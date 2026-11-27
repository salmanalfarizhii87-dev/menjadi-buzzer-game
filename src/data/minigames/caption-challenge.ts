/**
 * Konten Caption Challenge. Semua teks fiktif; skor opsi adalah placeholder
 * balancing. Tiga ronde: pembuka, isi, penutup.
 */

import type { CaptionRoundDefinition } from '@/domain/minigames/types';

export const CAPTION_ROUNDS: CaptionRoundDefinition[] = [
  {
    id: 'round-hook',
    prompt: 'Pilih pembuka caption yang paling sesuai untuk audiens kampanye.',
    options: [
      {
        id: 'hook-fact',
        text: 'Fakta singkat: tiga hal yang berubah minggu ini.',
        score: 100,
        note: 'Jelas, spesifik, dan langsung ke inti.',
      },
      {
        id: 'hook-question',
        text: 'Halo semuanya, apa kabar hari ini?',
        score: 20,
        note: 'Terlalu umum, tidak menyebut manfaat.',
      },
      {
        id: 'hook-bait',
        text: 'Kalian pasti nggak akan percaya apa yang terjadi.',
        score: 35,
        note: 'Bait berlebihan tanpa isi.',
      },
      {
        id: 'hook-push',
        text: 'Wajib beli sekarang juga sebelum kehabisan!',
        score: 0,
        note: 'Klaim memaksa, mudah memicu penolakan.',
      },
    ],
  },
  {
    id: 'round-proof',
    prompt: 'Pilih bagian isi yang membangun kepercayaan.',
    options: [
      {
        id: 'proof-test',
        text: 'Kami uji sendiri sebelum merekomendasikan ke kamu.',
        score: 100,
        note: 'Menunjukkan proses dan tanggung jawab.',
      },
      {
        id: 'proof-hearsay',
        text: 'Katanya sih bagus, coba saja dulu.',
        score: 25,
        note: 'Klaim tanpa bukti.',
      },
      {
        id: 'proof-common',
        text: 'Semua orang sudah tahu kualitasnya.',
        score: 40,
        note: 'Lemah karena mengandalkan asumsi.',
      },
      {
        id: 'proof-secret',
        text: 'Rahasianya tidak bisa dijelaskan di sini.',
        score: 0,
        note: 'Menutup informasi yang justru dibutuhkan.',
      },
    ],
  },
  {
    id: 'round-cta',
    prompt: 'Pilih penutup yang mendorong aksi secara wajar.',
    options: [
      {
        id: 'cta-try',
        text: 'Coba sendiri, lalu bandingkan hasilnya.',
        score: 100,
        note: 'Aksi jelas tanpa tekanan berlebih.',
      },
      {
        id: 'cta-hurry',
        text: 'Buruan, nanti pasti menyesal.',
        score: 20,
        note: 'Tekanan waktu terasa memaksa.',
      },
      {
        id: 'cta-polite',
        text: 'Semoga bermanfaat untuk semuanya.',
        score: 50,
        note: 'Sopan, tetapi tidak mengarahkan aksi.',
      },
      {
        id: 'cta-avoid',
        text: 'Jangan tanya alasannya, ikuti saja.',
        score: 0,
        note: 'Menghindari pertanyaan yang wajar.',
      },
    ],
  },
];
