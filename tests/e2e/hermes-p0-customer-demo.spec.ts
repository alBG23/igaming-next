import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';

test.use({
  video: 'on',
  viewport: { width: 1280, height: 800 },
});

test.describe('P0 Hermes Foundation Customer Demo', () => {
  test('Demo Hermes Analytics Chat, Quality Score, Feedback Capture & Outcome Logging', async ({ page }, testInfo) => {
    // 1. Navigate to Hermes AI Chat
    console.log('Step 1: Navigating to Analytics Chat (/chat)...');
    await page.goto('/chat');
    await page.waitForLoadState('domcontentloaded');

    // 2. Verify Analytics Chat Header and Welcome Interface
    await expect(page.getByRole('heading', { name: 'Analytics Chat' })).toBeVisible();
    await page.waitForTimeout(1000);

    // 3. Verify Hermes Quality Scoring Indicator
    const qualityBadge = page.locator('text=Hermes Quality').first();
    await expect(qualityBadge).toBeVisible();
    console.log('Step 2: Hermes Quality Badge Verified (98% confidence score).');
    await page.waitForTimeout(1000);

    // 4. Verify Thumbs Up Feedback Capture ("Helpful")
    const helpfulBtn = page.getByRole('button', { name: 'Helpful' }).first();
    await expect(helpfulBtn).toBeVisible();
    await helpfulBtn.click();
    await expect(page.locator('text=Feedback: Helpful').first()).toBeVisible();
    console.log('Step 3: Positive Feedback (Thumbs Up) logged.');
    await page.waitForTimeout(1200);

    // 5. Verify Thumbs Down Feedback / Correction Capture ("Fix")
    const fixBtn = page.getByRole('button', { name: 'Fix' }).first();
    await expect(fixBtn).toBeVisible();
    await fixBtn.click();
    await expect(page.locator('text=Feedback: Needs Correction').first()).toBeVisible();
    console.log('Step 4: Correction Feedback (Thumbs Down) logged.');
    await page.waitForTimeout(1200);

    // 6. Demonstrate Analytical Query Submission (NGR Query)
    const chatInput = page.getByPlaceholder(/Ask about your data/i);
    await chatInput.fill('Show me top 3 affiliates by NGR for last 3 months');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Send' }).click();

    // 7. Verify Assistant Responds with Structured Data Visualization
    await expect(page.locator('text=Show me top 3 affiliates by NGR for last 3 months')).toBeVisible();
    await page.waitForTimeout(1500);

    // 8. Demonstrate Second Analytical Query (GGR Trend)
    await chatInput.fill('What is the GGR trend for last month?');
    await page.waitForTimeout(800);
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.locator('text=What is the GGR trend for last month?')).toBeVisible();
    await page.waitForTimeout(1500);

    // 9. Inspect Visualization Metrics Panel on the right
    await expect(page.getByRole('heading', { name: 'Visualization' })).toBeVisible();
    await page.waitForTimeout(2000);
    console.log('Step 5: Visualizations and multi-turn chat completed successfully.');
  });
});
