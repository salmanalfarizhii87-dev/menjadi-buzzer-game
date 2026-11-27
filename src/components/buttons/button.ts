import { el, type Child } from '@/core/dom';
import './button.css';

export type ButtonVariant = 'primary' | 'accent' | 'gold' | 'danger' | 'ghost';

export interface ButtonOptions {
  label: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
  type?: 'button' | 'submit';
  disabled?: boolean;
  title?: string;
  onClick?: (event: MouseEvent) => void;
  icon?: Child;
  className?: string;
}

export function button(options: ButtonOptions): HTMLButtonElement {
  const {
    label,
    variant = 'primary',
    size = 'md',
    block = false,
    type = 'button',
    disabled = false,
    title,
    onClick,
    icon,
    className,
  } = options;

  const classes = ['btn', `btn--${variant}`];
  if (block) classes.push('btn--block');
  if (size !== 'md') classes.push(`btn--${size}`);
  if (className) classes.push(className);

  const node = el('button', {
    type,
    class: classes.join(' '),
    ...(title === undefined ? {} : { title }),
  });

  if (icon) node.appendChild(el('span', { class: 'btn__icon', 'aria-hidden': 'true' }, icon));
  node.appendChild(el('span', { class: 'btn__label' }, label));

  node.disabled = disabled;
  if (onClick) node.addEventListener('click', onClick);

  return node;
}

export interface IconButtonOptions {
  label: string;
  icon: Child;
  onClick?: (event: MouseEvent) => void;
  className?: string;
}

export function iconButton(options: IconButtonOptions): HTMLButtonElement {
  const node = el('button', {
    type: 'button',
    class: ['btn-icon', options.className].filter(Boolean).join(' '),
    'aria-label': options.label,
    title: options.label,
  });
  node.appendChild(options.icon as Node);
  if (options.onClick) node.addEventListener('click', options.onClick);
  return node;
}
