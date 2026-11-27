/**
 * Use case: posting manual dari handphone.
 *
 * Urutan (atomik):
 * 1. validasi input composer
 * 2. validasi cooldown
 * 3. hitung hasil (deterministik)
 * 4. terapkan money + followers + suspicion
 * 5. catat transaksi `posting_income` (bila > 0)
 * 6. set cooldown + counter
 * 7. evaluasi risk tier (mungkin memicu denda/shadowban)
 * 8. commit + persist segera
 */

import { err, ok, type ActionResult } from '@/core/result';
import { applyDelta } from '@/domain/finance/balance';
import { appendTransaction, descriptionKeyFor } from '@/domain/finance/ledger';
import { getCooldownState } from '@/domain/posting/cooldown';
import { validatePostInput, type PostInput } from '@/domain/posting/composer';
import { resolvePost, type PostResolution } from '@/domain/posting/resolve-post';
import { evaluateTier, type TierChange } from '@/application/risk/evaluate-tier';
import { selectPrimaryAccount, selectRiskMeter } from '@/state/selectors';
import type { BalanceConfig } from '@/data/config/balance';
import type { GameStore } from '@/state/game-store';
import type { SaveRepository } from '@/persistence/save-repository';
import type { Clock } from '@/core/clock';
import type { GameSave } from '@/state/types';

export interface PostOutcome {
  resolution: PostResolution;
  tierChange: TierChange;
  resolutionId: string;
  balanceAfter: number;
  suspicionAfter: number;
  followersAfter: number;
  cooldownUntil: number;
}

export interface CreatePostDeps {
  store: GameStore;
  config: BalanceConfig;
  repository: SaveRepository;
  clock: Clock;
  /** Guard in-flight untuk mencegah double-submit. */
  inFlight?: Set<string>;
}

export function createPost(deps: CreatePostDeps, input: PostInput): ActionResult<PostOutcome> {
  const { store, config, repository, clock } = deps;
  const inFlight = deps.inFlight ?? new Set<string>();
  const guardKey = 'create-post';

  if (inFlight.has(guardKey)) {
    return err('invalid_transition', 'error.invalid_transition', 'posting sedang diproses');
  }

  inFlight.add(guardKey);

  try {
    const now = clock.now();
    const state = store.getState();

    const validated = validatePostInput(input);
    if (!validated.ok) return validated;

    const cooldown = getCooldownState(state.social, config, now);
    if (cooldown.active) {
      return err(
        'invalid_transition',
        'posting.cooldownActive',
        `sisa cooldown ${Math.ceil(cooldown.remainingMs / 1000)} detik`,
      );
    }

    const account = selectPrimaryAccount(state);
    if (!account) return err('unknown', 'error.unknown', 'akun utama tidak ditemukan');

    const risk = selectRiskMeter(state, config);
    const shadowbanned =
      state.social.shadowbannedUntil !== null && now < state.social.shadowbannedUntil;

    const resolution = resolvePost(
      validated.value,
      {
        account,
        performanceReference: config.income.performanceReference,
        tierFollowersMultiplier: risk.tierConfig.postingFollowersMultiplier,
        shadowbanned,
      },
      config,
    );

    // --- Terapkan perubahan pada salinan state ---
    let next: GameSave = { ...state };

    if (resolution.moneyDelta > 0) {
      const applied = applyDelta(next, resolution.moneyDelta, { allowNegative: true });
      if (!applied.ok) return applied;
      next = applied.value.save;

      next = appendTransaction(next, {
        type: 'posting_income',
        amount: resolution.moneyDelta,
        sourceId: validated.value.app.id,
        descriptionKey: descriptionKeyFor('posting_income'),
        createdAt: now,
      });
    }

    const suspicionAfter = Math.min(
      config.posting.suspicionCap,
      Math.max(0, account.suspicion + resolution.suspicionDelta),
    );
    const followersAfter = Math.max(0, account.followers + resolution.followersDelta);

    next = {
      ...next,
      accounts: next.accounts.map((entry) =>
        entry.id === account.id
          ? { ...entry, suspicion: suspicionAfter, followers: followersAfter }
          : entry,
      ),
      social: {
        ...next.social,
        cooldownUntil: now + config.posting.cooldownMs,
        lastPostAt: now,
        postingCount: next.social.postingCount + 1,
      },
      meta: { ...next.meta, updatedAt: now },
    };

    // --- Risk tier ---
    const tierResult = evaluateTier(next, {
      config,
      now,
      sourceId: validated.value.app.id,
    });
    next = tierResult.save;

    store.setState(next);
    repository.saveNow(next);

    return ok({
      resolution,
      tierChange: tierResult.change,
      resolutionId: validated.value.app.id,
      balanceAfter: next.player.money,
      suspicionAfter: selectPrimaryAccount(next)?.suspicion ?? suspicionAfter,
      followersAfter: selectPrimaryAccount(next)?.followers ?? followersAfter,
      cooldownUntil: next.social.cooldownUntil ?? now,
    });
  } finally {
    inFlight.delete(guardKey);
  }
}

/** Ringkasan cooldown untuk UI. */
export function postingCooldown(
  state: GameSave,
  config: BalanceConfig,
  now: number,
): ReturnType<typeof getCooldownState> {
  return getCooldownState(state.social, config, now);
}
