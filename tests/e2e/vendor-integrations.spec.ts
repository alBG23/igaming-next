import { test, expect } from '@playwright/test';
import { VENDORS, getVendorById } from '../../src/lib/vendor-context';
import {
  getKnowledgeDocumentsForVendor,
  searchKnowledgeBase,
  fetchLiveVendorSnapshot,
  executeHermesLangChainQuery,
} from '../../src/lib/hermes/knowledge-base';
import { runReconciliation } from '../../src/lib/data-accuracy/engine';

test.describe('SoftSwiss, Soft2Bet & EveryMatrix Vendor Integration — Unit & Integration Suite', () => {

  test('Unit: VENDORS registry configures SoftSwiss, Soft2Bet, and EveryMatrix as active Connected integrations', async () => {
    expect(VENDORS.softswiss).toBeDefined();
    expect(VENDORS.soft2bet).toBeDefined();
    expect(VENDORS.everymatrix).toBeDefined();

    // SoftSwiss
    expect(VENDORS.softswiss.status).toBe('active');
    expect(VENDORS.softswiss.badge).toBe('Connected');
    expect(VENDORS.softswiss.shortCode).toBe('SS');
    expect(VENDORS.softswiss.url).toBe('https://www.softswiss.com/');
    expect(VENDORS.softswiss.features.length).toBeGreaterThanOrEqual(5);

    // Soft2Bet
    expect(VENDORS.soft2bet.status).toBe('active');
    expect(VENDORS.soft2bet.badge).toBe('Connected');
    expect(VENDORS.soft2bet.shortCode).toBe('S2B');
    expect(VENDORS.soft2bet.url).toBe('https://www.soft2bet.com/');
    expect(VENDORS.soft2bet.features.length).toBeGreaterThanOrEqual(5);

    // EveryMatrix
    expect(VENDORS.everymatrix.status).toBe('active');
    expect(VENDORS.everymatrix.badge).toBe('Connected');
    expect(VENDORS.everymatrix.shortCode).toBe('EM');
    expect(VENDORS.everymatrix.url).toBe('https://everymatrix.com/');
    expect(VENDORS.everymatrix.replicaName).toContain('EveryMatrix');
    expect(VENDORS.everymatrix.features.length).toBeGreaterThanOrEqual(5);

    // Helper lookup
    expect(getVendorById('softswiss').id).toBe('softswiss');
    expect(getVendorById('SOFT2BET').id).toBe('soft2bet');
    expect(getVendorById('everymatrix').id).toBe('everymatrix');
    expect(getVendorById('EVERYMATRIX').id).toBe('everymatrix');
    expect(getVendorById('unknown').id).toBe('softswiss');
  });

  test('Unit: Hermes Knowledge Base and LangChain pipeline support SoftSwiss, Soft2Bet, and EveryMatrix', async () => {
    const ssDocs = getKnowledgeDocumentsForVendor('softswiss');
    const s2bDocs = getKnowledgeDocumentsForVendor('soft2bet');
    const emDocs = getKnowledgeDocumentsForVendor('everymatrix');

    expect(ssDocs[0].vendorId).toBe('softswiss');
    expect(s2bDocs[0].vendorId).toBe('soft2bet');
    expect(emDocs[0].vendorId).toBe('everymatrix');

    const ssSchemaMatch = searchKnowledgeBase('replica schema architecture', 2, 'softswiss');
    expect(ssSchemaMatch[0].id).toBe('kb-softswiss-schema');

    const s2bSchemaMatch = searchKnowledgeBase('MEGA gamification schema architecture', 2, 'soft2bet');
    expect(s2bSchemaMatch[0].id).toBe('kb-soft2bet-schema');

    const emSchemaMatch = searchKnowledgeBase('GamMatrix CasinoEngine schema architecture', 2, 'everymatrix');
    expect(emSchemaMatch[0].id).toBe('kb-everymatrix-schema');

    const emMoneyMatrixMatch = searchKnowledgeBase('MoneyMatrix payment orchestration', 2, 'everymatrix');
    expect(emMoneyMatrixMatch[0].id).toBe('kb-everymatrix-moneymatrix');

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

    // Execute Hermes queries for EveryMatrix
    const emNgr = await executeHermesLangChainQuery('Show me top 3 affiliates by NGR', 'everymatrix');
    expect(emNgr.content).toContain('EveryMatrix');
    expect(emNgr.visualization?.title).toContain('EveryMatrix');

    const emGgr = await executeHermesLangChainQuery('What is the GGR trend?', 'everymatrix');
    expect(emGgr.content).toContain('EveryMatrix');
    expect(emGgr.visualization?.title).toContain('EveryMatrix');

    const emPayments = await executeHermesLangChainQuery('How many FTDs and payments?', 'everymatrix');
    expect(emPayments.content).toContain('EveryMatrix');
    expect(emPayments.visualization?.title).toContain('EveryMatrix');

    // Data Accuracy reconciliation engine supports softswiss_replica, soft2bet_replica, and everymatrix_replica
    const ssReconcile = await runReconciliation(3, undefined, 'softswiss');
    expect(ssReconcile.findings.some(f => f.sourceOfTruth === 'softswiss_replica')).toBe(true);

    const s2bReconcile = await runReconciliation(3, undefined, 'soft2bet');
    expect(s2bReconcile.findings.some(f => f.sourceOfTruth === 'soft2bet_replica')).toBe(true);

    const emReconcile = await runReconciliation(3, undefined, 'everymatrix');
    expect(emReconcile.findings.some(f => f.sourceOfTruth === 'everymatrix_replica')).toBe(true);
  });

  test('Integration: Real PostgreSQL datalake telemetry powers EveryMatrix, Soft2Bet, and SoftSwiss queries via /api/pg-query', async ({ baseURL }) => {
    const appBaseUrl = baseURL || 'http://localhost:3001';
    const snapshot = await fetchLiveVendorSnapshot('everymatrix', appBaseUrl);

    expect(snapshot).not.toBeNull();
    expect(snapshot?.source).toBe('postgresql_live');
    expect(snapshot?.vendorId).toBe('everymatrix');
    expect(snapshot?.partnerCount).toBeGreaterThan(0);
    expect(snapshot?.totalPartnerIncomeEur).toBeGreaterThan(0);
    expect(snapshot?.totalFtds).toBeGreaterThan(0);
    expect(snapshot?.totalRegistrations).toBeGreaterThan(0);
    expect(snapshot?.sampleRoundsCount).toBeGreaterThan(0);
    expect(snapshot?.sampleDepositsCount).toBeGreaterThan(0);

    // Verify executeHermesLangChainQuery grounds EveryMatrix response with live PostgreSQL data
    const emLivePayments = await executeHermesLangChainQuery(
      'How many EveryMatrix FTDs and payments did we have?',
      'everymatrix',
      { baseUrl: appBaseUrl }
    );
    expect(emLivePayments.liveSnapshot?.source).toBe('postgresql_live');
    expect(emLivePayments.content).toContain('Live PostgreSQL telemetry confirms');
    expect(emLivePayments.reasoningSteps.some(s => s.includes('Live PostgreSQL Replica'))).toBe(true);
  });

  test('Integration E2E: Sidebar vendor selector switches cleanly between SoftSwiss, Soft2Bet, and EveryMatrix on /chat', async ({ page }) => {
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

    // 2. Switch to Soft2Bet and verify Connected state & Quick Prompts
    const soft2betOption = page.getByRole('option', { name: /Soft2Bet/i });
    await expect(async () => {
      if ((await vendorSelect.getAttribute('data-state')) !== 'open') {
        await vendorSelect.click();
      }
      await expect(soft2betOption).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });
    await expect(soft2betOption).toContainText('Connected');
    await soft2betOption.click();

    await expect(vendorSelect).toContainText('Soft2Bet');
    await expect(page.getByText(/Soft2Bet Knowledge Base/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Soft2Bet Payments & FTDs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Soft2Bet MEGA & PAM Schema' })).toBeVisible();

    await page.getByRole('button', { name: 'Soft2Bet Payments & FTDs' }).click();
    await expect(page.getByText('Soft2Bet Payments & FTD Performance')).toBeVisible();
    await expect(page.getByText(/Trustly \/ Zimpler Instant/i)).toBeVisible();

    // 3. Switch to EveryMatrix and verify Connected state, Knowledge Base, and Quick Prompts with Real PostgreSQL telemetry
    const everymatrixOption = page.getByRole('option', { name: /EveryMatrix/i });
    await expect(async () => {
      if ((await vendorSelect.getAttribute('data-state')) !== 'open') {
        await vendorSelect.click();
      }
      await expect(everymatrixOption).toBeVisible({ timeout: 1500 });
    }).toPass({ timeout: 15000 });
    await expect(everymatrixOption).toContainText('Connected');
    await everymatrixOption.click();

    await expect(vendorSelect).toContainText('EveryMatrix');
    await expect(page.getByText(/EveryMatrix Knowledge Base/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'EveryMatrix Payments & FTDs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'EveryMatrix GamMatrix Schema' })).toBeVisible();

    await page.getByRole('button', { name: 'EveryMatrix Payments & FTDs' }).click();
    await expect(page.getByText('EveryMatrix MoneyMatrix Payments & FTD Performance')).toBeVisible();
    await expect(page.getByText(/MoneyMatrix Trustly Open Banking/i)).toBeVisible();

    // 4. Switch back to SoftSwiss and run a SoftSwiss Quick Prompt
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
