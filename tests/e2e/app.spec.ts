import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const today = new Date().toISOString().slice(0, 10);

async function openDemo(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/demo');
  await expect(page.getByTestId('demo-banner')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: 'Log language input you understand' })).toBeVisible();
}

async function showTrends(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Trends' }).click();
  await expect(page.getByRole('heading', { level: 1, name: 'See your understanding trend' })).toBeVisible();
}

test('logs, edits, charts, and persists a source', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'Log language input you understand' })).toHaveCount(1);
  await page.getByRole('button', { name: 'Log a source' }).last().click();
  await page.getByLabel('Source title *').fill('Easy German episode 12');
  await page.getByLabel('Language', { exact: true }).fill('German');
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
  await showTrends(page);
  await expect(page.getByRole('heading', { name: 'One more source starts a trend' })).toBeVisible();
});

test('rejects impossible import dates without changing the current log', async ({ page }) => {
  await openDemo(page);
  await showTrends(page);
  const invalid = {
    product: 'comprehensible-input-log', version: 1, exportedAt: `${today}T00:00:00.000Z`,
    entries: [{ id: 'bad-date', title: 'Impossible date', language: 'German', sourceType: 'book', amount: 2, amountUnit: 'pages', comprehension: 3, words: [], status: 'finished', date: '2026-99-99', notes: '', createdAt: '2026-08-20T12:00:00.000Z', updatedAt: '2026-08-20T12:00:00.000Z' }],
  };
  await page.locator('#import-file').setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(invalid)) });
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.locator('#live-region')).toContainText('incomplete or invalid');
  await page.getByRole('button', { name: 'Log', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Easy German: At the weekly market' })).toBeVisible();
});

test('has no serious accessibility violations on the demo and dialog states', async ({ page }) => {
  await openDemo(page);
  let results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
  await page.getByRole('button', { name: 'Log a source' }).first().click();
  results = await new AxeBuilder({ page }).analyze();
  expect(results.violations.filter(v => ['serious', 'critical'].includes(v.impact ?? ''))).toEqual([]);
});

test('@claim:source-agnostic-log logs multiple types of language source', async ({ page }) => {
  await openDemo(page);
  await expect(page.locator('.entry-card')).toHaveCount(4);
  await expect(page.locator('.entry-meta')).toContainText(['article', 'video', 'book', 'podcast']);
  await page.getByRole('button', { name: 'Log a source' }).first().click();
  await page.getByLabel('Source title *').fill('A learner-made audio note');
  await page.getByLabel('Amount *').fill('3');
  await page.getByRole('radio', { name: 'Other' }).check({ force: true });
  await page.locator('input[name="comprehension"][value="3"]').check({ force: true });
  await page.getByRole('button', { name: 'Save observation' }).click();
  await expect(page.getByRole('heading', { name: 'A learner-made audio note' })).toBeVisible();
});

test('@claim:demo-isolation keeps sample records out of the real log', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Log a source' }).last().click();
  await page.getByLabel('Source title *').fill('Real-only source');
  await page.getByLabel('Amount *').fill('6');
  await page.locator('input[name="comprehension"][value="4"]').check({ force: true });
  await page.getByRole('button', { name: 'Save observation' }).click();
  await page.getByRole('link', { name: 'Demo' }).click();
  await expect(page.getByTestId('demo-banner')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Easy German: At the weekly market' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Real-only source' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Log a source' }).first().click();
  await page.getByLabel('Source title *').fill('Demo-only source');
  await page.getByLabel('Amount *').fill('3');
  await page.locator('input[name="comprehension"][value="3"]').check({ force: true });
  await page.getByRole('button', { name: 'Save observation' }).click();
  await expect(page.getByRole('heading', { name: 'Demo-only source' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'Demo-only source' })).toHaveCount(0);
  await expect(page.locator('.entry-card')).toHaveCount(4);
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page.getByRole('heading', { name: 'Real-only source' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Easy German: At the weekly market' })).toHaveCount(0);
});

test('sets route-specific titles and shows a designed missing-page screen', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Comprehensible Input Log — Choose language input');
  await page.goto('/demo');
  await expect(page).toHaveTitle('Demo — Comprehensible Input Log');
  await page.goto('/privacy');
  await expect(page).toHaveTitle('Privacy — Comprehensible Input Log');
  await page.goto('/terms');
  await expect(page).toHaveTitle('Terms — Comprehensible Input Log');
  await page.goto('/not-a-page');
  await expect(page).toHaveTitle('Page not found — Comprehensible Input Log');
  await expect(page.getByRole('heading', { name: 'This page was not found' })).toBeVisible();
});

test('@claim:subjective-ratings describes ratings as personal, not proficiency scores', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Log a source' }).first().click();
  await expect(page.getByText('Choose from memory. This is a personal observation, not a proficiency score.')).toBeVisible();
  await page.locator('input[name="comprehension"][value="4"]').check({ force: true });
  await expect(page.getByRole('radio', { name: /Almost all/ })).toBeChecked();
});

