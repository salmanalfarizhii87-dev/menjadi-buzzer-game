/**
 * Screen: Campaign Board (Stitch) — kontrak + pelanggaran.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/campaign_board.html?raw';
import { CAMPAIGNS } from '@/data/campaigns/seed';
import { resumeCampaign } from '@/application/campaigns/resume';
import { campaignCardStatus } from '@/components/campaigns/campaign-card';
import { formatDecimal, formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import {
  $,
  bindRouteLinks,
  setText,
  stitchRoot,
} from '@/ui/stitch';
import {
  selectCampaignEntries,
  selectDisplayBalance,
  selectIncomeRate,
  selectPrimaryAccount,
  selectViolations,
} from '@/state/selectors';
import { screenForCampaignStage } from '@/screens/campaign-routes';
import type { GameSave } from '@/state/types';

function rateLabel(rate: number): string {
  return `+Rp ${formatDecimal(rate, 2)}/dtk`;
}

function difficultyLabel(difficulty: number): string {
  if (difficulty >= 3) return 'Sulit';
  if (difficulty === 2) return 'Sedang';
  return 'Mudah';
}

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const screen = stitchRoot(template);
  screen.classList.add('tb-loker-page');
  bindRouteLinks(screen, ctx);

  const panelKontrak = $<HTMLElement>(screen, '#panel-kontrak');
  const panelPelanggaran = $<HTMLElement>(screen, '#panel-pelanggaran');
  const tabKontrak = $<HTMLButtonElement>(screen, '#tab-kontrak');
  const tabPelanggaran = $<HTMLButtonElement>(screen, '#tab-pelanggaran');

  let activeTab: 'kontrak' | 'pelanggaran' = params['tab'] === 'pelanggaran' ? 'pelanggaran' : 'kontrak';

  const applyTab = (): void => {
    panelKontrak.classList.toggle('hidden', activeTab !== 'kontrak');
    panelPelanggaran.classList.toggle('hidden', activeTab !== 'pelanggaran');
    tabKontrak.className =
      activeTab === 'kontrak'
        ? 'ref-btn-yellow rounded-xl py-2.5 font-headline text-label-lg text-ink-dark'
        : 'ref-btn-white rounded-xl py-2.5 font-headline text-label-lg text-ink-dark';
    tabPelanggaran.className =
      activeTab === 'pelanggaran'
        ? 'ref-btn-yellow rounded-xl py-2.5 font-headline text-label-lg text-ink-dark'
        : 'ref-btn-white rounded-xl py-2.5 font-headline text-label-lg text-ink-dark';
    tabKontrak.setAttribute('aria-selected', activeTab === 'kontrak' ? 'true' : 'false');
    tabPelanggaran.setAttribute('aria-selected', activeTab === 'pelanggaran' ? 'true' : 'false');
  };
  tabKontrak.addEventListener('click', () => {
    activeTab = 'kontrak';
    applyTab();
  });
  tabPelanggaran.addEventListener('click', () => {
    activeTab = 'pelanggaran';
    applyTab();
  });

  const renderContracts = (state: GameSave): void => {
    const entries = selectCampaignEntries(state);
    const sampleCards = panelKontrak.querySelectorAll<HTMLElement>('article.ref-card');
    const dailyCard = sampleCards[0];
    const cardTemplate = sampleCards[1] ?? sampleCards[0];
    if (!cardTemplate || !dailyCard) return;

    for (const card of sampleCards) {
      if (card !== dailyCard) card.remove();
    }

    // Daily mission: progres posting.
    const posting = state.social.postingCount % 3;
    const progress = dailyCard.querySelector<HTMLElement>('.bg-dock-bg .bg-hud-cyan');
    if (progress) progress.style.width = `${(posting / 3) * 100}%`;
    const progressText = dailyCard.querySelector<HTMLElement>('.font-mono.text-label-sm');
    if (progressText) progressText.textContent = `${posting}/3`;
    const reward = dailyCard.querySelector<HTMLElement>('.text-success');
    if (reward) reward.textContent = 'Hadiah harian';
    const missionButton = dailyCard.querySelector<HTMLAnchorElement>('a.ref-btn-green');
    if (missionButton) {
      missionButton.textContent = 'Kerjakan';
      if (missionButton.dataset['bound'] !== '1') {
        missionButton.dataset['bound'] = '1';
        missionButton.addEventListener('click', (event) => {
          event.preventDefault();
          ctx.navigate('handphone');
        });
      }
    }

    for (const entry of entries) {
      const card = cardTemplate.cloneNode(true) as HTMLElement;
      const definition = entry.definition;
      const status = campaignCardStatus(entry);

      const title = card.querySelector<HTMLElement>('h2');
      if (title) title.textContent = definition.campaignName;
      const meta = card.querySelector<HTMLElement>('h2 + p');
      if (meta) meta.textContent = `${definition.client} • ${t(`campaign.interaction.${definition.interaction}`)}`;

      const heat = card.querySelector<HTMLElement>('.bg-success');
      if (heat) {
        heat.textContent = `Heat +${definition.riskImpact}`;
        heat.className =
          definition.riskImpact >= 13
            ? 'px-2.5 py-1 rounded-lg bg-btn-yellow font-headline text-label-sm text-ink-dark shrink-0'
            : 'px-2.5 py-1 rounded-lg bg-success font-headline text-label-sm text-on-success shrink-0';
      }

      const values = card.querySelectorAll<HTMLElement>('.grid .font-headline.text-body-sm');
      if (values[0]) values[0].textContent = formatMoney(definition.basePayment);
      if (values[1]) values[1].textContent = `+${formatMoney(definition.bonusPayment)}`;
      if (values[2]) values[2].textContent = difficultyLabel(definition.difficulty);

      const action = card.querySelector<HTMLAnchorElement>('a.ref-btn-green');
      if (action) {
        const label =
          status === 'active'
            ? 'Lanjutkan'
            : status === 'resolved'
              ? 'Lihat Hasil'
              : status === 'locked'
                ? 'Belum Memenuhi Syarat'
                : 'Lihat Brief & Ambil';
        action.textContent = label;
        action.className =
          status === 'active'
            ? 'ref-btn-yellow w-full text-center py-2.5 px-gutter-md rounded-xl font-headline text-label-lg text-ink-dark'
            : 'ref-btn-green w-full text-center py-2.5 px-gutter-md rounded-xl font-headline text-label-lg text-light-surface-bright';
        action.addEventListener('click', (event) => {
          event.preventDefault();
          const resume = resumeCampaign(state, CAMPAIGNS, entry.session?.id);
          if (status === 'active' && resume) {
            ctx.navigate(screenForCampaignStage(resume.stage), { sessionId: resume.session.id });
            return;
          }
          if (status === 'resolved' && entry.session) {
            ctx.navigate('campaign-result', { sessionId: entry.session.id });
            return;
          }
          ctx.navigate('campaign-brief', { id: definition.id });
        });
      }

      panelKontrak.appendChild(card);
    }

    const available = entries.filter((entry) => campaignCardStatus(entry) === 'available').length;
    const activeCount = entries.filter((entry) => campaignCardStatus(entry) === 'active').length;
    setText(screen, 'header span.text-btn-red-dark', `${activeCount + available} Aktif`);
    setText(screen, 'nav a[aria-label="Kampanye"] span', String(available));
    setText(screen, '#tab-kontrak', `Kontrak (${entries.length})`);
  };

  const renderViolations = (state: GameSave): void => {
    const rules = panelPelanggaran.querySelectorAll<HTMLElement>('.flex.flex-col.gap-gutter-xs > div');
    const account = selectPrimaryAccount(state);
    const violations = selectViolations(state);
    const tiers = ctx.config.riskTiers;

    tiers.forEach((tier, index) => {
      const row = rules[index];
      if (!row) return;
      const label = row.querySelector<HTMLElement>('span');
      const detail = row.querySelector<HTMLElement>('span + span');
      if (label) label.textContent = `${t(`risk.tier.${tier.id}`)} (${tier.minSuspicion}–${tier.maxSuspicion})`;
      if (detail) {
        const bits: string[] = [];
        if (tier.incomeMultiplier < 1) bits.push(`Income ${Math.round(tier.incomeMultiplier * 100)}%`);
        if (tier.autoFineOnEnter > 0) bits.push(`Denda ${formatMoney(tier.autoFineOnEnter)}`);
        if (tier.shadowbanMs > 0) bits.push('Shadowban');
        detail.textContent = bits.length > 0 ? bits.join(' · ') : 'Tidak ada penalti';
      }
    });

    const note = panelPelanggaran.querySelector<HTMLElement>('article:last-child p');
    if (note) {
      note.textContent =
        violations.length > 0
          ? `${violations.length} catatan pelanggaran. Suspicion saat ini ${Math.round(account?.suspicion ?? 0)}/100.`
          : `Belum ada pelanggaran aktif. Suspicion ${Math.round(account?.suspicion ?? 0)}/100 — jaga di bawah 30 agar income maksimal.`;
    }
  };

  const patch = (state: GameSave): void => {
    setText(screen, '#board-balance', formatMoney(selectDisplayBalance(state)));
    const rate = screen.querySelector<HTMLElement>('header .ref-cyan-pill span.font-mono');
    if (rate) rate.textContent = rateLabel(selectIncomeRate(state, ctx.config));
    renderContracts(state);
    renderViolations(state);
  };

  patch(ctx.store.getState());
  applyTab();
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

const screenModule: ScreenModule = { id: 'task', mount };
export default screenModule;
