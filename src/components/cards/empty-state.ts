/**
 * Empty state reusable.
 */

import { el } from '@/core/dom';

export interface EmptyStateOptions {
  title: string;
  body?: string;
  action?: HTMLElement;
}

export function emptyState(options: EmptyStateOptions): HTMLElement {
  const node = el('div', { class: 'empty-state' });
  node.appendChild(el('p', { class: 'empty-state__title', text: options.title }));
  if (options.body) {
    node.appendChild(el('p', { class: 'empty-state__body', text: options.body }));
  }
  if (options.action) node.appendChild(options.action);
  return node;
}
