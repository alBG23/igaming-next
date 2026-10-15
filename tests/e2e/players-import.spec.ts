import { test, expect } from '@playwright/test';

const playerResponse = {
  success: true,
  source: 'postgresql',
  data: [{
    id: 'source-501',
    name: 'Verified database record',
    email: 'source-501@invalid.test',
    status: 'Active',
    vipTier: null,
    balances: [
      { currency: 'EUR', amount: 42 },
      { currency: 'USD', amount: 10.5 },
    ],
    country: null,
    lastLogin: null,
    registeredAt: null,
  }],
  pagination: { page: 1, limit: 50, total: 480, hasMore: true },
  summary: {
    totalPlayers: 480,
    activePlayers: 470,
    inactivePlayers: 10,
    unknownStatusPlayers: 0,
    averageBalanceByCurrency: [
      { currency: 'EUR', averageBalance: 245.12, playerCount: 320 },
      { currency: 'GBP', averageBalance: 80, playerCount: 160 },
    ],
  },
};

test.describe('Players — database-backed data', () => {
  test('shows database records, global aggregates, and per-currency balances without sample data', async ({ page }) => {
    const requests: URL[] = [];
    await page.route('**/api/players?**', async (route) => {
      requests.push(new URL(route.request().url()));
      await route.fulfill({ status: 200, contentType: 'application/json', json: playerResponse });
    });

    await page.goto('/players');
    await expect(page.getByRole('heading', { name: 'Players', exact: true })).toBeVisible();
    await expect(page.getByText('480', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('470', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('10', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('€245.12 · £80.00')).toBeVisible();
    await expect(page.getByText('Verified database record')).toBeVisible();
    await expect(page.getByText('€42.00 · $10.50')).toBeVisible();
    await expect(page.getByText('Not recorded').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Player' })).toHaveCount(0);
    await expect(page.getByRole('row')).toHaveCount(2);

    await page.getByRole('button', { name: 'Inactive (10)' }).click();
    await expect.poll(() => requests.at(-1)?.searchParams.get('status')).toBe('Inactive');

    await page.getByRole('button', { name: 'View' }).click();
    await expect(page.getByRole('heading', { name: 'Player Record' })).toBeVisible();
    await expect(page.getByText('Read-only values returned by the configured PostgreSQL replica.')).toBeVisible();
  });

  test('shows a retryable source error instead of stale or fabricated player rows', async ({ page }) => {
    let requests = 0;
    await page.route('**/api/players?**', async (route) => {
      requests += 1;
      await route.fulfill({
        status: 503,
        contentType: 'application/json',
        json: { success: false, error: 'Player data source is unavailable.' },
      });
    });

    await page.goto('/players');
    await expect(page.getByText('Player data is unavailable.')).toBeVisible();
    await expect(page.getByRole('row')).toHaveCount(0);
    const initialRequests = requests;
    await page.getByRole('button', { name: 'Retry loading real player data' }).click();
    await expect.poll(() => requests).toBe(initialRequests + 1);
  });

  test('rejects SQL dumps and imported rows with invented or missing source fields', async ({ request }) => {
    const sqlResponse = await request.post('/api/players/import', {
      data: { raw_content: 'INSERT INTO users_view VALUES (1);' },
    });
    expect(sqlResponse.status()).toBe(400);
    await expect(sqlResponse.json()).resolves.toMatchObject({
      success: false,
      error: 'Only CSV and JSON player exports are supported; SQL is not accepted.',
    });

    const incompleteResponse = await request.post('/api/players/import', {
      data: { raw_content: 'id,email\n1,record-1@invalid.test' },
    });
    expect(incompleteResponse.status()).toBe(400);
    await expect(incompleteResponse.json()).resolves.toMatchObject({
      success: false,
      error: 'Row 2: status must be Active, Inactive, Disabled, or Suspended.',
    });
  });
});
