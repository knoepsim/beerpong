# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: tournament-lifecycle.spec.ts >> Tournament Full Lifecycle >> should create, start and report match in a tournament
- Location: tests\tournament-lifecycle.spec.ts:6:7

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/app/tournaments/create
Call log:
  - navigating to "http://localhost:3000/app/tournaments/create", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { setupTestSession } from './utils/auth-helper';
  3  | 
  4  | test.describe('Tournament Full Lifecycle', () => {
  5  |   
  6  |   test('should create, start and report match in a tournament', async ({ page, context }) => {
  7  |     // 1. Auth Setup
  8  |     await setupTestSession(context);
  9  |     
  10 |     // 2. Turnier erstellen
> 11 |     await page.goto('/app/tournaments/create');
     |                ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000/app/tournaments/create
  12 |     const tournamentTitle = `Auto Test ${Date.now()}`;
  13 |     await page.fill('input[name="title"]', tournamentTitle);
  14 |     
  15 |     const futureDate = new Date();
  16 |     futureDate.setFullYear(futureDate.getFullYear() + 1);
  17 |     // Format YYYY-MM-DDTHH:mm für datetime-local
  18 |     const dateStr = futureDate.toISOString().slice(0, 16);
  19 |     await page.fill('input[type="datetime-local"]', dateStr);
  20 |     
  21 |     await page.fill('input[name="maxParticipants"]', '4');
  22 |     await page.fill('input[name="numTables"]', '2');
  23 |     
  24 |     // Warten auf Navigation nach Submit
  25 |     await Promise.all([
  26 |         page.waitForURL(/\/app\/tournaments\/[a-z0-9]+/, { timeout: 10000 }),
  27 |         page.click('button[type="submit"]')
  28 |     ]);
  29 |     
  30 |     // 3. Verifizieren
  31 |     await expect(page.locator('h1')).toContainText(tournamentTitle);
  32 |     
  33 |     const tournamentUrl = page.url();
  34 |     const tournamentId = tournamentUrl.split('/').pop()!;
  35 | 
  36 |     // 4. Erstes Team erstellen
  37 |     await page.click('button:has-text("Team erstellen")');
  38 |     await page.fill('input#name', 'Team Alpha');
  39 |     await page.click('button:has-text("Team beitreten")');
  40 |     await expect(page.getByText('Team Alpha')).toBeVisible();
  41 | 
  42 |     // 5. Ein zweites Team simulieren via DB
  43 |     const { prisma } = await import('@beerpong/db');
  44 |     await prisma.team.create({
  45 |         data: {
  46 |             name: 'Team Beta',
  47 |             tournamentId: tournamentId,
  48 |             isCheckedIn: false,
  49 |         }
  50 |     });
  51 |     
  52 |     await page.reload();
  53 |     await expect(page.getByText('Team Beta')).toBeVisible();
  54 | 
  55 |     // 6. Check-in durchführen
  56 |     await page.click('button:has-text("Einchecken"):near(:text("Team Alpha"))');
  57 |     await page.click('button:has-text("Einchecken"):near(:text("Team Beta"))');
  58 |     
  59 |     await expect(page.getByText('Checked-In')).toHaveCount(2);
  60 | 
  61 |     // 7. Turnier starten
  62 |     await page.click('button:has-text("Turnier starten")');
  63 |     
  64 |     // 8. Verifizieren dass Gruppenphase läuft
  65 |     await expect(page.getByText('GROUP_PHASE')).toBeVisible();
  66 |     
  67 |     // 9. Match aufrufen und Ergebnis melden
  68 |     await page.click('text=VS');
  69 |     await expect(page.locator('h1')).toContainText('Spielbericht');
  70 |     
  71 |     // Wir klicken alle 10 Becher von Team Blau (rechts)
  72 |     // Selektor präzisieren: Nur die blauen Becher
  73 |     const blueCups = page.locator('.bg-blue-500');
  74 |     for (let i = 0; i < 10; i++) {
  75 |         await blueCups.nth(0).click();
  76 |     }
  77 |     
  78 |     await expect(page.getByText('0 Becher übrig')).toBeVisible();
  79 |     await page.click('button:has-text("Ergebnis bestätigen")');
  80 |     
  81 |     // 10. Zurück und Tabelle prüfen
  82 |     await expect(page.getByText('Ergebnis erfolgreich gemeldet')).toBeVisible();
  83 |     await page.goto(`/app/tournaments/${tournamentId}`);
  84 |     
  85 |     // Team Alpha sollte 3 Punkte haben
  86 |     await expect(page.getByText('Team Alpha')).toBeVisible();
  87 |     const alphaRow = page.locator('tr:has-text("Team Alpha")');
  88 |     await expect(alphaRow.locator('td').last()).toHaveText('3');
  89 |   });
  90 | 
  91 | });
  92 | 
```