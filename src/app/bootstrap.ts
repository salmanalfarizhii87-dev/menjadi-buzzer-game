/**
 * Bootstrap: load save → validate → migrate → fallback initial → context →
 * router → home → sembunyikan #boot.
 */

import { BALANCE } from '@/data/config/balance';
import { systemClock, type Clock } from '@/core/clock';
import { appRoots, el } from '@/core/dom';
import { button } from '@/components/buttons/button';
import { createOverlayService } from '@/components/modal/modal';
import { createToastService } from '@/components/toast/toast';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameStore } from '@/state/game-store';
import { createGameActions } from '@/state/actions';
import { createInitialSave } from '@/state/initial-state';
import { createIncomeScheduler } from '@/application/income/income-scheduler';
import { createStockScheduler } from '@/application/stocks/stock-scheduler';
import { ensureMarket } from '@/domain/stocks/market';
import { COMPANIES } from '@/data/stocks/companies';
import { listBackups } from '@/persistence/backup';
import { t } from '@/data/strings/id';
import { installDebugApi, readDebugOptions, type DebugOptions } from './debug';
import type { GameSave } from '@/state/types';
import { createRouter } from './router';
import { createScreenContext, type AppContext } from './context';
import type { ScreenId } from './lifecycle';

export interface BootstrapOptions {
  clock?: Clock;
}

export interface BootstrappedApp {
  store: ReturnType<typeof createGameStore>;
  actions: ReturnType<typeof createGameActions>;
  navigate: (screenId: ScreenId, params?: Record<string, string>) => Promise<void>;
  dispose: () => void;
}

