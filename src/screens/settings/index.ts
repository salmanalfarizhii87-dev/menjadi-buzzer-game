/**
 * Screen: Settings (Stitch) — audio, gameplay, reset save.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/settings_options.html?raw';
import { characterImage } from '@/art/stitch/figures';
import { $, bindRouteLinks, replacePlaceholder, setText, stitchRoot } from '@/ui/stitch';
import { selectEquippedOutfit, selectPrimaryAccount } from '@/state/selectors';
import type { GameSettings } from '@/state/types';

const SWITCH_KEYS: Array<keyof GameSettings> = [
  'soundEnabled',
  'soundEnabled',
  'confirmRisk',
  'incomePop',
  'qaMode',
];

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const state = ctx.store.getState();
  const account = selectPrimaryAccount(state);
  const outfit = selectEquippedOutfit(state);
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  const name = account?.name ?? '@KilatDaily';
  setText(screen, 'main article h1', name);
  setText(screen, 'main article p.font-body', `Save Lokal Aktif • Schema v${state.schemaVersion}`);
  replacePlaceholder(
    screen,
    'Avatar @KilatDaily',
    characterImage(outfit?.id ?? state.character.outfitId),
  );

  const switches = Array.from(screen.querySelectorAll<HTMLButtonElement>('button[role="switch"]'));

  const paint = (): void => {
    const settings = ctx.store.getState().settings;
    switches.forEach((button, index) => {
      const key = SWITCH_KEYS[index];
      const on = key ? settings[key] === true : false;
      button.setAttribute('aria-checked', on ? 'true' : 'false');
      button.className = on
        ? 'w-14 h-8 rounded-full bg-success border-2 border-ink-dark p-0.5 flex items-center justify-end cursor-pointer'
        : 'w-14 h-8 rounded-full bg-slate-300 border-2 border-slate-500 p-0.5 flex items-center justify-start cursor-pointer';
    });
  };

  switches.forEach((button, index) => {
    const key = SWITCH_KEYS[index];
    if (!key) return;
    button.addEventListener('click', () => {
      const current = ctx.store.getState().settings[key] === true;
      ctx.actions.updateSetting(key, !current);
      paint();
    });
  });

  const confirmBox = $<HTMLElement>(screen, '#reset-confirm-box');
  const done = $<HTMLElement>(screen, '#reset-done-msg');

  for (const button of screen.querySelectorAll<HTMLButtonElement>('button')) {
    const label = button.textContent?.trim();
    if (label === 'Reset Save Game') {
      button.addEventListener('click', () => confirmBox.classList.remove('hidden'));
    } else if (label === 'Batal') {
      button.addEventListener('click', () => confirmBox.classList.add('hidden'));
    } else if (label === 'Ya, Reset Semua') {
      button.addEventListener('click', () => {
        const result = ctx.actions.resetSave();
        if (!result.ok) {
          ctx.toasts.error('Gagal mereset simpanan.');
          return;
        }
        done.classList.remove('hidden');
        ctx.toasts.success('Save berhasil direset.');
        ctx.navigate('title');
      });
    }
  }

  paint();
  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'settings', mount };
export default screenModule;
