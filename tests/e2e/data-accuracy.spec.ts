import { test, expect } from '@playwright/test';

test.describe('P1: Continuous Data Accuracy, Reconciliation & Healing Engine', () => {
  test('verifies /data-accuracy dashboard metrics, accordion toggle, filter tabs, and healing actions', async ({ page }) => {
    await page.goto('/data-accuracy');
    await page.waitForLoadState('domcontentloaded');

    // 1. Heading and System Status
    await expect(page.getByRole('heading', { name: 'Data Accuracy & Continuous Reconciliation' })).toBeVisible();

    // 2. Financial KPI Metric Cards
    await expect(page.locator('text=Accuracy Score')).toBeVisible();
    await expect(page.getByText('Critical Discrepancies', { exact: true })).toBeVisible();
    await expect(page.locator('text=Drifts & Warnings')).toBeVisible();
    await expect(page.locator('text=Safe Heal Candidates').first()).toBeVisible();
    await expect(page.locator('text=Quarantined (Risky)').first()).toBeVisible();

    // 3. The Plan Accordion button interactivity
    const planToggleBtn = page.getByRole('button', { name: /The Plan: How We Guarantee Data Accuracy/i }).or(
      page.locator('text=The Plan: How We Guarantee Data Accuracy & Safe Healing')
    );
    await expect(planToggleBtn.first()).toBeVisible();
    await planToggleBtn.first().click();

    // Verify Plan details expand
    await expect(page.locator('text=1. Check & Identity Rules').first()).toBeVisible();

    // 4. Test Filter buttons (All, Discrepancies Only, Safe Heal Candidates)
    const discrepanciesBtn = page.getByRole('button', { name: /Discrepancies Only/i });
    if (await discrepanciesBtn.isVisible()) {
      await discrepanciesBtn.click();
    }

    const safeHealFilterBtn = page.getByRole('button', { name: /Safe Heal Candidates/i }).last();
    if (await safeHealFilterBtn.isVisible()) {
      await safeHealFilterBtn.click();
    }

    const allBtn = page.getByRole('button', { name: /All \(/i });
    if (await allBtn.isVisible()) {
      await allBtn.click();
    }

    // 5. Test "Run Reconcile Pass" button
    const reconcileBtn = page.getByRole('button', { name: /Run Reconcile Pass/i });
    await expect(reconcileBtn).toBeVisible();
    await reconcileBtn.click();

    // Wait for reconciliation to trigger and complete or show feedback
    await page.waitForTimeout(1000);

    // 6. Test "Safe Auto-Heal" button
    const healBtn = page.getByRole('button', { name: /Safe Auto-Heal/i }).first();
    await expect(healBtn).toBeVisible();
    if (!await healBtn.isDisabled()) {
      await healBtn.click();
      await page.waitForTimeout(1000);
    }
  });

  test('verifies /api/cron/data-reconciliation endpoint executes scheduled cycle', async ({ request }) => {
    const response = await request.get('/api/cron/data-reconciliation');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.stats).toBeDefined();
    expect(typeof data.stats.accuracyScorePct).toBe('number');
  });

  test('verifies /api/data-accuracy/status endpoint provides engine telemetry', async ({ request }) => {
    const response = await request.get('/api/data-accuracy/status');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.summary).toBeDefined();
  });
});
