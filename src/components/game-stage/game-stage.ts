/**
 * Stage game hidup: background bergerak (parallax), karakter bisa jalan/lompat,
 * partikel, dan reaksi klik. DOM + CSS + rAF, tanpa Canvas.
 */

import { el } from '@/core/dom';
import './game-stage.css';

const LINES = [
  'Santai, cuan jalan terus.',
  'Siap posting lagi, bos?',
  'Kopi dulu sebelum gas.',
  'Heat naik! Gas poll.',
];

export interface GameStageElement extends HTMLElement {
  stopStage?: () => void;
}

export interface GameStageOptions {
  outfitId: string;
  /** Tombol panah untuk menggerakkan karakter. */
  controls?: boolean;
  signal?: AbortSignal;
}

export function gameStage(options: GameStageOptions): HTMLElement {
  const { outfitId, controls = true, signal } = options;

  const outfitClass = outfitId.replace(/^outfit-/, '');

  const root = el('div', { class: 'game-stage' });
  const background = el('img', {
    class: 'game-stage__bg',
    src: '/assets/original/kilat-city-stage.png',
    alt: '',
    'aria-hidden': 'true',
  });
  root.appendChild(background);

  const layers = ['sky', 'far', 'mid', 'foreground'];
  const parallaxLayers = layers.map((layer) => {
    const element = el('span', {
      class: `game-stage__layer game-stage__layer--${layer}`,
      'aria-hidden': 'true',
    });
    root.appendChild(element);
    return element;
  });

  const sweep = el('span', { class: 'game-stage__sweep', 'aria-hidden': 'true' });
  root.appendChild(sweep);

  const motes = el('span', { class: 'game-stage__motes', 'aria-hidden': 'true' });
  for (let index = 0; index < 3; index += 1) {
    motes.appendChild(el('span', { class: `game-stage__mote game-stage__mote--${index % 3}` }));
  }
  root.appendChild(motes);

  const shadow = el('span', { class: 'game-stage__shadow', 'aria-hidden': 'true' });
  root.appendChild(shadow);

  const actor = el('button', {
    type: 'button',
    class: 'game-stage__actor',
    'aria-label': 'Karakter — ketuk untuk reaksi',
  });
  const bubble = el('span', { class: 'game-stage__bubble' });
  const portrait = el('img', {
    class: `game-stage__char outfit-${outfitClass}`,
    src: '/assets/original/creator-chibi.png',
    alt: 'Karakter pemain',
  });
  const walkFrames = Array.from({ length: 6 }, (_, index) => {
    const image = new Image();
    image.src = `/assets/original/kilat-walk-${index}.png`;
    return image;
  });
  actor.append(bubble, portrait);
  root.appendChild(actor);

  if (controls) {
    const pad = el('div', { class: 'game-stage__pad', role: 'group', 'aria-label': 'Gerakkan karakter' });
    const left = el('button', { type: 'button', class: 'game-stage__pad-btn', text: '◀', 'aria-label': 'Jalan ke kiri' });
    const jump = el('button', { type: 'button', class: 'game-stage__pad-btn game-stage__pad-btn--jump', text: '▲', 'aria-label': 'Lompat' });
    const right = el('button', { type: 'button', class: 'game-stage__pad-btn', text: '▶', 'aria-label': 'Jalan ke kanan' });
    pad.append(left, jump, right);
    root.appendChild(pad);

    const hold = (button: HTMLButtonElement, value: number): void => {
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        direction = value;
      });
      for (const type of ['pointerup', 'pointerleave', 'pointercancel']) {
        button.addEventListener(type, () => {
          if (direction === value) direction = 0;
        });
      }
    };
    hold(left, -1);
    hold(right, 1);
    jump.addEventListener('click', () => {
      if (height < 2) velocityY = 11;
    });
  }

  let direction = 0;
  let x = 0;
  let velocityX = 0;
  let height = 0;
  let velocityY = 0;
  let frame = 0;
  let lastWalkFrameAt = 0;
  let walkFrameIndex = 0;
  let bubbleTimer: number | null = null;

  const react = (): void => {
    bubble.textContent = LINES[Math.floor(Math.random() * LINES.length)] ?? LINES[0]!;
    bubble.classList.add('is-visible');
    actor.classList.remove('is-reacting');
    void actor.offsetWidth;
    actor.classList.add('is-reacting');
    if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('is-visible'), 2100);
  };
  actor.addEventListener('click', react);

  const handleKeyDown = (event: KeyboardEvent): void => {
    if (!controls || event.repeat) return;
    const target = event.target;
    if (target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;

    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      event.preventDefault();
      direction = -1;
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      event.preventDefault();
      direction = 1;
    } else if (event.key === 'ArrowUp' || event.key === ' ') {
      event.preventDefault();
      if (height < 2) velocityY = 11;
    }
  };
  const handleKeyUp = (event: KeyboardEvent): void => {
    if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
      if (direction < 0) direction = 0;
    } else if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
      if (direction > 0) direction = 0;
    }
  };
  if (controls) {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  }

  const tick = (now: number): void => {
    velocityX += direction * 0.9;
    velocityX *= 0.9;
    x += velocityX;
    if (x > 86 || x < -86) {
      x = Math.max(-86, Math.min(86, x));
      velocityX *= -0.35;
    }

    if (height > 0 || velocityY > 0) {
      height += velocityY;
      velocityY -= 0.9;
      if (height <= 0) {
        height = 0;
        velocityY = 0;
      }
    }

    actor.style.setProperty('--x', `${x.toFixed(1)}px`);
    actor.style.setProperty('--y', `${height.toFixed(1)}px`);
    const isWalking = Math.abs(velocityX) > 0.7;
    actor.classList.toggle('is-walking', isWalking);
    if (isWalking) {
      if (now - lastWalkFrameAt >= 115) {
        walkFrameIndex = (walkFrameIndex + 1) % walkFrames.length;
        lastWalkFrameAt = now;
      }
      const walkFrame = walkFrames[walkFrameIndex];
      if (walkFrame?.complete && walkFrame.naturalWidth > 0) portrait.src = walkFrame.src;
      portrait.style.transform = velocityX < 0 ? 'scaleX(-1)' : 'none';
    } else {
      if (portrait.getAttribute('src') !== '/assets/original/creator-chibi.png') {
        portrait.src = '/assets/original/creator-chibi.png';
      }
      portrait.style.transform = 'none';
    }
    shadow.style.setProperty('--x', `${x.toFixed(1)}px`);
    shadow.style.setProperty('--s', String(1 - height / 180));
    background.style.setProperty('--pan', `${(-x * 0.3).toFixed(1)}px`);
    parallaxLayers.forEach((layer, index) => {
      const depth = [0.08, 0.16, 0.26, 0.38][index] ?? 0.1;
      layer.style.setProperty('--pan', `${(-x * depth).toFixed(1)}px`);
    });
    motes.style.setProperty('--pan', `${(-x * 0.55).toFixed(1)}px`);

    frame = window.requestAnimationFrame(tick);
  };

  const stop = (): void => {
    window.cancelAnimationFrame(frame);
    if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  };
  signal?.addEventListener('abort', stop, { once: true });

  frame = window.requestAnimationFrame(tick);
  (root as GameStageElement).stopStage = stop;
  return root;
}
