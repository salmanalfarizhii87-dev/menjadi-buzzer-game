/**
 * Screen: Strategy & Risk (Stitch) — pendekatan + postur risiko.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/strategy_risk_selection.html?raw';
import { findCampaign } from '@/data/campaigns/seed';
import {
  defaultStrategySelection,
  estimateCampaign,
  type CampaignStrategySelection,
} from '@/domain/campaigns/session';
import { relevantApproachIds } from '@/domain/campaigns/definition';
import { tierForSuspicion } from '@/domain/risk/tier';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { $, bindRouteLinks, setText, stitchRoot } from '@/ui/stitch';
import {
  selectDisplayBalance,
  selectPrimaryAccount,
  selectSessionById,
} from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  const state = ctx.store.getState();
  const session = selectSessionById(state, params['sessionId'] ?? '');
  const definition = session ? findCampaign(session.campaignDefinitionId) : undefined;

  if (!session || !definition) {
    ctx.toasts.error(t('error.campaign_not_found'));
    ctx.navigate('task');
    return;
  }

  const account = selectPrimaryAccount(state);
  if (!account) return;

  const approachButtons = Array.from(screen.querySelectorAll<HTMLButtonElement>('.approach-btn'));
  const postureButtons = Array.from(screen.querySelectorAll<HTMLButtonElement>('.posture-btn'));
  const approaches = ctx.config.strategy.contentApproach.filter((option) =>
    relevantApproachIds(definition, ctx.config.strategy.contentApproach.map((entry) => entry.id)).includes(option.id),
  );

  let selection: CampaignStrategySelection = defaultStrategySelection(definition, ctx.config);

  const paintButtons = (): void => {
    approachButtons.forEach((button, index) => {
      const option = approaches[index];
      button.hidden = !option;
      if (!option) return;
      const active = option.id === selection.approachId;
      button.className = `approach-btn ${active ? 'ref-opt-active' : 'ref-opt-idle'} rounded-xl p-gutter-sm flex flex-col items-center gap-gutter-xs cursor-pointer`;
      button.dataset['id'] = option.id;
    });
    postureButtons.forEach((button, index) => {
      const option = ctx.config.strategy.riskPosture[index];
      if (!option) return;
      const active = option.id === selection.postureId;
      button.className = `posture-btn ${active ? 'ref-opt-active' : 'ref-opt-idle'} rounded-xl p-gutter-sm flex flex-col items-center gap-gutter-xs cursor-pointer`;
      button.dataset['id'] = option.id;
    });
  };

  const paintEstimates = (): void => {
    const estimate = estimateCampaign(definition, account, ctx.config, selection, session.miniGameScore);
    setText(screen, '#est-reward', formatMoney(estimate.payment + estimate.bonus));
    const projected = Math.min(100, Math.round(account.suspicion + estimate.suspicionDelta));
    const tier = tierForSuspicion(projected, ctx.config);
    setText(screen, '#est-risk', t(`risk.tier.${tier}`));
    const warning = $<HTMLElement>(screen, '#warning-text');
    warning.textContent = `Kondisi ${account.name} saat ini ${t(`risk.tier.${tierForSuspicion(account.suspicion, ctx.config)}`)} (Suspicion ${Math.round(account.suspicion)}/100). Estimasi suspicion setelah kampanye: ${projected}/100 (${t(`risk.tier.${tier}`)}).`;
  };

  approachButtons.forEach((button, index) => {
    const option = approaches[index];
    if (!option) return;
    button.querySelector('span')!.textContent = t(option.labelKey);
    const hint = button.querySelectorAll('span')[1];
    if (hint) hint.textContent = option.performanceModifier >= 0 ? `Performa +${option.performanceModifier}` : `Performa ${option.performanceModifier}`;
    button.addEventListener('click', () => {
      selection = { ...selection, approachId: option.id };
      paintButtons();
      paintEstimates();
    });
  });

  postureButtons.forEach((button, index) => {
    const option = ctx.config.strategy.riskPosture[index];
    if (!option) return;
    button.querySelector('span')!.textContent = t(option.labelKey);
    const hint = button.querySelectorAll('span')[1];
    if (hint) hint.textContent = option.riskModifier < 0 ? 'Risiko -' : option.riskModifier > 0 ? 'Risiko ++' : 'Standar';
    button.addEventListener('click', () => {
      selection = { ...selection, postureId: option.id };
      paintButtons();
      paintEstimates();
    });
  });

  const details = $<HTMLElement>(screen, 'header .ref-cyan-pill');
  const subtitle = details.querySelector<HTMLElement>('.font-mono');
  if (subtitle) subtitle.textContent = `#${definition.campaignName} • Aktif`;
  setText(screen, 'header .bg-light-surface-bright span', formatMoney(selectDisplayBalance(state)));

  const back = $<HTMLAnchorElement>(screen, 'header a');
  back.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    ctx.navigate('campaign-brief', { id: definition.id });
  }, { capture: true });

  const confirm = $<HTMLAnchorElement>(screen, 'main .ref-btn-green');
  const auto = definition.miniGameId === null;
  confirm.querySelector('span')!.textContent = auto ? 'Konfirmasi & Selesaikan' : 'Konfirmasi & Mulai Mini-Game';
  confirm.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    const result = ctx.actions.selectCampaignStrategy({
      sessionId: session.id,
      approachId: selection.approachId,
      intensityId: 'normal',
      postureId: selection.postureId,
    });
    if (!result.ok) {
      ctx.toasts.error(t(result.messageKey));
      return;
    }
    ctx.navigate(auto ? 'campaign-result' : 'campaign-minigame', { sessionId: session.id });
  }, { capture: true });

  paintButtons();
  paintEstimates();
  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'campaign-strategy', mount };
export default screenModule;
