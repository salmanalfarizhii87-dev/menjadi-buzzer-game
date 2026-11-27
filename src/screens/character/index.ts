/**
 * Screen: Home (Stitch business_home). Scene kamar + HUD + 5 tab.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/business_home.html?raw';
import { characterImage } from '@/art/stitch/figures';
import { gameStage, type GameStageElement } from '@/components/game-stage/game-stage';
import { formatDecimal, formatMoney } from '@/core/money';
import {
  $,
  bindRouteLinks,
  compact,
  replacePlaceholder,
  stitchRoot,
} from '@/ui/stitch';
import { campaignCardStatus } from '@/components/campaigns/campaign-card';
import {
  selectCampaignEntries,
  selectDisplayBalance,
  selectEquippedOutfit,
  selectIncomeRate,
  selectPrimaryAccount,
} from '@/state/selectors';
import type { GameSave } from '@/state/types';

function rateLabel(rate: number): string {
  const sign = rate < 0 ? '-' : '+';
  return `${sign}Rp ${formatDecimal(Math.abs(rate), 2)}/dtk`;
}

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const screen = stitchRoot(template);
  screen.classList.add('game-home-screen');
  bindRouteLinks(screen, ctx);

  const balanceNode = $<HTMLElement>(screen, '#hud-balance');
  const rateNode = $<HTMLElement>(screen, '#hud-rate');
  const ribbon = $<HTMLElement>(screen, 'header .bg-btn-red-dark');
  const handleNode = ribbon.children[0] as HTMLElement;
  const followersNode = ribbon.children[1] as HTMLElement;
  const ribbonRate = ribbon.children[2] as HTMLElement;

  const suspicionRow = $<HTMLElement>(screen, 'header .ref-progress-track').previousElementSibling as HTMLElement;
  const suspicionLabel = suspicionRow.children[0] as HTMLElement;
  const suspicionValue = suspicionRow.children[1] as HTMLElement;
  const suspicionFill = $<HTMLElement>(screen, 'header .ref-progress-track > div');

  const campaignSplit = $<HTMLElement>(screen, '.game-home-task-count');
  const navCampaignBadge = $<HTMLElement>(screen, 'nav a[aria-label="Kampanye"] span');

  let renderedOutfit = '';
  let activeStage: GameStageElement | null = null;

  const renderFigure = (state: GameSave): void => {
    const outfit = selectEquippedOutfit(state);
    const outfitId = outfit?.id ?? state.character.outfitId;
    if (outfitId === renderedOutfit) return;
    renderedOutfit = outfitId;

    activeStage?.stopStage?.();
    const stage = gameStage({ outfitId, signal: ctx.signal });
    activeStage = stage;
    stage.classList.add('game-stage--fill');
    replacePlaceholder(
      screen,
      'Karakter utama @KilatDaily bekerja di laptop studio buzzer',
      stage,
    );
    replacePlaceholder(
      screen,
      'Karakter @KilatDaily',
      characterImage(outfitId),
    );
  };

  const patch = (state: GameSave): void => {
    const balance = selectDisplayBalance(state);
    const account = selectPrimaryAccount(state);
    const entries = selectCampaignEntries(state);
    const available = entries.filter((entry) => campaignCardStatus(entry) === 'available').length;

    balanceNode.textContent = formatMoney(balance);
    rateNode.textContent = rateLabel(selectIncomeRate(state, ctx.config));
    handleNode.textContent = account?.name ?? '@KilatDaily';
    followersNode.textContent = compact(account?.followers ?? 0);
    ribbonRate.textContent = rateLabel(selectIncomeRate(state, ctx.config)).replace('/dtk', '');

    const suspicion = Math.round(account?.suspicion ?? 0);
    suspicionLabel.textContent = `Suspicion ${suspicion > 29 ? 'naik' : 'aman'}...`;
    suspicionValue.textContent = `${suspicion}/100`;
    suspicionFill.style.width = `${Math.min(100, Math.max(0, suspicion))}%`;

    campaignSplit.textContent = String(available);
    navCampaignBadge.textContent = String(available);

    renderFigure(state);
  };

  const initial = ctx.store.getState();
  patch(initial);
  root.replaceChildren(screen);

  let scheduled = false;
  const unsubscribe = ctx.store.subscribe((state) => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      patch(state);
    });
  });
  ctx.signal.addEventListener('abort', () => unsubscribe(), { once: true });
}

const screenModule: ScreenModule = { id: 'character', mount };
export default screenModule;
