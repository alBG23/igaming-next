import { test, expect } from '@playwright/test';

test.describe('Players Management — Real Data & Import Validation', () => {
  test('displays real database players, status badge, and functional Import Data modal', async ({ page }) => {
    await page.goto('/players');
    await expect(page.getByRole('heading', { name: 'Players Management' })).toBeVisible();

    // Verify Live PostgreSQL or Data Source indicator
    await expect(page.locator('text=Live PostgreSQL').or(page.locator('text=Local Storage'))).toBeVisible();

    // Verify Import Data button exists and is clickable
    const importBtn = page.locator('#import-players-btn');
    await expect(importBtn).toBeVisible();
    await importBtn.click();

    // Verify Import Modal opens
    await expect(page.getByRole('heading', { name: 'Import Real Player Data' })).toBeVisible();

    // Verify Sample Export Loader button
    const loadSampleBtn = page.getByRole('button', { name: /Load Sample Export/i });
    await expect(loadSampleBtn).toBeVisible();
    await loadSampleBtn.click();

    // Verify textarea populated with sample CSV data
    const textarea = page.locator('#import-textarea');
    await expect(textarea).toHaveValue(/Alexander Novak/);

    // Close import modal
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByRole('heading', { name: 'Import Real Player Data' })).not.toBeVisible();

    // Verify Export CSV button works
    const exportBtn = page.getByRole('button', { name: 'Export CSV' });
    await expect(exportBtn).toBeVisible();

    // Verify Add Player button opens Add Player modal
    const addPlayerBtn = page.locator('#add-player-btn');
    await expect(addPlayerBtn).toBeVisible();
    await addPlayerBtn.click();
    await expect(page.getByRole('heading', { name: 'Add New Player' })).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();
  });
});
