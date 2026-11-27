/**
 * Pemetaan tahap session kampanye ke layar. Satu tempat agar tombol
 * "Lanjutkan" di Karakter, Task, brief, dan strategy selalu konsisten.
 */

import type { ScreenId } from '@/app/lifecycle';
import type { CampaignStage } from '@/application/campaigns/resume';

export function screenForCampaignStage(stage: CampaignStage): ScreenId {
  switch (stage) {
    case 'strategy':
      return 'campaign-strategy';
    case 'activity':
      return 'campaign-minigame';
    case 'result':
      return 'campaign-result';
    default:
      return 'task';
  }
}
