/**
 * Layar placeholder untuk fitur yang dibangun pada fase berikutnya.
 *
 * Sengaja TIDAK menampilkan tombol palsu yang terlihat aktif. Hanya status
 * jujur + tombol kembali yang benar-benar berfungsi.
 */

import type { ScreenContext, ScreenId, ScreenParams } from '@/app/lifecycle';
import { button } from '@/components/buttons/button';
import { panel } from '@/components/cards/panel';
import { appFrame, mainContent, topBar } from '@/components/layout/app-shell';
import { primaryNav } from '@/components/navigation/primary-nav';
import { el } from '@/core/dom';
import { selectDisplayBalance } from '@/state/selectors';

export interface PlaceholderOptions {
  screenId: ScreenId;
  title: string;
  subtitle: string;
  phase: string;
  description: string;
  /** Sembunyikan bottom nav (mis. mini-game). Default false. */
  hideNav?: boolean;
  /** Layar tujuan tombol kembali. Default 'character'. */
  backTo?: ScreenId;
}

export function mountPlaceholder(
  root: HTMLElement,
  ctx: ScreenContext,
  _params: ScreenParams,
  options: PlaceholderOptions,
): void {
  const balance = selectDisplayBalance(ctx.store.getState());
  const backTo = options.backTo ?? 'character';

  const content = mainContent();
  const screen = el('section', { class: 'screen anim-fade' });

  screen.appendChild(
    panel({
      title: options.title,
      subtitle: options.subtitle,
      children: [
        el('p', { class: 'text-soft', text: options.description }),
        el('p', { class: 'text-muted', text: `Dibangun pada ${options.phase}.` }),
      ],
      footer: button({
        label: 'Kembali',
        variant: 'primary',
        block: true,
        onClick: () => ctx.navigate(backTo),
      }),
    }),
  );

  content.appendChild(screen);

  root.replaceChildren(
    appFrame({
      topBar: topBar({
        title: options.title,
        subtitle: options.subtitle,
        balance,
        showBack: true,
        onBack: () => ctx.navigate(backTo),
      }),
      nav: options.hideNav
        ? null
        : primaryNav({ currentScreen: options.screenId, onNavigate: (id) => ctx.navigate(id) }),
      content,
    }),
  );
}
