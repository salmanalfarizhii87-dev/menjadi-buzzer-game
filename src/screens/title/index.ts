/**
 * Screen: Title (Stitch) — slot save, lanjut, atau mulai baru.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/title_screen.html?raw';
import { characterImage } from '@/art/stitch/figures';
import { gameStage } from '@/components/game-stage/game-stage';
import { formatMoney } from '@/core/money';
import { $, bindRouteLinks, compact, replacePlaceholder, setText, stitchRoot } from '@/ui/stitch';
import { selectDisplayBalance, selectEquippedOutfit, selectPrimaryAccount } from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const state = ctx.store.getState();
  const account = selectPrimaryAccount(state);
  const balance = selectDisplayBalance(state);
  const outfit = selectEquippedOutfit(state);

  const screen = stitchRoot(template);

  setText(screen, '#save-summary', `${formatMoney(balance)} • ${compact(account?.followers ?? 0)} Followers`);
  const heading = $<HTMLElement>(screen, '#save-ready-card h2');
  heading.textContent = `${account?.name ?? '@KilatDaily'} • Lv ${state.player.careerLevel}`;

  const titleStage = gameStage({
    outfitId: outfit?.id ?? state.character.outfitId,
    controls: false,
    signal: ctx.signal,
  });
  titleStage.classList.add('game-stage--fill');
  replacePlaceholder(screen, 'Latar studio Menjadi Buzzer', titleStage);
  replacePlaceholder(
    screen,
    'Avatar @KilatDaily',
    characterImage(outfit?.id ?? state.character.outfitId),
  );

  const ready = $<HTMLElement>(screen, '#save-ready-card');
  const recovery = $<HTMLElement>(screen, '#save-recovery-card');
  const confirm = $<HTMLElement>(screen, '#new-game-confirm');

  const showConfirm = (): void => confirm.classList.remove('hidden');
  const hideConfirm = (): void => confirm.classList.add('hidden');

  for (const button of screen.querySelectorAll('button')) {
    const label = button.textContent?.trim() ?? '';
    if (label === 'Mulai Save Baru') {
      button.addEventListener('click', showConfirm);
    } else if (label === 'Batal') {
      button.addEventListener('click', hideConfirm);
    } else if (label === 'Uji Save Rusak') {
      button.addEventListener('click', () => {
        ready.classList.add('hidden');
        recovery.classList.remove('hidden');
      });
    } else if (label === 'Kembali ke Slot Save') {
      button.addEventListener('click', () => {
        recovery.classList.add('hidden');
        ready.classList.remove('hidden');
      });
    }
  }

  for (const anchor of screen.querySelectorAll<HTMLAnchorElement>('a')) {
    if (anchor.textContent?.includes('Ya, Timpa Save') || anchor.textContent?.includes('Buat Save Baru yang Bersih')) {
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const result = ctx.actions.resetSave();
        if (!result.ok) {
          ctx.toasts.error('Gagal membuat simpanan baru.');
          return;
        }
        ctx.navigate('character');
      });
    }
  }

  bindRouteLinks(screen, ctx);

  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'title', mount };
export default screenModule;
