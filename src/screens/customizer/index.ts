/**
 * Screen: Character Customizer (Stitch) — hub Player/Outfits/Accessories.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/character_customizer.html?raw';
import { avatarImage, characterImage } from '@/art/stitch/figures';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { bindRouteLinks, replacePlaceholder, setText, stitchRoot } from '@/ui/stitch';
import { selectDisplayBalance, selectEquippedOutfit } from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const state = ctx.store.getState();
  const outfit = selectEquippedOutfit(state);
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  setText(screen, '#cust-balance', formatMoney(selectDisplayBalance(state)));
  setText(screen, 'section[aria-label] h1, main h1', state.accounts[0]?.name ?? '@KilatDaily');
  const level = screen.querySelector<HTMLElement>('#preview-level-badge');
  if (level) level.textContent = `Lv ${state.player.careerLevel} • Buzzer Pemula`;
  const outfitPill = screen.querySelector<HTMLElement>('#preview-outfit-pill');
  if (outfitPill) outfitPill.textContent = `Outfit: ${outfit ? t(outfit.nameKey) : '—'}`;
  const accPill = screen.querySelector<HTMLElement>('#preview-acc-pill');
  if (accPill) accPill.textContent = `Aksesori: ${state.character.accessoryIds.length > 0 ? state.character.accessoryIds.length : 'Tidak ada'}`;

  replacePlaceholder(
    screen,
    'Foto karakter @KilatDaily',
    characterImage(outfit?.id ?? state.character.outfitId),
  );
  for (const label of ['Kilat Klasik', 'Rina Strategis', 'Bima Topi', 'Dika Streamer']) {
    replacePlaceholder(screen, label, avatarImage(label));
  }

  const tabs = Array.from(screen.querySelectorAll<HTMLButtonElement>('.custom-tab'));
  const panels: Record<string, HTMLElement | null> = {
    player: screen.querySelector('#panel-player'),
    outfits: screen.querySelector('#panel-outfits'),
    accessories: screen.querySelector('#panel-accessories'),
  };
  const apply = (tab: string): void => {
    tabs.forEach((button) => {
      const active = button.dataset['tab'] === tab;
      button.setAttribute('aria-selected', active ? 'true' : 'false');
      button.className = `custom-tab px-gutter-sm py-gutter-sm rounded-lg ${active ? 'bg-btn-yellow text-ink-dark' : 'text-light-surface-bright'} font-headline text-label-sm cursor-pointer`;
    });
    for (const [key, panel] of Object.entries(panels)) panel?.classList.toggle('hidden', key !== tab);
  };
  tabs.forEach((button) => button.addEventListener('click', () => apply(button.dataset['tab'] ?? 'player')));
  apply(params['tab'] ?? 'player');

  const save = screen.querySelector<HTMLButtonElement>('button.ref-btn-green');
  save?.addEventListener('click', () => {
    const applied = ctx.actions.equipOutfit(outfit?.id ?? state.character.outfitId);
    if (applied.ok) ctx.toasts.success('Outfit dipasang.');
  });

  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'customizer', mount };
export default screenModule;
