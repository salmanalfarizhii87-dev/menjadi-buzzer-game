import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BALANCE } from '@/data/config/balance';
import { createFakeClock } from '@/core/clock';
import { createInitialSave } from '@/state/initial-state';
import { createGameStore } from '@/state/game-store';
import { createSaveRepository } from '@/persistence/save-repository';
import { createGameActions } from '@/state/actions';
import { SOCIAL_APPS } from '@/data/social/apps';
import { CAPTION_OPTIONS } from '@/data/social/composer-options';
import { installMemoryStorage, uninstallMemoryStorage } from '@/tests/helpers';
import type { TransactionType } from '@/state/types';

const START = 1_700_000_000_000;
let clock: ReturnType<typeof createFakeClock>;

beforeEach(() => {
  installMemoryStorage();
  clock = createFakeClock(START);
});

afterEach(() => {
  uninstallMemoryStorage();
});

describe('satu siklus penuh', () => {
  it('income → upgrade → posting → kampanye → shop → travel → saham', () => {
    const base = createInitialSave(BALANCE, START);
    const store = createGameStore({
      initialState: { ...base, player: { ...base.player, money: 5000 } },
    });
    const repository = createSaveRepository({ now: () => clock.now(), debounceMs: 0 });
    const actions = createGameActions({
      store,
      config: BALANCE,
      repository,
      clock,
      random: () => 0,
    });

    // 1. Income + upgrade.
    clock.advance(60_000);
    expect(actions.accrueIncome().ok).toBe(true);
    expect(actions.flushPendingIncome().ok).toBe(true);
    expect(actions.purchaseAutomationUpgrade().ok).toBe(true);
    expect(store.getState().accounts[0]!.automationLevel).toBe(1);

    // 2. Posting manual.
    const chirper = SOCIAL_APPS.find((app) => app.id === 'chirper')!;
    const caption = CAPTION_OPTIONS.find((option) => option.tone === chirper.preferredTone)!;
    const post = actions.createPost({
      appId: 'chirper',
      captionId: caption.id,
      hashtagId: 'tag-chill',
      timingId: 'quiet',
    });
    expect(post.ok).toBe(true);

    // 3. Kampanye auto: accept → strategi → resolve.
    const accepted = actions.acceptCampaign('cmp_launch_soft');
    expect(accepted.ok).toBe(true);
    if (!accepted.ok) return;

    const strategy = actions.selectCampaignStrategy({
      sessionId: accepted.value.session.id,
      approachId: 'informative',
      intensityId: 'normal',
      postureId: 'balanced',
    });
    expect(strategy.ok).toBe(true);

    const resolved = actions.resolveCampaign(accepted.value.session.id);
    expect(resolved.ok).toBe(true);
    if (!resolved.ok) return;
    expect(resolved.value.snapshot.outcome).toBe('success');

    // 4. Shop: beli + pasang outfit.
    expect(actions.buyShopItem('outfit-casual').ok).toBe(true);
    expect(actions.equipOutfit('outfit-casual').ok).toBe(true);

    // 5. Tiket + terbang.
    expect(actions.buyShopItem('ticket-belanda').ok).toBe(true);
    expect(actions.flyTo('belanda').ok).toBe(true);

    // 6. Saham: beli → tick → jual.
    expect(actions.tradeStock({ ticker: 'KOPI', shares: 2, side: 'buy' }).ok).toBe(true);
    clock.advance(BALANCE.stocks.tickMs);
    expect(actions.tickMarket().ok).toBe(true);
    expect(actions.tradeStock({ ticker: 'KOPI', shares: 2, side: 'sell' }).ok).toBe(true);

    const save = store.getState();
    expect(Number.isInteger(save.player.money)).toBe(true);
    expect(save.character.locationCountryId).toBe('belanda');
    expect(save.character.visitedCountryIds).toContain('belanda');
    expect(save.inventory.equippedOutfitId).toBe('outfit-casual');
    expect(save.stocks.holdings).toHaveLength(0);
    expect(save.campaignSessions[0]!.status).toBe('resolved');

    const types = new Set(save.transactions.map((transaction) => transaction.type));
    const expectedTypes: TransactionType[] = [
      'passive_income',
      'upgrade_purchase',
      'posting_income',
      'campaign_payment',
      'shop_purchase',
      'travel_cost',
      'stock_buy',
      'stock_sell',
    ];
    for (const expected of expectedTypes) {
      expect(types.has(expected)).toBe(true);
    }
  });
});
