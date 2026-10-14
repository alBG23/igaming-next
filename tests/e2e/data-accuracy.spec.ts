import { test, expect } from '@playwright/test';

const statusFixture = {
  success: true,
  crossSource: { source: 'bo', verified: false },
  findings: [
    {
      id: 'ggr:2026-01-01:EUR',
      date: '2026-01-01',
      metric: 'ggr',
      currency: 'EUR',
      sourceOfTruth: 'Back Office (bo)',
      sourceValue: 100,
      prebuiltValue: 100,
      delta: 0,
      deltaPct: 0,
      status: 'MATCH',
      isClosedDay: true,
    },
    {
      id: 'ngr:2026-01-01:EUR',
      date: '2026-01-01',
      metric: 'ngr',
      currency: 'EUR',
      sourceOfTruth: 'Back Office (bo)',
      sourceValue: 80,
      prebuiltValue: null,
      delta: null,
      deltaPct: null,
      status: 'MISSING',
      isClosedDay: true,
    },
  ],
  findingQueue: [],
  findingSummary: { open: 0, tier_b: 0 },
  loop: {
    loop_enabled: true,
    autofix: { master_env_enabled: true, operator_switch_on: false },
  },
  recentRuns: [],
  accuracyScorePct: 50,
  summary: {
    totalChecks: 2,
    matches: 1,
    critical: 1,
    warning: 0,
    safeHealable: 0,
    quarantined: 0,
    openFindings: 0,
  },
};

test.describe('Data accuracy evidence dashboard', () => {
  test('renders observed comparisons and only exposes backend-owned controls', async ({ page }) => {
    await page.route('**/api/data-accuracy/status', (route) =>
      route.fulfill({ status: 200, json: statusFixture }),
    );
    await page.route('**/api/data-accuracy/reconcile*', (route) =>
      route.fulfill({ status: 200, json: { ok: true } }),
    );
    await page.route('**/api/data-accuracy/autofix*', (route) =>
      route.fulfill({ status: 200, json: { operator_switch_on: true } }),
    );
    await page.route('**/api/data-accuracy/parity-proof*', (route) =>
      route.fulfill({
        status: 200,
        json: {
          status: 'UNVERIFIED',
          overall_match_rate: null,
          evaluated_at: '2026-01-02T00:00:00Z',
          window_days: 7,
          closed_days_count: 7,
          source_of_truth: 'Operator-supplied back-office snapshot (bo_snapshot)',
          coverage: { compared: 0, matched: 0 },
          metrics: [{
            metric_id: 'ggr',
            name: 'Gross Gaming Revenue',
            currency: null,
            app_value: null,
            source_value: null,
            delta: null,
            status: 'UNVERIFIED',
          }],
          repeatable_proof_hash: 'sha256:test',
          prospect_summary: 'No overlapping records; parity is unverified.',
        },
      }),
    );

    await page.goto('/data-accuracy');
    await expect(page.getByRole('heading', { name: 'Data Accuracy & Continuous Reconciliation' })).toBeVisible();
    await expect(page.getByText('50%', { exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Back Office (bo)' }).first()).toBeVisible();
    await expect(page.getByText('MISSING APPLICATION VALUE', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Run Reconcile Pass' })).toBeEnabled();
    await expect(page.getByRole('button', { name: 'One-Click Parity Proof' })).toBeEnabled();
    await expect(page.getByRole('switch', { name: 'Backend auto-fix' })).toBeEnabled();
    await expect(page.getByRole('button', { name: /Heal Slice|Safe Auto-Heal|Review/ })).toHaveCount(0);

    await page.getByRole('button', { name: 'Discrepancies Only' }).click();
    await expect(page.getByText('MISSING APPLICATION VALUE', { exact: true })).toBeVisible();
    await expect(page.getByText('MATCH', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'All (2)' }).click();

    await page.getByRole('button', { name: 'One-Click Parity Proof' }).click();
    await expect(page.getByText('No overlapping records; parity is unverified.')).toBeVisible();
    await expect(page.getByText('UNVERIFIED').first()).toBeVisible();

    await page.getByRole('button', { name: 'Run Reconcile Pass' }).click();
    await expect(page.getByText('Reconciliation pass completed across 7-day window.')).toBeVisible();
    await page.getByRole('switch', { name: 'Backend auto-fix' }).click();
    await expect(page.getByText('Backend auto-fix resumed.')).toBeVisible();
  });

  test('retired frontend heal and cron routes return 410', async ({ request }) => {
    const responses = await Promise.all([
      request.post('/api/data-accuracy/heal'),
      request.get('/api/cron/data-reconciliation'),
      request.post('/api/cron/data-reconciliation'),
    ]);
    for (const response of responses) expect(response.status()).toBe(410);
  });

  test('status and parity endpoints return backend evidence or explicit access/unavailable errors', async ({ request }) => {
    const status = await request.get('/api/data-accuracy/status');
    expect([200, 401, 403, 503]).toContain(status.status());
    if (status.ok()) {
      const statusBody = await status.json();
      expect(statusBody.success).toBe(true);
      expect(statusBody.summary).toBeDefined();
      expect(statusBody.crossSource).toBeDefined();
      expect(statusBody.accuracyScorePct === null || typeof statusBody.accuracyScorePct === 'number').toBe(true);
    } else {
      expect((await status.text()).trim()).not.toBe('');
    }

    const proof = await request.get('/api/data-accuracy/parity-proof');
    expect([200, 401, 403, 503]).toContain(proof.status());
    if (proof.ok()) {
      const proofBody = await proof.json();
      expect(['VERIFIED_PARITY', 'DISCREPANCY', 'UNVERIFIED']).toContain(proofBody.status);
      expect(proofBody.coverage).toBeDefined();
      expect(proofBody.metrics).toBeInstanceOf(Array);
      expect(proofBody.repeatable_proof_hash).toMatch(/^sha256:/);
    } else {
      expect((await proof.text()).trim()).not.toBe('');
    }
  });
});
