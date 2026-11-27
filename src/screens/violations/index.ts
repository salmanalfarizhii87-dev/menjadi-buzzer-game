/**
 * Screen: Pelanggaran.
 * Read-only terhadap ekonomi: hanya menampilkan aturan, riwayat, dan aksi
 * pemulihan berbayar (satu-satunya mutasi, lewat action).
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import { panel } from '@/components/cards/panel';
import { riskMeter } from '@/components/risk-meter/risk-meter';
import { recoveryBox, rulesTable, violationHistory } from '@/components/violations/violations-view';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { el } from '@/core/dom';
import { t } from '@/data/strings/id';
import {
  selectDisplayBalance,
  selectRiskMeter,
  selectViolations,
} from '@/state/selectors';

function mount(root: HTMLElement, ctx: ScreenContext, _params: ScreenParams): void {
  const render = (): void => {
    const state = ctx.store.getState();
    const balance = selectDisplayBalance(state);
    const risk = selectRiskMeter(state, ctx.config);
    const violations = selectViolations(state);

    const content = mainContent();
    const screen = el('section', { class: 'screen anim-fade' });

    screen.appendChild(riskMeter({ tier: risk.tier, suspicion: risk.suspicion }));

    screen.appendChild(
      panel({
        title: t('violations.rules'),
        subtitle: 'Konsekuensi naik seiring tingkat suspicion',
        children: [rulesTable(state, ctx.config)],
      }),
    );

    screen.appendChild(
      panel({
        title: t('violations.history'),
        subtitle: `${violations.length} catatan`,
        children: [violationHistory(state)],
      }),
    );

    screen.appendChild(
      panel({
        title: 'Pemulihan akun',
        children: [
          recoveryBox({
            save: state,
            config: ctx.config,
            onRecover: () => {
              const result = ctx.actions.recoverAccount();

              if (!result.ok) {
                ctx.toasts.error(t(result.messageKey));
                return;
              }

              const { evaluation, tierChange } = result.value;
              ctx.toasts.success(
                `Suspicion turun ${evaluation.suspicionBefore} → ${evaluation.suspicionAfter}.`,
              );

              if (tierChange.changed && tierChange.direction === 'down') {
                ctx.toasts.info(
                  `Tingkat risiko turun: ${t(`risk.tier.${tierChange.from}`)} → ${t(`risk.tier.${tierChange.to}`)}.`,
                );
              }

              render();
            },
          }),
        ],
      }),
    );

    content.appendChild(screen);

    root.replaceChildren(
      appFrame({
        topBar: topBar({
          title: t('screen.violations.title'),
          subtitle: t('screen.violations.subtitle'),
          balance,
          showBack: true,
          onBack: () => ctx.navigate('task'),
        }),
        nav: primaryNav({ currentScreen: 'violations', onNavigate: (id) => ctx.navigate(id) }),
        content,
      }),
    );
  };

  render();

  let scheduled = false;
  const unsubscribe = ctx.store.subscribe(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      render();
    });
  });

  ctx.signal.addEventListener('abort', () => unsubscribe(), { once: true });
}

const screenModule: ScreenModule = { id: 'violations', mount };
export default screenModule;
