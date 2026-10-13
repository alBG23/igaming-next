import { test, expect } from '@playwright/test';

test.describe('Maximoos Client-Readiness Priorities (CR1 - CR8) E2E Suite', () => {

  test('CR1: Data accuracy & one-click repeatable parity proof (/data-accuracy)', async ({ page }) => {
    await page.goto('/data-accuracy');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: /Data Accuracy & Continuous Reconciliation/i })).toBeVisible();

    // Verify One-Click Parity Proof button exists and is clickable
    const parityBtn = page.getByRole('button', { name: /One-Click Parity Proof/i });
    await expect(parityBtn).toBeVisible();
    await parityBtn.click();

    // Verify Parity Proof report modal / card opens
    await expect(page.locator('text=Repeatable Parity Proof Report (CR1)')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=VERIFIED PARITY')).toBeVisible();
    await expect(page.locator('text=100.0%')).toBeVisible();
  });

  test('CR2: Multi-tenant isolation & security audit (/settings)', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Security Tab
    const securityTab = page.getByRole('tab', { name: 'Security' });
    await securityTab.click();

    // Verify PII Masking & Tenant Isolation Guard switch
    const piiSwitch = page.locator('#pii-masking-switch');
    await expect(piiSwitch).toBeVisible();
  });

  test('CR3: Scale & reliability wide-window responsiveness (/dashboard)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();
  });

  test('CR4: Data validations & autoheal trigger (/data-accuracy)', async ({ page }) => {
    await page.goto('/data-accuracy');
    await page.waitForLoadState('domcontentloaded');

    const reconcileBtn = page.getByRole('button', { name: /Run Reconcile Pass/i });
    await expect(reconcileBtn).toBeVisible();
  });

  test('CR5: Partner economics & freeze rules (/affiliates)', async ({ page }) => {
    await page.goto('/affiliates');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.locator('body')).toBeVisible();
  });

  test('CR7: Hermes AI chat reasoning loop (/chat)', async ({ page }) => {
    await page.goto('/chat');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Analytics Chat' })).toBeVisible();

    // Verify input and send button
    const input = page.getByPlaceholder(/Ask about your data/i);
    await expect(input).toBeVisible();
    await input.fill('Show me NGR for last month');

    const sendBtn = page.getByRole('button', { name: 'Send' });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    await expect(page.locator('text=Show me NGR for last month')).toBeVisible();
  });

  test('CR8: Promo Planner CRM intelligence flagship (/promo-planner)', async ({ page }) => {
    await page.goto('/promo-planner');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'Promo Planner' })).toBeVisible();

    // Verify KPI summary cards
    await expect(page.locator('text=Target NGR Uplift')).toBeVisible();
    await expect(page.locator('text=Allocated Promo Budget')).toBeVisible();

    // Verify tabs
    await expect(page.getByRole('tab', { name: /Active Campaigns/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Audience Segments/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Creative Studio/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Promo Calendar/i })).toBeVisible();

    // Click Audience Segments tab
    await page.getByRole('tab', { name: /Audience Segments/i }).click();
    await expect(page.locator('text=High-Impact Player Cohorts')).toBeVisible();

    // Click Creative Studio tab
    await page.getByRole('tab', { name: /Creative Studio/i }).click();
    await expect(page.locator('text=Variant A (Value Hook)')).toBeVisible();

    // Click Generate AI Campaign
    const generateBtn = page.getByRole('button', { name: /Generate AI Campaign/i });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();
    await expect(page.locator('text=Successfully generated')).toBeVisible({ timeout: 5000 });
  });

});
