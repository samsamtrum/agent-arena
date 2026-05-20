import { test, expect } from '@playwright/test';

const noRuntimeErrors = [];

async function installErrorWatch(page) {
  noRuntimeErrors.length = 0;
  page.on('console', msg => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (/favicon|Failed to load resource: the server responded with a status of (404|502|429)/i.test(text)) return;
    noRuntimeErrors.push(text);
  });
  page.on('pageerror', err => noRuntimeErrors.push(err.message));
}

test.beforeEach(async ({ page }) => {
  await installErrorWatch(page);
  await page.goto('/');
});

test.afterEach(async () => {
  expect(noRuntimeErrors).toEqual([]);
});

test('loads dashboard, edits battle, saves memory, exports reports', async ({ page }) => {
  await expect(page.getByRole('heading', { name: /Analyze one Base token/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Paste contract and run analysis' })).toBeVisible();
  await expect(page.getByText('Step 4')).toBeVisible();

  await page.getByLabel('Battle title').fill('UI QA Battle');
  await page.getByRole('button', { name: /^\+ Compare another token$/ }).click();
  await expect(page.getByPlaceholder('0x... Base token contract')).toHaveCount(2);

  const contracts = page.getByPlaceholder('0x... Base token contract');
  await contracts.nth(1).fill('0x9999999999999999999999999999999999999999');

  const downloads = [];
  page.on('download', d => downloads.push(d));
  await page.getByRole('button', { name: /Download MD/i }).click();
  await page.getByRole('button', { name: /Download JSON/i }).click();
  await expect(page.getByText(/downloaded/i).first()).toBeVisible();
  expect(downloads.length).toBeGreaterThanOrEqual(2);

  await page.getByRole('button', { name: /^\+ Compare another token$/ }).click();
  await expect(page.getByPlaceholder('0x... Base token contract')).toHaveCount(3);
});

test('invalid external scans show useful status instead of crashing', async ({ page }) => {
  await page.getByPlaceholder('0x... Base token contract').first().fill('not-an-address');
  await page.getByRole('button', { name: /Import only/i }).first().click();
  await expect(page.getByText('Paste a valid Base contract address.')).toBeVisible();

  await page.locator('.token-card').first().getByRole('button', { name: /^Security$/i }).click();
  await expect(page.getByText('Paste/import a valid Base contract first.').first()).toBeVisible();

  await page.locator('.token-card').first().getByRole('button', { name: /^Holders$/i }).click();
  await expect(page.getByText('Paste/import a valid Base contract first.').first()).toBeVisible();

  await page.locator('.token-card').first().getByRole('button', { name: /Whale flow/i }).click();
  await expect(page.getByText('Add BaseScan API key first.').first()).toBeVisible();

  await page.locator('.token-card').first().getByRole('button', { name: /Farcaster/i }).click();
  await expect(page.getByText('Add Neynar API key first.').first()).toBeVisible();
});

test('core export section remains interactive in simplified UI', async ({ page }) => {
  await page.getByText('Step 4').scrollIntoViewIfNeeded();
  await expect(page.getByText(/Reports include ranking/)).toBeVisible();
  await page.getByRole('button', { name: /Download JSON/i }).click();
  await expect(page.getByText(/downloaded/i).first()).toBeVisible();
});

test('downloaded report files are valid and do not contain broken placeholders', async ({ page }) => {
  await page.getByPlaceholder('0x... Base token contract').first().fill('0x9999999999999999999999999999999999999999');
  await page.getByPlaceholder('owner/repo or GitHub URL').first().fill('facebook/react');
  const mdDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download MD/i }).click();
  const mdDownload = await mdDownloadPromise;
  const md = await mdDownload.createReadStream();
  const mdChunks = [];
  for await (const chunk of md) mdChunks.push(chunk);
  const mdText = Buffer.concat(mdChunks).toString('utf8');
  expect(mdDownload.suggestedFilename()).toMatch(/agentarena-.*-report\.md$/);
  expect(mdText).toContain('# AgentArena Token Report');
  expect(mdText).toContain('## Verdict');
  expect(mdText).toContain('## Evidence Summary');
  expect(mdText).toContain('## Decision Gate / Penalty Breakdown');
  expect(mdText).toContain('## Token Identity / Pair Integrity');
  expect(mdText).toContain('Identity score:');
  expect(mdText).toContain('## Liquidity Exit Risk / Pool Health');
  expect(mdText).toContain('Exit safety:');
  expect(mdText).toContain('## Base Contract Risk');
  expect(mdText).toContain('Tax matrix:');
  expect(mdText).toContain('## Verdict Trace / Why This Result');
  expect(mdText).toContain('Pull up:');
  expect(mdText).toContain('## Scan Readiness / Evidence Gaps');
  expect(mdText).toContain('Next best scan:');
  expect(mdText).toContain('## Adversarial Risk Simulation');
  expect(mdText).toContain('Pre-rug proximity:');
  expect(mdText).toContain('## Confidence Calibration');
  expect(mdText).toContain('Evidence tier:');
  expect(mdText).toContain('## Re-scan Intelligence');
  expect(mdText).toContain('## Risk Cards');
  expect(mdText).toContain('## Remediation Queue');
  expect(mdText).toContain('## Next Agent Tasks');
  expect(mdText).not.toMatch(/undefined|NaN|\[object Object\]/);

  const jsonDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download JSON/i }).click();
  const jsonDownload = await jsonDownloadPromise;
  const json = await jsonDownload.createReadStream();
  const jsonChunks = [];
  for await (const chunk of json) jsonChunks.push(chunk);
  const report = JSON.parse(Buffer.concat(jsonChunks).toString('utf8'));
  expect(jsonDownload.suggestedFilename()).toMatch(/agentarena-.*-report\.json$/);
  expect(report.winner).toBeTruthy();
  expect(report.ranking.length).toBeGreaterThanOrEqual(1);
  expect(report.ranking[0].reliability).toBeTruthy();
  expect(report.tasks.length).toBeGreaterThan(0);
});

