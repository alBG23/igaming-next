import { test, expect } from '@playwright/test';

test.describe('Bonuses Page & Analytics Data', () => {
  test('displays API-backed metrics and filters the bonus list', async ({ page }) => {
    const now = new Date()
    await page.route('**/api/bonuses**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        data: [{
          id: 'e2e-bonus',
          created_at: now.toISOString(),
          account_id: '9001',
          title: 'E2E Bonus Offer',
          status: 'active',
          amount_cents: 12500,
          amount_wager_cents: 25000,
          amount_locked_cents: 0,
          valid_until: new Date(now.getTime() + 7 * 86400000).toISOString(),
          activated_at: now.toISOString(),
          finished_at: null,
          strategy: 'test',
          type: 'bonus',
        }],
        count: 1,
        metrics: {
          totalBonusesIssued: 1,
          totalBonusAmount: 12500,
          totalFreespinsIssued: 0,
          totalFreespinsWinAmount: 0,
          activeWageringAmount: 25000,
          completionRate: 0,
        },
      },
    }));
    await page.goto('/bonuses', { waitUntil: 'domcontentloaded' });

    // Verify main page heading
    await expect(page.getByRole('heading', { name: 'Bonuses', exact: true })).toBeVisible();

    // Verify metric cards
    await expect(page.locator('text=Total Bonuses Issued')).toBeVisible();
    await expect(page.locator('text=Total Bonus Amount')).toBeVisible();
    await expect(page.locator('text=Total Free Spins')).toBeVisible();
    await expect(page.getByText('€125.00')).toBeVisible();

    // Switch to Bonus List tab
    const listTab = page.getByRole('tab', { name: 'Bonus List' });
    await expect(listTab).toBeVisible();
    await listTab.click();

    // Verify Refresh button and Search input
    const refreshBtn = page.getByRole('button', { name: 'Refresh' });
    await expect(refreshBtn).toBeVisible();
    const searchInput = page.getByPlaceholder('Search bonuses...');
    await expect(searchInput).toBeVisible();

    // Test search filter against the deterministic API response
    await searchInput.fill('E2E Bonus');
    await expect(page.getByText('E2E Bonus Offer')).toBeVisible();
    await searchInput.fill('missing');
    await expect(page.getByText('No bonus records match this search.')).toBeVisible();
  });
});
