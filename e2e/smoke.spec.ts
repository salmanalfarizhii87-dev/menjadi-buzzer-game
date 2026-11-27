import { expect, test } from '@playwright/test';

test('title lalu home dan 5 tab tampil', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Lanjutkan Game').click();
  await expect(page.locator('.stitch-root')).toBeVisible();
  await expect(page.locator('nav a')).toHaveCount(5);
  await expect(page.locator('#hud-balance')).toBeVisible();
});

test('kampanye auto berhasil dengan roll terkunci', async ({ page }) => {
  await page.goto('/?debug=1&roll=0&seed=42');
  await page.getByText('Lanjutkan Game').click();
  await page.locator('nav a[aria-label="Kampanye"]').first().click();
  await page.locator('#panel-kontrak article.ref-card', { hasText: 'Soft Launch Gerai Baru' }).locator('a.ref-btn-green').click();
  await page.locator('main a.ref-btn-green').first().click();
  await expect(page.locator('.approach-btn')).toHaveCount(3);
  await page.locator('main a.ref-btn-green').first().click();
  await expect(page.locator('section[aria-label="Status hasil kampanye"] h2')).toHaveText('Kampanye Sukses!');
  await expect(page.locator('section[aria-label="Status hasil kampanye"]')).toBeVisible();
});

test('transaksi tampil di Keuangan', async ({ page }) => {
  await page.goto('/');
  await page.getByText('Lanjutkan Game').click();
  await page.locator('nav a[aria-label="Keuangan"]').first().click();
  await expect(page.locator('#tx-list')).toBeVisible();
  await expect(page.locator('.finance-filter, #tab-tx-all')).toHaveCount(1);
});
