/**
 * Risk meter: gauge 10 sel, warna mengikuti tier, plus label dan angka.
 * Alasan: satu gauge terbaca sebagai "meter", bukan dua bar bertumpuk.
 * Aksesibilitas: warna + label teks + jumlah sel terisi (bukan warna saja).
 */

import { el } from '@/core/dom';
import { t } from '@/data/strings/id';
import { clampDisplay } from '@/core/money';
import type { RiskTier } from '@/state/types';
import './risk-meter.css';

const TIER_ORDER: RiskTier[] = ['safe', 'watch', 'hot', 'critical'];

const TIER_CLASS: Record<RiskTier, string> = {
  safe: 'risk-meter--safe',
  watch: 'risk-meter--watch',
  hot: 'risk-meter--hot',
  critical: 'risk-meter--critical',
};

const CELLS = 10;

export interface RiskMeterOptions {
  tier: RiskTier;
  suspicion: number;
  compact?: boolean;
}

export function riskMeter(options: RiskMeterOptions): HTMLElement {
  const { tier, suspicion, compact = false } = options;
  const clamped = clampDisplay(suspicion, 0, 100);
  const filled = Math.round(clamped / 10);

  const node = el('div', {
    class: `risk-meter ${TIER_CLASS[tier]}${compact ? ' risk-meter--compact' : ''}`,
    role: 'meter',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    'aria-valuenow': String(Math.round(clamped)),
    'aria-label': `${t('risk.meter.label')}: ${t(`risk.tier.${tier}`)}, ${Math.round(clamped)} dari 100`,
  });

  const head = el('div', { class: 'risk-meter__head' });
  head.appendChild(el('span', { class: 'risk-meter__label', text: t('risk.meter.label') }));
  head.appendChild(el('span', { class: 'risk-meter__value', text: `${Math.round(clamped)}` }));
  head.appendChild(el('span', { class: 'risk-meter__tier', text: t(`risk.tier.${tier}`) }));
  node.appendChild(head);

  const gauge = el('div', { class: 'risk-meter__gauge', 'aria-hidden': 'true' });
  for (let index = 0; index < CELLS; index += 1) {
    gauge.appendChild(
      el('span', { class: index < filled ? 'risk-meter__cell is-on' : 'risk-meter__cell' }),
    );
  }
  node.appendChild(gauge);

  if (!compact) {
    node.appendChild(el('p', { class: 'risk-meter__hint', text: t('risk.meter.hint') }));
  }

  return node;
}

export { TIER_ORDER };
