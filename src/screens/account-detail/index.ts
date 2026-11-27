/**
 * Screen: Account Detail (Stitch).
 */

import type { ScreenContext, ScreenModule } from '@/app/lifecycle';
import template from '@/templates/stitch/account_detail.html?raw';
import { characterImage } from '@/art/stitch/figures';
import { formatDecimal, formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { $, bindRouteLinks, replacePlaceholder, setText, stitchRoot } from '@/ui/stitch';
import {
  selectDisplayBalance,
  selectEquippedOutfit,
  selectIncomeRate,
  selectPrimaryAccount,
  selectRiskMeter,
} from '@/state/selectors';
import type { GameSave } from '@/state/types';

function statusClass(status: string): string {
  if (status === 'normal') return 'inline-flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full bg-success text-on-success shrink-0';
  if (status === 'warning') return 'inline-flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full bg-btn-yellow text-ink-dark shrink-0';
  return 'inline-flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full bg-light-error-container text-light-on-error-container shrink-0';
}

function mount(root: HTMLElement, ctx: ScreenContext): void {
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  const patch = (state: GameSave): void => {
    const account = selectPrimaryAccount(state);
    const risk = selectRiskMeter(state, ctx.config);
    const balance = selectDisplayBalance(state);
    const outfit = selectEquippedOutfit(state);
    const name = account?.name ?? '@KilatDaily';
    const rate = selectIncomeRate(state, ctx.config);

    setText(screen, '#acc-balance', formatMoney(balance));
    const hudRate = screen.querySelector<HTMLElement>('header .ref-cyan-pill .font-mono');
    if (hudRate) hudRate.textContent = `+Rp ${formatDecimal(rate, 2)}/dtk`;

    const subHeader = $<HTMLElement>(screen, 'header .bg-light-surface-bright');
    const title = subHeader.querySelector<HTMLElement>('h1');
    if (title) title.textContent = `Detail ${name}`;
    const headerStatus = subHeader.querySelector<HTMLElement>('span.text-success');
    if (headerStatus) headerStatus.textContent = t(`status.${account?.status ?? 'normal'}`);

    const identity = $<HTMLElement>(screen, 'main article.ref-card');
    const identityName = identity.querySelector<HTMLElement>('h2');
    if (identityName) identityName.textContent = name;
    const platform = identity.querySelector<HTMLElement>('p.font-body');
    if (platform) platform.textContent = `Platform: Chirper • Auto Lv ${account?.automationLevel ?? 0}`;
    const incomeLine = identity.querySelector<HTMLElement>('p.font-headline');
    if (incomeLine) incomeLine.textContent = `Income: +Rp ${formatDecimal(rate, 2)}/dtk`;

    const statusBadge = identity.querySelector<HTMLElement>('[role="status"]');
    if (statusBadge) {
      statusBadge.className = statusClass(account?.status ?? 'normal');
      statusBadge.textContent = t(`status.${account?.status ?? 'normal'}`);
    }
    const levelBadge = identity.querySelector<HTMLElement>('.bg-btn-yellow');
    if (levelBadge) levelBadge.textContent = `Lv ${state.player.careerLevel}`;

    replacePlaceholder(
      screen,
      `Avatar akun ${name}`,
      characterImage(outfit?.id ?? state.character.outfitId),
    );

    const metrics = screen.querySelectorAll<HTMLElement>('section[aria-label="Statistik utama akun"] p');
    if (metrics[0]) metrics[0].textContent = new Intl.NumberFormat('id-ID').format(account?.followers ?? 0);
    if (metrics[1]) metrics[1].textContent = String(account?.reputation ?? 0);

    const bars = screen.querySelectorAll<HTMLElement>('.ref-progress-track > div');
    const performance = Math.round(account?.performance ?? 0);
    const suspicion = Math.round(account?.suspicion ?? 0);
    if (bars[0]) bars[0].style.width = `${performance}%`;
    if (bars[1]) {
      bars[1].style.width = `${suspicion}%`;
      bars[1].className = `h-full rounded-full ${suspicion >= 85 ? 'bg-btn-red' : suspicion >= 60 ? 'bg-btn-orange' : suspicion >= 30 ? 'bg-btn-yellow' : 'bg-hud-cyan'}`;
    }

    const labels = screen.querySelectorAll<HTMLElement>('.ref-progress-track');
    const performanceLabel = labels[0]?.previousElementSibling?.querySelectorAll('span')[1];
    if (performanceLabel) performanceLabel.textContent = `${performance} / 100`;
    const suspicionLabel = labels[1]?.previousElementSibling?.querySelectorAll('span')[1];
    if (suspicionLabel) suspicionLabel.textContent = `${suspicion} / 100 • ${t(`risk.tier.${risk.tier}`)}`;
    const suspiciousTitle = labels[1]?.previousElementSibling?.querySelector('span');
    if (suspiciousTitle) suspiciousTitle.textContent = `Dicurigai (Warning di ${ctx.config.statusThresholds.warningSuspicion}+)`;
  };

  patch(ctx.store.getState());
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

const screenModule: ScreenModule = { id: 'account-detail', mount };
export default screenModule;
