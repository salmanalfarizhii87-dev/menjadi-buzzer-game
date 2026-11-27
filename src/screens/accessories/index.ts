import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/kustom_karakter_accessories.html?raw';
import { characterImage } from '@/art/stitch/figures';
import { formatMoney } from '@/core/money';
import { bindRouteLinks, replacePlaceholder, setText, stitchRoot } from '@/ui/stitch';
import { selectDisplayBalance, selectEquippedOutfit } from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const state = ctx.store.getState();
  const outfit = selectEquippedOutfit(state);
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);
  setText(screen, '#acc-balance', formatMoney(selectDisplayBalance(state)));
  setText(screen, 'main h1', state.accounts[0]?.name ?? '@KilatDaily');
  replacePlaceholder(
    screen,
    'Foto karakter memakai aksesori',
    characterImage(outfit?.id ?? state.character.outfitId),
  );
  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'accessories', mount };
export default screenModule;
