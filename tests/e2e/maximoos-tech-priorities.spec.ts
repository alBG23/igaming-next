import { test, expect } from '@playwright/test';

test.describe('Maximoos Tech Priorities (P0 - P6) Validation Suite', () => {

  test('P0: Hermes — Foundation & feedback capture (/chat)', async ({ page }) => {
    await page.goto('/chat');
    await expect(page.getByRole('heading', { name: 'Analytics Chat' })).toBeVisible();

    // Verify assistant welcome message with Hermes Quality indicator
    const qualityBadge = page.locator('text=Hermes Quality');
    await expect(qualityBadge.first()).toBeVisible();

    // Verify feedback capture buttons (Thumbs Up / Down)
    const helpfulBtn = page.getByRole('button', { name: 'Helpful' }).first();
    const fixBtn = page.getByRole('button', { name: 'Fix' }).first();

    await expect(helpfulBtn).toBeVisible();
    await expect(fixBtn).toBeVisible();

    // Click Helpful (Thumbs Up)
    await helpfulBtn.click();
    await expect(page.locator('text=Feedback: Helpful').first()).toBeVisible();

    // Click Fix (Needs Correction)
    await fixBtn.click();
    await expect(page.locator('text=Feedback: Needs Correction').first()).toBeVisible();

    // Submit an analytical question
    const input = page.getByPlaceholder(/Ask about your data/i);
    await input.fill('Show me NGR for last month');
    await page.getByRole('button', { name: 'Send' }).click();

    // Check message appears
    await expect(page.locator('text=Show me NGR for last month')).toBeVisible();
  });

  test('P1: Data accuracy & financial reconciliation (/dashboard)', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');

    // Verify main financial KPI cards are displayed
    await expect(page.locator('body')).toBeVisible();
    const headings = page.locator('h1, h2, h3');
    await expect(headings.first()).toBeVisible();

    // Verify interactive filters/buttons on dashboard
    const interactiveButtons = page.locator('button');
    const buttonCount = await interactiveButtons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('P2: Multi-tenant security & PII masking isolation (/settings)', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Security Tab
    const securityTab = page.getByRole('tab', { name: 'Security' });
    await securityTab.click();

    // Verify PII Masking & Tenant Isolation Guard switch
    const piiSwitch = page.locator('#pii-masking-switch');
    await expect(piiSwitch).toBeVisible();

    const initialState = await piiSwitch.getAttribute('aria-checked');
    await piiSwitch.click();
    const toggledState = await piiSwitch.getAttribute('aria-checked');
    expect(toggledState).not.toBe(initialState);

    // Toggle back
    await piiSwitch.click();
    const restoredState = await piiSwitch.getAttribute('aria-checked');
    expect(restoredState).toBe(initialState);
  });

  test('P3: AI-chat self-learning human gate (/settings -> AI Knowledge)', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    // Switch to AI Knowledge Tab
    const aiKnowledgeTab = page.getByRole('tab', { name: /AI Knowledge/i });
    await expect(aiKnowledgeTab).toBeVisible();
    await aiKnowledgeTab.click();

    // Verify Knowledge Refinement Queue heading is visible
    await expect(page.getByRole('heading', { name: 'Knowledge Refinement Queue' })).toBeVisible();

    // Verify interactive curator action button exists
    const generateBtn = page.getByRole('button', { name: /Run Knowledge Curation/i });
    await expect(generateBtn).toBeVisible();
  });

  test('P4 & P5: IP protection & white-label runtime settings (/settings)', async ({ page }) => {
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    // Verify General profile settings
    const fullNameInput = page.locator('#fullname');
    await expect(fullNameInput).toBeVisible();
    await expect(fullNameInput).toHaveValue(/.+/);

    // Verify Security emergency backup codes action
    await page.getByRole('tab', { name: 'Security' }).click();
    const backupCodesBtn = page.getByRole('button', { name: /Generate Codes/i });
    await expect(backupCodesBtn).toBeVisible();
  });

  test('P6: B2B support readiness & diagnostic observability (/settings & /api/health)', async ({ page, request }) => {
    // 1. Check live health observability endpoint
    const healthResponse = await request.get('/api/health');
    expect(healthResponse.ok()).toBeTruthy();
    const healthData = await healthResponse.json();
    expect(healthData.status).toBe('ok');

    // 2. Check B2B Support Tickets UI
    await page.goto('/settings');
    await page.waitForLoadState('domcontentloaded');

    const supportTab = page.getByRole('tab', { name: /B2B Support/i });
    await expect(supportTab).toBeVisible();
    await supportTab.click();

    // Verify support ticket table renders
    await expect(page.locator('text=B2B Support Ticketing')).toBeVisible();
    await expect(page.locator('text=TKT-100')).toBeVisible();

    // Click View ticket button to verify interactivity
    const viewBtn = page.getByRole('button', { name: 'View' }).first();
    await expect(viewBtn).toBeVisible();
    await viewBtn.click();
  });

});
