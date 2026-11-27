import { clampDisplay } from '@/core/money';
import { el, type Child } from '@/core/dom';
import type { AccountStatus } from '@/state/types';
import './indicators.css';

export interface StatDisplayOptions {
  label: string;
  value: string;
  tone?: 'default' | 'positive' | 'negative';
  icon?: Child;
  hint?: string;
}

export function statDisplay(options: StatDisplayOptions): HTMLElement {
  const row = el('div', { class: 'stat' });

  const labelWrap = el('div', { class: 'stat__label' });
  if (options.icon) labelWrap.appendChild(options.icon as Node);
  labelWrap.appendChild(el('span', { text: options.label }));

  const valueClass =
    options.tone === 'positive'
      ? 'stat__value stat__value--positive'
      : options.tone === 'negative'
        ? 'stat__value stat__value--negative'
        : 'stat__value';

  const value = el('span', { class: valueClass, text: options.value, ...(options.hint ? { title: options.hint } : {}) });

  row.appendChild(labelWrap);
  row.appendChild(value);
  return row;
}

const STATUS_LABEL: Record<AccountStatus, string> = {
  normal: 'Normal',
  warning: 'Warning',
  restricted: 'Restricted',
  suspended: 'Suspended',
};

const STATUS_TONE: Record<AccountStatus, string> = {
  normal: 'badge--normal',
  warning: 'badge--warning',
  restricted: 'badge--danger',
  suspended: 'badge--danger',
};

export function statusBadge(status: AccountStatus): HTMLElement {
  return el('span', {
    class: `badge ${STATUS_TONE[status]}`,
    text: STATUS_LABEL[status],
  });
}

export type RiskLevel = 'low' | 'medium' | 'high';

const RISK_LABEL: Record<RiskLevel, string> = {
  low: 'Risiko rendah',
  medium: 'Risiko sedang',
  high: 'Risiko tinggi',
};

const RISK_SEGMENTS: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

/** Risk indicator: warna + label teks + jumlah segmen (tidak bergantung warna saja). */
export function riskIndicator(level: RiskLevel): HTMLElement {
  const node = el('div', { class: `risk risk--${level}`, role: 'status' });

  const bar = el('div', { class: 'risk__bar', 'aria-hidden': 'true' });
  const active = RISK_SEGMENTS[level];
  for (let index = 0; index < 3; index += 1) {
    bar.appendChild(
      el('span', { class: index < active ? 'risk__segment is-on' : 'risk__segment' }),
    );
  }

  node.appendChild(bar);
  node.appendChild(el('span', { text: RISK_LABEL[level] }));
  return node;
}

export interface ProgressOptions {
  value: number;
  max: number;
  labelLeft?: string;
  labelRight?: string;
  tone?: 'default' | 'warning' | 'danger';
  ariaLabel?: string;
}

export function progressBar(options: ProgressOptions): HTMLElement {
  const { value, max, labelLeft, labelRight, tone = 'default', ariaLabel } = options;
  const ratio = max > 0 ? clampDisplay(value / max, 0, 1) : 0;

  const wrap = el('div', { class: 'progress' });

  const track = el('div', {
    class: 'progress__track',
    role: 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': String(max),
    'aria-valuenow': String(clampDisplay(value, 0, max)),
    ...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
  });

  const fillTone =
    tone === 'warning' ? 'progress__fill progress__fill--warning' : tone === 'danger' ? 'progress__fill progress__fill--danger' : 'progress__fill';

  track.appendChild(el('div', { class: fillTone, style: { width: `${(ratio * 100).toFixed(1)}%` } }));
  wrap.appendChild(track);

  if (labelLeft !== undefined || labelRight !== undefined) {
    const meta = el('div', { class: 'progress__meta' });
    meta.appendChild(el('span', { text: labelLeft ?? '' }));
    meta.appendChild(el('span', { text: labelRight ?? '' }));
    wrap.appendChild(meta);
  }

  return wrap;
}
