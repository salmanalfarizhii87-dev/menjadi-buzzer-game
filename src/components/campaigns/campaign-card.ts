/**
 * Kartu kontrak untuk layar Task. Satu kartu = satu kontrak.
 * Angka yang tampil berasal dari definisi/estimasi domain; kartu tidak
 * menghitung imbalan sendiri.
 */

import { el } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { icons } from '@/components/icons';
import { t } from '@/data/strings/id';
import {
  CAMPAIGN_INTERACTION_LABEL_KEY,
  riskLabelFor,
  type CampaignDefinition,
} from '@/domain/campaigns/definition';
import type { CampaignEntry } from '@/state/selectors';
import './campaign.css';

export type CampaignCardStatus = 'available' | 'active' | 'resolved' | 'locked';

export function campaignCardStatus(entry: CampaignEntry): CampaignCardStatus {
  if (entry.session?.status === 'resolved') return 'resolved';
  if (entry.session && entry.session.status !== 'cancelled') return 'active';
  return entry.eligibility.eligible ? 'available' : 'locked';
}

function statusLabel(status: CampaignCardStatus): string {
  switch (status) {
    case 'active':
      return t('campaign.status.active');
    case 'resolved':
      return t('campaign.status.resolved');
    case 'locked':
      return t('campaign.ineligible');
    default:
      return t('campaign.status.available');
  }
}

function difficultyPips(difficulty: number): HTMLElement {
  const wrap = el('span', { class: 'campaign-pips', 'aria-hidden': 'true' });
  for (let index = 1; index <= 3; index += 1) {
    wrap.appendChild(el('span', { class: index <= difficulty ? 'campaign-pip is-on' : 'campaign-pip' }));
  }
  return wrap;
}

function metaItem(label: string, value: string, valueClass = ''): HTMLElement {
  return el('span', { class: 'campaign-meta' }, [
    el('span', { class: 'campaign-meta__label', text: label }),
    el('span', { class: `campaign-meta__value ${valueClass}`.trim(), text: value }),
  ]);
}

export interface CampaignCardOptions {
  entry: CampaignEntry;
  onOpen: () => void;
}

export function campaignCard(options: CampaignCardOptions): HTMLElement {
  const { entry, onOpen } = options;
  const { definition } = entry;
  const status = campaignCardStatus(entry);
  const risk = riskLabelFor(definition.baseRisk);

  const card = el('button', {
    type: 'button',
    class: `campaign-card campaign-card--${status} campaign-card--risk-${risk}`,
    'aria-label': `${definition.campaignName}, ${statusLabel(status)}`,
  });

  const top = el('span', { class: 'campaign-card__top' }, [
    el('span', { class: 'campaign-card__name', text: definition.campaignName }),
    el('span', {
      class: `campaign-card__badge campaign-card__badge--${status}`,
      text: statusLabel(status),
    }),
  ]);
  card.appendChild(top);

  card.appendChild(
    el('span', { class: 'campaign-card__client', text: `${definition.client} · ${definition.category}` }),
  );

  card.appendChild(
    el('span', { class: 'campaign-card__meta-row' }, [
      metaItem(t('campaign.payment'), formatMoney(definition.basePayment), 'campaign-meta__value--money'),
      metaItem(t('campaign.bonus'), formatMoney(definition.bonusPayment), 'campaign-meta__value--gold'),
      metaItem(t('campaign.risk'), t(`risk.${risk}`), `campaign-meta__value--${risk}`),
    ]),
  );

  const footer = el('span', { class: 'campaign-card__footer' }, [
    el('span', { class: 'campaign-card__tag', text: t(CAMPAIGN_INTERACTION_LABEL_KEY[definition.interaction]) }),
    difficultyPips(definition.difficulty),
    el('span', { class: 'campaign-card__open', 'aria-hidden': 'true' }, [icons.chevronRight()]),
  ]);
  card.appendChild(footer);

  card.addEventListener('click', onOpen);
  return card;
}

export function campaignList(entries: readonly CampaignEntry[], onOpen: (id: string) => void): HTMLElement {
  const list = el('div', { class: 'campaign-list' });
  for (const entry of entries) {
    list.appendChild(
      campaignCard({ entry, onOpen: () => onOpen(entry.definition.id) }),
    );
  }
  return list;
}

export function campaignMetaGrid(definition: CampaignDefinition): HTMLElement {
  const risk = riskLabelFor(definition.baseRisk);
  return el('div', { class: 'campaign-facts' }, [
    el('div', { class: 'campaign-fact' }, [
      el('span', { class: 'campaign-fact__label', text: t('campaign.difficulty') }),
      difficultyPips(definition.difficulty),
    ]),
    el('div', { class: 'campaign-fact' }, [
      el('span', { class: 'campaign-fact__label', text: t('campaign.payment') }),
      el('span', { class: 'campaign-fact__value', text: formatMoney(definition.basePayment) }),
    ]),
    el('div', { class: 'campaign-fact' }, [
      el('span', { class: 'campaign-fact__label', text: t('campaign.bonus') }),
      el('span', { class: 'campaign-fact__value campaign-fact__value--gold', text: formatMoney(definition.bonusPayment) }),
    ]),
    el('div', { class: 'campaign-fact' }, [
      el('span', { class: 'campaign-fact__label', text: t('campaign.risk') }),
      el('span', { class: `campaign-fact__value campaign-fact__value--${risk}`, text: t(`risk.${risk}`) }),
    ]),
    el('div', { class: 'campaign-fact' }, [
      el('span', { class: 'campaign-fact__label', text: t('campaign.riskImpact') }),
      el('span', { class: 'campaign-fact__value', text: `+${definition.riskImpact}` }),
    ]),
    el('div', { class: 'campaign-fact' }, [
      el('span', { class: 'campaign-fact__label', text: t('campaign.interaction') }),
      el('span', { class: 'campaign-fact__value', text: t(CAMPAIGN_INTERACTION_LABEL_KEY[definition.interaction]) }),
    ]),
  ]);
}
