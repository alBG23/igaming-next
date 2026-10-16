import { test, expect } from '@playwright/test';
import { VENDORS, getVendorById } from '../../src/lib/vendor-context';
import {
  KNOWLEDGE_DOCUMENTS,
  getKnowledgeDocumentsForVendor,
  searchKnowledgeBase,
  executeHermesLangChainQuery,
} from '../../src/lib/hermes/knowledge-base';
import { runReconciliation } from '../../src/lib/data-accuracy/engine';

test.describe('SoftSwiss & Soft2Bet Vendor Integration — Unit & Integration Suite', () => {

  test('Unit: VENDORS registry configures both SoftSwiss and Soft2Bet as active Connected integrations', async () => {
    expect(VENDORS.softswiss).toBeDefined();
    expect(VENDORS.soft2bet).toBeDefined();

    // Both must be active and Connected
    expect(VENDORS.softswiss.status).toBe('active');
    expect(VENDORS.softswiss.badge).toBe('Connected');
    expect(VENDORS.softswiss.shortCode).toBe('SS');
    expect(VENDORS.softswiss.url).toBe('https://www.softswiss.com/');
    expect(VENDORS.softswiss.features.length).toBeGreaterThanOrEqual(5);

    expect(VENDORS.soft2bet.status).toBe('active');
    expect(VENDORS.soft2bet.badge).toBe('Connected');
    expect(VENDORS.soft2bet.shortCode).toBe('S2B');
    expect(VENDORS.soft2bet.url).toBe('https://www.soft2bet.com/');
    expect(VENDORS.soft2bet.features.length).toBeGreaterThanOrEqual(5);

    // Helper lookup
    expect(getVendorById('softswiss').id).toBe('softswiss');
    expect(getVendorById('SOFT2BET').id).toBe('soft2bet');
    expect(getVendorById('unknown').id).toBe('softswiss');
  });

  test('Unit: Hermes Knowledge Base and LangChain pipeline support both SoftSwiss and Soft2Bet', async () => {
    const ssDocs = getKnowledgeDocumentsForVendor('softswiss');
    const s2bDocs = getKnowledgeDocumentsForVendor('soft2bet');

    expect(ssDocs[0].vendorId).toBe('softswiss');
    expect(s2bDocs[0].vendorId).toBe('soft2bet');

    const ssSchemaMatch = searchKnowledgeBase('replica schema architecture', 2, 'softswiss');
    expect(ssSchemaMatch[0].id).toBe('kb-softswiss-schema');

    const s2bSchemaMatch = searchKnowledgeBase('MEGA gamification schema architecture', 2, 'soft2bet');
    expect(s2bSchemaMatch[0].id).toBe('kb-soft2bet-schema');

    // Execute Hermes queries for SoftSwiss
    const ssNgr = await executeHermesLangChainQuery('Show me top 3 affiliates by NGR', 'softswiss');
    expect(ssNgr.content).toContain('SoftSwiss');
    expect(ssNgr.visualization?.title).toContain('SoftSwiss');

    const ssGgr = await executeHermesLangChainQuery('What is the GGR trend?', 'softswiss');
    expect(ssGgr.content).toContain('SoftSwiss');
    expect(ssGgr.visualization?.title).toContain('SoftSwiss');

    const ssPayments = await executeHermesLangChainQuery('How many FTDs and payments?', 'softswiss');
    expect(ssPayments.content).toContain('SoftSwiss');
    expect(ssPayments.visualization?.title).toContain('SoftSwiss');

    // Execute Hermes queries for Soft2Bet
    const s2bNgr = await executeHermesLangChainQuery('Show me top 3 affiliates by NGR', 'soft2bet');
    expect(s2bNgr.content).toContain('Soft2Bet');
    expect(s2bNgr.visualization?.title).toContain('Soft2Bet');

    const s2bGgr = await executeHermesLangChainQuery('What is the GGR trend?', 'soft2bet');
    expect(s2bGgr.content).toContain('Soft2Bet');
    expect(s2bGgr.visualization?.title).toContain('Soft2Bet');

    const s2bPayments = await executeHermesLangChainQuery('How many FTDs and payments?', 'soft2bet');
    expect(s2bPayments.content).toContain('Soft2Bet');
    expect(s2bPayments.visualization?.title).toContain('Soft2Bet');

    // Data Accuracy reconciliation engine supports both softswiss_replica and soft2bet_replica
    const ssReconcile = await runReconciliation(3, undefined, 'softswiss');
    expect(ssReconcile.findings.some(f => f.sourceOfTruth === 'softswiss_replica')).toBe(true);

    const s2bReconcile = await runReconciliation(3, undefined, 'soft2bet');
    expect(s2bReconcile.findings.some(f => f.sourceOfTruth === 'soft2bet_replica')).toBe(true);
  });

  test('Integration E2E: Sidebar vendor selector switches cleanly between SoftSwiss and Soft2Bet on /chat', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/chat', { waitUntil: 'load' });

    // 1. Default vendor is SoftSwiss (Connected)
    const vendorSelect = page.locator('#vendor-selector-combobox');
    await expect(vendorSelect).toBeVisible({ timeout: 20000 });
    await expect(vendorSelect).toContainText('SoftSwiss');
    await expect(vendorSelect).toContainText('Connected');
    await expect(page.getByText(/SoftSwiss Knowledge Base/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'SoftSwiss Payments & FTDs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'SoftSwiss Replica Schema' })).toBeVisible();

    // 2. Open Vendor Platform selector (retrying click if hydration is still completing) and verify Soft2Bet is Connected
    const soft2betOption = page.getByRole('option', { name: /Soft2Bet/i });
    await expect(async () => {
      if ((await vendorSelect.getAttribute('data-state')) !== 'open') {
        await vendorSelect.click();
      }
      await expect(soft2betOption).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });
    await expect(soft2betOption).toContainText('Connected');
    await soft2betOption.click();

    // 3. Verify UI updates to Soft2Bet across Sidebar and Analytics Chat
    await expect(vendorSelect).toContainText('Soft2Bet');
    await expect(page.getByText(/Soft2Bet Knowledge Base/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Soft2Bet Payments & FTDs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Soft2Bet MEGA & PAM Schema' })).toBeVisible();

    // 4. Run a Soft2Bet Quick Prompt and verify Soft2Bet response & visualization
    await page.getByRole('button', { name: 'Soft2Bet Payments & FTDs' }).click();
    await expect(page.getByText('Soft2Bet Payments & FTD Performance')).toBeVisible();
    await expect(page.getByText(/Trustly \/ Zimpler Instant/i)).toBeVisible();

    // 5. Switch back to SoftSwiss and run a SoftSwiss Quick Prompt
    const softswissOption = page.getByRole('option', { name: /SoftSwiss/i });
    await expect(async () => {
      if ((await vendorSelect.getAttribute('data-state')) !== 'open') {
        await vendorSelect.click();
      }
      await expect(softswissOption).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });
    await softswissOption.click();
    await expect(vendorSelect).toContainText('SoftSwiss');
    await expect(page.getByText(/SoftSwiss Knowledge Base/i)).toBeVisible();

    await page.getByRole('button', { name: 'SoftSwiss Payments & FTDs' }).click();
    await expect(page.getByText('SoftSwiss Payments & FTD Performance')).toBeVisible();
    await expect(page.getByText(/CoinsPaid Crypto/i)).toBeVisible();
  });

});
