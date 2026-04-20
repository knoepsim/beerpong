import { test, expect } from '@playwright/test';
import { setupTestSession } from './utils/auth-helper';

test.describe('Tournament Full Lifecycle', () => {
  
  test('should create, start and report match in a tournament', async ({ page, context }) => {
    // 1. Auth Setup
    await setupTestSession(context);
    
    // 2. Turnier erstellen
    await page.goto('/app/tournaments/create');
    const tournamentTitle = `Auto Test ${Date.now()}`;
    await page.fill('input[name="title"]', tournamentTitle);
    
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    // Format YYYY-MM-DDTHH:mm für datetime-local
    const dateStr = futureDate.toISOString().slice(0, 16);
    await page.fill('input[type="datetime-local"]', dateStr);
    
    await page.fill('input[name="maxParticipants"]', '4');
    await page.fill('input[name="numTables"]', '2');
    
    // Warten auf Navigation nach Submit
    await Promise.all([
        page.waitForURL(/\/app\/tournaments\/[a-z0-9]+/, { timeout: 10000 }),
        page.click('button[type="submit"]')
    ]);
    
    // 3. Verifizieren
    await expect(page.locator('h1')).toContainText(tournamentTitle);
    
    const tournamentUrl = page.url();
    const tournamentId = tournamentUrl.split('/').pop()!;

    // 4. Erstes Team erstellen
    await page.click('button:has-text("Team erstellen")');
    await page.fill('input#name', 'Team Alpha');
    await page.click('button:has-text("Team beitreten")');
    await expect(page.getByText('Team Alpha')).toBeVisible();

    // 5. Ein zweites Team simulieren via DB
    const { prisma } = await import('@beerpong/db');
    await prisma.team.create({
        data: {
            name: 'Team Beta',
            tournamentId: tournamentId,
            isCheckedIn: false,
        }
    });
    
    await page.reload();
    await expect(page.getByText('Team Beta')).toBeVisible();

    // 6. Check-in durchführen
    await page.click('button:has-text("Einchecken"):near(:text("Team Alpha"))');
    await page.click('button:has-text("Einchecken"):near(:text("Team Beta"))');
    
    await expect(page.getByText('Checked-In')).toHaveCount(2);

    // 7. Turnier starten
    await page.click('button:has-text("Turnier starten")');
    
    // 8. Verifizieren dass Gruppenphase läuft
    await expect(page.getByText('GROUP_PHASE')).toBeVisible();
    
    // 9. Match aufrufen und Ergebnis melden
    await page.click('text=VS');
    await expect(page.locator('h1')).toContainText('Spielbericht');
    
    // Wir klicken alle 10 Becher von Team Blau (rechts)
    // Selektor präzisieren: Nur die blauen Becher
    const blueCups = page.locator('.bg-blue-500');
    for (let i = 0; i < 10; i++) {
        await blueCups.nth(0).click();
    }
    
    await expect(page.getByText('0 Becher übrig')).toBeVisible();
    await page.click('button:has-text("Ergebnis bestätigen")');
    
    // 10. Zurück und Tabelle prüfen
    await expect(page.getByText('Ergebnis erfolgreich gemeldet')).toBeVisible();
    await page.goto(`/app/tournaments/${tournamentId}`);
    
    // Team Alpha sollte 3 Punkte haben
    await expect(page.getByText('Team Alpha')).toBeVisible();
    const alphaRow = page.locator('tr:has-text("Team Alpha")');
    await expect(alphaRow.locator('td').last()).toHaveText('3');
  });

});
