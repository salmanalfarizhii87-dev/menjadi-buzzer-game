/**
 * Screen: Outfits (Stitch) — pilih dan pasang outfit.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/kustom_karakter_outfits.html?raw';
import { OUTFITS } from '@/data/shop/outfits';
import { characterImage } from '@/art/stitch/figures';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { bindRouteLinks, replacePlaceholder, setText, stitchRoot } from '@/ui/stitch';
import { selectDisplayBalance, selectEquippedOutfit } from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const state = ctx.store.getState();
  const equipped = selectEquippedOutfit(state);
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  setText(screen, '#outfits-balance', formatMoney(selectDisplayBalance(state)));
  setText(screen, 'section[aria-label="Pratinjau outfit karakter"] h1', state.accounts[0]?.name ?? '@KilatDaily');

  const grid = screen.querySelector<HTMLElement>('section[aria-label="Daftar outfits"] .grid');
  const source = grid?.querySelector<HTMLButtonElement>('.outfit-opt');
  if (!grid || !source) return;

  let selected = equipped?.id ?? state.character.outfitId;

  const preview = (outfitId: string): void => {
    replacePlaceholder(
      screen,
      'Foto karakter memakai outfit',
      characterImage(outfitId),
    );
    const bonus = screen.querySelector<HTMLElement>('#preview-bonus');
    const outfit = OUTFITS.find((entry) => entry.id === outfitId);
    if (bonus && outfit) bonus.textContent = `Outfit: ${t(outfit.nameKey)}${outfit.credibilityBonus ? ` • +${outfit.credibilityBonus} Kredibilitas` : ''}`;
  };

  const cards = grid.querySelectorAll<HTMLElement>('.outfit-opt, a');
  for (const card of cards) card.remove();

  for (const outfit of OUTFITS) {
    const owned = state.inventory.ownedItemIds.includes(outfit.id);
    const card = source.cloneNode(true) as HTMLButtonElement;
    card.querySelector('span')!.textContent = t(outfit.nameKey);
    const detail = card.querySelectorAll('span')[1];
    if (detail) detail.textContent = outfit.credibilityBonus ? `+${outfit.credibilityBonus} Kredibilitas` : 'Penampilan dasar';
    const status = card.querySelector<HTMLElement>('.outfit-status');
    if (status) {
      if (outfit.id === equipped?.id) {
        status.textContent = 'Dipakai';
        status.className = 'outfit-status px-gutter-sm py-gutter-xs rounded-full bg-success text-light-surface-bright font-headline text-label-sm';
      } else if (owned) {
        status.textContent = 'Milikmu';
        status.className = 'outfit-status px-gutter-sm py-gutter-xs rounded-full bg-dock-bg text-ink-dark font-headline text-label-sm';
      } else {
        status.textContent = `Shop • ${formatMoney(outfit.price)}`;
        status.className = 'outfit-status px-gutter-sm py-gutter-xs rounded-full bg-btn-yellow text-ink-dark font-headline text-label-sm tabular-nums';
      }
    }
    card.className = `outfit-opt flex flex-col items-center gap-gutter-xs p-gutter-sm rounded-xl border-2 ${outfit.id === selected ? 'border-success bg-dock-bg' : 'border-slate-300 bg-light-surface-bright'} cursor-pointer`;
    card.addEventListener('click', () => {
      if (!owned) {
        ctx.navigate('shop-detail', { id: outfit.id });
        return;
      }
      selected = outfit.id;
      preview(outfit.id);
      for (const node of grid.querySelectorAll('.outfit-opt')) {
        node.className = 'outfit-opt flex flex-col items-center gap-gutter-xs p-gutter-sm rounded-xl border-2 border-slate-300 bg-light-surface-bright cursor-pointer';
      }
      card.className = 'outfit-opt flex flex-col items-center gap-gutter-xs p-gutter-sm rounded-xl border-2 border-success bg-dock-bg cursor-pointer';
    });
    grid.appendChild(card);
  }

  preview(selected);

  const save = screen.querySelector<HTMLButtonElement>('button.ref-btn-green');
  save?.addEventListener('click', () => {
    const result = ctx.actions.equipOutfit(selected);
    if (!result.ok) {
      ctx.toasts.error(t(result.messageKey));
      return;
    }
    ctx.toasts.success('Outfit berhasil dipasang & disimpan!');
    ctx.navigate('customizer', { tab: 'player' });
  });

  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'outfits', mount };
export default screenModule;
