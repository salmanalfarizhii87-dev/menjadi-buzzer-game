import { describe, expect, it } from 'vitest';
import { migratePayload, migrateV1ToV2, MIGRATIONS } from './migrations';

describe('migratePayload', () => {
  it('tidak mengubah payload bila versi sudah sama', () => {
    const payload = { hello: 'world' };
    const result = migratePayload(payload, 2);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toBe(payload);
    expect(result.migratedFrom).toBeNull();
  });

  it('menolak save dari versi lebih baru', () => {
    const result = migratePayload({}, 3);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('newer_than_app');
  });

  it('menolak bila tidak ada langkah migrasi', () => {
    const registry = { currentVersion: 4, steps: {} };
    const result = migratePayload({}, 2, registry);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.code).toBe('missing_migration');
  });

  it('menjalankan langkah migrasi berurutan', () => {
    const registry = {
      currentVersion: 3,
      steps: {
        1: (payload: unknown) => ({ ...(payload as object), v2: true }),
        2: (payload: unknown) => ({ ...(payload as object), v3: true }),
      },
    };
    const result = migratePayload({ base: true }, 1, registry);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.payload).toEqual({ base: true, v2: true, v3: true });
    expect(result.migratedFrom).toBe(1);
  });

  it('registry default punya migrasi v1 → v2', () => {
    expect(MIGRATIONS.currentVersion).toBe(2);
    expect(typeof MIGRATIONS.steps[1]).toBe('function');
  });
});

describe('migrateV1ToV2', () => {
  const v1Payload = {
    schemaVersion: 1,
    player: { id: 'player_1', money: 750, reputation: 0, careerLevel: 1, careerXP: 0, sessionsCompleted: 2, createdAt: 100 },
    accounts: [
      {
        id: 'acct_1',
        name: '@KilatDaily',
        platformId: 'chirper',
        followers: 2500,
        performance: 60,
        reputation: 0,
        suspicion: 25,
        status: 'normal',
        automationLevel: 3,
      },
    ],
    upgrades: [],
    campaignSessions: [],
    transactions: [],
    activeTime: { lastAccrualAt: 100, fractionalIncome: 0, pendingIncome: 0, pendingIncomeSince: null },
    settings: { soundEnabled: true, reducedMotion: false },
    meta: { createdAt: 100, updatedAt: 200 },
  };

  it('menaikkan schemaVersion ke 2', () => {
    const migrated = migrateV1ToV2(v1Payload) as Record<string, unknown>;
    expect(migrated.schemaVersion).toBe(2);
  });

  it('mempertahankan seluruh data v1', () => {
    const migrated = migrateV1ToV2(v1Payload) as Record<string, unknown>;
    const player = migrated.player as Record<string, unknown>;
    const accounts = migrated.accounts as Array<Record<string, unknown>>;

    expect(player.money).toBe(750);
    expect(player.sessionsCompleted).toBe(2);
    expect(accounts[0]!.followers).toBe(2500);
    expect(accounts[0]!.automationLevel).toBe(3);
  });

  it('menambahkan karakter dengan outfit default', () => {
    const migrated = migrateV1ToV2(v1Payload) as Record<string, unknown>;
    const character = migrated.character as Record<string, unknown>;

    expect(character.outfitId).toBe('outfit-basic');
    expect(character.locationCountryId).toBe('nusantara');
    expect(character.visitedCountryIds).toEqual(['nusantara']);
  });

  it('menambahkan inventori dengan outfit default dimiliki & terpasang', () => {
    const migrated = migrateV1ToV2(v1Payload) as Record<string, unknown>;
    const inventory = migrated.inventory as Record<string, unknown>;

    expect(inventory.ownedItemIds).toContain('outfit-basic');
    expect(inventory.equippedOutfitId).toBe('outfit-basic');
  });

  it('menambahkan aset kosong, tiket negara awal, saham kosong', () => {
    const migrated = migrateV1ToV2(v1Payload) as Record<string, unknown>;

    expect(migrated.assets).toEqual({ propertyIds: [], vehicleIds: [] });
    expect((migrated.tickets as Record<string, unknown>).ownedCountryIds).toEqual(['nusantara']);

    const stocks = migrated.stocks as Record<string, unknown>;
    expect(stocks.holdings).toEqual([]);
    expect(stocks.prices).toEqual({});
    expect(typeof stocks.seed).toBe('number');
    expect(typeof stocks.lastTickAt).toBe('number');
  });

  it('menambahkan social default dan risk safe', () => {
    const migrated = migrateV1ToV2(v1Payload) as Record<string, unknown>;
    const social = migrated.social as Record<string, unknown>;
    const risk = migrated.risk as Record<string, unknown>;

    expect(social.cooldownUntil).toBeNull();
    expect(social.postingCount).toBe(0);
    expect(social.shadowbannedUntil).toBeNull();
    expect(risk.tier).toBe('safe');
    expect(migrated.violations).toEqual([]);
  });

  it('idempoten: memigrasi payload yang sudah v2 tidak merusak data', () => {
    const once = migrateV1ToV2(v1Payload) as Record<string, unknown>;
    const twice = migrateV1ToV2(once) as Record<string, unknown>;

    expect(twice.character).toEqual(once.character);
    expect(twice.inventory).toEqual(once.inventory);
    expect((twice.player as Record<string, unknown>).money).toBe(750);
  });

  it('aman untuk payload non-objek', () => {
    expect(migrateV1ToV2(null)).toBeNull();
    expect(migrateV1ToV2('teks')).toBe('teks');
  });
});
