import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { appendTransaction, createTransaction, summarizeTransactions } from './ledger';

const NOW = 1_700_000_000_000;

describe('createTransaction', () => {
  it('menghitung balanceAfter dari saldo sebelum', () => {
    const txn = createTransaction(1000, {
      type: 'passive_income',
      amount: 250,
      sourceId: null,
      descriptionKey: 'txn.passiveIncome',
      createdAt: NOW,
    });
    expect(txn.amount).toBe(250);
    expect(txn.balanceAfter).toBe(1250);
  });

  it('mendukung amount negatif (pengeluaran)', () => {
    const txn = createTransaction(1000, {
      type: 'upgrade_purchase',
      amount: -400,
      sourceId: 'upg_1',
      descriptionKey: 'txn.upgradePurchase',
      createdAt: NOW,
    });
    expect(txn.amount).toBe(-400);
    expect(txn.balanceAfter).toBe(600);
  });

  it('mendukung saldo akhir negatif (utang)', () => {
    const txn = createTransaction(100, {
      type: 'campaign_fine',
      amount: -500,
      sourceId: 'sess_1',
      descriptionKey: 'txn.campaignFine',
      createdAt: NOW,
    });
    expect(txn.balanceAfter).toBe(-400);
  });

  it('setiap transaksi punya id unik', () => {
    const first = createTransaction(0, {
      type: 'passive_income',
      amount: 1,
      sourceId: null,
      descriptionKey: 'txn.passiveIncome',
      createdAt: NOW,
    });
    const second = createTransaction(1, {
      type: 'passive_income',
      amount: 1,
      sourceId: null,
      descriptionKey: 'txn.passiveIncome',
      createdAt: NOW,
    });
    expect(first.id).not.toBe(second.id);
  });

  it('membulatkan amount ke integer', () => {
    const txn = createTransaction(0, {
      type: 'passive_income',
      amount: 10.7,
      sourceId: null,
      descriptionKey: 'txn.passiveIncome',
      createdAt: NOW,
    });
    expect(txn.amount).toBe(11);
  });
});

describe('appendTransaction', () => {
  it('menambahkan transaksi tanpa memutasi save asli', () => {
    const save = createInitialSave(BALANCE, NOW);
    const next = appendTransaction(save, {
      type: 'passive_income',
      amount: 100,
      sourceId: null,
      descriptionKey: 'txn.passiveIncome',
      createdAt: NOW,
    });

    expect(save.transactions).toHaveLength(0);
    expect(next.transactions).toHaveLength(1);
    expect(next.transactions[0]!.amount).toBe(100);
  });

  it('mengambil balanceAfter dari saldo save, bukan menghitung ulang', () => {
    // Pemanggil sudah menerapkan delta ke saldo sebelum mencatat.
    const save = createInitialSave(BALANCE, NOW);
    const afterSpend = { ...save, player: { ...save.player, money: 300 } };

    const next = appendTransaction(afterSpend, {
      type: 'upgrade_purchase',
      amount: -200,
      sourceId: 'upg_1',
      descriptionKey: 'txn.upgradePurchase',
      createdAt: NOW,
    });

    // Tidak dobel: balanceAfter = saldo saat ini, bukan 300 - 200.
    expect(next.transactions[0]!.balanceAfter).toBe(300);
  });

  it('transaksi bersifat append-only (urutan dipertahankan)', () => {
    let save = createInitialSave(BALANCE, NOW);
    save = appendTransaction(save, {
      type: 'passive_income',
      amount: 10,
      sourceId: null,
      descriptionKey: 'txn.passiveIncome',
      createdAt: NOW,
    });
    save = appendTransaction(save, {
      type: 'upgrade_purchase',
      amount: -5,
      sourceId: 'upg_1',
      descriptionKey: 'txn.upgradePurchase',
      createdAt: NOW + 1000,
    });

    expect(save.transactions.map((txn) => txn.type)).toEqual([
      'passive_income',
      'upgrade_purchase',
    ]);
  });
});

describe('summarizeTransactions', () => {
  it('memisahkan total masuk dan keluar', () => {
    const summary = summarizeTransactions([
      createTransaction(0, {
        type: 'passive_income',
        amount: 100,
        sourceId: null,
        descriptionKey: 'txn.passiveIncome',
        createdAt: NOW,
      }),
      createTransaction(100, {
        type: 'campaign_fine',
        amount: -40,
        sourceId: 'sess_1',
        descriptionKey: 'txn.campaignFine',
        createdAt: NOW,
      }),
    ]);

    expect(summary.totalIn).toBe(100);
    expect(summary.totalOut).toBe(40);
    expect(summary.count).toBe(2);
  });
});
