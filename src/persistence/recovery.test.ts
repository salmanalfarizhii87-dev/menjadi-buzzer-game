import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { STORAGE_KEYS } from './storage-adapter';
import { createSaveRepository } from './save-repository';
import { installMemoryStorage, uninstallMemoryStorage } from '@/tests/helpers';

const START = 1_700_000_000_000;

beforeEach(() => {
  installMemoryStorage();
});

afterEach(() => {
  uninstallMemoryStorage();
});

function setup() {
  const onWriteError = vi.fn();
  const repository = createSaveRepository({
    now: () => START,
    debounceMs: 0,
    onWriteError,
  });
  return { repository, onWriteError };
}

describe('restoreRaw', () => {
  it('menulis ulang cadangan dan bisa dimuat', () => {
    const { repository } = setup();
    const save = createInitialSave(BALANCE, START);
    expect(repository.saveNow(save)).toBe(true);

    const changed = { ...save, player: { ...save.player, money: 1234 } };
    const raw = JSON.stringify(repository.buildEnvelope(changed));

    expect(repository.restoreRaw(raw)).toBe(true);
    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(loaded.save.player.money).toBe(1234);
  });
});

describe('kuota penuh', () => {
  it('tidak menimpa save lama dan memanggil onWriteError', () => {
    const storage = installMemoryStorage();
    const { repository, onWriteError } = setup();
    const save = createInitialSave(BALANCE, START);
    expect(repository.saveNow(save)).toBe(true);
    const rawBefore = storage.getItem(STORAGE_KEYS.save);

    const changed = { ...save, player: { ...save.player, money: 999 } };
    storage.failNextWrite = true;
    expect(repository.saveNow(changed)).toBe(false);

    expect(onWriteError).toHaveBeenCalledWith('quota');
    expect(storage.getItem(STORAGE_KEYS.save)).toBe(rawBefore);

    const loaded = repository.load();
    expect(loaded.ok).toBe(true);
    if (loaded.ok) expect(loaded.save.player.money).toBe(save.player.money);
  });
});
