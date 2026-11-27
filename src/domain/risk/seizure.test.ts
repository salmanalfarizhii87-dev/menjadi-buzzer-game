import { describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createInitialSave } from '@/state/initial-state';
import { listSeizableAssets, removeAsset, selectSeizableAsset } from './seizure';

const NOW = 1_700_000_000_000;

function saveWith(propertyIds: string[] = [], vehicleIds: string[] = []) {
  const save = createInitialSave(BALANCE, NOW);
  return { ...save, assets: { propertyIds, vehicleIds } };
}

describe('listSeizableAssets', () => {
  it('kosong bila tidak punya aset', () => {
    expect(listSeizableAssets(saveWith())).toEqual([]);
  });

  it('menggabungkan properti dan kendaraan', () => {
    const list = listSeizableAssets(saveWith(['p1'], ['v1']));
    expect(list).toEqual([
      { kind: 'property', id: 'p1' },
      { kind: 'vehicle', id: 'v1' },
    ]);
  });
});

describe('selectSeizableAsset', () => {
  it('null tanpa aset', () => {
    expect(selectSeizableAsset(saveWith(), BALANCE)).toBeNull();
  });

  it('memilih aset terakhir saat seizeMostValuableFirst', () => {
    const result = selectSeizableAsset(saveWith(['p1', 'p2'], ['v1']), BALANCE);
    expect(result).toEqual({ kind: 'vehicle', id: 'v1' });
  });

  it('memilih aset pertama bila konfigurasi menyatakan sebaliknya', () => {
    const config = {
      ...BALANCE,
      seizure: { ...BALANCE.seizure, seizeMostValuableFirst: false },
    };
    const result = selectSeizableAsset(saveWith(['p1', 'p2']), config);
    expect(result).toEqual({ kind: 'property', id: 'p1' });
  });
});

describe('removeAsset', () => {
  it('menghapus properti', () => {
    const next = removeAsset(saveWith(['p1', 'p2']), { kind: 'property', id: 'p1' });
    expect(next.assets.propertyIds).toEqual(['p2']);
    expect(next.assets.vehicleIds).toEqual([]);
  });

  it('menghapus kendaraan', () => {
    const next = removeAsset(saveWith([], ['v1', 'v2']), { kind: 'vehicle', id: 'v2' });
    expect(next.assets.vehicleIds).toEqual(['v1']);
  });

  it('tidak memutasi save asli', () => {
    const save = saveWith(['p1']);
    removeAsset(save, { kind: 'property', id: 'p1' });
    expect(save.assets.propertyIds).toEqual(['p1']);
  });

  it('aman bila aset tidak ada', () => {
    const save = saveWith(['p1']);
    const next = removeAsset(save, { kind: 'property', id: 'tidak-ada' });
    expect(next.assets.propertyIds).toEqual(['p1']);
  });
});
