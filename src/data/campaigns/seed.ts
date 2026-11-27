/**
 * Seed campaign. Empat kontrak dengan variasi wajib:
 * Auto/risiko rendah, Auto/reward tinggi-risiko tinggi, Interactive (caption),
 * Hybrid (engagement). Semua konten fiktif.
 *
 * PLACEHOLDER — angka belum balancing final.
 */

import { findCampaignDefinition, type CampaignDefinition } from '@/domain/campaigns/definition';

export type { CampaignDefinition };

export const CAMPAIGNS: CampaignDefinition[] = [
  {
    id: 'cmp_launch_soft',
    client: 'Kopi Rembulan',
    campaignName: 'Soft Launch Gerai Baru',
    objective: 'Perkenalkan gerai baru ke audiens lokal dengan nada ringan.',
    targetAudience: 'Pekerja muda usia 20–30 di kota besar',
    category: 'awareness',
    difficulty: 1,
    basePayment: 120,
    bonusPayment: 40,
    baseRisk: 0.1,
    baseSuccessChance: 0.82,
    strategyTags: ['informative'],
    interaction: 'auto',
    miniGameId: null,
    penaltyProfileId: 'lenient',
    targetPerformance: 55,
    riskImpact: 4,
    requirements: { minPerformance: 0, allowedStatuses: ['normal', 'warning'] },
  },
  {
    id: 'cmp_viral_push',
    client: 'Nusa Gadget',
    campaignName: 'Push Peluncuran Viral',
    objective: 'Dorong percakapan masif untuk peluncuran produk baru.',
    targetAudience: 'Pengguna gadget early adopter',
    category: 'engagement',
    difficulty: 3,
    basePayment: 900,
    bonusPayment: 500,
    baseRisk: 0.55,
    baseSuccessChance: 0.46,
    strategyTags: ['emotional', 'humorous'],
    interaction: 'auto',
    miniGameId: null,
    penaltyProfileId: 'severe',
    targetPerformance: 75,
    riskImpact: 18,
    requirements: { minPerformance: 30, allowedStatuses: ['normal', 'warning'] },
  },
  {
    id: 'cmp_caption_drive',
    client: 'Warung Sehat Ibu Sari',
    campaignName: 'Caption Drive Mingguan',
    objective: 'Susun caption yang mendorong kunjungan ke gerai minggu ini.',
    targetAudience: 'Keluarga muda di sekitar gerai',
    category: 'promotion',
    difficulty: 2,
    basePayment: 380,
    bonusPayment: 180,
    baseRisk: 0.28,
    baseSuccessChance: 0.62,
    strategyTags: ['informative', 'emotional'],
    interaction: 'interactive',
    miniGameId: 'caption-challenge',
    penaltyProfileId: 'standard',
    targetPerformance: 65,
    riskImpact: 9,
    requirements: { minPerformance: 20, allowedStatuses: ['normal', 'warning'] },
  },
  {
    id: 'cmp_engagement_hybrid',
    client: 'Ruang Belajar Cendekia',
    campaignName: 'Hybrid Engagement Sprint',
    objective: 'Aktifkan percakapan audiens lewat interaksi terjadwal.',
    targetAudience: 'Pelajar dan mahasiswa',
    category: 'engagement',
    difficulty: 3,
    basePayment: 620,
    bonusPayment: 320,
    baseRisk: 0.42,
    baseSuccessChance: 0.54,
    strategyTags: ['humorous', 'emotional'],
    interaction: 'hybrid',
    miniGameId: 'engagement-challenge',
    penaltyProfileId: 'standard',
    targetPerformance: 70,
    riskImpact: 13,
    requirements: { minPerformance: 25, allowedStatuses: ['normal', 'warning'] },
  },
];

export function findCampaign(id: string): CampaignDefinition | undefined {
  return findCampaignDefinition(CAMPAIGNS, id);
}
