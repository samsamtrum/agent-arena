import test from 'node:test';
import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key),
  clear: () => store.clear()
};

const core = await import('../src/core/index.js');

const baseProject = {
  name: 'Alpha Base Agent',
  symbol: 'ABA',
  chain: 'Base',
  contract: '0x1111111111111111111111111111111111111111',
  price: 0.01,
  marketCap: 1_200_000,
  volume: 180_000,
  liquidity: 220_000,
  priceChange24h: 24,
  buys24h: 420,
  sells24h: 260,
  mentions: 120,
  risk: 24,
  repo: 'base/agent-arena',
  repoUrl: 'https://github.com/base/agent-arena',
  stars: 1400,
  forks: 120,
  commits: 320,
  openIssues: 18,
  pushedAt: new Date().toISOString(),
  pairUrl: 'https://dexscreener.com/base/0x2222222222222222222222222222222222222222',
  pairAddress: '0x2222222222222222222222222222222222222222',
  lpStatus: 'locked',
  lpProof: 'https://example.com/lp-lock',
  website: 'https://example.com',
  docs: 'https://example.com/docs',
  xLink: 'https://x.com/example',
  socialKeyword: 'Base AI agent',
  tagline: 'Base AI agents battle tokens',
  narrative: 'AI agent council for Base token discovery',
  mentionText: 'bullish Base AI agent alpha\nthis Base token looks strong\ncommunity is cooking\nagent narrative is based',
  gecko: { volume: 176000, liquidity: 214000, marketCap: 1180000, pairAddress: '0x2222222222222222222222222222222222222222' },
  security: { owner_address: '0x5555555555555555555555555555555555555555' },
  deployerAddress: '0x5555555555555555555555555555555555555555',
  deployerScan: { address: '0x5555555555555555555555555555555555555555', txCount: 24, contractCreations: 1, recentTx: 2, outboundEth: 0.4, firstTxAt: '2025-01-01T00:00:00.000Z' },
  farcasterScan: { query: 'Base AI agent', castCount: 32, uniqueAuthors: 18, bullish: 9, bearish: 1, sentiment: 'Bullish', spamScore: 10, phrases: ['ai', 'agent', 'base'] },
  transferFlow: { transferCount: 92, uniqueWallets: 54, largeTransferCount: 2, netToTopWalletPct: 4.2, exchangeLikeCount: 1, totalObserved: 100000, medianTransfer: 300, topNetWallet: '0x6666666666666666666666666666666666666666', sample: [
    { from: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', to: '0x6666666666666666666666666666666666666666' },
    { from: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', to: '0x6666666666666666666666666666666666666666' },
    { from: '0xcccccccccccccccccccccccccccccccccccccccc', to: '0x7777777777777777777777777777777777777777' },
    { from: '0xdddddddddddddddddddddddddddddddddddddddd', to: '0x7777777777777777777777777777777777777777' },
    { from: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', to: '0x7777777777777777777777777777777777777777' },
    { from: '0xffffffffffffffffffffffffffffffffffffffff', to: '0x7777777777777777777777777777777777777777' }
  ] },
  holders: {
    supply: 1000000,
    holderCount: 1800,
    topHolders: [
      { TokenHolderAddress: '0x6666666666666666666666666666666666666666', TokenHolderQuantity: 80000 },
      { TokenHolderAddress: '0x8888888888888888888888888888888888888888', TokenHolderQuantity: 60000 },
      { TokenHolderAddress: '0x9999999999999999999999999999999999999999', TokenHolderQuantity: 50000 },
      { TokenHolderAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', TokenHolderQuantity: 40000 },
      { TokenHolderAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', TokenHolderQuantity: 30000 },
      { TokenHolderAddress: '0xcccccccccccccccccccccccccccccccccccccccc', TokenHolderQuantity: 20000 },
      { TokenHolderAddress: '0xdddddddddddddddddddddddddddddddddddddddd', TokenHolderQuantity: 15000 },
      { TokenHolderAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', TokenHolderQuantity: 12000 },
      { TokenHolderAddress: '0xffffffffffffffffffffffffffffffffffffffff', TokenHolderQuantity: 10000 },
      { TokenHolderAddress: '0x1212121212121212121212121212121212121212', TokenHolderQuantity: 8000 }
    ]
  }
};

const weakProject = {
  name: 'Thin Risk Token',
  symbol: 'THIN',
  chain: 'Base',
  contract: '0x3333333333333333333333333333333333333333',
  price: 0.001,
  marketCap: 50_000,
  volume: 2_000,
  liquidity: 3_000,
  priceChange24h: -30,
  buys24h: 12,
  sells24h: 30,
  mentions: 2,
  risk: 85,
  pairUrl: '',
  pairAddress: '',
  lpStatus: 'unlocked',
  mentionText: 'rug warning\nlooks bearish\navoid this scam'
};

test('scoring rewards stronger market/builder data and penalizes weak risk', () => {
  const strong = core.scoreProject(baseProject);
  const weak = core.scoreProject(weakProject);
  assert.ok(strong.final > weak.final, `${strong.final} should beat ${weak.final}`);
  assert.ok(strong.market > weak.market);
  assert.ok(strong.safety > weak.safety);
  assert.ok(strong.confidence > weak.confidence);
});

test('consensus activates risk veto when Risk Agent is bearish with high confidence', () => {
  const weakScored = { ...weakProject, scores: core.scoreProject(weakProject) };
  const baseScored = { ...baseProject, scores: core.scoreProject(baseProject) };
  const kernels = core.agentKernel(weakScored, baseScored);
  const consensus = core.consensusFromKernels(kernels);
  const risk = kernels.find(k => k.name === 'Risk Agent');
  assert.equal(risk.vote, 'Bearish');
  assert.ok(consensus.riskVeto);
});


test('market cross-check rewards aligned second-source data and flags mismatches', () => {
  const aligned = core.marketCrossCheck(baseProject);
  const mismatch = core.marketCrossCheck({ ...baseProject, gecko: { volume: 20_000, liquidity: 30_000, marketCap: 300_000, pairAddress: '0x4444444444444444444444444444444444444444' } });
  assert.equal(aligned.confidence, 'High');
  assert.ok(aligned.score > mismatch.score);
  assert.ok(mismatch.flags.some(f => f.label.includes('mismatch')));
});

test('source plugin coverage rises with connected sources', () => {
  const strong = core.sourcePlugins(baseProject);
  const weak = core.sourcePlugins(weakProject);
  assert.ok(strong.coverage > weak.coverage, `${strong.coverage} should beat ${weak.coverage}`);
  assert.ok(strong.plugins.some(p => p.name.includes('DexScreener') && p.status === 'connected'));
});

test('social mention scanner detects bullish tone and spam repetition', () => {
  const bullish = core.analyzeMentionsText('bullish alpha\nbase agent will send\nstrong community', 'agent');
  const spam = core.analyzeMentionsText('moon moon moon\nmoon moon moon\nmoon moon moon', 'token');
  assert.equal(bullish.sentiment, 'Bullish');
  assert.ok(spam.spamScore > 0);
  assert.ok(spam.flags.some(f => f.label === 'Keyword missing'));
});





test('holder distribution computes top tiers and flags dangerous concentration', () => {
  const healthy = core.holderDistribution(baseProject);
  const dangerous = core.holderDistribution({ ...baseProject, holders: { supply: 1000000, holderCount: 80, topHolders: [
    { TokenHolderAddress: baseProject.deployerAddress, TokenHolderQuantity: 320000 },
    { TokenHolderAddress: '0x6666666666666666666666666666666666666666', TokenHolderQuantity: 180000 },
    { TokenHolderAddress: '0x7777777777777777777777777777777777777777', TokenHolderQuantity: 140000 },
    { TokenHolderAddress: '0x8888888888888888888888888888888888888888', TokenHolderQuantity: 90000 },
    { TokenHolderAddress: '0x9999999999999999999999999999999999999999', TokenHolderQuantity: 80000 }
  ] } });
  assert.equal(healthy.tier, 'Healthy');
  assert.ok(dangerous.score < healthy.score);
  assert.ok(dangerous.flags.some(f => f.label === 'Owner/deployer is top holder'));
});

test('wallet label intelligence classifies owner, deployer, whale receiver, LP pair, and router-like hubs', () => {
  const labels = core.walletLabelIntel(baseProject);
  const summaries = labels.labels.flatMap(x => x.labels);
  assert.ok(summaries.includes('Owner'));
  assert.ok(summaries.includes('Deployer'));
  assert.ok(summaries.includes('Whale Receiver'));
  assert.ok(summaries.includes('LP Pair'));
  assert.ok(summaries.includes('Router-like'));
  assert.ok(labels.count >= 4);
});

test('Farcaster intel rewards broad real social traction and whale flow flags concentration', () => {
  const social = core.farcasterIntel(baseProject);
  const weakSocial = core.farcasterIntel({ ...baseProject, farcasterScan: { castCount: 3, uniqueAuthors: 1, bullish: 0, bearish: 4, sentiment: 'Bearish', spamScore: 70 } });
  const flow = core.whaleFlowIntel(baseProject);
  const concentrated = core.whaleFlowIntel({ ...baseProject, transferFlow: { transferCount: 30, uniqueWallets: 8, largeTransferCount: 8, netToTopWalletPct: 28, exchangeLikeCount: 0 } });
  assert.ok(social.score > weakSocial.score);
  assert.ok(flow.score > concentrated.score);
  assert.ok(concentrated.flags.some(f => f.label === 'Whale accumulation risk'));
});

test('deployer intelligence scores scanned deployer history and flags factory-like wallets', () => {
  const clean = core.deployerIntel(baseProject);
  const factory = core.deployerIntel({ ...baseProject, deployerScan: { txCount: 100, contractCreations: 12, recentTx: 40, outboundEth: 5 } });
  assert.ok(clean.score > factory.score, `${clean.score} should beat ${factory.score}`);
  assert.ok(factory.flags.some(f => f.label === 'Many contract creations'));
});

test('LP auto confidence improves with pair, liquidity, and lock proof', () => {
  const strong = core.lpAutoIntel(baseProject);
  const weak = core.lpAutoIntel(weakProject);
  assert.ok(strong.confidence > weak.confidence, `${strong.confidence} should beat ${weak.confidence}`);
  assert.ok(strong.flags.some(f => f.label === 'Pair address detected'));
  assert.ok(weak.flags.some(f => f.level === 'danger'));
});

test('risk rule pack gates attractive scores when critical evidence is missing or dangerous', () => {
  const missingScans = { ...baseProject, security: null, holders: null, gecko: null, scores: core.scoreProject({ ...baseProject, security: null, holders: null, gecko: null }) };
  const missingIntel = core.tokenIntelligence(missingScans);
  assert.notEqual(missingIntel.label, 'Safe to Watch');
  assert.ok(missingIntel.penalty > 0);
  assert.ok(missingIntel.penaltyBreakdown.some(x => x.label.includes('Missing')));

  const risky = { ...baseProject, priceChange24h: 88, transferFlow: { transferCount: 22, uniqueWallets: 5, largeTransferCount: 9, netToTopWalletPct: 35, ownerOutPct: 28, exchangeLikeCount: 0 }, holders: { supply: 1000000, holderCount: 70, topHolders: [{ TokenHolderAddress: baseProject.deployerAddress, TokenHolderQuantity: 420000 }] } };
  risky.scores = core.scoreProject(risky);
  const riskyIntel = core.tokenIntelligence(risky);
  assert.ok(['High Risk', 'Avoid'].includes(riskyIntel.label));
  assert.ok(riskyIntel.penaltyBreakdown.some(x => /Holder|Suspicious|Price/.test(x.label)));
});

test('report export includes winner, ranking, evidence, and tasks', () => {
  const ranked = [baseProject, weakProject].map(p => ({ ...p, scores: core.scoreProject(p) })).sort((a, b) => b.scores.final - a.scores.final);
  const winner = ranked[0];
  const kernels = core.agentKernel(winner, ranked[1]);
  const consensus = core.consensusFromKernels(kernels);
  const debate = core.agentDebate(kernels, consensus, winner);
  const review = core.selfReview(winner, kernels, consensus, '');
  const trends = Object.fromEntries(ranked.map(p => [core.projectId(p), { status: 'New', level: 'neutral', summary: 'No previous snapshot yet.' }]));
  const tasks = core.agentTasks(ranked, ranked, trends);
  const backtest = { stats: {}, resolved: [] };
  const scenarioResult = core.scenarioAnalysis(winner, ranked[1], { volumeMultiplier: 1, liquidityMultiplier: 1, mentionsMultiplier: 1, priceMoveDelta: 0, riskDelta: 0, lpStatus: 'same', socialBoost: false });
  const data = core.buildReportData({ ranked, winner, kernels, consensus, debate, review, tasks, backtest, scenarioResult, weights: core.DEFAULT_WEIGHTS });
  const md = core.reportMarkdown(data);
  assert.match(md, /AgentArena Token Report/);
  assert.match(md, /Verdict/);
  assert.match(md, /Evidence Summary/);
  assert.match(md, /Decision Gate \/ Penalty Breakdown/);
  assert.match(md, /Evidence Trail/);
  assert.doesNotThrow(() => JSON.stringify(data));
});
