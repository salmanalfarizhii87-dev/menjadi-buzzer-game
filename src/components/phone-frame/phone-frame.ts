import { el, type Child } from '@/core/dom';
import { icons } from '@/components/icons';
import { formatCooldown } from '@/domain/posting/cooldown';
import type { SocialApp } from '@/data/social/apps';
import './phone-frame.css';

const APP_ICON: Record<string, () => SVGSVGElement> = {
  chirper: icons.appChirper,
  pulse: icons.appPulse,
  loop: icons.appLoop,
};

const APP_ICON_CLASS: Record<string, string> = {
  chirper: '',
  pulse: ' app-tile__icon--pulse',
  loop: ' app-tile__icon--loop',
};

export interface PhoneFrameOptions {
  /** Isi status bar kiri, mis. nama operator fiktif. */
  carrier?: string;
  screen: Child | Child[];
}

export function phoneFrame(options: PhoneFrameOptions): HTMLElement {
  const frame = el('div', { class: 'phone-frame' });

  const status = el('div', { class: 'phone-frame__status' });
  status.appendChild(el('span', { text: options.carrier ?? 'SignalNet' }));
  status.appendChild(el('span', { text: '88%' }));
  frame.appendChild(status);

  const screen = el('div', { class: 'phone-frame__screen' }, options.screen);
  frame.appendChild(screen);

  return frame;
}

export interface AppGridOptions {
  apps: readonly SocialApp[];
  selectedAppId: string | null;
  onSelect: (appId: string) => void;
}

export function appGrid(options: AppGridOptions): HTMLElement {
  const grid = el('div', { class: 'app-grid' });

  for (const app of options.apps) {
    const selected = options.selectedAppId === app.id;
    const tile = el('button', {
      type: 'button',
      class: selected ? 'app-tile app-tile--selected' : 'app-tile',
      'aria-pressed': selected ? 'true' : 'false',
      'aria-label': app.name,
    });

    const iconWrap = el('span', {
      class: `app-tile__icon${APP_ICON_CLASS[app.id] ?? ''}${selected ? ' app-tile__icon--selected' : ''}`,
    });
    const iconFactory = APP_ICON[app.id] ?? icons.appChirper;
    iconWrap.appendChild(iconFactory());

    tile.appendChild(iconWrap);
    tile.appendChild(el('span', { class: 'app-tile__name', text: app.name }));
    tile.appendChild(el('span', { class: 'app-tile__dot', 'aria-hidden': 'true' }));
    tile.addEventListener('click', () => options.onSelect(app.id));

    grid.appendChild(tile);
  }

  return grid;
}

export interface CooldownBarOptions {
  remainingMs: number;
  progress: number;
}

export function cooldownBar(options: CooldownBarOptions): HTMLElement {
  const bar = el('div', { class: 'cooldown-bar' });
  bar.appendChild(el('span', { text: 'Cooldown' }));

  const track = el('div', { class: 'cooldown-bar__track' });
  track.appendChild(
    el('div', {
      class: 'cooldown-bar__fill',
      style: { width: `${(Math.min(1, Math.max(0, options.progress)) * 100).toFixed(1)}%` },
    }),
  );
  bar.appendChild(track);
  bar.appendChild(el('span', { text: formatCooldown(options.remainingMs) }));

  return bar;
}

export function phoneBanner(message: string): HTMLElement {
  const banner = el('div', { class: 'phone-banner', role: 'status' });
  banner.appendChild(icons.alert());
  banner.appendChild(el('span', { text: message }));
  return banner;
}
