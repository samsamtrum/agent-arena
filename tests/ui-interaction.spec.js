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
  await expect(page.getByRole('heading', { name: /AgentArena/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Battle Setup' })).toBeVisible();
  await expect(page.getByText('Source Reliability')).toBeVisible();
  await expect(page.getByText('Evidence Graph + Contradiction Detector')).toBeVisible();

  await page.getByLabel('Battle title').fill('UI QA Battle');
  await page.getByRole('button', { name: /^\+ Add$/ }).click();
  await expect(page.getByPlaceholder('Base token/project name')).toHaveCount(2);

  const names = page.getByPlaceholder('Base token/project name');
  await names.nth(1).fill('Manual UI QA Token');
  const contracts = page.getByPlaceholder('Paste Base token contract');
  await contracts.nth(1).fill('0x9999999999999999999999999999999999999999');

  await page.getByRole('button', { name: /Save Battle/i }).first().click();
  await expect(page.getByText('Battle saved locally.')).toBeVisible();

  await page.getByRole('button', { name: /Save Snapshot/i }).click();
  await expect(page.getByText(/Saved \d+ token snapshots/)).toBeVisible();

  await page.getByRole('button', { name: /Save Predictions/i }).click();
  await expect(page.getByText(/Saved \d+ prediction records/)).toBeVisible();

  const downloads = [];
  page.on('download', d => downloads.push(d));
  await page.getByRole('button', { name: /Download MD/i }).click();
  await page.getByRole('button', { name: /Download JSON/i }).click();
  await expect(page.getByText(/downloaded/i)).toBeVisible();
  expect(downloads.length).toBeGreaterThanOrEqual(2);

  await page.getByRole('button', { name: /^New$/ }).click();
  await expect(page.getByText('Started a fresh battle.')).toBeVisible();
});

test('invalid external scans show useful status instead of crashing', async ({ page }) => {
  await page.getByPlaceholder('Paste Base token contract').first().fill('not-an-address');
  await page.getByRole('button', { name: /Import$/ }).first().click();
  await expect(page.getByText('Paste a valid Base contract address.')).toBeVisible();

  await page.getByRole('button', { name: /Security Scan/i }).first().click();
  await expect(page.getByText('Paste/import a valid Base contract first.').first()).toBeVisible();

  await page.getByRole('button', { name: /Holder Scan/i }).first().click();
  await expect(page.getByText('Paste/import a valid Base contract first.').first()).toBeVisible();

  await page.getByRole('button', { name: /Whale Flow/i }).first().click();
  await expect(page.getByText('Add BaseScan API key first.').first()).toBeVisible();

  await page.getByRole('button', { name: /Farcaster/i }).first().click();
  await expect(page.getByText('Add Neynar API key first.').first()).toBeVisible();
});

test('strategy simulator, weight presets, saved battles and report sections remain interactive', async ({ page }) => {
  await page.getByText('Strategy Simulator').scrollIntoViewIfNeeded();
  const volume = page.locator('input[type="range"]').first();
  await volume.fill('2');
  await expect(page.getByText(/agent changes|No major agent vote/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Reset Scenario' }).click();

  const weightsPanel = page.locator('.weights-panel');
  await weightsPanel.scrollIntoViewIfNeeded();
  await weightsPanel.getByRole('button', { name: 'Builder' }).click();
  await expect(weightsPanel.getByRole('button', { name: 'Builder' })).toHaveClass(/active/);
  await weightsPanel.getByRole('button', { name: 'Reset' }).click();

  await page.getByText('Agent Report Export Pack').scrollIntoViewIfNeeded();
  await expect(page.getByText(/Export the full agent analysis/)).toBeVisible();
  await expect(page.getByText(/tasks/i).first()).toBeVisible();

  const savedBattlesPanel = page.locator('.history-panel');
  await savedBattlesPanel.scrollIntoViewIfNeeded();
  await savedBattlesPanel.getByRole('button', { name: /^Save$/ }).click();
  await expect(page.getByText('Battle saved locally.')).toBeVisible();
  await expect(page.locator('.history-item').first()).toBeVisible();
  await page.locator('.history-item').first().click();
  await expect(page.getByText(/Loaded /)).toBeVisible();
});

test('downloaded report files are valid and do not contain broken placeholders', async ({ page }) => {
  await page.getByPlaceholder('Base token/project name').first().fill('Report QA Token');
  await page.getByPlaceholder('Paste Base token contract').first().fill('0x9999999999999999999999999999999999999999');
  await page.getByPlaceholder('GitHub repo or URL').first().fill('facebook/react');
  const mdDownloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download MD/i }).click();
  const mdDownload = await mdDownloadPromise;
  const md = await mdDownload.createReadStream();
  const mdChunks = [];
  for await (const chunk of md) mdChunks.push(chunk);
  const mdText = Buffer.concat(mdChunks).toString('utf8');
  expect(mdDownload.suggestedFilename()).toMatch(/agentarena-.*-report\.md$/);
  expect(mdText).toContain('# AgentArena Battle Report');
  expect(mdText).toContain('## Source Reliability');
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
  const repoInput = page.getByPlaceholder('GitHub repo or URL').first();
  await repoInput.fill('facebook/react');
  await page.getByRole('button', { name: /^Repo$/i }).first().click();
  await expect(page.getByText('Imported facebook/react from GitHub.')).toBeVisible({ timeout: 20_000 });
  await expect(repoInput).toHaveValue('facebook/react');
  await expect(page.getByText(/stars/i).first()).toBeVisible();

  await repoInput.fill('definitely-not-a-real-owner-zzzz/not-a-real-repo-zzzz');
  await page.getByRole('button', { name: /^Repo$/i }).first().click();
  await expect(page.getByText(/GitHub repo not found or rate limited/)).toBeVisible({ timeout: 20_000 });
});

test('external API network failures surface in UI without crashing', async ({ page }) => {
  await page.route('**/api.dexscreener.com/**', route => route.fulfill({ status: 502, body: 'bad gateway' }));
  await page.route('**/api.geckoterminal.com/**', route => route.fulfill({ status: 404, body: 'not found' }));
  await page.route('**/api.gopluslabs.io/**', route => route.fulfill({ status: 429, body: 'rate limited' }));

  const contract = page.getByPlaceholder('Paste Base token contract').first();
  await contract.fill('0x4200000000000000000000000000000000000006');

  await page.getByRole('button', { name: /Import$/ }).first().click();
  await expect(page.getByText(/DexScreener request failed/)).toBeVisible();

  await page.locator('.project-form').first().getByRole('button', { name: /^Market$/i }).click();
  await expect(page.getByText(/GeckoTerminal request failed \(404\)/)).toBeVisible();

  await page.locator('.project-form').first().getByRole('button', { name: /Security Scan/i }).click();
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
      await expect(page.getByRole('heading', { name: /AgentArena/i })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Battle Setup' })).toBeVisible();
      await page.getByText('Agent Report Export Pack').scrollIntoViewIfNeeded();
      await expect(page.getByRole('button', { name: /Download MD/i })).toBeVisible();
      await page.getByText('Saved Battles').first().scrollIntoViewIfNeeded();
      await expect(page.locator('.history-panel').getByRole('button', { name: /^Save$/ })).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(12);
    });
  }
});