export async function bootstrap(options: BootstrapOptions = {}): Promise<BootstrappedApp> {
  const clock = options.clock ?? systemClock;
  const roots = appRoots();

  const toasts = createToastService(roots.toast);
  const overlays = createOverlayService(roots.overlay);

  const debug: DebugOptions = import.meta.env.DEV
    ? readDebugOptions(typeof window === 'undefined' ? '' : window.location.search, true)
    : { enabled: false, roll: null, seed: null };

  let writeWarningShown = false;
  const repository = createSaveRepository({
    now: () => clock.now(),
    onWriteError: (code) => {
      if (writeWarningShown) return;
      writeWarningShown = true;
      toasts.error(t(code === 'quota' ? 'error.storage_quota' : 'error.persistence_failed'));
    },
  });

  const now = clock.now();
  const loaded = repository.load();

  let save: GameSave;
  let showRecovery = false;
  let migratedNeedsPersist = false;

  if (loaded.ok) {
    save = loaded.save;
    // Jika baru dimigrasi, tulis segera agar schema v2 tersimpan dan backup
    // v1 tidak dipakai lagi pada load berikutnya.
    if (loaded.migrated) {
      migratedNeedsPersist = true;
    }
  } else if (loaded.reason === 'empty') {
    save = createInitialSave(BALANCE, now);
  } else {
    // Save rusak / versi lebih baru: jangan timpa. Pakai state awal in-memory
    // dan tampilkan recovery UI; tidak menulis ke storage sampai pemain memilih.
    save = createInitialSave(BALANCE, now);
    showRecovery = true;
    console.error('[menjadi-buzzer] save tidak dapat dimuat:', loaded.reason, loaded.issues);
  }

  // Tidak ada offline income: accrual dimulai dari sekarang, bukan dari savedAt.
  save = {
    ...save,
    activeTime: { ...save.activeTime, lastAccrualAt: now },
    stocks: {
      ...ensureMarket(save.stocks, COMPANIES, now),
      lastTickAt: now,
      ...(debug.seed !== null ? { seed: debug.seed } : {}),
    },
  };

  if (migratedNeedsPersist) {
    // Persist hasil migrasi segera, sebelum UI berjalan.
    repository.saveNow(save);
  }

  const store = createGameStore({ initialState: save });
  const forcedRoll = debug.roll;
  const actions = createGameActions({
    store,
    config: BALANCE,
    repository,
    clock,
    ...(forcedRoll !== null ? { random: () => forcedRoll } : {}),
  });
  if (import.meta.env.DEV && debug.enabled) {
    installDebugApi({ store, actions, config: BALANCE, roll: debug.roll, seed: debug.seed });
  }

  // Mode recovery: jangan menulis apa pun sampai pemain memilih, agar save
  // rusak/versi lebih baru tidak tertimpa state awal.
  const persistenceEnabled = !showRecovery;

  if (persistenceEnabled) {
    store.onCommit((state) => {
      repository.saveDebounced(state);
    });
  }

  const appContext: AppContext = {
    store,
    actions,
    config: BALANCE,
    clock,
    overlays,
    toasts,
    navigate: (screenId, params) => {
      void router.navigate(screenId, params);
    },
    back: () => {
      void router.back();
    },
  };

  const router = createRouter({
    root: roots.app,
    buildContext: (signal) => createScreenContext(appContext, signal),
    onError: (error, screenId) => {
      toasts.error(`Gagal membuka layar ${screenId}.`);
      console.error('[menjadi-buzzer] router error', error);
    },
  });

  // Flush income pending sebelum meninggalkan halaman agar ledger konsisten.
  const onHide = (): void => {
    actions.flushPendingIncome();
    repository.flush();
  };
  const scheduler = createIncomeScheduler({ actions, config: BALANCE });
  const stockScheduler = createStockScheduler({ actions, config: BALANCE });

  if (persistenceEnabled) {
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') onHide();
    });
    scheduler.start();
    stockScheduler.start();
    // Suspicion menurun saat istirahat: terapkan decay lalu evaluasi tier
    // sebelum layar pertama dirender, agar risk meter langsung akurat.
    actions.settleRisk();
  }

  await router.navigate('title');

  roots.boot.hidden = true;

  if (showRecovery) {
    showRecoveryModal();
  }

  function showRecoveryModal(): void {
    const backups = listBackups().sort((a, b) => b.key.localeCompare(a.key));
    const latestBackup = backups[0];

    overlays.openModal({
      title: 'Data simpanan bermasalah',
      variant: 'danger',
      message:
        'Progres lama tidak dapat dibaca. Data asli tidak dihapus. Kamu bisa memuat ulang, memulihkan cadangan bila ada, atau memulai permainan baru.',
      dismissible: false,
      actions: [
        ...(latestBackup
          ? [
              {
                label: 'Pulihkan cadangan',
                variant: 'primary' as const,
                onClick: () => {
                  if (!repository.restoreRaw(latestBackup.raw)) {
                    toasts.error('Cadangan gagal dipulihkan.');
                    return;
                  }
                  window.location.reload();
                },
              },
            ]
          : []),
        {
          label: 'Muat ulang halaman',
          variant: latestBackup ? ('ghost' as const) : ('primary' as const),
          onClick: () => window.location.reload(),
        },
        {
          label: 'Mulai baru (hapus simpanan)',
          variant: 'danger',
          onClick: () => {
            const result = actions.resetSave();
            if (result.ok) {
              window.location.reload();
            } else {
              toasts.error('Gagal membuat simpanan baru.');
            }
          },
        },
      ],
    });
  }

  return {
    store,
    actions,
    navigate: (screenId, params) => router.navigate(screenId, params),
    dispose: () => {
      if (import.meta.env.DEV && window.__menjadiBuzzer?.store === store) {
        delete window.__menjadiBuzzer;
      }
      window.removeEventListener('pagehide', onHide);
      scheduler.stop();
      stockScheduler.stop();
      router.dispose();
      repository.flush();
    },
  };
}

/** Dipakai layar untuk menampilkan error fatal yang tidak bisa dipulihkan. */
export function renderFatalError(root: HTMLElement, message: string): void {
  root.replaceChildren(
    el(
      'div',
      { class: 'app-frame' },
      el(
        'main',
        { class: 'app-main app-main--full' },
        el('section', { class: 'screen' }, [
          el('h1', { text: 'Terjadi kesalahan' }),
          el('p', { class: 'text-soft', text: message }),
          button({
            label: 'Muat ulang',
            variant: 'primary',
            block: true,
            onClick: () => window.location.reload(),
          }),
        ]),
      ),
    ),
  );
}
