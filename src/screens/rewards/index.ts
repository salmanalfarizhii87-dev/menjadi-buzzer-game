import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/rewards_collectibles.html?raw';
import { formatMoney } from '@/core/money';
import { bindRouteLinks, setText, stitchRoot } from '@/ui/stitch';
import { selectDisplayBalance } from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);
  setText(screen, '#rc-balance', formatMoney(selectDisplayBalance(ctx.store.getState())));
  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'rewards', mount };
export default screenModule;
