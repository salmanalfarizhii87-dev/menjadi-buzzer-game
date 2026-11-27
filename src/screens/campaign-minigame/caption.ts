/**
 * Renderer Caption Challenge. Tiga ronde, keyboard 1–4, skor dihitung modul
 * domain yang dimuat lazy lewat registri.
 */

import { panel } from '@/components/cards/panel';
import { el } from '@/core/dom';
import { t } from '@/data/strings/id';
import { CAPTION_ROUNDS } from '@/data/minigames/caption-challenge';
import { loadMiniGameModule } from '@/domain/minigames/registry';
import type { MiniGameRenderer } from './types';

export const render: MiniGameRenderer = async (root, deps) => {
  const { scoreCaptionChallenge } = await loadMiniGameModule('caption-challenge');
  if (deps.signal.aborted) return;

  let roundIndex = 0;
  let locked = false;
  let timer: number | null = null;
  const answers: number[] = [];

  deps.signal.addEventListener(
    'abort',
    () => {
      if (timer !== null) window.clearTimeout(timer);
    },
    { once: true },
  );

  const drawRound = (): void => {
    const round = CAPTION_ROUNDS[roundIndex];
    if (!round) return;

    const options = el('div', { class: 'caption-options' });

    const choose = (optionIndex: number, node: HTMLButtonElement): void => {
      if (locked || deps.signal.aborted) return;
      const option = round.options[optionIndex];
      if (!option) return;

      locked = true;
      answers.push(optionIndex);

      for (const button of options.querySelectorAll<HTMLButtonElement>('.caption-option')) {
        button.disabled = true;
      }
      node.classList.add('is-picked');

      const feedback = el('div', { class: 'caption-feedback' }, [
        el('span', { class: 'caption-feedback__score', text: `+${option.score}` }),
        el('span', { class: 'caption-feedback__note', text: option.note }),
      ]);
      card.appendChild(feedback);

      timer = window.setTimeout(() => {
        timer = null;
        locked = false;
        roundIndex += 1;

        if (roundIndex >= CAPTION_ROUNDS.length) {
          const result = scoreCaptionChallenge(CAPTION_ROUNDS, answers);
          deps.onComplete(result.score);
          return;
        }

        drawRound();
      }, 700);
    };

    round.options.forEach((option, optionIndex) => {
      const node = el(
        'button',
        {
          type: 'button',
          class: 'caption-option',
          dataset: { key: String(optionIndex + 1) },
        },
        [
          el('span', { class: 'caption-option__key', text: String(optionIndex + 1) }),
          el('span', { class: 'caption-option__text', text: option.text }),
        ],
      );
      node.addEventListener('click', () => choose(optionIndex, node));
      options.appendChild(node);
    });

    const card = panel({
      title: t('minigame.caption.title'),
      subtitle: `${t('minigame.caption.round')} ${roundIndex + 1}/${CAPTION_ROUNDS.length}`,
      children: [
        el('p', { class: 'minigame-prompt', text: round.prompt }),
        options,
        el('p', { class: 'minigame-keyhint', text: t('minigame.keyHint') }),
      ],
    });

    root.replaceChildren(card);
  };

  window.addEventListener(
    'keydown',
    (event) => {
      if (locked || deps.signal.aborted) return;
      const index = Number(event.key);
      if (!Number.isInteger(index) || index < 1 || index > 4) return;
      event.preventDefault();
      const target = root.querySelector<HTMLButtonElement>(
        `.caption-option[data-key="${index}"]`,
      );
      target?.click();
    },
    { signal: deps.signal },
  );

  drawRound();
};
