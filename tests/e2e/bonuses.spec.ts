import { test, expect } from '@playwright/test';

test.describe('Bonuses Page & Analytics Data', () => {
  test('displays populated bonus metrics and interactive list', async ({ page }) => {
    await page.goto('/bonuses');
    await page.waitForLoadState('domcontentloaded');

    // Verify main page heading
    await expect(page.getByRole('heading', { name: 'Bonuses', exact: true })).toBeVisible();

    // Verify metric cards
    await expect(page.locator('text=Total Bonuses Issued')).toBeVisible();
    await expect(page.locator('text=Total Bonus Amount')).toBeVisible();
    await expect(page.locator('text=Total Free Spins')).toBeVisible();

    // Verify non-zero data
    const bonusesCount = page.locator('text=Total Bonuses Issued').locator('..').locator('..');
    await expect(bonusesCount).toContainText('10', { timeout: 10000 });

    // Switch to Bonus List tab
    const listTab = page.getByRole('tab', { name: 'Bonus List' });
    await expect(listTab).toBeVisible();
    await listTab.click();

    // Verify Refresh button and Search input
    const refreshBtn = page.getByRole('button', { name: 'Refresh' });
    await expect(refreshBtn).toBeVisible();
    const searchInput = page.getByPlaceholder('Search bonuses...');
    await expect(searchInput).toBeVisible();

    // Test search filter
    await searchInput.fill('Welcome');
    await expect(page.locator('text=Welcome Deposit Match 100%')).toBeVisible();
  });
});
