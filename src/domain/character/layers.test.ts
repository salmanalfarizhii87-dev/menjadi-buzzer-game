import { describe, expect, it } from 'vitest';
import { getDefaultOutfit, OUTFITS } from '@/data/shop/outfits';
import { resolveCharacterLayers, resolveEquippedOutfit } from './layers';

describe('resolveCharacterLayers', () => {
  it('menghasilkan layer dasar untuk outfit apa pun', () => {
    const layers = resolveCharacterLayers('outfit-basic');
    const layerNames = layers.map((layer) => layer.layer);

    expect(layerNames).toContain('base');
    expect(layerNames).toContain('shoes');
    expect(layerNames).toContain('outfit');
    expect(layerNames).toContain('hair');
  });

  it('mengurutkan layer berdasarkan zIndex naik', () => {
    const layers = resolveCharacterLayers('outfit-formal');
    const zIndexes = layers.map((layer) => layer.zIndex);
    const sorted = [...zIndexes].sort((a, b) => a - b);
    expect(zIndexes).toEqual(sorted);
  });

  it('memakai artId outfit yang diminta', () => {
    const layers = resolveCharacterLayers('outfit-luxury');
    const outfitLayer = layers.find((layer) => layer.layer === 'outfit');
    expect(outfitLayer?.artId).toBe('outfit-luxury');
    expect(outfitLayer?.outfitId).toBe('outfit-luxury');
  });

  it('jatuh ke outfit default bila ID tidak dikenal', () => {
    const layers = resolveCharacterLayers('outfit-tidak-ada');
    const outfitLayer = layers.find((layer) => layer.layer === 'outfit');
    expect(outfitLayer?.outfitId).toBe(getDefaultOutfit().id);
  });

  it('menambahkan aksesori di depan', () => {
    const withAccessory = resolveCharacterLayers('outfit-basic', ['acc-glasses']);
    const accessory = withAccessory.find((layer) => layer.layer === 'accessory');
    const outfit = withAccessory.find((layer) => layer.layer === 'outfit');

    expect(accessory).toBeDefined();
    expect(accessory!.zIndex).toBeGreaterThan(outfit!.zIndex);
  });

  it('beberapa aksesori tetap terurut', () => {
    const layers = resolveCharacterLayers('outfit-basic', ['acc-a', 'acc-b', 'acc-c']);
    const accessories = layers.filter((layer) => layer.layer === 'accessory');
    expect(accessories).toHaveLength(3);

    const zIndexes = accessories.map((layer) => layer.zIndex);
    expect(zIndexes).toEqual([...zIndexes].sort((a, b) => a - b));
  });
});

describe('resolveEquippedOutfit', () => {
  it('mengembalikan outfit yang cocok', () => {
    const outfit = resolveEquippedOutfit('outfit-casual');
    expect(outfit.id).toBe('outfit-casual');
  });

  it('jatuh ke default bila tidak dikenal', () => {
    const outfit = resolveEquippedOutfit('tidak-ada');
    expect(outfit.id).toBe(getDefaultOutfit().id);
  });
});

describe('katalog outfit', () => {
  it('punya minimal 4 outfit dengan ID unik', () => {
    expect(OUTFITS.length).toBeGreaterThanOrEqual(4);
    const ids = OUTFITS.map((outfit) => outfit.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('outfit default gratis dan exempt penyitaan', () => {
    const basic = OUTFITS.find((outfit) => outfit.id === 'outfit-basic');
    expect(basic).toBeDefined();
    expect(basic!.price).toBe(0);
    expect(basic!.seizureExempt).toBe(true);
  });

  it('outfit berbayar punya harga positif', () => {
    const paid = OUTFITS.filter((outfit) => outfit.id !== 'outfit-basic');
    for (const outfit of paid) {
      expect(outfit.price).toBeGreaterThan(0);
    }
  });
});
