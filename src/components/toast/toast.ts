import { el } from '@/core/dom';
import { icon, path } from '@/core/svg';
import './toast.css';

export type ToastVariant = 'info' | 'success' | 'warning' | 'error';

export interface ToastOptions {
  message: string;
  variant?: ToastVariant;
  durationMs?: number;
}

export interface ToastService {
  show(options: ToastOptions): void;
  success(message: string): void;
  error(message: string): void;
  warning(message: string): void;
  info(message: string): void;
  clear(): void;
}

const ICON_PATHS: Record<ToastVariant, string> = {
  info: 'M12 8h.01M11 12h1v4h1',
  success: 'm5 13 4 4L19 7',
  warning: 'M12 8v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  error: 'M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
};

export function createToastService(root: HTMLElement): ToastService {
  const active = new Set<HTMLElement>();

  const dismiss = (node: HTMLElement): void => {
    if (!active.has(node)) return;
    active.delete(node);
    node.classList.add('is-leaving');
    const remove = (): void => node.remove();
    node.addEventListener('animationend', remove, { once: true });
    // Fallback bila animasi dimatikan oleh reduced-motion.
    setTimeout(remove, 200);
  };

  const show = (options: ToastOptions): void => {
    const { message, variant = 'info', durationMs = 3200 } = options;

    const node = el('div', {
      class: `toast toast--${variant}`,
      role: variant === 'error' ? 'alert' : 'status',
    });

    const iconNode = icon([path({ d: ICON_PATHS[variant] })], undefined);
    iconNode.setAttribute('class', 'toast__icon');
    node.appendChild(iconNode);

    node.appendChild(el('div', { class: 'toast__body', text: message }));

    const close = el('button', {
      type: 'button',
      class: 'toast__close',
      'aria-label': 'Tutup notifikasi',
    });
    close.appendChild(icon([path({ d: 'M18 6 6 18M6 6l12 12' })]));
    close.addEventListener('click', () => dismiss(node));
    node.appendChild(close);

    root.appendChild(node);
    active.add(node);

    if (durationMs > 0) {
      setTimeout(() => dismiss(node), durationMs);
    }
  };

  return {
    show,
    success: (message) => show({ message, variant: 'success' }),
    error: (message) => show({ message, variant: 'error', durationMs: 5000 }),
    warning: (message) => show({ message, variant: 'warning', durationMs: 4200 }),
    info: (message) => show({ message, variant: 'info' }),
    clear() {
      for (const node of [...active]) dismiss(node);
    },
  };
}
