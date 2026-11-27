/**
 * Komposisi foto: ukuran kanvas dan posisi landmark/karakter.
 * Angka layout ada di domain agar layar photo tinggal merender.
 */

import type { BalanceConfig } from '@/data/config/balance';

export interface PhotoComposition {
  width: number;
  height: number;
  characterSize: number;
  characterX: number;
  characterY: number;
  landmarkScale: number;
  landmarkX: number;
  landmarkY: number;
}

/** Landmark digambar dalam ruang 200×160 lalu diskalakan. */
const LANDMARK_WIDTH = 200;

export function composePhoto(config: BalanceConfig): PhotoComposition {
  const width = config.travel.photoWidth;
  const height = config.travel.photoHeight;
  const characterSize = Math.round(width * 0.46);

  return {
    width,
    height,
    characterSize,
    characterX: Math.round(width * 0.06),
    characterY: Math.round(height * 0.52),
    landmarkScale: (width * 0.7) / LANDMARK_WIDTH,
    landmarkX: Math.round(width * 0.3),
    landmarkY: Math.round(height * 0.14),
  };
}
