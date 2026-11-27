/**
 * Pilihan composer: caption, hashtag, jam posting.
 * Semua konten fiktif. Angka adalah placeholder balancing.
 */

import type { CaptionTone } from './apps';

export interface CaptionOption {
  id: string;
  text: string;
  tone: CaptionTone;
  /** Engagement dasar sebelum pengali. */
  baseEngagement: number;
}

export interface HashtagOption {
  id: string;
  label: string;
  reachModifier: number;
  suspicionModifier: number;
}

export interface TimingOption {
  id: 'quiet' | 'normal' | 'peak';
  labelKey: string;
  engagementModifier: number;
  suspicionModifier: number;
  /** Untuk indikator kualitatif. */
  reachHint: 'low' | 'medium' | 'high';
}

export const CAPTION_OPTIONS: CaptionOption[] = [
  {
    id: 'caption-fact',
    text: 'Fakta singkat: ini yang perlu kamu tahu sebelum ikut tren.',
    tone: 'informative',
    baseEngagement: 42,
  },
  {
    id: 'caption-feel',
    text: 'Jujur, hal kecil ini bikin hari saya jauh lebih baik.',
    tone: 'emotional',
    baseEngagement: 55,
  },
  {
    id: 'caption-joke',
    text: 'Katanya canggih. Buktinya? Ya begini ini.',
    tone: 'humorous',
    baseEngagement: 64,
  },
  {
    id: 'caption-bait',
    text: 'Kalau kamu masih percaya itu, coba pikir ulang sekali lagi.',
    tone: 'provocative',
    baseEngagement: 78,
  },
];

export const HASHTAG_OPTIONS: HashtagOption[] = [
  { id: 'tag-info', label: '#InfoCepat', reachModifier: 1, suspicionModifier: 1 },
  { id: 'tag-viral', label: '#ViralSekarang', reachModifier: 1.35, suspicionModifier: 1.4 },
  { id: 'tag-chill', label: '#SantaiAja', reachModifier: 0.9, suspicionModifier: 0.7 },
  { id: 'tag-fact', label: '#CekDulu', reachModifier: 1.15, suspicionModifier: 0.85 },
];

export const TIMING_OPTIONS: TimingOption[] = [
  {
    id: 'quiet',
    labelKey: 'social.timing.quiet',
    engagementModifier: 0.8,
    suspicionModifier: 0.7,
    reachHint: 'low',
  },
  {
    id: 'normal',
    labelKey: 'social.timing.normal',
    engagementModifier: 1,
    suspicionModifier: 1,
    reachHint: 'medium',
  },
  {
    id: 'peak',
    labelKey: 'social.timing.peak',
    engagementModifier: 1.25,
    suspicionModifier: 1.3,
    reachHint: 'high',
  },
];

export function findCaption(id: string): CaptionOption | undefined {
  return CAPTION_OPTIONS.find((option) => option.id === id);
}

export function findHashtag(id: string): HashtagOption | undefined {
  return HASHTAG_OPTIONS.find((option) => option.id === id);
}

export function findTiming(id: string): TimingOption | undefined {
  return TIMING_OPTIONS.find((option) => option.id === id);
}
