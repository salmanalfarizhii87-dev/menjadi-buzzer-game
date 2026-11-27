/**
 * Screen: Handphone (tab 3).
 *
 * Bingkai ponsel berisi daftar app fiktif + feed ringkas. Tombol Posting membuka
 * composer. Cooldown dan shadowban terlihat jelas.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { appGrid, cooldownBar, phoneBanner, phoneFrame } from '@/components/phone-frame/phone-frame';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { riskMeter } from '@/components/risk-meter/risk-meter';
import { el, setText } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { SOCIAL_APPS, findApp, getDefaultApp } from '@/data/social/apps';
import { t } from '@/data/strings/id';
import {
  selectDisplayBalance,
  selectIsShadowbanned,
  selectPostingCooldown,
  selectRiskMeter,
  selectSocial,
} from '@/state/selectors';
import './handphone.css';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  let selectedAppId = getDefaultApp().id;

  const state = ctx.store.getState();
  const balance = selectDisplayBalance(state);

  const content = mainContent();
  const screen = el('section', { class: 'screen anim-fade' });

  // ---- Bagian atas (di luar ponsel) ----
  const header = el('div', { class: 'hp-header' });
  const riskSlot = el('div');
  header.appendChild(riskSlot);

  // ---- Isi ponsel ----
  const screenSlot = el('div', { class: 'stack' });

  const bannerSlot = el('div');
  const gridSlot = el('div');
  const feedSlot = el('div');
  const cooldownSlot = el('div');

  screenSlot.appendChild(bannerSlot);
  screenSlot.appendChild(gridSlot);
  screenSlot.appendChild(feedSlot);
  screenSlot.appendChild(cooldownSlot);

  const phone = phoneFrame({ screen: screenSlot });

  // ---- Tombol aksi ----
  const postButton = button({
    label: t('posting.button'),
    variant: 'primary',
    block: true,
    size: 'lg',
    onClick: () => {
      if (postButton.disabled) return;
      ctx.navigate('composer', { appId: selectedAppId });
    },
  });

  const actions = el('div', { class: 'hp-actions' }, [
    postButton,
    el('p', {
      class: 'hp-hint',
      text: 'Posting memberi uang kecil dan menaikkan suspicion. Kontrak kampanye memberi lebih besar dengan risiko lebih tinggi.',
    }),
  ]);

  screen.appendChild(header);
  screen.appendChild(phone);
  screen.appendChild(actions);
  content.appendChild(screen);

  const topBarNode = topBar({
    title: t('screen.handphone.title'),
    subtitle: t('screen.handphone.subtitle'),
    balance,
  });
  const balancePill = topBarNode.querySelector<HTMLElement>('.balance-pill');

  root.replaceChildren(
    appFrame({
      topBar: topBarNode,
      nav: primaryNav({
        currentScreen: 'handphone',
        onNavigate: (screenId) => ctx.navigate(screenId),
      }),
      content,
    }),
  );

  // ---- Render bagian dinamis ----
  const renderGrid = (): void => {
    gridSlot.replaceChildren(
      appGrid({
        apps: SOCIAL_APPS,
        selectedAppId,
        onSelect: (appId) => {
          selectedAppId = appId;
          renderGrid();
          renderFeed();
        },
      }),
    );
  };

  const renderFeed = (): void => {
    const current = ctx.store.getState();
    const social = selectSocial(current);
    const app = findApp(selectedAppId) ?? getDefaultApp();

    const feed = el('div', { class: 'phone-feed' });
    feed.appendChild(el('p', { class: 'phone-feed__title', text: app.name }));
    feed.appendChild(el('p', { class: 'phone-feed__body', text: t(app.taglineKey) }));

    const stats = el('div', { class: 'stack stack--tight' });
    const postingRow = el('div', { class: 'phone-feed__stat' });
    postingRow.appendChild(el('span', { text: t('social.postingCount') }));
    postingRow.appendChild(el('span', { text: String(social.postingCount) }));
    stats.appendChild(postingRow);
    feed.appendChild(stats);

    feedSlot.replaceChildren(feed);
  };

  const patch = (): void => {
    const current = ctx.store.getState();
    const now = ctx.clock.now();
    const risk = selectRiskMeter(current, ctx.config);
    const cooldown = selectPostingCooldown(current, ctx.config, now);
    const shadowbanned = selectIsShadowbanned(current, now);
    const balanceNow = selectDisplayBalance(current);

    riskSlot.replaceChildren(riskMeter({ tier: risk.tier, suspicion: risk.suspicion }));

    bannerSlot.replaceChildren();
    if (shadowbanned) {
      bannerSlot.appendChild(phoneBanner(t('posting.shadowbanActive')));
    }

    renderFeed();

    cooldownSlot.replaceChildren();
    if (cooldown.active) {
      cooldownSlot.appendChild(
        cooldownBar({ remainingMs: cooldown.remainingMs, progress: cooldown.progress }),
      );
    }

    // Tombol: disabled saat cooldown.
    postButton.disabled = cooldown.active;
    postButton.textContent = cooldown.active
      ? `${t('posting.cooldown')} ${Math.ceil(cooldown.remainingMs / 1000)}s`
      : t('posting.button');

    if (balancePill) {
      const valueNode = balancePill.querySelector('span:last-child');
      if (valueNode) setText(valueNode, formatMoney(balanceNow));
    }

  };

  renderGrid();
  patch();

  // Timer ringan hanya untuk memperbarui countdown cooldown di layar ini.
  const interval = window.setInterval(() => {
    const cooldown = selectPostingCooldown(ctx.store.getState(), ctx.config, ctx.clock.now());
    if (cooldown.active) patch();
    else if (postButton.disabled) patch();
  }, 1000);

  const unsubscribe = ctx.store.subscribe(() => patch());

  ctx.signal.addEventListener('abort', () => {
    window.clearInterval(interval);
    unsubscribe();
  });

}

const screenModule: ScreenModule = { id: 'handphone', mount };
export default screenModule;
