/**
 * Screen: Composer.
 *
 * Pilihan caption / hashtag / jam posting. Default = opsi paling aman.
 * Preview memakai label kualitatif (bukan angka presisi) sesuai PRD §7.5.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { panel } from '@/components/cards/panel';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { el } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { findApp, getDefaultApp } from '@/data/social/apps';
import {
  CAPTION_OPTIONS,
  HASHTAG_OPTIONS,
  TIMING_OPTIONS,
} from '@/data/social/composer-options';
import { t } from '@/data/strings/id';
import {
  DEFAULT_POST_INPUT,
  validatePostInput,
  type PostInput,
} from '@/domain/posting/composer';
import {
  reachLabel,
  resolvePost,
  riskLabel,
} from '@/domain/posting/resolve-post';
import {
  selectDisplayBalance,
  selectIsShadowbanned,
  selectPostingCooldown,
  selectPrimaryAccount,
  selectRiskMeter,
} from '@/state/selectors';
import '../handphone/handphone.css';

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const appId = params.appId ?? getDefaultApp().id;
  const app = findApp(appId) ?? getDefaultApp();

  const state = ctx.store.getState();
  const balance = selectDisplayBalance(state);
  const account = selectPrimaryAccount(state);
  const cooldown = selectPostingCooldown(state, ctx.config, ctx.clock.now());

  let input: PostInput = {
    ...DEFAULT_POST_INPUT,
    appId: app.id,
    // Caption default dipilih yang cocok dengan tone aplikasi, tetap yang paling aman.
    captionId: CAPTION_OPTIONS.find((caption) => caption.tone === app.preferredTone)?.id ??
      DEFAULT_POST_INPUT.captionId,
  };

  const content = mainContent();
  const screen = el('section', { class: 'screen anim-fade' });

  // ---- Pilihan caption ----
  const captionGroup = el('div', { class: 'composer-group' });
  captionGroup.appendChild(el('p', { class: 'composer-group__label', text: t('posting.caption') }));
  const captionOptions = el('div', { class: 'composer-options' });
  captionGroup.appendChild(captionOptions);

  // ---- Pilihan hashtag ----
  const hashtagGroup = el('div', { class: 'composer-group' });
  hashtagGroup.appendChild(el('p', { class: 'composer-group__label', text: t('posting.hashtag') }));
  const hashtagOptions = el('div', { class: 'composer-options' });
  hashtagGroup.appendChild(hashtagOptions);

  // ---- Pilihan jam ----
  const timingGroup = el('div', { class: 'composer-group' });
  timingGroup.appendChild(el('p', { class: 'composer-group__label', text: t('posting.timing') }));
  const timingOptions = el('div', { class: 'composer-options' });
  timingGroup.appendChild(timingOptions);

  // ---- Preview ----
  const previewSlot = el('div', { class: 'composer-preview' });

  const previewPanel = panel({
    title: t('social.estimated'),
    children: [previewSlot],
  });

  // ---- Tombol ----
  const submitButton = button({
    label: t('posting.button'),
    variant: 'primary',
    block: true,
    size: 'lg',
    onClick: () => {
      const result = ctx.actions.createPost(input);

      if (!result.ok) {
        ctx.toasts.error(t(result.messageKey));
        return;
      }

      const outcome = result.value;
      ctx.navigate('post-result', {
        engagement: String(outcome.resolution.engagement),
        money: String(outcome.resolution.moneyDelta),
        followers: String(outcome.resolution.followersDelta),
        suspicion: String(outcome.resolution.suspicionDelta),
        suspicionAfter: String(outcome.suspicionAfter),
        followersAfter: String(outcome.followersAfter),
        captionMatch: String(outcome.resolution.captionMatch),
        shadowbanned: outcome.resolution.shadowbanned ? '1' : '0',
        tierFrom: outcome.tierChange.from,
        tierTo: outcome.tierChange.to,
        tierChanged: outcome.tierChange.changed ? '1' : '0',
        fine: String(outcome.tierChange.fineApplied),
        seized: outcome.tierChange.seized ? outcome.tierChange.seized.id : '',
        appId: app.id,
      });
    },
  });

  // ---- Rakit ----
  screen.appendChild(
    panel({
      title: app.name,
      subtitle: t(app.taglineKey),
      children: [captionGroup, hashtagGroup, timingGroup],
    }),
  );
  screen.appendChild(previewPanel);
  screen.appendChild(submitButton);

  content.appendChild(screen);

  const topBarNode = topBar({
    title: t('screen.composer.title'),
    subtitle: t('screen.composer.subtitle'),
    balance,
    showBack: true,
    onBack: () => ctx.navigate('handphone'),
  });

  root.replaceChildren(
    appFrame({
      topBar: topBarNode,
      nav: primaryNav({
        currentScreen: 'composer',
        onNavigate: (screenId) => ctx.navigate(screenId),
      }),
      content,
    }),
  );

  // ---- Render opsi ----
  const renderOption = (
    id: string,
    selectedId: string,
    text: string,
    meta: string | null,
    onSelect: () => void,
  ): HTMLElement => {
    const option = el('button', {
      type: 'button',
      class: selectedId === id ? 'composer-option is-selected' : 'composer-option',
      'aria-pressed': selectedId === id ? 'true' : 'false',
    });

    option.appendChild(el('span', { class: 'composer-option__mark', 'aria-hidden': 'true' }));

    const textWrap = el('span', { class: 'composer-option__text', text });
    if (meta) textWrap.appendChild(el('span', { class: 'composer-option__meta', text: meta }));
    option.appendChild(textWrap);

    option.addEventListener('click', onSelect);
    return option;
  };

  const renderAll = (): void => {
    captionOptions.replaceChildren();
    for (const caption of CAPTION_OPTIONS) {
      captionOptions.appendChild(
        renderOption(
          caption.id,
          input.captionId,
          caption.text,
          caption.tone === app.preferredTone ? t('social.captionMatch.good') : t('social.captionMatch.poor'),
          () => {
            input = { ...input, captionId: caption.id };
            renderAll();
          },
        ),
      );
    }

    hashtagOptions.replaceChildren();
    for (const hashtag of HASHTAG_OPTIONS) {
      hashtagOptions.appendChild(
        renderOption(hashtag.id, input.hashtagId, hashtag.label, null, () => {
          input = { ...input, hashtagId: hashtag.id };
          renderAll();
        }),
      );
    }

    timingOptions.replaceChildren();
    for (const timing of TIMING_OPTIONS) {
      timingOptions.appendChild(
        renderOption(timing.id, input.timingId, t(timing.labelKey), null, () => {
          input = { ...input, timingId: timing.id };
          renderAll();
        }),
      );
    }

    renderPreview();
  };

  const renderPreview = (): void => {
    const current = ctx.store.getState();
    const currentAccount = selectPrimaryAccount(current);
    if (!currentAccount) return;

    const validated = validatePostInput(input);
    if (!validated.ok) {
      previewSlot.replaceChildren(
        el('p', { class: 'text-muted', text: t(validated.messageKey) }),
      );
      return;
    }

    const risk = selectRiskMeter(current, ctx.config);
    const shadowbanned = selectIsShadowbanned(current, ctx.clock.now());

    const resolution = resolvePost(
      validated.value,
      {
        account: currentAccount,
        performanceReference: ctx.config.income.performanceReference,
        tierFollowersMultiplier: risk.tierConfig.postingFollowersMultiplier,
        shadowbanned,
      },
      ctx.config,
    );

    const reach = reachLabel(resolution.engagement);
    const riskBand = riskLabel(resolution.suspicionDelta);

    previewSlot.replaceChildren(
      cell('Jangkauan', t(`social.reach.short.${reach}`)),
      cell('Risiko', t(`social.risk.short.${riskBand}`)),
      cell('Perkiraan uang', formatMoney(resolution.moneyDelta)),
      cell('Followers', `+${resolution.followersDelta}`),
    );
  };

  const cell = (label: string, value: string): HTMLElement => {
    const node = el('div', { class: 'composer-preview__cell' });
    node.appendChild(el('span', { class: 'composer-preview__label', text: label }));
    node.appendChild(el('span', { class: 'composer-preview__value', text: value }));
    return node;
  };

  renderAll();

  // Cooldown: tombol disabled bila masih aktif.
  const cooldownNow = selectPostingCooldown(ctx.store.getState(), ctx.config, ctx.clock.now());
  if (cooldownNow.active) {
    submitButton.disabled = true;
    submitButton.textContent = `${t('posting.cooldown')} ${Math.ceil(cooldownNow.remainingMs / 1000)}s`;
  }

  ctx.signal.addEventListener('abort', () => {
    void account;
    void cooldown;
  });
}

const screenModule: ScreenModule = { id: 'composer', mount };
export default screenModule;
