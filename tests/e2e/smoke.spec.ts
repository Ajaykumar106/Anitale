import { test, expect } from '@playwright/test';

test.describe('Production Smoke Tests', () => {
  test('Homepage loads correctly', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');
    
    // Expect a title "Anitale"
    await expect(page).toHaveTitle(/Anitale/);
    
    // Expect main branding to be visible
    const branding = page.locator('text=Anitale').first();
    await expect(branding).toBeVisible();
  });

  test('Health check endpoint returns 200 OK', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.database).toBe('connected');
  });
  
  test('Search functionality works', async ({ page }) => {
    await page.goto('/search');
    
    // Check if the search input exists
    const searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    await expect(searchInput.first()).toBeVisible();
  });
});
