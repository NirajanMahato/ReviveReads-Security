import { test, expect } from '@playwright/test';

test.describe('Reset Password Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/reset-password/mock-token'); // Simulating a token in the URL
  });

  test('Should show validation errors for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Password is required')).toBeVisible();
    await expect(page.locator('text=Please confirm your password')).toBeVisible();
  });

  test('Should show mismatch error for different passwords', async ({ page }) => {
    await page.fill('input[placeholder="New Password"]', 'password123');
    await page.fill('input[placeholder="Confirm New Password"]', 'password321');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Passwords must match')).toBeVisible();
  });

  test('Should successfully reset password', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/user/reset-password', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ success: true }),
      });
    });

    await page.fill('input[placeholder="New Password"]', 'password123');
    await page.fill('input[placeholder="Confirm New Password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Password Reset Successful!')).toBeVisible();
  });
});
