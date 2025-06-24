import { test, expect } from '@playwright/test';

test.describe('Forgot Password Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/forgot-password'); // Navigate to the Forgot Password page
  });

  test('Should display validation error for empty email', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
  });

  test('Should display error for invalid email format', async ({ page }) => {
    await page.fill('input[placeholder="Email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
  });

  test('Should successfully send reset instructions', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/user/forgot-password', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('input[placeholder="Email"]', 'user@example.com');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Check Your Email')).toBeVisible();
  });
});
