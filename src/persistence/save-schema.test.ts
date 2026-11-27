import { describe, expect, it } from 'vitest';
import { validateSavePayload, parseEnvelope } from './save-schema';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';

const NOW = 1_700_000_000_000;

describe('validateSavePayload', () => {
  it('menerima save awal yang valid', () => {
    const save = createInitialSave(BALANCE, NOW);
    const result = validateSavePayload(save);
    expect(result.ok).toBe(true);
  });

  it('menolak payload yang bukan objek', () => {
    expect(validateSavePayload(null).ok).toBe(false);
    expect(validateSavePayload('string').ok).toBe(false);
    expect(validateSavePayload([]).ok).toBe(false);
  });

  it('menolak schemaVersion yang salah', () => {
    const save = { ...createInitialSave(BALANCE, NOW), schemaVersion: 7 };
    const result = validateSavePayload(save);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues.some((issue) => issue.path === 'schemaVersion')).toBe(true);
  });

  it('menolak saldo non-finite', () => {
    const save = createInitialSave(BALANCE, NOW);
    const broken = { ...save, player: { ...save.player, money: Number.NaN } };
    const result = validateSavePayload(broken);
    expect(result.ok).toBe(false);
  });

  it('menerima saldo negatif yang valid', () => {
    const save = createInitialSave(BALANCE, NOW);
    const debt = { ...save, player: { ...save.player, money: -1200 } };
    expect(validateSavePayload(debt).ok).toBe(true);
  });

  it('menolak accounts yang kosong', () => {
    const save = createInitialSave(BALANCE, NOW);
    const result = validateSavePayload({ ...save, accounts: [] });
    expect(result.ok).toBe(false);
  });

  it('menolak status akun yang tidak dikenal', () => {
    const save = createInitialSave(BALANCE, NOW);
    const broken = {
      ...save,
      accounts: [{ ...save.accounts[0]!, status: 'banned' }],
    };
    const result = validateSavePayload(broken);
    expect(result.ok).toBe(false);
  });

  it('menolak tipe transaksi yang tidak dikenal', () => {
    const save = createInitialSave(BALANCE, NOW);
    const broken = {
      ...save,
      transactions: [
        {
          id: 'txn_1',
          type: 'magic_money',
          amount: 10,
          balanceAfter: 10,
          sourceId: null,
          createdAt: NOW,
          descriptionKey: 'x',
        },
      ],
    };
    const result = validateSavePayload(broken);
    expect(result.ok).toBe(false);
  });

  it('menerima transaksi valid', () => {
    const save = createInitialSave(BALANCE, NOW);
    const withTxn = {
      ...save,
      transactions: [
        {
          id: 'txn_1',
          type: 'passive_income',
          amount: 50,
          balanceAfter: 550,
          sourceId: null,
          createdAt: NOW,
          descriptionKey: 'txn.passiveIncome',
        },
      ],
    };
    expect(validateSavePayload(withTxn).ok).toBe(true);
  });
});

describe('parseEnvelope', () => {
  it('menolak JSON tidak valid', () => {
    const result = parseEnvelope('{rusak');
    expect(result.ok).toBe(false);
  });

  it('menolak appId berbeda', () => {
    const result = parseEnvelope(JSON.stringify({ appId: 'lain', schemaVersion: 1, savedAt: 0, payload: {} }));
    expect(result.ok).toBe(false);
  });

  it('menerima envelope yang benar', () => {
    const result = parseEnvelope(
      JSON.stringify({ appId: 'menjadi-buzzer', schemaVersion: 1, savedAt: NOW, payload: {} }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.envelope.appId).toBe('menjadi-buzzer');
  });
});
