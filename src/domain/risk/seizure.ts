/**
 * Penyitaan aset saat tier kritis. Aset yang disita hilang dari kepemilikan dan
 * dicatat sebagai pelanggaran — tidak ada transaksi uang.
 */

import type { BalanceConfig } from '@/data/config/balance';
import type { GameSave } from '@/state/types';

export interface SeizedAsset {
  kind: 'property' | 'vehicle';
  id: string;
}

export function listSeizableAssets(save: GameSave): SeizedAsset[] {
  return [
    ...save.assets.propertyIds.map((id) => ({ kind: 'property' as const, id })),
    ...save.assets.vehicleIds.map((id) => ({ kind: 'vehicle' as const, id })),
  ];
}

/**
 * Pilih aset yang disita.
 *
 * CATATAN: state tidak menyimpan harga per aset, jadi "termahal" didekati dengan
 * urutan pembelian terakhir. Placeholder sampai katalog aset menyimpan harga.
 */
export function selectSeizableAsset(save: GameSave, config: BalanceConfig): SeizedAsset | null {
  const candidates = listSeizableAssets(save);
  if (candidates.length === 0) return null;
  if (!config.seizure.seizeMostValuableFirst) return candidates[0] ?? null;
  return candidates[candidates.length - 1] ?? null;
}

export function removeAsset(save: GameSave, asset: SeizedAsset): GameSave {
  if (asset.kind === 'property') {
    return {
      ...save,
      assets: {
        ...save.assets,
        propertyIds: save.assets.propertyIds.filter((id) => id !== asset.id),
      },
    };
  }

  return {
    ...save,
    assets: {
      ...save.assets,
      vehicleIds: save.assets.vehicleIds.filter((id) => id !== asset.id),
    },
  };
}
