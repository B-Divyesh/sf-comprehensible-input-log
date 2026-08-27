import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('logs, edits, charts, and persists an observation', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await page.getByRole('button', { name: 'Log your first source' }).click();
  await page.getByLabel('Source title *').fill('Easy German episode 12');
  await page.getByLabel('Language').fill('German');
  await page.getByLabel('Amount *').fill('18');
  await page.locator('input[name="comprehension"][value="4"]').check({ force: true });
  await page.getByLabel('Unknown word 1').fill('trotzdem');
  await page.getByRole('button', { name: 'Save observation' }).click();
  await expect(page.getByRole('heading', { name: 'Easy German episode 12' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Easy German episode 12' }).click();
  await page.getByLabel('A note for next time optional').fill('Replay once without captions.');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.locator('.entry-notes')).toHaveText('Replay once without captions.');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Easy German episode 12' })).toBeVisible();
  await page.getByRole('button', { name: 'Trends' }).click();
  await expect(page.getByRole('heading', { name: 'One more point starts a trend' })).toBeVisible();
});

test('imports a backup with confirmation and exports it again', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'data ownership round trip is viewport-independent');
  const entry = {
    id: 'imported-1', title: 'Imported short story', language: 'Spanish', sourceType: 'book', amount: 6,
    amountUnit: 'pages', comprehension: 3, words: ['aunque'], status: 'finished', date: '2026-08-20', notes: '',
    createdAt: '2026-08-20T12:00:00.000Z', updatedAt: '2026-08-20T12:00:00.000Z',
  };
  await page.getByRole('button', { name: 'Trends' }).click();
  await page.locator('#import-file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ product: 'comprehensible-input-log', version: 1, exportedAt: '2026-08-21T00:00:00.000Z', entries: [entry] })) });
  await expect(page.getByText('The file contains 1 observation.')).toBeVisible();
  await page.getByRole('button', { name: 'Replace and import' }).click();
  await page.getByRole('button', { name: 'Journal' }).click();
  await expect(page.getByRole('heading', { name: 'Imported short story' })).toBeVisible();
  await page.getByRole('button', { name: 'Trends' }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^input-log-.*\.json$/);
});

test('has no serious accessibility violations on empty and dialog states', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'desktop axe coverage is sufficient');
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Log your first source' }).click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});

test('works from the service worker while offline', async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'covered once in Chromium to avoid two workers racing the shared preview origin');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller);
  await page.waitForTimeout(500);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Find input that');
  await expect(page.getByText('Offline — your log still saves on this device.')).toBeVisible();
});
