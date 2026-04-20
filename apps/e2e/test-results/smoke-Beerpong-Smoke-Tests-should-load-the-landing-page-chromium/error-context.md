# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> Beerpong Smoke Tests >> should load the landing page
- Location: tests\smoke.spec.ts:5:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
Call log:
  - navigating to "http://localhost:3000/", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Beerpong Smoke Tests', () => {
  4  |   
  5  |   test('should load the landing page', async ({ page }) => {
> 6  |     await page.goto('/');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/
  7  |     // Wir akzeptieren beide Schreibweisen
  8  |     await expect(page).toHaveTitle(/(Beerpong|Bierpong)/i);
  9  |   });
  10 | 
  11 |   test('should redirect to signin when accessing /app without session', async ({ page }) => {
  12 |     await page.goto('/app');
  13 |     // Next.js sollte uns zu /auth/signin umleiten
  14 |     await expect(page).toHaveURL(/\/auth\/signin/);
  15 |   });
  16 | 
  17 |   test('should show login form', async ({ page }) => {
  18 |     await page.goto('/auth/signin');
  19 |     // Wir nutzen getByRole für Eindeutigkeit
  20 |     await expect(page.getByRole('heading', { name: /Anmelden/i })).toBeVisible();
  21 |     await expect(page.locator('input[type="email"]')).toBeVisible();
  22 |   });
  23 | 
  24 | });
  25 | 
```