test('@claim:trend-guidance shows a trend and next-source suggestion', async ({ page }) => {
  await openDemo(page);
  await expect(page.getByRole('heading', { name: 'Stay in this useful range' })).toBeVisible();
  await showTrends(page);
  await expect(page.getByRole('heading', { name: 'Understanding over time' })).toBeVisible();
  await expect(page.getByText('Trending more understandable')).toBeVisible();
});

test('@claim:browser-local-persistence keeps a demo entry after reload', async ({ page }) => {
  await openDemo(page);
  await page.getByRole('button', { name: 'Log a source' }).first().click();
  await page.getByLabel('Source title *').fill('Reload check source');
  await page.getByLabel('Amount *').fill('9');
  await page.locator('input[name="comprehension"][value="4"]').check({ force: true });
  await page.getByRole('button', { name: 'Save observation' }).click();
  await expect(page.getByRole('heading', { name: 'Reload check source' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Reload check source' })).toBeVisible();
});

test('@claim:offline-reload works offline after the first demo visit', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('/demo');
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker?.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1, name: 'Log language input you understand' })).toBeVisible();
  await expect(page.getByText('Offline — your log still saves on this device.')).toBeVisible();
  await context.close();
});

test('@claim:json-backup exports every demo source as JSON', async ({ page }) => {
  await openDemo(page);
  await showTrends(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON' }).click();
  const download = await downloadPromise;
  const content = await (await download.createReadStream())!.toArray();
  const exported = JSON.parse(Buffer.concat(content).toString('utf8'));
  expect(exported.entries).toHaveLength(4);
  expect(exported.entries.map((entry: { title: string }) => entry.title)).toContain('Easy German: At the weekly market');
});

test('@claim:csv-export exports a header and one row for each demo source', async ({ page }) => {
  await openDemo(page);
  await showTrends(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export CSV' }).click();
  const download = await downloadPromise;
  const content = await (await download.createReadStream())!.toArray();
  const lines = Buffer.concat(content).toString('utf8').trim().split('\n');
  expect(lines[0]).toBe('date,title,language,sourceType,amount,amountUnit,comprehension,status,words,notes');
  expect(lines).toHaveLength(5);
});

test('@claim:import-confirmation previews replacement before importing', async ({ page }) => {
  await openDemo(page);
  await showTrends(page);
  const replacement = {
    id: 'imported-1', title: 'Imported short story', language: 'Spanish', sourceType: 'book', amount: 6,
    amountUnit: 'pages', comprehension: 3, words: ['aunque'], status: 'finished', date: '2026-08-20', notes: '',
    createdAt: '2026-08-20T12:00:00.000Z', updatedAt: '2026-08-20T12:00:00.000Z',
  };
  await page.locator('#import-file').setInputFiles({ name: 'backup.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ product: 'comprehensible-input-log', version: 1, exportedAt: '2026-08-21T00:00:00.000Z', entries: [replacement] })) });
  await expect(page.getByRole('dialog')).toContainText('The file contains 1 source.');
  await expect(page.getByRole('heading', { name: 'Replace this demo log?' })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await page.getByRole('button', { name: 'Log', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Easy German: At the weekly market' })).toBeVisible();
});

test('@claim:free-no-account opens the demo without sign-in or payment', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Free to use')).toBeVisible();
  await expect(page.getByRole('button', { name: /sign in|log in|pay/i })).toHaveCount(0);
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.getByTestId('demo-banner')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Easy German: At the weekly market' })).toBeVisible();
});

test('@claim:no-account-analytics keeps demo traffic on this site', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await openDemo(page);
  await showTrends(page);
  expect(requests.length).toBeGreaterThan(0);
  expect(requests.every(url => new URL(url).origin === new URL(page.url()).origin)).toBe(true);
});

test('@claim:no-media-uploads saves a demo source without sending a request', async ({ page }) => {
  await openDemo(page);
  const writes: string[] = [];
  page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) writes.push(`${request.method()} ${request.url()}`); });
  await page.getByRole('button', { name: 'Log a source' }).first().click();
  await page.getByLabel('Source title *').fill('No upload check');
  await page.getByLabel('Amount *').fill('4');
  await page.locator('input[name="comprehension"][value="3"]').check({ force: true });
  await page.getByRole('button', { name: 'Save observation' }).click();
  await expect(page.getByRole('heading', { name: 'No upload check' })).toBeVisible();
  expect(writes).toEqual([]);
});
