import { test, expect } from '@playwright/test';

test.describe('Register Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup'); // Navigate to the register page
  });

  test('Validation error for empty fields', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('Invalid email format', async ({ page }) => {
    await page.fill('input[placeholder="Full Name"]', 'Test User');
    await page.fill('input[placeholder="Email"]', 'invalid-email');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
  });

  test('Successful registration', async ({ page }) => {
    await page.fill('input[placeholder="Full Name"]', 'New User');
    await page.fill('input[placeholder="Email"]', 'newuser@example.com');
    await page.fill('input[placeholder="Password"]', 'newpassword123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
  });
});
