/**
 * Renderer Engagement Challenge. Penanda bergerak bolak-balik; pemain menekan
 * Stop untuk merekam posisi. Target berasal dari seed session, jadi sama
 * setelah refresh. Skor dihitung modul domain.
 */

import { panel } from '@/components/cards/panel';
import { el } from '@/core/dom';
import { t } from '@/data/strings/id';
import { loadMiniGameModule } from '@/domain/minigames/registry';
import type { MiniGameRenderer } from './types';

export const render: MiniGameRenderer = async (root, deps) => {
  const { createEngagementChallenge, scoreEngagementChallenge } =
    await loadMiniGameModule('engagement-challenge');
  if (deps.signal.aborted) return;

  const setup = createEngagementChallenge(
    deps.session.miniGameSeed,
    deps.ctx.config.miniGames.engagementTargetWidth,
    deps.ctx.config.miniGames.engagementAttempts,
  );

  const positions: number[] = [];
  const reduceMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const period = reduceMotion ? 2600 : 1800;

  let current = 0;
  let finished = false;
  let frame = 0;

  const marker = el('span', { class: 'timing-marker', 'aria-hidden': 'true' });
  const zone = el('span', {
    class: 'timing-zone',
    'aria-hidden': 'true',
    style: {
      left: `${(setup.targetCenter - setup.targetWidth / 2) * 100}%`,
      width: `${setup.targetWidth * 100}%`,
    },
  });
  const track = el(
    'div',
    {
      class: 'timing-track',
      role: 'img',
      'aria-label': `${t('minigame.targetZone')} di ${Math.round(setup.targetCenter * 100)} persen`,
      dataset: { target: setup.targetCenter.toFixed(4) },
    },
    [zone, marker],
  );

  const pips = el('div', { class: 'minigame-pips', 'aria-hidden': 'true' });
  for (let index = 0; index < setup.attempts; index += 1) {
    pips.appendChild(el('span', { class: 'minigame-pip' }));
  }

  const counter = el('p', {
    class: 'minigame-step',
    text: `${t('minigame.engagement.attempt')} 1/${setup.attempts}`,
  });

  const stopButton = el('button', {
    type: 'button',
    class: 'btn btn--danger btn--lg btn--block minigame-stop',
    text: t('minigame.stop'),
  });

  const card = panel({
    title: t('minigame.engagement.title'),
    children: [
      el('p', { class: 'minigame-prompt', text: t('minigame.engagement.instruction') }),
      counter,
      track,
      pips,
      stopButton,
    ],
  });

  const abort = (): void => {
    finished = true;
    cancelAnimationFrame(frame);
  };
  deps.signal.addEventListener('abort', abort, { once: true });

  const tick = (now: number): void => {
    if (finished || deps.signal.aborted) return;
    const phase = (now % period) / period;
    current = phase <= 0.5 ? phase * 2 : 2 - phase * 2;
    marker.style.left = `${(current * 100).toFixed(2)}%`;
    frame = requestAnimationFrame(tick);
  };

  const stop = (): void => {
    if (finished || deps.signal.aborted) return;

    positions.push(current);
    const pip = pips.children[positions.length - 1];
    if (pip) pip.classList.add('is-on');

    if (positions.length >= setup.attempts) {
      finished = true;
      cancelAnimationFrame(frame);
      stopButton.disabled = true;
      const result = scoreEngagementChallenge(setup, positions);
      deps.onComplete(result.score);
      return;
    }

    counter.textContent = `${t('minigame.engagement.attempt')} ${positions.length + 1}/${setup.attempts}`;
  };

  stopButton.addEventListener('click', stop);

  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== ' ' && event.key !== 'Enter') return;
      if (event.target instanceof HTMLButtonElement) return;
      event.preventDefault();
      stop();
    },
    { signal: deps.signal },
  );

  root.replaceChildren(card);
  frame = requestAnimationFrame(tick);
};
