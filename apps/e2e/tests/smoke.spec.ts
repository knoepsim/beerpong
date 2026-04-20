import { test, expect } from '@playwright/test';

test.describe('Beerpong Smoke Tests', () => {
  
  test('should load the landing page', async ({ page }) => {
    await page.goto('/');
    // Wir akzeptieren beide Schreibweisen
    await expect(page).toHaveTitle(/(Beerpong|Bierpong)/i);
  });

  test('should redirect to signin when accessing /app without session', async ({ page }) => {
    await page.goto('/app');
    // Next.js sollte uns zu /auth/signin umleiten
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/auth/signin');
    // Wir nutzen getByRole für Eindeutigkeit
    await expect(page.getByRole('heading', { name: /Anmelden/i })).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

});
