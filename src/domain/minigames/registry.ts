/**
 * Registri mini-game. Modul pemuatan bersifat lazy agar bundel awal tidak
 * memuat dua mini-game sekaligus.
 */

import type { MiniGameId } from './types';

export interface MiniGameDescriptor {
  id: MiniGameId;
  titleKey: string;
  descriptionKey: string;
  kind: 'quiz' | 'timing';
}

export const MINI_GAME_DESCRIPTORS: Record<MiniGameId, MiniGameDescriptor> = {
  'caption-challenge': {
    id: 'caption-challenge',
    titleKey: 'minigame.caption.title',
    descriptionKey: 'minigame.caption.instruction',
    kind: 'quiz',
  },
  'engagement-challenge': {
    id: 'engagement-challenge',
    titleKey: 'minigame.engagement.title',
    descriptionKey: 'minigame.engagement.instruction',
    kind: 'timing',
  },
};

export function getMiniGameDescriptor(id: string): MiniGameDescriptor | undefined {
  return MINI_GAME_DESCRIPTORS[id as MiniGameId];
}

export function loadMiniGameModule(
  id: 'caption-challenge',
): Promise<typeof import('./caption-challenge')>;
export function loadMiniGameModule(
  id: 'engagement-challenge',
): Promise<typeof import('./engagement-challenge')>;
export function loadMiniGameModule(id: MiniGameId) {
  switch (id) {
    case 'caption-challenge':
      return import('./caption-challenge');
    case 'engagement-challenge':
      return import('./engagement-challenge');
  }
}
