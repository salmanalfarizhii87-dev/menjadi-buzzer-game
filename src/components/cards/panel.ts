import { el, type Child } from '@/core/dom';
import './panel.css';

export interface PanelOptions {
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'raised' | 'sunken';
  children?: Child | Child[];
  headerAction?: Child;
  footer?: Child | Child[];
  className?: string;
}

export function panel(options: PanelOptions): HTMLElement {
  const { title, subtitle, variant = 'default', children, headerAction, footer, className } = options;

  const classes = ['panel'];
  if (variant === 'raised') classes.push('panel--raised');
  if (variant === 'sunken') classes.push('panel--sunken');
  if (className) classes.push(className);

  const node = el('section', { class: classes.join(' ') });

  if (title !== undefined || subtitle !== undefined || headerAction) {
    const header = el('div', { class: 'panel__header' });
    const titleWrap = el('div', { class: 'stack stack--tight' });
    if (title !== undefined) {
      titleWrap.appendChild(el('h2', { class: 'panel__title', text: title }));
    }
    if (subtitle !== undefined) {
      titleWrap.appendChild(el('p', { class: 'panel__subtitle', text: subtitle }));
    }
    header.appendChild(titleWrap);
    if (headerAction) header.appendChild(headerAction as Node);
    node.appendChild(header);
  }

  if (children !== undefined) {
    node.appendChild(el('div', { class: 'panel__body' }, children));
  }

  if (footer !== undefined) {
    node.appendChild(el('div', { class: 'panel__footer' }, footer));
  }

  return node;
}
