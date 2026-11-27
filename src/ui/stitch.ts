/**
 * Helper template Stitch: parse markup statis, lalu binder layar menambal
 * nilai dinamis lewat textContent/DOM. Tidak ada data dinamis sebagai HTML.
 */

import type { ScreenContext } from '@/app/lifecycle';
import type { ScreenId } from '@/app/lifecycle';

const ROUTES: Array<{ match: RegExp; screen: ScreenId }> = [
  { match: /01-business-home/, screen: 'character' },
  { match: /02-campaign-board/, screen: 'task' },
  { match: /03-asset-shop/, screen: 'shop' },
  { match: /04-account-detail/, screen: 'account-detail' },
  { match: /05-finance-history/, screen: 'finance' },
  { match: /11-character-customizer/, screen: 'customizer' },
  { match: /12-settings-options/, screen: 'settings' },
  { match: /13-studio-location/, screen: 'studio' },
  { match: /14-rewards-collectibles/, screen: 'rewards' },
  { match: /19-character-outfits/, screen: 'outfits' },
  { match: /20-character-accessories/, screen: 'accessories' },
  { match: /08-caption-challenge/, screen: 'campaign-minigame' },
  { match: /09-engagement-challenge/, screen: 'campaign-minigame' },
];

export function stitchRoot(html: string): HTMLElement {
  const doc = new DOMParser().parseFromString(
    `<div class="stitch-root">${html}</div>`,
    'text/html',
  );
  const root = doc.body.firstElementChild as HTMLElement;
  for (const node of root.querySelectorAll('*')) {
    for (const attribute of [...node.attributes]) {
      if (attribute.name.startsWith('on')) node.removeAttribute(attribute.name);
    }
  }
  return root;
}

export function $<T extends Element = HTMLElement>(root: ParentNode, selector: string): T {
  const node = root.querySelector<T>(selector);
  if (!node) throw new Error(`[stitch] elemen tidak ditemukan: ${selector}`);
  return node;
}

export function setText(root: ParentNode, selector: string, value: string): void {
  $(root, selector).textContent = value;
}

export function bindRouteLinks(
  root: HTMLElement,
  ctx: ScreenContext,
  overrides: Record<string, () => void> = {},
): void {
  for (const anchor of root.querySelectorAll<HTMLAnchorElement>('a[href]')) {
    anchor.addEventListener('click', (event) => {
      event.preventDefault();
      const href = anchor.getAttribute('href') ?? '';
      const override = Object.entries(overrides).find(([needle]) => href.includes(needle));
      if (override) {
        override[1]();
        return;
      }
      const route = ROUTES.find((entry) => entry.match.test(href));
      if (route) ctx.navigate(route.screen);
    });
  }
}

/** Ganti placeholder gambar dengan node SVG/DOM. */
export function replacePlaceholder(
  root: HTMLElement,
  label: string,
  content: Node,
): void {
  const slot = root.querySelector<HTMLElement>(`[data-stitch-img="${label}"]`);
  if (!slot) return;
  slot.classList.remove('stitch-img');
  slot.replaceChildren(content);
}

export function compact(value: number): string {
  if (!Number.isFinite(value)) return '0';
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace('.', ',')}jt`;
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1).replace('.', ',')}rb`;
  return String(Math.round(value));
}
