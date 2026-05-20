import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key),
  clear: () => store.clear()
};

const core = await import('../src/core/index.js');

const project = {
  name: 'Audit Agent Token',
  symbol: 'AUDIT',
  chain: 'Base',
  contract: '0x1111111111111111111111111111111111111111',
  price: 0.012,
  marketCap: 1_500_000,
  volume: 220_000,
  liquidity: 180_000,
  priceChange24h: 18,
  buys24h: 520,
  sells24h: 310,
  mentions: 160,
  risk: 28,
  repo: 'base/audit-agent-token',
  repoUrl: 'https://github.com/base/audit-agent-token',
  stars: 980,
  forks: 90,
  commits: 260,
  openIssues: 14,
  pushedAt: new Date().toISOString(),
  pairUrl: 'https://dexscreener.com/base/0x2222222222222222222222222222222222222222',
  pairAddress: '0x2222222222222222222222222222222222222222',
  lpStatus: 'locked',
  lpProof: 'https://example.com/lp-lock',
  website: 'https://example.com',
  docs: 'https://example.com/docs',
  xLink: 'https://x.com/example',
  socialKeyword: 'Base AI audit token',
  tagline: 'Base AI token risk analytics',
  narrative: 'AI token intelligence for Base projects',
  mentionText: 'bullish Base AI token analytics\nstrong community\nagent narrative on Base\nreal product shipping',
  gecko: { volume: 216000, liquidity: 176000, marketCap: 1480000, pairAddress: '0x2222222222222222222222222222222222222222' },
  security: { owner_address: '0x5555555555555555555555555555555555555555', is_honeypot: '0', is_blacklisted: '0', is_open_source: '1' },
  deployerAddress: '0x5555555555555555555555555555555555555555',
  deployerScan: { address: '0x5555555555555555555555555555555555555555', txCount: 42, contractCreations: 1, recentTx: 3, outboundEth: 0.5, firstTxAt: '2025-01-01T00:00:00.000Z' },
  farcasterScan: { query: 'Base AI audit token', castCount: 40, uniqueAuthors: 24, bullish: 11, bearish: 2, sentiment: 'Bullish', spamScore: 12, phrases: ['base', 'ai', 'analytics'] },
  transferFlow: {
    transferCount: 100,
    uniqueWallets: 62,
    largeTransferCount: 2,
    netToTopWalletPct: 6,
    exchangeLikeCount: 1,
    totalObserved: 100000,
    medianTransfer: 350,
    topNetWallet: '0x6666666666666666666666666666666666666666',
    transfers: [
      { from: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', to: '0x6666666666666666666666666666666666666666', amount: 4000, timeStamp: '1779250000' },
      { from: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', to: '0x7777777777777777777777777777777777777777', amount: 2600, timeStamp: '1779253600' },
      { from: '0xcccccccccccccccccccccccccccccccccccccccc', to: '0x8888888888888888888888888888888888888888', amount: 2000, timeStamp: '1779257200' }
    ],
    sample: [
      { from: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', to: '0x6666666666666666666666666666666666666666', amount: 4000 },
      { from: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', to: '0x7777777777777777777777777777777777777777', amount: 2600 }
    ]
  },
  holders: {
    supply: 1000000,
    holderCount: 2400,
    topHolders: [
      { TokenHolderAddress: '0x6666666666666666666666666666666666666666', TokenHolderQuantity: 70000 },
      { TokenHolderAddress: '0x8888888888888888888888888888888888888888', TokenHolderQuantity: 55000 },
      { TokenHolderAddress: '0x9999999999999999999999999999999999999999', TokenHolderQuantity: 42000 },
      { TokenHolderAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', TokenHolderQuantity: 32000 },
      { TokenHolderAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', TokenHolderQuantity: 24000 },
      { TokenHolderAddress: '0xcccccccccccccccccccccccccccccccccccccccc', TokenHolderQuantity: 19000 },
      { TokenHolderAddress: '0xdddddddddddddddddddddddddddddddddddddddd', TokenHolderQuantity: 16000 },
      { TokenHolderAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', TokenHolderQuantity: 13000 },
      { TokenHolderAddress: '0xffffffffffffffffffffffffffffffffffffffff', TokenHolderQuantity: 10000 },
      { TokenHolderAddress: '0x1212121212121212121212121212121212121212', TokenHolderQuantity: 8000 }
    ]
  }
};

const scored = { ...project, scores: core.scoreProject(project) };
const runner = { ...scored, name: 'Runner Token', symbol: 'RUN', contract: '0x3333333333333333333333333333333333333333', volume: 70000, liquidity: 90000, marketCap: 700000, stars: 80, commits: 40, risk: 55 };
runner.scores = core.scoreProject(runner);
const ranked = [scored, runner].sort((a, b) => (b.scores.adjustedFinal ?? b.scores.final) - (a.scores.adjustedFinal ?? a.scores.final));
const winner = ranked[0];
const kernels = core.agentKernel(winner, ranked[1]);
const consensus = core.consensusFromKernels(kernels);
const debate = core.agentDebate(kernels, consensus, winner);
const review = core.selfReview(winner, kernels, consensus, '');
const snapshots = { [core.projectId(winner)]: [{ ...core.compactSnapshot(winner), ts: Date.now() - 86_400_000, liquidity: 220000, top10Pct: 22, whaleDirection: 'Broad Flow', ownerOutPct: 0 }] };
const trends = Object.fromEntries(ranked.map(p => [core.projectId(p), core.riskDeltaEngine(p, snapshots)]));
const tasks = core.agentTasks(ranked, ranked, trends);
const backtest = core.predictionStats([], ranked);
const scenarioResult = core.scenarioAnalysis(winner, ranked[1], { volumeMultiplier: 1.2, liquidityMultiplier: 0.9, mentionsMultiplier: 1, priceMoveDelta: 5, riskDelta: 0, lpStatus: 'same', socialBoost: false });
const report = core.buildReportData({ ranked, winner, kernels, consensus, debate, review, tasks, backtest, scenarioResult, weights: core.DEFAULT_WEIGHTS });
const md = core.reportMarkdown(report);

const checks = [
  ['score adjusted final', Number.isFinite(scored.scores.adjustedFinal)],
  ['source reliability', core.sourceReliability(scored).score > 0],
  ['adjusted score', core.adjustedScore(scored).adjustedFinal <= scored.scores.final],
  ['evidence graph nodes', core.evidenceGraph(scored).nodes.length >= 10],
  ['contradiction detector', core.contradictionDetector(scored).items.length >= 1],
  ['risk delta engine', trends[core.projectId(winner)].status],
  ['holder risk engine', core.holderRiskEngine(scored).available],
  ['whale flow engine', core.whaleFlowEngine(scored).available],
  ['wallet labels', core.walletLabelIntel(scored).count >= 3],
  ['source plugins', core.sourcePlugins(scored).plugins.length >= 10],
  ['report markdown', md.includes('Source Reliability') && md.includes('Evidence Graph')],
  ['json export safe', JSON.stringify(report).length > 1000]
];

for (const [name, ok] of checks) assert.ok(ok, `failed: ${name}`);
console.log(JSON.stringify({ ok: true, checks: checks.map(([name]) => name), adjustedFinal: Math.round(scored.scores.adjustedFinal), reliability: core.sourceReliability(scored).badge, reportBytes: JSON.stringify(report).length }, null, 2));
