/**
 * Screen: Automation Upgrade.
 *
 * Satu jalur upgrade dengan beberapa level. Kartu menampilkan level sekarang →
 * berikutnya, harga, dan preview rate sebelum/sesudah. Pembelian mengunci tombol
 * sampai selesai untuk mencegah double-click.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { panel } from '@/components/cards/panel';
import { icons } from '@/components/icons';
import { progressBar } from '@/components/indicators/indicators';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { el, setText } from '@/core/dom';
import { formatDecimal, formatMoney, formatRate, isDebt } from '@/core/money';
import { t } from '@/data/strings/id';
import { getAutomationDefinition } from '@/data/upgrades/automation';
import { evaluatePurchase, type PurchaseEvaluation } from '@/domain/upgrades/purchase';
import { selectDisplayBalance, selectPrimaryAccount } from '@/state/selectors';
import type { GameSave } from '@/state/types';
import './automation.css';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const state = ctx.store.getState();
  const def = getAutomationDefinition(ctx.config);
  const balance = selectDisplayBalance(state);
  const account = selectPrimaryAccount(state);

  if (!def || !account) {
    const content = mainContent();
    content.appendChild(
      panel({
        title: 'Upgrade tidak tersedia',
        children: el('p', {
          class: 'text-soft',
          text: 'Konfigurasi upgrade tidak lengkap. Hubungi developer.',
        }),
      }),
    );
    root.replaceChildren(
      appFrame({
        topBar: topBar({
          title: t('screen.automation.title'),
          balance,
          showBack: true,
          onBack: () => ctx.navigate('character'),
        }),
        nav: primaryNav({ currentScreen: 'automation', onNavigate: (id) => ctx.navigate(id) }),
        content,
      }),
    );
    return;
  }

  const initial = evaluatePurchase(state, def, ctx.config);
  const initialEval: PurchaseEvaluation | null = initial.ok ? initial.value : null;

  // ---- Ringkasan (statis) ----
  const summary = el('div', { class: 'automation-summary' });

  const balanceCell = el('div', { class: 'automation-summary__cell' });
  balanceCell.appendChild(el('span', { class: 'automation-summary__label', text: t('stat.balance') }));
  const balanceValue = el('span', { class: 'automation-summary__value', text: formatMoney(balance) });
  balanceCell.appendChild(balanceValue);

  const rateCell = el('div', { class: 'automation-summary__cell' });
  rateCell.appendChild(el('span', { class: 'automation-summary__label', text: t('stat.incomeRate') }));
  const rateValue = el('span', {
    class: 'automation-summary__value automation-summary__value--positive',
    text: formatRate(initialEval?.rateBefore ?? 0),
  });
  rateCell.appendChild(rateValue);

  summary.appendChild(balanceCell);
  summary.appendChild(rateCell);

  // ---- Kartu upgrade ----
  const card = el('div', { class: 'upgrade-card' });

  const head = el('div', { class: 'upgrade-card__head' });
  const headText = el('div', { class: 'stack stack--tight' });
  headText.appendChild(el('h2', { class: 'upgrade-card__title', text: t(def.titleKey) }));
  headText.appendChild(el('p', { class: 'upgrade-card__desc', text: t(def.descriptionKey) }));
  head.appendChild(headText);

  const levelBadge = el('span', { class: 'upgrade-card__level', text: 'Lv 0' });
  head.appendChild(levelBadge);
  card.appendChild(head);

  // Progress level
  const progressSlot = el('div');
  card.appendChild(progressSlot);

  // Preview sebelum → sesudah
  const preview = el('div', { class: 'upgrade-preview' });

  const beforeCol = el('div', { class: 'upgrade-preview__col' });
  beforeCol.appendChild(el('span', { class: 'upgrade-preview__label', text: t('upgrade.rateBefore') }));
  const beforeValue = el('span', { class: 'upgrade-preview__value', text: '' });
  beforeCol.appendChild(beforeValue);

  const arrow = el('div', { class: 'upgrade-preview__arrow' }, icons.chevronRight());

  const afterCol = el('div', { class: 'upgrade-preview__col' });
  afterCol.appendChild(el('span', { class: 'upgrade-preview__label', text: t('upgrade.rateAfter') }));
  const afterValue = el('span', {
    class: 'upgrade-preview__value upgrade-preview__value--after',
    text: '',
  });
  afterCol.appendChild(afterValue);

  preview.appendChild(beforeCol);
  preview.appendChild(arrow);
  preview.appendChild(afterCol);
  card.appendChild(preview);

  // Harga
  const costRow = el('div', { class: 'upgrade-card__cost-row' });
  costRow.appendChild(el('span', { text: t('upgrade.cost') }));
  const costValue = el('span', { class: 'upgrade-card__cost', text: '' });
  costRow.appendChild(costValue);
  card.appendChild(costRow);

  // Catatan (alasan disabled)
  const note = el('p', { class: 'upgrade-card__note', text: '' });
  card.appendChild(note);

  // Tombol beli
  const buyButton = button({
    label: t('upgrade.buy'),
    variant: 'primary',
    block: true,
    size: 'lg',
    onClick: () => {
      if (processing) return;
      processing = true;
      buyButton.disabled = true;

      const result = ctx.actions.purchaseAutomationUpgrade();

      if (result.ok) {
        ctx.toasts.success(
          `${t('upgrade.purchased')} Level ${result.value.newLevel} · ${formatMoney(
            result.value.evaluation.cost,
          )}`,
        );
      } else {
        ctx.toasts.error(t(result.messageKey));
      }

      processing = false;
      patch(ctx.store.getState());
    },
  });
  card.appendChild(buyButton);

  let processing = false;

  const content = mainContent();
  const screen = el('section', { class: 'screen anim-fade' });
  screen.appendChild(summary);
  screen.appendChild(card);

  screen.appendChild(
    panel({
      title: 'Cara kerja automation',
      children: [
        el('p', {
          class: 'text-muted',
          text: 'Automation menaikkan multiplier pendapatan pasif. Setiap level menambah multiplier secara linear, dan biaya naik geometris sehingga tiap level terasa sebagai keputusan investasi.',
        }),
      ],
    }),
  );

  content.appendChild(screen);

  const topBarNode = topBar({
    title: t('screen.automation.title'),
    subtitle: t('screen.automation.subtitle'),
    balance,
    showBack: true,
    onBack: () => ctx.navigate('character'),
  });

  root.replaceChildren(
    appFrame({
      topBar: topBarNode,
      nav: primaryNav({ currentScreen: 'automation', onNavigate: (id) => ctx.navigate(id) }),
      content,
    }),
  );

  // ---- Penambalan nilai ----
  const pill = topBarNode.querySelector<HTMLElement>('.balance-pill');

  const patch = (next: GameSave): void => {
    const nextAccount = selectPrimaryAccount(next);
    const nextBalance = selectDisplayBalance(next);
    const evaluation = evaluatePurchase(next, def, ctx.config);

    setText(balanceValue, formatMoney(nextBalance));
    if (pill) {
      const debt = isDebt(nextBalance);
      pill.className = debt ? 'balance-pill balance-pill--debt' : 'balance-pill';
      const valueNode = pill.querySelector('span:last-child');
      if (valueNode) setText(valueNode, formatMoney(nextBalance));
    }

    if (!evaluation.ok || !nextAccount) {
      setText(note, t(evaluation.ok ? 'error.unknown' : evaluation.messageKey));
      buyButton.disabled = true;
      return;
    }

    const value = evaluation.value;

    setText(rateValue, formatRate(value.rateBefore));
    setText(levelBadge, value.isMax ? `Lv ${value.currentLevel} · MAX` : `Lv ${value.currentLevel}`);
    levelBadge.className = value.isMax
      ? 'upgrade-card__level upgrade-card__level--max'
      : 'upgrade-card__level';

    progressSlot.replaceChildren(
      progressBar({
        value: value.currentLevel,
        max: value.maxLevel,
        labelLeft: `${t('upgrade.level')} ${value.currentLevel}`,
        labelRight: `${value.maxLevel}`,
        ariaLabel: 'Level automation',
      }),
    );

    setText(beforeValue, formatRate(value.rateBefore));
    setText(afterValue, value.isMax ? '—' : formatRate(value.rateAfter));

    if (value.isMax) {
      setText(costValue, '—');
      costValue.className = 'upgrade-card__cost';
      setText(note, t('upgrade.maxLevel'));
      note.className = 'upgrade-card__note upgrade-card__note--muted';
      buyButton.disabled = true;
      buyButton.textContent = t('upgrade.maxLevel');
      card.classList.add('upgrade-card--max');
      return;
    }

    card.classList.remove('upgrade-card--max');
    setText(costValue, formatMoney(value.cost));
    costValue.className = value.canAfford
      ? 'upgrade-card__cost'
      : 'upgrade-card__cost upgrade-card__cost--unaffordable';

    if (!value.canAfford) {
      const shortfall = value.cost - value.balance;
      setText(note, `${t('upgrade.insufficient')} Kurang ${formatMoney(shortfall)}.`);
      note.className = 'upgrade-card__note';
      buyButton.disabled = true;
      buyButton.textContent = t('upgrade.buy');
    } else {
      setText(note, `Efek: +${formatDecimal(value.rateGain)} rupiah/detik`);
      note.className = 'upgrade-card__note upgrade-card__note--muted';
      buyButton.disabled = processing;
      buyButton.textContent = t('upgrade.buy');
    }
  };

  patch(state);

  const unsubscribe = ctx.store.subscribe((next) => patch(next));
  ctx.signal.addEventListener('abort', () => unsubscribe(), { once: true });
}

const screenModule: ScreenModule = { id: 'automation', mount };
export default screenModule;
