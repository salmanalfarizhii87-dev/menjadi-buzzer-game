import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/studio_location.html?raw';
import { formatMoney } from '@/core/money';
import { bindRouteLinks, stitchRoot } from '@/ui/stitch';
import { selectDisplayBalance } from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);
  const balance = screen.querySelector<HTMLElement>('header .bg-light-surface-bright span');
  if (balance) balance.textContent = formatMoney(selectDisplayBalance(ctx.store.getState()));
  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'studio', mount };
export default screenModule;
