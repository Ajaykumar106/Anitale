import { test, expect } from '@playwright/test';

test.describe('Community & Moderation UI', () => {
  test('ReviewForm renders on Media Detail page', async ({ page }) => {
    // We can't easily mock auth in this simple test without extra setup,
    // but we can check if the form elements exist on a media page
    await page.goto('/movie/mock-movie-id-123');
    
    // Check if review section exists
    await expect(page.locator('h3', { hasText: 'Write a Review' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Post Review' })).toBeVisible();
  });

  test('Admin Moderation Queue redirects if not logged in', async ({ page }) => {
    await page.goto('/admin/moderation');
    
    // NextAuth middleware should intercept
    await expect(page).toHaveURL(/.*\/login.*/);
  });
});