test('GitHub import live updates builder fields and bad repos show status', async ({ page }) => {
  const repoInput = page.getByPlaceholder('owner/repo or GitHub URL').first();
  await repoInput.fill('facebook/react');
  await page.locator('.token-card').first().getByRole('button', { name: /^Repo$/i }).click();
  await expect(page.getByText('Imported facebook/react from GitHub.')).toBeVisible({ timeout: 20_000 });
  await expect(repoInput).toHaveValue('facebook/react');
  await expect(page.locator('.token-card').first().getByRole('button', { name: /^Repo$/i })).toBeVisible();

  await repoInput.fill('definitely-not-a-real-owner-zzzz/not-a-real-repo-zzzz');
  await page.locator('.token-card').first().getByRole('button', { name: /^Repo$/i }).click();
  await expect(page.getByText(/GitHub repo not found or rate limited/)).toBeVisible({ timeout: 20_000 });
});

test('external API network failures surface in UI without crashing', async ({ page }) => {
  await page.route('**/api.dexscreener.com/**', route => route.fulfill({ status: 502, body: 'bad gateway' }));
  await page.route('**/api.geckoterminal.com/**', route => route.fulfill({ status: 404, body: 'not found' }));
  await page.route('**/api.gopluslabs.io/**', route => route.fulfill({ status: 429, body: 'rate limited' }));

  const contract = page.getByPlaceholder('0x... Base token contract').first();
  await contract.fill('0x4200000000000000000000000000000000000006');

  await page.getByRole('button', { name: /Import only/i }).first().click();
  await expect(page.getByText(/DexScreener request failed/)).toBeVisible();

  await page.locator('.token-card').first().getByRole('button', { name: /^Market$/i }).click();
  await expect(page.getByText(/GeckoTerminal request failed \(404\)/)).toBeVisible();

  await page.locator('.token-card').first().getByRole('button', { name: /^Security$/i }).click();
  await expect(page.getByText(/Security request failed \(429\)/)).toBeVisible();
});

test.describe('responsive smoke', () => {
  for (const viewport of [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop-wide', width: 1440, height: 900 }
  ]) {
    test(`${viewport.name} viewport keeps core panels usable`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.reload();
      await expect(page.getByRole('heading', { name: /Analyze one Base token/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Paste contract and run analysis' })).toBeVisible();
      await page.getByText('Step 4').scrollIntoViewIfNeeded();
      await expect(page.getByRole('button', { name: /Download MD/i })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(12);
    });
  }
});
