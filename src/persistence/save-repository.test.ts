import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { createSaveRepository } from './save-repository';
import { STORAGE_KEYS } from './storage-adapter';
import { installMemoryStorage, uninstallMemoryStorage, type MemoryStorage } from '@/tests/helpers';

const NOW = 1_700_000_000_000;

let storage: MemoryStorage;

beforeEach(() => {
  storage = installMemoryStorage();
});

afterEach(() => {
  uninstallMemoryStorage();
});

function repo(now = NOW) {
  return createSaveRepository({ now: () => now, debounceMs: 0 });
}

describe('save repository — load', () => {
  it('melaporkan empty bila belum ada save', () => {
    const result = repo().load();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('empty');
  });

  it('memuat save yang valid', () => {
    const repository = repo();
    const save = createInitialSave(BALANCE, NOW);
    expect(repository.saveNow(save)).toBe(true);

    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.save.player.money).toBe(save.player.money);
    expect(loaded.migrated).toBe(false);
  });

  it('menolak JSON yang rusak dan mengarsipkan data mentah', () => {
    storage.setItem(STORAGE_KEYS.save, '{ ini bukan json');

    const result = repo().load();
    expect(result.ok).toBe(false);
    if (result.ok || result.reason === 'empty') return;
    expect(result.reason).toBe('corrupt');
    expect(result.rawArchived).toBe(true);

    // Data asli tetap ada, tidak ditimpa.
    expect(storage.getItem(STORAGE_KEYS.save)).toBe('{ ini bukan json');
    const archived = [...Array(storage.length).keys()]
      .map((index) => storage.key(index))
      .filter((key): key is string => key !== null && key.startsWith(STORAGE_KEYS.corruptPrefix));
    expect(archived.length).toBeGreaterThan(0);
  });

  it('menolak save dengan schemaVersion lebih tinggi tanpa menimpa', () => {
    const envelope = JSON.stringify({
      appId: 'menjadi-buzzer',
      schemaVersion: 99,
      savedAt: NOW,
      payload: {},
    });
    storage.setItem(STORAGE_KEYS.save, envelope);

    const result = repo().load();
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe('newer');
    expect(storage.getItem(STORAGE_KEYS.save)).toBe(envelope);
  });

  it('menolak payload yang tidak lolos validasi', () => {
    const envelope = JSON.stringify({
      appId: 'menjadi-buzzer',
      schemaVersion: 1,
      savedAt: NOW,
      payload: { schemaVersion: 1, player: null },
    });
    storage.setItem(STORAGE_KEYS.save, envelope);

    const result = repo().load();
    expect(result.ok).toBe(false);
    if (result.ok || result.reason === 'empty') return;
    expect(result.reason).toBe('corrupt');
    expect(result.issues.length).toBeGreaterThan(0);
  });

  it('menolak envelope dengan appId berbeda', () => {
    const envelope = JSON.stringify({
      appId: 'game-lain',
      schemaVersion: 1,
      savedAt: NOW,
      payload: {},
    });
    storage.setItem(STORAGE_KEYS.save, envelope);

    const result = repo().load();
    expect(result.ok).toBe(false);
  });
});

describe('save repository — save', () => {
  it('menulis envelope dengan appId dan schemaVersion', () => {
    const repository = repo();
    const save = createInitialSave(BALANCE, NOW);
    repository.saveNow(save);

    const raw = storage.getItem(STORAGE_KEYS.save);
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.appId).toBe('menjadi-buzzer');
    expect(parsed.schemaVersion).toBe(2);
    expect(parsed.savedAt).toBe(NOW);
    expect(parsed.payload.player.money).toBe(500);
  });

  it('saveNow membatalkan debounce yang tertunda', () => {
    const repository = repo();
    const save = createInitialSave(BALANCE, NOW);
    repository.saveDebounced({ ...save, player: { ...save.player, money: 1 } });
    repository.saveNow({ ...save, player: { ...save.player, money: 2 } });

    const parsed = JSON.parse(storage.getItem(STORAGE_KEYS.save)!);
    expect(parsed.payload.player.money).toBe(2);
  });

  it('flush menulis state yang tertunda', () => {
    const repository = createSaveRepository({ now: () => NOW, debounceMs: 10_000 });
    const save = createInitialSave(BALANCE, NOW);
    repository.saveDebounced({ ...save, player: { ...save.player, money: 321 } });

    expect(storage.getItem(STORAGE_KEYS.save)).toBeNull();
    repository.flush();
    expect(storage.getItem(STORAGE_KEYS.save)).not.toBeNull();

    const parsed = JSON.parse(storage.getItem(STORAGE_KEYS.save)!);
    expect(parsed.payload.player.money).toBe(321);
  });

  it('clear menghapus save', () => {
    const repository = repo();
    repository.saveNow(createInitialSave(BALANCE, NOW));
    repository.clear();
    expect(storage.getItem(STORAGE_KEYS.save)).toBeNull();
  });
});

describe('save repository — roundtrip', () => {
  it('save lalu load mengembalikan state identik', () => {
    const repository = repo();
    const save = createInitialSave(BALANCE, NOW);
    const modified = {
      ...save,
      player: { ...save.player, money: 1234, sessionsCompleted: 3 },
    };

    repository.saveNow(modified);
    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;

    expect(loaded.save.player.money).toBe(1234);
    expect(loaded.save.player.sessionsCompleted).toBe(3);
    expect(loaded.save.accounts).toHaveLength(1);
    expect(loaded.save.accounts[0]!.name).toBe('@KilatDaily');
  });

  it('mempertahankan saldo negatif setelah roundtrip', () => {
    const repository = repo();
    const save = createInitialSave(BALANCE, NOW);
    repository.saveNow({ ...save, player: { ...save.player, money: -750 } });

    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    expect(loaded.save.player.money).toBe(-750);
  });
});
