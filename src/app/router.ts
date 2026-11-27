/**
 * Router layar. Tidak menyentuh state game: hanya memasang/mencopot modul layar.
 */

import type { ScreenContext, ScreenId, ScreenModule, ScreenParams } from './lifecycle';
import { isScreenId } from './lifecycle';
import { screenLoaders } from './screen-registry';

export interface RouterDeps {
  root: HTMLElement;
  buildContext: (signal: AbortSignal) => Omit<ScreenContext, 'signal'>;
  onError?: (error: unknown, screenId: ScreenId) => void;
}

export interface Router {
  navigate(screenId: ScreenId, params?: ScreenParams): Promise<void>;
  current(): { screenId: ScreenId; params: ScreenParams } | null;
  /** Back memakai history internal sederhana (bukan History API). */
  back(): Promise<void>;
  dispose(): void;
}

interface StackEntry {
  screenId: ScreenId;
  params: ScreenParams;
}

export function createRouter(deps: RouterDeps): Router {
  const { root, buildContext, onError } = deps;

  let active: ScreenModule | null = null;
  let activeAbort: AbortController | null = null;
  let currentEntry: StackEntry | null = null;
  let stack: StackEntry[] = [];
  let navigating = false;

  const teardown = (): void => {
    try {
      active?.unmount?.();
    } catch (error) {
      console.error('[router] unmount gagal', error);
    }
    activeAbort?.abort();
    active = null;
    activeAbort = null;
  };

  const navigate = async (screenId: ScreenId, params: ScreenParams = {}): Promise<void> => {
    if (!isScreenId(screenId)) {
      console.error(`[router] screen id tidak dikenal: ${screenId}`);
      return;
    }

    if (navigating) {
      // Cegah navigasi bersamaan yang bisa menghasilkan dua mount.
      return;
    }

    navigating = true;

    try {
      teardown();
      root.replaceChildren();

      const module = await screenLoaders[screenId]();
      const screen = module.default;

      activeAbort = new AbortController();
      const ctx: ScreenContext = { ...buildContext(activeAbort.signal), signal: activeAbort.signal };

      active = screen;
      screen.mount(root, ctx, params);

      if (currentEntry) {
        stack = [...stack, currentEntry].slice(-20);
      }
      currentEntry = { screenId, params };
    } catch (error) {
      console.error('[router] gagal membuka layar', screenId, error);
      onError?.(error, screenId);
    } finally {
      navigating = false;
    }
  };

  return {
    navigate,

    current() {
      return currentEntry;
    },

    async back() {
      const previous = stack.pop();
      if (!previous) {
        await navigate('character');
        return;
      }
      // Hindari mendorong ulang entri saat kembali.
      const target = previous;
      teardown();
      root.replaceChildren();

      const module = await screenLoaders[target.screenId]();
      const screen = module.default;
      activeAbort = new AbortController();
      const ctx: ScreenContext = {
        ...buildContext(activeAbort.signal),
        signal: activeAbort.signal,
      };
      active = screen;
      screen.mount(root, ctx, target.params);
      currentEntry = target;
    },

    dispose() {
      teardown();
      stack = [];
      currentEntry = null;
    },
  };
}
