/**
 * Ambient cart scene with an autonomous idle/walk loop. No directional controls.
 */

import { el } from '@/core/dom';
import './game-stage.css';

const REACTIONS = [
  'Pelanggan datang lagi!',
  'Sebentar, siap melayani.',
  'Wah, ramai hari ini!',
];

const IDLE_IMAGE = '/assets/original/creator-chibi.png';
const WALK_FRAME_COUNT = 6;
const WALK_FRAME_INTERVAL = 120;
const MOTION_CYCLE = 10_400;

export interface GameStageElement extends HTMLElement {
  stopStage?: () => void;
}

export interface GameStageOptions {
  outfitId: string;
  signal?: AbortSignal;
}

export function gameStage(options: GameStageOptions): HTMLElement {
  const { outfitId, signal } = options;
  const root = el('div', { class: 'game-stage', 'aria-label': 'Suasana lapak dan jalan' });
  const background = el('img', {
    class: 'game-stage__bg',
    src: '/assets/original/kilat-city-stage.png',
    alt: '',
    'aria-hidden': 'true',
  });
  const groundGlow = el('span', { class: 'game-stage__ground', 'aria-hidden': 'true' });
  const cart = el('img', {
    class: 'game-stage__cart',
    src: '/assets/original/vendor-cart.png',
    alt: '',
    'aria-hidden': 'true',
  });
  const shadow = el('span', { class: 'game-stage__shadow', 'aria-hidden': 'true' });
  const actor = el('button', {
    type: 'button',
    class: 'game-stage__actor is-idle',
    'aria-label': 'Pedagang sedang beristirahat; ketuk untuk melihat reaksinya',
    'data-motion': 'idle',
  });
  const bubble = el('span', { class: 'game-stage__bubble', 'aria-live': 'polite' });
  const portrait = el('img', {
    class: `game-stage__char outfit-${outfitId.replace(/^outfit-/, '')}`,
    src: IDLE_IMAGE,
    alt: '',
    'aria-hidden': 'true',
  });
  const walkFrames = Array.from({ length: WALK_FRAME_COUNT }, (_, index) => {
    const image = new Image();
    image.src = `/assets/original/kilat-walk-${index}.png`;
    return image;
  });

  actor.append(bubble, portrait);
  root.append(background, groundGlow, shadow, actor, cart);

  let frame = 0;
  let previousTime = 0;
  let previousWalkFrameAt = 0;
  let walkFrameIndex = 0;
  let x = 0;
  let direction = 1;
  let currentMotion = 'idle';
  let bubbleTimer: number | null = null;
  let stopped = false;

  const setMotion = (motion: 'idle' | 'move', nextDirection: number): void => {
    if (motion !== currentMotion) {
      currentMotion = motion;
      actor.dataset.motion = motion;
      actor.classList.toggle('is-idle', motion === 'idle');
      actor.classList.toggle('is-walking', motion === 'move');
      if (motion === 'idle') {
        portrait.src = IDLE_IMAGE;
        portrait.style.transform = 'none';
      }
    }
    direction = nextDirection;
  };

  const react = (): void => {
    bubble.textContent = REACTIONS[Math.floor(Math.random() * REACTIONS.length)] ?? REACTIONS[0]!;
    bubble.classList.add('is-visible');
    actor.classList.remove('is-reacting');
    void actor.offsetWidth;
    actor.classList.add('is-reacting');
    if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
    bubbleTimer = window.setTimeout(() => bubble.classList.remove('is-visible'), 2100);
  };
  actor.addEventListener('click', react);

  const tick = (now: number): void => {
    if (stopped) return;
    const delta = previousTime === 0 ? 0 : Math.min(now - previousTime, 40);
    previousTime = now;

    const phase = now % MOTION_CYCLE;
    if (phase < 2600 || (phase >= 5300 && phase < 6900) || phase >= 9700) {
      setMotion('idle', direction);
    } else if (phase < 5300) {
      setMotion('move', 1);
    } else {
      setMotion('move', -1);
    }

    if (currentMotion === 'move') {
      x += direction * delta * 0.025;
      if (x > 42 || x < -42) {
        x = Math.max(-42, Math.min(42, x));
      }
      if (now - previousWalkFrameAt >= WALK_FRAME_INTERVAL) {
        walkFrameIndex = (walkFrameIndex + 1) % WALK_FRAME_COUNT;
        previousWalkFrameAt = now;
      }
      const walkFrame = walkFrames[walkFrameIndex];
      if (walkFrame?.complete && walkFrame.naturalWidth > 0 && portrait.src !== walkFrame.src) {
        portrait.src = walkFrame.src;
      }
      portrait.style.transform = direction < 0 ? 'scaleX(-1)' : 'none';
    }

    actor.style.setProperty('--x', `${x.toFixed(1)}px`);
    actor.style.setProperty('--direction', String(direction));
    shadow.style.setProperty('--x', `${x.toFixed(1)}px`);
    frame = window.requestAnimationFrame(tick);
  };

  const stop = (): void => {
    stopped = true;
    window.cancelAnimationFrame(frame);
    if (bubbleTimer !== null) window.clearTimeout(bubbleTimer);
  };
  signal?.addEventListener('abort', stop, { once: true });
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    frame = window.requestAnimationFrame(tick);
  }
  (root as GameStageElement).stopStage = stop;
  return root;
}
