/**
 * Screen: Hasil Posting.
 *
 * Semua nilai datang dari router params hasil `createPost`. Screen ini TIDAK
 * memutasi state apa pun, sehingga refresh tidak pernah menggandakan reward.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { panel } from '@/components/cards/panel';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { el } from '@/core/dom';
import { formatMoney } from '@/core/money';
import { t } from '@/data/strings/id';
import { selectDisplayBalance } from '@/state/selectors';
import '../handphone/handphone.css';

function numberParam(params: ScreenParams, key: string): number {
  const raw = params[key];
  if (raw === undefined) return 0;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function row(label: string, value: string, tone?: 'positive' | 'negative'): HTMLElement {
  const node = el('div', { class: 'result-row' });
  node.appendChild(el('span', { class: 'result-row__label', text: label }));

  const valueClass =
    tone === 'positive'
      ? 'result-row__value result-row__value--positive'
      : tone === 'negative'
        ? 'result-row__value result-row__value--negative'
        : 'result-row__value';

  node.appendChild(el('span', { class: valueClass, text: value }));
  return node;
}

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const balance = selectDisplayBalance(ctx.store.getState());

  const hasResult = params['engagement'] !== undefined;

  const content = mainContent();
  const screen = el('section', { class: 'screen anim-fade' });

  if (!hasResult) {
    screen.appendChild(
      panel({
        title: 'Hasil tidak tersedia',
        children: [
          el('p', {
            class: 'text-soft',
            text: 'Hasil posting tidak dapat dipulihkan setelah halaman dimuat ulang. Buka handphone untuk melihat kondisi terbaru.',
          }),
        ],
        footer: button({
          label: t('screen.handphone.title'),
          variant: 'primary',
          block: true,
          onClick: () => ctx.navigate('handphone'),
        }),
      }),
    );

    content.appendChild(screen);
    root.replaceChildren(
      appFrame({
        topBar: topBar({
          title: t('screen.postResult.title'),
          subtitle: t('screen.postResult.subtitle'),
          balance,
          showBack: true,
          onBack: () => ctx.navigate('handphone'),
        }),
        nav: primaryNav({
          currentScreen: 'post-result',
          onNavigate: (screenId) => ctx.navigate(screenId),
        }),
        content,
      }),
    );
    return;
  }

  const engagement = numberParam(params, 'engagement');
  const money = numberParam(params, 'money');
  const followers = numberParam(params, 'followers');
  const suspicion = numberParam(params, 'suspicion');
  const suspicionAfter = numberParam(params, 'suspicionAfter');
  const followersAfter = numberParam(params, 'followersAfter');
  const captionMatch = numberParam(params, 'captionMatch');
  const shadowbanned = params['shadowbanned'] === '1';
  const tierFrom = params['tierFrom'] ?? 'safe';
  const tierTo = params['tierTo'] ?? 'safe';
  const tierChanged = params['tierChanged'] === '1';
  const fine = numberParam(params, 'fine');
  const seized = params['seized'] ?? '';
  const appId = params['appId'] ?? '';

  const heroTone = tierChanged && tierTo !== 'safe' ? 'result-hero result-hero--warn' : 'result-hero';

  const hero = el('div', { class: heroTone });
  hero.appendChild(el('p', { class: 'result-hero__title', text: t('posting.success') }));
  hero.appendChild(
    el('p', {
      class: 'result-hero__subtitle',
      text: shadowbanned ? t('posting.shadowbanActive') : t(`social.reach.${engagement >= 90 ? 'high' : engagement >= 45 ? 'medium' : 'low'}`),
    }),
  );
  screen.appendChild(hero);

  const rows = el('div', { class: 'result-list' });
  rows.appendChild(row('Engagement', String(engagement)));
  rows.appendChild(row(t('posting.moneyGain'), formatMoney(money), money > 0 ? 'positive' : undefined));
  rows.appendChild(
    row(
      t('posting.followersGain'),
      shadowbanned ? '0 (shadowban)' : `+${followers}`,
      !shadowbanned && followers > 0 ? 'positive' : undefined,
    ),
  );
  rows.appendChild(row(t('posting.suspicionGain'), `+${suspicion}`, suspicion > 0 ? 'negative' : undefined));
  rows.appendChild(row('Suspicion sekarang', `${suspicionAfter} / 100`));
  rows.appendChild(row('Followers sekarang', followersAfter.toLocaleString('id-ID')));
  rows.appendChild(
    row(
      'Kecocokan caption',
      captionMatch >= 1 ? t('social.captionMatch.good') : t('social.captionMatch.poor'),
      captionMatch >= 1 ? 'positive' : undefined,
    ),
  );
  if (fine > 0) rows.appendChild(row(t('social.fineApplied'), formatMoney(-fine), 'negative'));
  if (seized) rows.appendChild(row(t('social.seized'), seized, 'negative'));

  screen.appendChild(panel({ title: 'Rincian', children: [rows] }));

  if (tierChanged) {
    const up = tierTo !== 'safe' && tierTo !== 'watch' ? true : tierFrom === 'safe';
    const alert = el('div', {
      class: up && tierTo !== 'safe' ? 'tier-alert tier-alert--up' : 'tier-alert tier-alert--down',
    });
    alert.appendChild(
      el('span', {
        class: 'tier-alert__title',
        text: up && tierTo !== 'safe' ? t('social.tierUp') : t('social.tierDown'),
      }),
    );
    alert.appendChild(
      el('span', {
        text: `${t(`risk.tier.${tierFrom}`)} → ${t(`risk.tier.${tierTo}`)}`,
      }),
    );
    if (fine > 0) {
      alert.appendChild(el('span', { text: `${t('social.fineApplied')}: ${formatMoney(-fine)}` }));
    }
    screen.appendChild(alert);
  }

  const actions = el('div', { class: 'stack' }, [
    button({
      label: 'Kembali ke Handphone',
      variant: 'primary',
      block: true,
      onClick: () => ctx.navigate('handphone'),
    }),
    button({
      label: t('nav.finance'),
      variant: 'ghost',
      block: true,
      onClick: () => ctx.navigate('finance'),
    }),
  ]);
  screen.appendChild(actions);

  content.appendChild(screen);

  root.replaceChildren(
    appFrame({
      topBar: topBar({
        title: t('screen.postResult.title'),
        subtitle: appId ? `via ${appId}` : t('screen.postResult.subtitle'),
        balance,
        showBack: true,
        onBack: () => ctx.navigate('handphone'),
      }),
      nav: primaryNav({
        currentScreen: 'post-result',
        onNavigate: (screenId) => ctx.navigate(screenId),
      }),
      content,
    }),
  );
}

const screenModule: ScreenModule = { id: 'post-result', mount };
export default screenModule;
