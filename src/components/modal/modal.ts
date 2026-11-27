import { button } from '@/components/buttons/button';
import { el, type Child } from '@/core/dom';
import './modal.css';

export interface ModalAction {
  label: string;
  variant?: 'primary' | 'accent' | 'gold' | 'danger' | 'ghost';
  onClick: () => void;
  /** Jika true, modal tetap terbuka setelah aksi. */
  keepOpen?: boolean;
}

export interface ModalOptions {
  title: string;
  message?: string;
  variant?: 'default' | 'danger' | 'warning';
  content?: Child | Child[];
  actions: ModalAction[];
  /** Klik backdrop menutup modal. Default false untuk keputusan berisiko. */
  dismissible?: boolean;
  onClose?: () => void;
}

export interface OverlayService {
  openModal(options: ModalOptions): void;
  close(): void;
  isOpen(): boolean;
}

export function createOverlayService(root: HTMLElement): OverlayService {
  let current: HTMLElement | null = null;
  let previousFocus: HTMLElement | null = null;

  const close = (): void => {
    if (!current) return;
    const node = current;
    current = null;
    node.remove();
    previousFocus?.focus();
    previousFocus = null;
  };

  const openModal = (options: ModalOptions): void => {
    close();
    previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const backdrop = el('div', { class: 'modal-backdrop' });

    const ribbonClass =
      options.variant === 'danger'
        ? 'modal__ribbon modal__ribbon--danger'
        : options.variant === 'warning'
          ? 'modal__ribbon modal__ribbon--warning'
          : 'modal__ribbon';

    const dialog = el('div', {
      class: 'modal',
      role: 'dialog',
      'aria-modal': 'true',
      'aria-label': options.title,
    });

    dialog.appendChild(el('div', { class: ribbonClass, text: options.title }));

    const body = el('div', { class: 'modal__body' });
    if (options.message) {
      body.appendChild(el('p', { class: 'modal__message', text: options.message }));
    }
    if (options.content) body.appendChild(el('div', { class: 'stack stack--tight' }, options.content));
    dialog.appendChild(body);

    const actions = el('div', {
      class: options.actions.length > 2 ? 'modal__actions' : 'modal__actions modal__actions--row',
    });

    for (const action of options.actions) {
      actions.appendChild(
        button({
          label: action.label,
          variant: action.variant ?? 'primary',
          block: options.actions.length > 2,
          onClick: () => {
            action.onClick();
            if (!action.keepOpen) close();
          },
        }),
      );
    }

    dialog.appendChild(actions);
    backdrop.appendChild(dialog);

    if (options.dismissible !== false) {
      backdrop.addEventListener('click', (event) => {
        if (event.target === backdrop) {
          close();
          options.onClose?.();
        }
      });
    }

    backdrop.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && options.dismissible !== false) {
        event.preventDefault();
        close();
        options.onClose?.();
      }
    });

    root.appendChild(backdrop);
    current = backdrop;

    // Fokuskan aksi pertama agar keyboard langsung bisa dipakai.
    const firstButton = dialog.querySelector<HTMLButtonElement>('button');
    firstButton?.focus();
  };

  return {
    openModal,
    close,
    isOpen: () => current !== null,
  };
}
