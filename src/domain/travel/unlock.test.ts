import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { makeSave } from '@/tests/helpers';
import { canFly, isUnlocked, travelCost } from './unlock';

describe('travelCost', () => {
  it('memakai biaya per negara', () => {
    expect(travelCost(BALANCE, 'belanda')).toBe(200);
  });

  it('jatuh ke biaya default untuk negara tak dikenal', () => {
    expect(travelCost(BALANCE, 'atlantis')).toBe(BALANCE.travel.defaultTravelCost);
  });
});

describe('canFly', () => {
  const save = makeSave();

  it('menolak negara tanpa tiket', () => {
    const result = canFly(save, BALANCE, 'belanda');
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('locked');
  });

  it('mengizinkan negara dengan tiket dan saldo cukup', () => {
    const withTicket = {
      ...save,
      tickets: { ownedCountryIds: [...save.tickets.ownedCountryIds, 'belanda'] },
    };
    const result = canFly(withTicket, BALANCE, 'belanda', 1000);
    expect(result.allowed).toBe(true);
    expect(result.cost).toBe(200);
    expect(result.firstVisit).toBe(true);
  });

  it('menolak negara saat ini', () => {
    const result = canFly(save, BALANCE, 'nusantara', 1000);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('current');
  });

  it('menolak saat saldo kurang dari biaya', () => {
    const withTicket = {
      ...save,
      tickets: { ownedCountryIds: [...save.tickets.ownedCountryIds, 'belanda'] },
    };
    const result = canFly(withTicket, BALANCE, 'belanda', 100);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('insufficient_funds');
  });

  it('menandai firstVisit false untuk negara yang sudah dikunjungi', () => {
    const withTicket = {
      ...save,
      tickets: { ownedCountryIds: [...save.tickets.ownedCountryIds, 'belanda'] },
      character: { ...save.character, visitedCountryIds: ['nusantara', 'belanda'] },
    };
    expect(canFly(withTicket, BALANCE, 'belanda', 1000).firstVisit).toBe(false);
  });
});

describe('isUnlocked', () => {
  it('hanya benar bila tiket dimiliki', () => {
    const save = makeSave();
    expect(isUnlocked(save, 'nusantara')).toBe(true);
    expect(isUnlocked(save, 'jepang')).toBe(false);
  });
});
