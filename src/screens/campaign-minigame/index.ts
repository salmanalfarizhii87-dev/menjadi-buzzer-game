/**
 * Screen: Mini-game (Stitch) — Caption Challenge & Engagement Boost.
 */

import type { ScreenContext, ScreenModule, ScreenParams } from '@/app/lifecycle';
import captionTemplate from '@/templates/stitch/caption_challenge.html?raw';
import engagementTemplate from '@/templates/stitch/engagement_challenge.html?raw';
import { CAPTION_ROUNDS } from '@/data/minigames/caption-challenge';
import { scoreCaptionChallenge } from '@/domain/minigames/caption-challenge';
import {
  createEngagementChallenge,
  scoreEngagementAttempt,
  scoreEngagementChallenge,
} from '@/domain/minigames/engagement-challenge';
import { findCampaign } from '@/data/campaigns/seed';
import { $, bindRouteLinks, stitchRoot } from '@/ui/stitch';
import { selectSessionById } from '@/state/selectors';
import type { CampaignSession } from '@/state/types';

const ROUND_SECONDS = 20;

function mountCaption(root: HTMLElement, ctx: ScreenContext, session: CampaignSession): void {
  const screen = stitchRoot(captionTemplate);
  bindRouteLinks(screen, ctx);

  const source = $<HTMLButtonElement>(screen, '.caption-opt');
  const optionsHost = source.parentElement as HTMLElement;
  const submit = $<HTMLButtonElement>(screen, '#submit-btn');
  const submitLabel = $<HTMLElement>(screen, '#submit-label');
  const timerText = $<HTMLElement>(screen, '#timer-text');
  const timerBar = $<HTMLElement>(screen, '#timer-bar');
  const prompt = $<HTMLElement>(screen, 'section[aria-label="Instruksi mini-game"] p');
  const badge = $<HTMLElement>(screen, 'section[aria-label="Instruksi mini-game"] span.bg-btn-yellow');

  const definition = findCampaign(session.campaignDefinitionId);
  let roundIndex = 0;
  let selected: number | null = null;
  const answers: number[] = [];
  let remaining = ROUND_SECONDS;
  let timer: number | null = null;

  const clearTimer = (): void => {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  };

  const finish = (): void => {
    clearTimer();
    const result = scoreCaptionChallenge(CAPTION_ROUNDS, answers);
    const saved = ctx.actions.completeMiniGame({ sessionId: session.id, score: result.score });
    if (!saved.ok) {
      ctx.toasts.error('Skor gagal disimpan.');
    }
    ctx.navigate('campaign-result', { sessionId: session.id });
  };

  const advance = (): void => {
    answers.push(selected ?? 3);
    selected = null;
    roundIndex += 1;
    if (roundIndex >= CAPTION_ROUNDS.length) {
      finish();
      return;
    }
    drawRound();
  };

  const drawRound = (): void => {
    const round = CAPTION_ROUNDS[roundIndex];
    if (!round) return;
    remaining = ROUND_SECONDS;
    selected = null;
    submit.disabled = true;
    submit.className = 'ref-btn-disabled w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-gutter-md rounded-xl text-ink-dark cursor-not-allowed mt-auto';
    submitLabel.textContent = 'Pilih 1 Caption Dulu';
    prompt.textContent = `Ronde ${roundIndex + 1}/${CAPTION_ROUNDS.length}: ${round.prompt}`;
    badge.textContent = definition ? `#${definition.campaignName}` : 'Kampanye';
    const subtitle = screen.querySelector<HTMLElement>('header .font-mono');
    if (subtitle) subtitle.textContent = `Mini-Game • Ronde ${roundIndex + 1}/${CAPTION_ROUNDS.length}`;

    optionsHost.replaceChildren();
    round.options.slice(0, 3).forEach((option, index) => {
      const button = source.cloneNode(true) as HTMLButtonElement;
      button.className = 'caption-opt ref-choice-idle rounded-xl p-gutter-md text-left flex items-start gap-gutter-sm cursor-pointer';
      button.querySelector<HTMLElement>('span')!.textContent = ['A', 'B', 'C'][index] ?? 'D';
      button.querySelector<HTMLElement>('p')!.textContent = `"${option.text}"`;
      button.addEventListener('click', () => {
        selected = index;
        for (const node of optionsHost.querySelectorAll('.caption-opt')) {
          node.className = 'caption-opt ref-choice-idle rounded-xl p-gutter-md text-left flex items-start gap-gutter-sm cursor-pointer';
        }
        button.className = 'caption-opt ref-choice-active rounded-xl p-gutter-md text-left flex items-start gap-gutter-sm cursor-pointer';
        submit.disabled = false;
        submit.className = 'ref-btn-green w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-gutter-md rounded-xl mt-auto';
        submitLabel.textContent = 'Kirim Caption';
      });
      optionsHost.appendChild(button);
    });

    clearTimer();
    const tick = (): void => {
      remaining = Math.max(0, remaining - 0.25);
      timerText.textContent = `${Math.ceil(remaining)} dtk`;
      timerBar.style.width = `${(remaining / ROUND_SECONDS) * 100}%`;
      if (remaining <= 0) {
        clearTimer();
        advance();
      }
    };
    timer = window.setInterval(tick, 250);
    tick();
  };

  submit.addEventListener('click', () => {
    clearTimer();
    advance();
  });

  drawRound();
  root.replaceChildren(screen);
  ctx.signal.addEventListener('abort', clearTimer, { once: true });
}

