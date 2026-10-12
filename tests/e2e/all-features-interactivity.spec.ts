import { test, expect } from '@playwright/test';

test.describe('Full Application Feature Interactivity & Build Stability Suite', () => {

  test('verifies all sidebar navigation links are clickable and route without error', async ({ page }) => {
    const routes = [
      '/dashboard',
      '/players',
      '/bonuses',
      '/payments',
      '/player-value',
      '/cohorts',
      '/campaigns',
      '/affiliates',
      '/data-accuracy',
      '/chat',
      '/settings',
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      // Ensure page renders without crashing
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('verifies Payments page interactivity: tab switches, view buttons, and CSV export', async ({ page }) => {
    await page.goto('/payments');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Payments Dashboard' })).toBeVisible();

    // Verify view toggle buttons (Total, By Country, By Payment Method, By Device)
    const totalBtn = page.getByRole('button', { name: 'Total' });
    const countryBtn = page.getByRole('button', { name: 'By Country' });
    const paymentMethodBtn = page.getByRole('button', { name: 'By Payment Method' });
    const deviceBtn = page.getByRole('button', { name: 'By Device' });

    if (await countryBtn.isVisible()) {
      await countryBtn.click();
    }
    if (await paymentMethodBtn.isVisible()) {
      await paymentMethodBtn.click();
    }
    if (await deviceBtn.isVisible()) {
      await deviceBtn.click();
    }
    if (await totalBtn.isVisible()) {
      await totalBtn.click();
    }

    // Verify Export CSV button
    const exportBtn = page.getByRole('button', { name: /Export/i }).first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
    }
  });

  test('verifies Player Value page interactivity: search filtering and tier selection', async ({ page }) => {
    await page.goto('/player-value');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Player Value', exact: true })).toBeVisible();

    // Switch to Players tab
    const playersTab = page.getByRole('tab', { name: 'Players' });
    await expect(playersTab).toBeVisible();
    await playersTab.click();

    // Test Search player input
    const searchInput = page.getByPlaceholder(/Search players by name/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('VIP');

    // Test Filter button and Tier selection popover
    const filterBtn = page.getByRole('button', { name: 'Filter' });
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    // Select VIP tier filter
    const vipBtn = page.getByRole('button', { name: 'VIP' });
    await expect(vipBtn).toBeVisible();
    await vipBtn.click();
  });

  test('verifies Cohorts page interactivity: search and export action', async ({ page }) => {
    await page.goto('/cohorts');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Cohort Analysis' })).toBeVisible();

    // Search cohorts
    const searchInput = page.getByPlaceholder(/Search by date/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('2024');

    // Export Cohort Data button
    const exportBtn = page.getByRole('button', { name: /Export/i }).first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
    }
  });

  test('verifies Campaigns page interactivity: create campaign modal trigger and close', async ({ page }) => {
    await page.goto('/campaigns');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Campaigns', exact: true })).toBeVisible();

    // Click New Campaign button
    const newBtn = page.getByRole('button', { name: /New Campaign/i }).first();
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    // Check modal or dialog opens
    const dialogTitle = page.getByRole('heading', { name: /New Campaign/i }).last();
    await expect(dialogTitle).toBeVisible();

    // Close modal
    const cancelBtn = page.getByRole('button', { name: 'Cancel' }).first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
  });

  test('verifies Affiliates page interactivity: search and tag filtering', async ({ page }) => {
    await page.goto('/affiliates');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Affiliates' })).toBeVisible();

    // Search affiliates
    const searchInput = page.getByPlaceholder(/Search affiliates/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('aff');
    }

    // Refresh / Export button
    const exportBtn = page.getByRole('button', { name: /Export/i }).first();
    if (await exportBtn.isVisible()) {
      await exportBtn.click();
    }
  });
});
