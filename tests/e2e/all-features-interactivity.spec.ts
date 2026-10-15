import { test, expect } from '@playwright/test';

test.describe('Full Application Feature Interactivity & Build Stability Suite', () => {

  test('verifies all sidebar navigation links are clickable and route without error', async ({ page }) => {
    test.setTimeout(120_000);
    page.setDefaultNavigationTimeout(60_000);
    const routes = [
      '/dashboard',
      '/chat',
      '/promo-planner',
      '/data-accuracy',
      '/players',
      '/acquisition',
      '/cohorts',
      '/payments',
      '/casino-games',
      '/bonuses',
      '/affiliates',
      '/settings',
    ];

    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });
    for (const route of routes) {
      const link = page.locator(`a[href="${route}"]`).first();
      await expect(link).toBeVisible();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${route.replace('/', '\\/')}$`), { timeout: 30_000 });
      await expect(page.locator('body')).toBeVisible();
      await expect(page.getByText('404: This page could not be found.')).toHaveCount(0);
    }
  });

  test('verifies Payments date filtering, refresh, and transaction search', async ({ page }) => {
    await page.route('**/api/pg-query', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { data: [], count: 0, error: null },
    }));
    await page.goto('/payments', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Payments Dashboard' })).toBeVisible();

    const range = page.getByRole('combobox', { name: 'Payment date range' });
    await range.click();
    await page.getByRole('option', { name: 'Last Month' }).click();
    await expect(range).toContainText('Last Month');

    const refresh = page.getByRole('button', { name: 'Refresh payment analytics' });
    await expect(refresh).toBeEnabled();
    await refresh.click();
    const search = page.getByRole('textbox', { name: 'Search transactions' });
    await search.fill('not-a-transaction');
    await expect(page.getByText('No transactions match this search.')).toBeVisible();
  });

  test('verifies Player Value page reports unavailable live data without showing demo controls', async ({ page }) => {
    await page.route('**/rest/v1/players**', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      json: { message: 'Player data unavailable' },
    }));
    await page.goto('/player-value', { waitUntil: 'load' });

    await expect(page.getByRole('heading', { name: 'Player Value', exact: true })).toBeVisible();
    await expect(page.getByText(/Failed to connect to the database/i)).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Players' })).toHaveCount(0);
  });

  test('verifies Cohorts page interactivity: search and refresh', async ({ page }) => {
    await page.route('**/rest/v1/player_cohorts**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '*/0' },
      json: [],
    }));
    await page.goto('/cohorts', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: 'Cohort Analysis' })).toBeVisible();

    // Search cohorts
    const searchInput = page.getByPlaceholder(/Search by date/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('2024');

    await page.getByRole('button', { name: 'Refresh cohort analytics' }).click();
    await expect(page.getByText('No cohort records are available from the live data source.')).toBeVisible();
  });

  test('verifies Settings tenant and probe tables paginate through all audit records', async ({ page }) => {
    await page.route('**/api/tenant/audit', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        success: true,
        allIsolationProbesPassed: true,
        tenants: Array.from({ length: 12 }, (_, index) => ({
          id: `tenant-${index + 1}`,
          name: `Operator ${index + 1}`,
          isolationMode: 'STRICT_ROW_LEVEL',
          status: 'ACTIVE',
        })),
        probes: Array.from({ length: 12 }, (_, index) => ({
          testName: `Probe ${index + 1}`,
          sourceTenantId: `tenant-${index + 1}`,
          targetTenantId: `tenant-${index + 2}`,
          errorCaptured: 'Cross-tenant access blocked',
          httpStatus: 403,
          passed: true,
        })),
      },
    }));
    await page.goto('/settings?tab=tenant-security', { waitUntil: 'domcontentloaded' });

    await expect(page.getByRole('heading', { name: /Multi-Tenant Security/i })).toBeVisible();
    await expect(page.getByText('Operator 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Operator 11', { exact: true })).toHaveCount(0);

    await page.getByRole('button', { name: 'Next tenants page' }).click();
    await expect(page.getByText('Operator 11', { exact: true })).toBeVisible();
    await expect(page.getByText('Operator 1', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Previous tenants page' }).click();
    await expect(page.getByText('Operator 1', { exact: true })).toBeVisible();

    await expect(page.getByText('Probe 1', { exact: true })).toBeVisible();
    await expect(page.getByText('Probe 11', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Next probes page' }).click();
    await expect(page.getByText('Probe 11', { exact: true })).toBeVisible();
    await expect(page.getByText('Probe 1', { exact: true })).toHaveCount(0);
  });

  test('shows a retryable error instead of an empty queue when curator requests fail', async ({ page }) => {
    let proposalRequests = 0;
    await page.route('**/api/v1/curator/proposals', route => {
      proposalRequests += 1;
      if (proposalRequests === 1) {
        return route.fulfill({
          status: 502,
          contentType: 'application/json',
          json: { error: 'Unable to reach the curator service.' },
        });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        json: { proposals: [] },
      });
    });
    await page.goto('/settings?tab=ai-knowledge', { waitUntil: 'domcontentloaded' });

    await expect(page.getByText('Unable to load pending proposals.', { exact: true })).toBeVisible();
    await expect(page.getByText('Queue is empty. The AI is fully caught up.')).toHaveCount(0);

    await page.getByRole('button', { name: 'Retry loading proposals' }).click();
    await expect(page.getByText('Queue is empty. The AI is fully caught up.')).toBeVisible();
    expect(proposalRequests).toBe(2);
  });

  test('verifies Campaigns page interactivity: create campaign modal trigger and close', async ({ page }) => {
    await page.goto('/campaigns', { waitUntil: 'load' });

    await expect(page.getByRole('heading', { name: 'Campaigns', exact: true })).toBeVisible();

    // Click New Campaign button
    const newBtn = page.getByRole('button', { name: /New Campaign/i }).first();
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    // Check modal or dialog opens
    const dialogTitle = page.getByRole('heading', { name: /Create New Campaign/i });
    await expect(dialogTitle).toBeVisible();

    // Close modal
    const cancelBtn = page.getByRole('button', { name: 'Cancel' }).first();
    await expect(cancelBtn).toBeVisible();
    await cancelBtn.click();
  });

  test('verifies Affiliates page search, export, and refresh controls', async ({ page }) => {
    await page.route('**/rest/v1/income_reports**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '*/1' },
      json: [{ partner_id: 'partner-17', currency: 'EUR', partner_income: 125.5 }],
    }));
    await page.route('**/rest/v1/traffic_reports**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '*/1' },
      json: [{
        foreign_partner_id: 'partner-17',
        visits: 100,
        clicks: 80,
        registrations_count: 10,
        deposits_count: 4,
        ftd_count: 2,
      }],
    }));
    await page.goto('/affiliates', { waitUntil: 'load' });

    await expect(page.getByRole('heading', { name: 'Affiliates' })).toBeVisible();

    // Search affiliates
    const searchInput = page.getByPlaceholder(/Search partner or traffic source/i);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('partner');

    await page.getByRole('button', { name: 'Export CSV' }).click();
    await expect(page.getByRole('status')).toContainText('Exported the available commission and traffic reports.');
    const refresh = page.getByRole('button', { name: 'Refresh' });
    await expect(refresh).toBeEnabled();
    await refresh.click();
  });

  test('verifies Acquisition refresh and export use live report data', async ({ page }) => {
    await page.route('**/rest/v1/users_view**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '*/0' },
      json: [],
    }));
    await page.route('**/rest/v1/traffic_reports**', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'content-range': '*/1' },
      json: [{
        foreign_partner_id: 17,
        visits: 100,
        clicks: 80,
        registrations_count: 10,
        deposits_count: 4,
        ftd_count: 2,
      }],
    }));
    await page.goto('/acquisition', { waitUntil: 'load' });
    await expect(page.getByRole('heading', { name: 'Acquisition' })).toBeVisible();

    await page.getByRole('button', { name: 'Export CSV' }).click();
    await expect(page.getByRole('status')).toContainText('Exported 1 traffic sources.');
    const refresh = page.getByRole('button', { name: 'Refresh' });
    await expect(refresh).toBeEnabled();
    await refresh.click();
  });

  test('verifies User Feedback Widget opens, allows category switching, and submits suggestions', async ({ page }) => {
    await page.route('**/api/v1/feedback', route => route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: { email_sent: true },
    }));
    await page.goto('/dashboard', { waitUntil: 'domcontentloaded' });

    // Find and open floating feedback trigger
    const feedbackTrigger = page.getByRole('button', { name: /Give Feedback & Suggest Improvements/i });
    await expect(feedbackTrigger).toBeVisible();
    await feedbackTrigger.click();

    // Verify modal header is visible
    await expect(page.getByText('Help Us Improve Maximoos')).toBeVisible();

    // Switch category to Feature Idea or Bug Report
    const featureCatBtn = page.getByRole('button', { name: /Feature Idea/i });
    if (await featureCatBtn.isVisible()) {
      await featureCatBtn.click();
    }

    // Type a test feedback message
    const textarea = page.getByPlaceholder(/Describe what you were trying to accomplish/i);
    await expect(textarea).toBeVisible();
    await textarea.fill('E2E automated improvement suggestion: add real-time GGR velocity alerts.');

    // Submit feedback
    const submitBtn = page.getByRole('button', { name: /Submit Improvement/i });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // Verify submission thank you screen
    await expect(page.getByText('Thank You for Your Feedback!')).toBeVisible();
  });
});