function mountEngagement(root: HTMLElement, ctx: ScreenContext, session: CampaignSession): void {
  const screen = stitchRoot(engagementTemplate);
  bindRouteLinks(screen, ctx);

  const setup = createEngagementChallenge(
    session.miniGameSeed,
    ctx.config.miniGames.engagementTargetWidth,
    ctx.config.miniGames.engagementAttempts,
  );
  const positions: number[] = [];
  let current = 0;
  let finished = false;
  let frame = 0;

  const gauge = $<HTMLElement>(screen, '.ref-gauge-track');
  const needle = $<HTMLElement>(screen, '#timing-needle');
  const scoreNode = $<HTMLElement>(screen, '#eng-score');
  const badge = $<HTMLElement>(screen, '#hit-badge');
  const counter = $<HTMLElement>(screen, '#tap-counter');
  const boost = $<HTMLButtonElement>(screen, '#boost-btn');
  const resultCta = $<HTMLAnchorElement>(screen, '#result-cta');
  const slots = [$<HTMLElement>(screen, '#slot-1'), $<HTMLElement>(screen, '#slot-2'), $<HTMLElement>(screen, '#slot-3')];

  const zone = document.createElement('div');
  zone.className = 'absolute inset-y-0 bg-success/60 border-x-2 border-white';
  zone.style.left = `${(setup.targetCenter - setup.targetWidth / 2) * 100}%`;
  zone.style.width = `${setup.targetWidth * 100}%`;
  gauge.prepend(zone);

  counter.textContent = `0 / ${setup.attempts}`;
  slots.forEach((slot, index) => {
    if (index >= setup.attempts) slot.hidden = true;
  });

  const updateScore = (): void => {
    if (positions.length === 0) return;
    const total = positions.reduce((sum, position) => sum + scoreEngagementAttempt(setup, position), 0);
    scoreNode.textContent = `${Math.round(total / positions.length)} / 100`;
  };

  const hit = (): void => {
    if (finished) return;
    positions.push(current);
    const index = positions.length - 1;
    const value = scoreEngagementAttempt(setup, current);
    const slot = slots[index];
    if (slot) {
      slot.textContent = `${Math.round(current * 100)}% → ${value}`;
      slot.className = `bg-dock-bg border-2 ${value >= 75 ? 'border-success text-success' : value >= 40 ? 'border-warning text-warning' : 'border-btn-red text-btn-red-dark'} rounded-xl p-gutter-sm text-center font-headline text-label-sm`;
    }
    badge.textContent = value >= 75 ? 'Perfect!' : value >= 40 ? 'Lumayan!' : 'Meleset';
    counter.textContent = `${positions.length} / ${setup.attempts}`;
    updateScore();
    if (positions.length >= setup.attempts) {
      finished = true;
      window.cancelAnimationFrame(frame);
      boost.disabled = true;
      boost.className = 'ref-btn-disabled w-full py-gutter-lg px-gutter-lg rounded-xl flex items-center justify-center gap-gutter-sm cursor-not-allowed';
      const result = scoreEngagementChallenge(setup, positions);
      const saved = ctx.actions.completeMiniGame({ sessionId: session.id, score: result.score });
      if (!saved.ok) ctx.toasts.error('Skor gagal disimpan.');
      resultCta.classList.remove('hidden');
    }
  };

  const tick = (now: number): void => {
    if (finished || ctx.signal.aborted) return;
    const period = 1800;
    const phase = (now % period) / period;
    current = phase <= 0.5 ? phase * 2 : 2 - phase * 2;
    needle.style.left = `${(current * 100).toFixed(2)}%`;
    frame = window.requestAnimationFrame(tick);
  };

  boost.addEventListener('click', hit);
  window.addEventListener(
    'keydown',
    (event) => {
      if (event.key === ' ' || event.key === 'Enter') {
        if (event.target instanceof HTMLButtonElement) return;
        event.preventDefault();
        hit();
      }
    },
    { signal: ctx.signal },
  );

  resultCta.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    ctx.navigate('campaign-result', { sessionId: session.id });
  }, { capture: true });

  root.replaceChildren(screen);
  frame = window.requestAnimationFrame(tick);
  ctx.signal.addEventListener('abort', () => window.cancelAnimationFrame(frame), { once: true });
}

function mount(root: HTMLElement, ctx: ScreenContext, params: ScreenParams): void {
  const state = ctx.store.getState();
  const session = selectSessionById(state, params['sessionId'] ?? '');

  if (!session) {
    ctx.toasts.error('Session kampanye tidak ditemukan.');
    ctx.navigate('task');
    return;
  }

  if (session.status === 'activity_completed' || session.miniGameScore !== null) {
    ctx.navigate('campaign-result', { sessionId: session.id });
    return;
  }

  if (session.miniGameId === 'caption-challenge') {
    mountCaption(root, ctx, session);
    return;
  }
  if (session.miniGameId === 'engagement-challenge') {
    mountEngagement(root, ctx, session);
    return;
  }

  ctx.toasts.error('Jenis aktivitas tidak dikenali.');
  ctx.navigate('task');
}

const screenModule: ScreenModule = { id: 'campaign-minigame', mount };
export default screenModule;
