/**
 * Komposisi foto: langit, landmark, karakter, dan bingkai. Semua warna/shape
 * original; hasilnya SVG yang bisa diekspor ke PNG oleh layar photo.
 */

import {
  circle,
  defs,
  g,
  linearGradient,
  path,
  rect,
  svg,
  text,
  SVG_NS,
} from '@/core/svg';
import { playerCharacter } from '@/art/character/renderer';
import { landmarkGroup } from '@/art/landmarks';
import { composePhoto } from '@/domain/travel/photo';
import { findTravelCountry } from '@/data/travel/countries';
import { t } from '@/data/strings/id';
import type { BalanceConfig } from '@/data/config/balance';

interface ScenePalette {
  skyTop: string;
  skyBottom: string;
  hill: string;
  ground: string;
}

const PALETTES: Record<string, ScenePalette> = {
  nusantara: { skyTop: '#f6bd6a', skyBottom: '#fbe8c8', hill: '#5f8a48', ground: '#7aa05a' },
  belanda: { skyTop: '#9dc0e2', skyBottom: '#e8f2fb', hill: '#4f7a57', ground: '#6f9a63' },
  jepang: { skyTop: '#efa9bb', skyBottom: '#fde9ef', hill: '#4f7a57', ground: '#6f9a63' },
  korea: { skyTop: '#9fd2cc', skyBottom: '#e6f5f2', hill: '#4f7a57', ground: '#6f9a63' },
  prancis: { skyTop: '#9fb8d8', skyBottom: '#e8eef8', hill: '#5b7a4f', ground: '#7d9a63' },
};

const FALLBACK: ScenePalette = PALETTES['nusantara']!;

export interface PhotoSceneOptions {
  countryId: string;
  outfitId: string;
  accessoryIds: string[];
  config: BalanceConfig;
}

export function photoScene(options: PhotoSceneOptions): SVGSVGElement {
  const { countryId, outfitId, accessoryIds, config } = options;
  const composition = composePhoto(config);
  const palette = PALETTES[countryId] ?? FALLBACK;
  const country = findTravelCountry(countryId);
  const width = composition.width;
  const height = composition.height;
  const gradientId = `photo-sky-${countryId}`;

  const root = svg({
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    xmlns: SVG_NS,
    class: 'photo-scene',
    role: 'img',
    ariaLabel: 'Foto landmark',
  });

  root.appendChild(
    defs([
      linearGradient({
        id: gradientId,
        x1: 0,
        y1: 0,
        x2: 0,
        y2: 1,
        stops: [
          { offset: '0%', color: palette.skyTop },
          { offset: '100%', color: palette.skyBottom },
        ],
      }),
    ]),
  );

  root.appendChild(
    rect({ x: 0, y: 0, width, height, fill: `url(#${gradientId})` }),
  );
  root.appendChild(circle({ cx: width * 0.74, cy: height * 0.16, r: width * 0.1, fill: '#ffe6ad', opacity: 0.85 }));
  root.appendChild(
    path({
      d: `M0 ${height * 0.66} Q ${width * 0.3} ${height * 0.52} ${width * 0.62} ${height * 0.64} T ${width} ${height * 0.6} V ${height} H 0 Z`,
      fill: palette.hill,
      opacity: 0.9,
    }),
  );
  root.appendChild(
    rect({ x: 0, y: height * 0.78, width, height: height * 0.22, fill: palette.ground }),
  );

  root.appendChild(
    g({ transform: `translate(${composition.landmarkX} ${composition.landmarkY}) scale(${composition.landmarkScale})` }, [
      landmarkGroup(country?.landmarkId ?? countryId),
    ]),
  );

  const character = playerCharacter({
    size: composition.characterSize,
    outfitId,
    accessoryIds,
    mood: 'happy',
  });
  character.setAttribute('x', String(composition.characterX));
  character.setAttribute('y', String(composition.characterY));
  root.appendChild(character);

  root.appendChild(
    rect({
      x: 24,
      y: 24,
      width: width - 48,
      height: height - 48,
      rx: 28,
      fill: 'none',
      stroke: '#2b1c0e',
      strokeWidth: 16,
    }),
  );
  root.appendChild(
    rect({
      x: 44,
      y: 44,
      width: width - 88,
      height: height - 88,
      rx: 20,
      fill: 'none',
      stroke: '#e9a93c',
      strokeWidth: 4,
      opacity: 0.85,
    }),
  );

  const plateY = height - 250;
  root.appendChild(
    rect({
      x: 70,
      y: plateY,
      width: width - 140,
      height: 150,
      rx: 18,
      fill: '#2b1c0e',
      opacity: 0.72,
    }),
  );
  root.appendChild(
    text(
      {
        x: width / 2,
        y: plateY + 66,
        textAnchor: 'middle',
        fontFamily: 'Baloo 2, system-ui, sans-serif',
        fontSize: 48,
        fontWeight: 800,
        fill: '#ffe9c7',
      },
      country ? t(country.nameKey) : countryId,
    ),
  );
  root.appendChild(
    text(
      {
        x: width / 2,
        y: plateY + 112,
        textAnchor: 'middle',
        fontFamily: 'system-ui, sans-serif',
        fontSize: 28,
        fontWeight: 600,
        fill: '#e9a93c',
      },
      country ? t(country.landmarkNameKey) : '',
    ),
  );

  return root;
}
