import { test, expect } from '@playwright/test';

test.describe('Login Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login'); // Navigate to the login page
  });

  test('Should display validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
  });

  test('Should display invalid email error', async ({ page }) => {
    await page.fill('input[placeholder="Email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Enter a valid email address')).toBeVisible();
  });

  test('Successful login', async ({ page }) => {
    await page.fill('input[placeholder="Email"]', 'test@example.com');
    await page.fill('input[placeholder="Password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Login successful!')).toBeVisible();
  });
});
