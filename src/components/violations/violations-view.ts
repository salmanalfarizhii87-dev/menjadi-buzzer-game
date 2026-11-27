/**
 * View bersama: tabel aturan tier + riwayat pelanggaran.
 * Dipakai oleh layar `violations` dan tab Pelanggaran di layar `task`.
 */

import { button } from '@/components/buttons/button';
import { el } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { allTierConsequences } from '@/domain/risk/consequences';
import { evaluateRecovery } from '@/domain/risk/recovery';
import { t } from '@/data/strings/id';
import {
  selectDisplayBalance,
  selectPrimaryAccount,
  selectRiskMeter,
  selectViolations,
} from '@/state/selectors';
import type { BalanceConfig } from '@/data/config/balance';
import type { GameSave, ViolationKind, ViolationRecord } from '@/state/types';
import './violations.css';

const KIND_LABEL: Record<ViolationKind, string> = {
  warning: 'violations.kind.warning',
  fine: 'violations.kind.fine',
  shadowban: 'violations.kind.shadowban',
  restriction: 'violations.kind.restriction',
  seizure: 'violations.kind.seizure',
};

function formatDate(at: number): string {
  const date = new Date(at);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  return `${day}/${month} ${hour}:${minute}`;
}

export interface ViolationViewOptions {
  save: GameSave;
  config: BalanceConfig;
  onRecover?: () => void;
}

export function rulesTable(save: GameSave, config: BalanceConfig): HTMLElement {
  const current = selectRiskMeter(save, config).tier;
  const table = el('div', { class: 'tier-table' });

  for (const tier of allTierConsequences(config)) {
    const isCurrent = tier.tier === current;
    const row = el('div', {
      class: `tier-row tier-row--${tier.tier}${isCurrent ? ' tier-row--current' : ''}`,
    });

    const head = el('div', { class: 'tier-row__head' });
    head.appendChild(el('span', { class: 'tier-row__name', text: t(tier.labelKey) }));
    head.appendChild(
      el('span', {
        class: 'tier-row__range',
        text: `${tier.minSuspicion}–${tier.maxSuspicion}`,
      }),
    );
    row.appendChild(head);

    const effects = el('div', { class: 'tier-row__effects' });
    if (tier.summaryKeys.length === 0) {
      effects.appendChild(el('span', { class: 'tier-chip', text: t('risk.effect.none') }));
    } else {
      for (const key of tier.summaryKeys) {
        effects.appendChild(el('span', { class: 'tier-chip', text: t(key) }));
      }
    }
    row.appendChild(effects);

    if (isCurrent) {
      row.appendChild(el('span', { class: 'tier-row__now', text: 'Tingkat saat ini' }));
    }

    table.appendChild(row);
  }

  return table;
}

export function violationHistory(save: GameSave): HTMLElement {
  const violations = selectViolations(save);

  if (violations.length === 0) {
    return el('div', { class: 'empty-state' }, [
      el('p', { class: 'empty-state__title', text: t('violations.empty') }),
      el('p', {
        class: 'empty-state__body',
        text: 'Suspicion naik saat kamu posting atau gagal kontrak. Jika melewati ambang, penalti akan tercatat di sini.',
      }),
    ]);
  }

  const list = el('div', { class: 'violation-list' });
  for (const violation of violations) {
    list.appendChild(violationRow(violation));
  }
  return list;
}

function violationRow(violation: ViolationRecord): HTMLElement {
  const item = el('div', { class: 'violation-item' });

  const main = el('div', { class: 'violation-item__main' });
  main.appendChild(
    el('span', { class: 'violation-item__kind', text: t(KIND_LABEL[violation.kind]) }),
  );
  main.appendChild(
    el('span', {
      class: 'violation-item__meta',
      text: `${formatDate(violation.at)} · ${t(`risk.tier.${violation.tier}`)}`,
    }),
  );

  item.appendChild(main);
  item.appendChild(
    el('span', {
      class:
        violation.amount > 0
          ? 'violation-item__amount'
          : 'violation-item__amount violation-item__amount--none',
      text: violation.amount > 0 ? formatMoney(-violation.amount) : '—',
    }),
  );

  return item;
}

/** Kotak pemulihan: biaya vs pengurangan suspicion. */
export function recoveryBox(options: ViolationViewOptions): HTMLElement {
  const { save, config, onRecover } = options;
  const account = selectPrimaryAccount(save);
  const evaluation = evaluateRecovery(save, config);

  const box = el('div', { class: 'recovery-box' });

  if (!account || !evaluation.ok) {
    box.appendChild(el('p', { class: 'recovery-box__text', text: 'Data pemulihan tidak tersedia.' }));
    return box;
  }

  const value = evaluation.value;

  if (!value.needed) {
    box.appendChild(
      el('p', {
        class: 'recovery-box__text',
        text: 'Suspicion sudah 0. Tidak ada yang perlu dipulihkan.',
      }),
    );
    return box;
  }

  box.appendChild(
    el('p', {
      class: 'recovery-box__text',
      text: `Bayar ${formatMoney(value.cost)} untuk menurunkan suspicion ${value.suspicionBefore} → ${value.suspicionAfter}.`,
    }),
  );

  if (!value.canAfford) {
    box.appendChild(
      el('p', {
        class: 'recovery-box__text',
        text: `Saldo tidak cukup. Kurang ${formatMoney(value.cost - selectDisplayBalance(save))}.`,
      }),
    );
  }

  const action = button({
    label: `Pulihkan (${formatMoney(value.cost)})`,
    variant: 'primary',
    block: true,
    disabled: !value.canAfford,
    onClick: () => onRecover?.(),
  });
  box.appendChild(action);

  return box;
}
