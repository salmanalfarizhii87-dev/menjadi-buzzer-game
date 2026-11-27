/**
 * Screen: Campaign Result (Stitch success/failure).
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import successTemplate from '@/templates/stitch/campaign_result.html?raw';
import failureTemplate from '@/templates/stitch/campaign_result_failure.html?raw';
import { findCampaign } from '@/data/campaigns/seed';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { bindRouteLinks, setText, stitchRoot } from '@/ui/stitch';
import {
  selectDisplayBalance,
  selectSessionById,
  selectViolations,
} from '@/state/selectors';

function signed(value: number): string {
  return value > 0 ? `+${value}` : String(value);
}

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const sessionId = params['sessionId'] ?? '';
  const before = selectSessionById(ctx.store.getState(), sessionId);

  if (before && before.status !== 'resolved') {
    const resolved = ctx.actions.resolveCampaign(sessionId);
    if (!resolved.ok) {
      ctx.toasts.error(t(resolved.messageKey));
      ctx.navigate('task');
      return;
    }
  }

  const state = ctx.store.getState();
  const session = selectSessionById(state, sessionId);
  const snapshot = session?.status === 'resolved' ? session.result : null;
  const definition = session ? findCampaign(session.campaignDefinitionId) : undefined;

  if (!session || !snapshot || !definition) {
    ctx.toasts.error(t('result.notReady'));
    ctx.navigate('task');
    return;
  }

  const success = snapshot.outcome === 'success';
  const screen = stitchRoot(success ? successTemplate : failureTemplate);
  bindRouteLinks(screen, ctx);

  const accountName = state.accounts[0]?.name ?? '@KilatDaily';
  setText(screen, 'header .font-mono', `#${definition.campaignName} • Selesai`);
  setText(screen, 'header .bg-light-surface-bright span', formatMoney(selectDisplayBalance(state)));

  const score = screen.querySelector<HTMLElement>('section[aria-label="Status hasil kampanye"] span[id], section[aria-label="Status hasil kampanye"] .font-headline.tabular-nums');
  if (score) score.textContent = `${snapshot.performanceScore} / 100`;

  if (success) {
    const values = screen.querySelectorAll<HTMLElement>('article:nth-of-type(1) .bg-dock-bg .font-headline');
    if (values[0]) values[0].textContent = `+${formatMoney(snapshot.reward)}`;
    if (values[1]) values[1].textContent = `+${formatMoney(snapshot.bonus)}`;
    if (values[2]) values[2].textContent = `+${formatMoney(snapshot.reward + snapshot.bonus)}`;
  } else {
    const values = screen.querySelectorAll<HTMLElement>('article:nth-of-type(1) .bg-dock-bg .font-headline');
    if (values[0]) values[0].textContent = formatMoney(0);
    if (values[1]) values[1].textContent = `-${formatMoney(snapshot.fine)}`;
    if (values[2]) {
      values[2].textContent = t(`status.${snapshot.statusAfter}`);
      values[2].className = 'px-gutter-sm py-gutter-xs rounded-full bg-light-tertiary text-light-on-tertiary font-headline text-label-sm';
    }
  }

  const statValues = screen.querySelectorAll<HTMLElement>('article:nth-of-type(2) .grid .font-headline');
  const deltas = [
    snapshot.followersDelta,
    snapshot.performanceDelta,
    snapshot.reputationDelta,
    snapshot.suspicionDelta,
  ];
  statValues.forEach((node, index) => {
    const value = deltas[index] ?? 0;
    node.textContent = signed(value);
    node.className = `font-headline text-body-md ${value >= 0 ? 'text-success' : 'text-light-error'} tabular-nums`;
  });

  const note = screen.querySelector<HTMLElement>('aside p');
  if (note) {
    const violations = selectViolations(state).filter((violation) => violation.sourceId === session.id);
    const bits = [
      `Strategi ${t(`strategy.approach.${snapshot.strategyId}`)} · postur ${t(`strategy.posture.${snapshot.riskPosture}`)}.`,
      `Peluang sukses ${Math.round(snapshot.successProbability * 100)}%, roll ${snapshot.roll.toFixed(3)}.`,
    ];
    if (snapshot.tierBefore && snapshot.tierAfter && snapshot.tierBefore !== snapshot.tierAfter) {
      bits.push(`Tingkat risiko ${t(`risk.tier.${snapshot.tierBefore}`)} → ${t(`risk.tier.${snapshot.tierAfter}`)}.`);
    }
    if (violations.length > 0) {
      bits.push(`${violations.length} konsekuensi risiko dicatat di tab Pelanggaran.`);
    }
    note.textContent = `${accountName}: ${bits.join(' ')}`;
  }

  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'campaign-result', mount };
export default screenModule;
