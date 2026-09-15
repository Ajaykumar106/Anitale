import { test, expect } from '@playwright/test';

test.describe('Production Readiness & Regression (Phase 7)', () => {
  test('Home page renders correctly on repeat visit (cached)', async ({ page }) => {
    // First visit
    await page.goto('/');
    await expect(page.locator('h1', { hasText: 'Trending Now' })).toBeVisible();

    // Repeat visit
    await page.reload();
    await expect(page.locator('h1', { hasText: 'Trending Now' })).toBeVisible();
  });

  test('404 Page gracefully handles invalid URLs', async ({ page }) => {
    const res = await page.goto('/this-page-definitely-does-not-exist-12345');
    
    // Assert status is 404
    expect(res?.status()).toBe(404);
    
    // Assert 404 UI renders
    await expect(page.locator('h1', { hasText: '404' })).toBeVisible();
    await expect(page.locator('h2', { hasText: 'Page Not Found' })).toBeVisible();
    await expect(page.locator('a', { hasText: 'Return to Home' })).toBeVisible();
  });

  test('Search handles empty inputs properly', async ({ page }) => {
    await page.goto('/search');
    
    const input = page.locator('input[placeholder*="Search"]');
    await input.fill('');
    await page.waitForTimeout(500); // debounce
    
    // UI should show some initial state or empty message, not crash
    await expect(page.locator('text=Search for movies, TV shows, and anime')).toBeVisible();
  });

  test('Layout is responsive on mobile viewport', async ({ page }) => {
    // Emulate Mobile Safari
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    
    // Ensure navbar doesn't overflow horizontally
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375);
  });
});
