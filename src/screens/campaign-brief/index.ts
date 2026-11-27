/**
 * Screen: Campaign Brief (Stitch).
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import template from '@/templates/stitch/campaign_brief.html?raw';
import { CAMPAIGNS } from '@/data/campaigns/seed';
import { fineFor, penaltyProfileFor } from '@/domain/penalties/profiles';
import { ELIGIBILITY_MESSAGE_KEY } from '@/domain/campaigns/eligibility';
import { resumeCampaign } from '@/application/campaigns/resume';
import { campaignCardStatus } from '@/components/campaigns/campaign-card';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { $, bindRouteLinks, setText, stitchRoot } from '@/ui/stitch';
import { selectCampaignEntry, selectDisplayBalance } from '@/state/selectors';
import { screenForCampaignStage } from '@/screens/campaign-routes';

function riskTone(risk: number): { label: string; className: string } {
  if (risk < 0.25) return { label: 'Risiko Rendah', className: 'bg-success text-on-success' };
  if (risk < 0.5) return { label: 'Risiko Sedang', className: 'bg-btn-yellow text-ink-dark' };
  return { label: 'Risiko Tinggi', className: 'bg-light-error-container text-light-on-error-container' };
}

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const screen = stitchRoot(template);
  bindRouteLinks(screen, ctx);

  const render = (): void => {
    const state = ctx.store.getState();
    const entry = selectCampaignEntry(state, params['id'] ?? '');

    if (!entry) {
      ctx.toasts.error(t('error.campaign_not_found'));
      ctx.navigate('task');
      return;
    }

    const definition = entry.definition;
    const status = campaignCardStatus(entry);
    const resume = resumeCampaign(state, CAMPAIGNS, entry.session?.id);
    const fine = fineFor(definition.basePayment, penaltyProfileFor(ctx.config, definition.penaltyProfileId));

    setText(screen, 'header .px-gutter-sm.py-1\\.5 span', formatMoney(selectDisplayBalance(state)));
    setText(screen, 'header .ref-cyan-pill .font-mono', `#${definition.id.replace('cmp_', '').toUpperCase()} • ${state.accounts[0]?.name ?? '@KilatDaily'}`);

    setText(screen, 'main article h1', definition.campaignName);
    setText(screen, 'main article header p', `Klien: ${definition.client}`);
    const objective = screen.querySelectorAll<HTMLElement>('main article p.text-body-md');
    if (objective[0]) objective[0].textContent = definition.objective;
    const audience = screen.querySelectorAll<HTMLElement>('main article p.text-body-sm');
    if (audience[0]) audience[0].textContent = definition.targetAudience;

    const risk = riskTone(definition.baseRisk);
    const badge = $<HTMLElement>(screen, 'main article [role="status"]');
    badge.className = `px-gutter-sm py-gutter-xs rounded-full ${risk.className} font-headline text-label-sm shrink-0`;
    badge.textContent = risk.label;

    const stats = screen.querySelectorAll<HTMLElement>('main article .grid.grid-cols-3 p.font-headline');
    if (stats[0]) stats[0].textContent = state.accounts[0]?.name ?? '@KilatDaily';
    if (stats[1]) stats[1].textContent = definition.difficulty >= 3 ? 'Sulit' : definition.difficulty === 2 ? 'Sedang' : 'Mudah';
    if (stats[2]) stats[2].textContent = t(`campaign.interaction.${definition.interaction}`);

    setText(screen, 'section[aria-label="Potensi bayaran"] .grid > div:nth-child(1) p.font-headline', formatMoney(definition.basePayment));
    setText(screen, 'section[aria-label="Potensi bayaran"] .grid > div:nth-child(2) p.font-headline', `+${formatMoney(definition.bonusPayment)}`);

    const consequence = $<HTMLElement>(screen, 'section[aria-label="Kemungkinan konsekuensi"] p');
    consequence.replaceChildren(
      document.createTextNode('Kegagalan dapat memicu denda hingga '),
      Object.assign(document.createElement('span'), {
        className: 'font-headline text-light-error tabular-nums',
        textContent: `-${formatMoney(fine)}`,
      }),
      document.createTextNode(', kenaikan '),
      Object.assign(document.createElement('span'), {
        className: 'font-headline text-light-tertiary tabular-nums',
        textContent: `+${definition.riskImpact + penaltyProfileFor(ctx.config, definition.penaltyProfileId).suspicionDelta} Suspicion`,
      }),
      document.createTextNode(', dan penurunan reputasi akun.'),
    );

    const primary = $<HTMLAnchorElement>(screen, 'main .ref-btn-green');
    const reason = entry.eligibility.reasons[0];
    if (status === 'active' && resume) {
      primary.textContent = 'Lanjutkan Kampanye';
      primary.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        ctx.navigate(screenForCampaignStage(resume.stage), { sessionId: resume.session.id });
      }, { once: true });
    } else if (status === 'resolved' && entry.session) {
      primary.textContent = 'Lihat Hasil';
      primary.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        ctx.navigate('campaign-result', { sessionId: entry.session!.id });
      }, { once: true });
    } else if (!entry.eligibility.eligible) {
      primary.textContent = reason ? t(ELIGIBILITY_MESSAGE_KEY[reason.code]) : 'Belum Memenuhi Syarat';
      primary.className = 'ref-btn-white w-full inline-flex items-center justify-center px-gutter-lg py-gutter-md rounded-xl';
    } else {
      primary.textContent = 'Terima Kontrak & Pilih Strategi';
      primary.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const result = ctx.actions.acceptCampaign(definition.id);
        if (!result.ok) {
          ctx.toasts.error(t(result.messageKey));
          return;
        }
        ctx.navigate('campaign-strategy', { sessionId: result.value.session.id });
      }, { once: true });
    }
  };

  render();
  root.replaceChildren(screen);
}

const screenModule: ScreenModule = { id: 'campaign-brief', mount };
export default screenModule;
