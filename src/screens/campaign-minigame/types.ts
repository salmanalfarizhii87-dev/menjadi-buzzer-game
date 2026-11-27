/**
 * Kontrak renderer mini-game. Host menyediakan container, konteks layar,
 * session, dan callback skor; modul hanya menggambar dan menghitung.
 */

import type { ScreenContext } from '@/app/lifecycle';
import type { CampaignSession } from '@/state/types';

export interface MiniGameRendererDeps {
  ctx: ScreenContext;
  session: CampaignSession;
  signal: AbortSignal;
  onComplete: (score: number) => void;
}

export type MiniGameRenderer = (
  root: HTMLElement,
  deps: MiniGameRendererDeps,
) => Promise<void>;
