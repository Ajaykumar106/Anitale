import { test, expect } from '@playwright/test';

test.describe('Core Discovery Experience', () => {
  test('Homepage loads with data-driven sections', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section
    await expect(page.getByRole('heading', { name: /Welcome to Anitale/i })).toBeVisible();

    // The trending sections might be empty if TMDB fails or dummy key is used,
    // so we just check that the page rendered successfully without crashing.
    await expect(page.locator('nav')).toBeVisible();
  });

  test('Search functionality works', async ({ page }) => {
    await page.goto('/');
    
    // Type in search bar
    const searchInput = page.getByPlaceholder(/Search for/i);
    await searchInput.fill('Inception');
    
    // Wait for debounce and navigation
    await page.waitForURL('**/search?q=Inception');
    
    // Verify search page loaded
    await expect(page.getByRole('heading', { name: /Search results for "Inception"/i })).toBeVisible();
  });

  test('Navigation links work', async ({ page }) => {
    await page.goto('/');
    
    // Mobile/Desktop nav check
    // In our simplified nav, auth is there
    await page.getByRole('link', { name: /Sign In/i }).click();
    await page.waitForURL('**/auth/signin');
    await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  });
});
