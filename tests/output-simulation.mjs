import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key),
  clear: () => store.clear()
};

const core = await import('../src/core/index.js');

const base = {
  chain: 'Base',
  price: 0.01,
  buys24h: 120,
  sells24h: 80,
  pairUrl: 'https://dexscreener.com/base/0x2222222222222222222222222222222222222222',
  pairAddress: '0x2222222222222222222222222222222222222222',
  website: 'https://example.com',
  docs: 'https://example.com/docs',
  xLink: 'https://x.com/example',
  socialKeyword: 'Base AI token',
  mentionText: 'base ai token shipping\nstrong community\nuseful product\nnot just hype',
  lpStatus: 'locked',
  lpProof: 'https://example.com/lp',
  gecko: { volume: 120000, liquidity: 160000, marketCap: 900000, pairAddress: '0x2222222222222222222222222222222222222222' },
  security: { owner_address: '0x0000000000000000000000000000000000000000', is_honeypot: '0', is_blacklisted: '0', is_open_source: '1' },
  farcasterScan: { castCount: 25, uniqueAuthors: 16, bullish: 8, bearish: 1, sentiment: 'Bullish', spamScore: 12, phrases: ['base', 'ai'] },
};

const healthy = {
  ...base,
  name: 'Healthy Builder Token', symbol: 'HLTH', contract: '0x1111111111111111111111111111111111111111',
  marketCap: 900000, volume: 120000, liquidity: 160000, priceChange24h: 14, mentions: 90, risk: 20,
  repo: 'base/healthy-token', repoUrl: 'https://github.com/base/healthy-token', stars: 720, forks: 80, commits: 240, openIssues: 8, pushedAt: new Date().toISOString(),
  deployerAddress: '0x5555555555555555555555555555555555555555',
  deployerScan: { txCount: 30, contractCreations: 1, recentTx: 2, outboundEth: 0.2, firstTxAt: '2025-01-01T00:00:00.000Z' },
  transferFlow: { transferCount: 90, uniqueWallets: 60, largeTransferCount: 1, netToTopWalletPct: 5, exchangeLikeCount: 1, totalObserved: 100000, medianTransfer: 400, topNetWallet: '0x6666666666666666666666666666666666666666', transfers: [
    { from: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', to: '0x6666666666666666666666666666666666666666', amount: 3000, timeStamp: '1779250000' },
    { from: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', to: '0x7777777777777777777777777777777777777777', amount: 2400, timeStamp: '1779253600' },
    { from: '0xcccccccccccccccccccccccccccccccccccccccc', to: '0x8888888888888888888888888888888888888888', amount: 2000, timeStamp: '1779257200' }
  ], sample: [] },
  holders: { supply: 1000000, holderCount: 2100, topHolders: [
    ['0x6666666666666666666666666666666666666666', 65000], ['0x7777777777777777777777777777777777777777', 45000], ['0x8888888888888888888888888888888888888888', 35000], ['0x9999999999999999999999999999999999999999', 25000], ['0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', 22000], ['0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb', 19000], ['0xcccccccccccccccccccccccccccccccccccccccc', 15000], ['0xdddddddddddddddddddddddddddddddddddddddd', 12000], ['0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', 9000], ['0xffffffffffffffffffffffffffffffffffffffff', 7000]
  ].map(([TokenHolderAddress, TokenHolderQuantity]) => ({ TokenHolderAddress, TokenHolderQuantity })) }
};

const hypeConflict = {
  ...base,
  name: 'Hype Conflict Token', symbol: 'HYPE', contract: '0x3333333333333333333333333333333333333333',
  marketCap: 3000000, volume: 650000, liquidity: 12000, priceChange24h: 85, mentions: 500, risk: 58,
  repo: 'base/hype-conflict', repoUrl: 'https://github.com/base/hype-conflict', stars: 1200, forks: 20, commits: 35, pushedAt: new Date(Date.now() - 220 * 86400000).toISOString(),
  gecko: { volume: 200000, liquidity: 40000, marketCap: 1600000, pairAddress: '0x4444444444444444444444444444444444444444' },
  security: { owner_address: '0x5555555555555555555555555555555555555555', is_honeypot: '0', is_blacklisted: '0', is_open_source: '0' },
  deployerAddress: '0x5555555555555555555555555555555555555555',
  deployerScan: { txCount: 450, contractCreations: 14, recentTx: 55, outboundEth: 7, firstTxAt: '2026-01-01T00:00:00.000Z' },
  transferFlow: { transferCount: 70, uniqueWallets: 14, largeTransferCount: 10, netToTopWalletPct: 32, exchangeLikeCount: 0, totalObserved: 100000, medianTransfer: 1000, topNetWallet: '0x6666666666666666666666666666666666666666', transfers: [
    { from: '0x5555555555555555555555555555555555555555', to: '0x6666666666666666666666666666666666666666', amount: 22000, timeStamp: '1779250000' },
    { from: '0x5555555555555555555555555555555555555555', to: '0x7777777777777777777777777777777777777777', amount: 14000, timeStamp: '1779250100' },
    { from: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa', to: '0x6666666666666666666666666666666666666666', amount: 12000, timeStamp: '1779250200' }
  ], sample: [] },
  holders: { supply: 1000000, holderCount: 120, topHolders: [
    ['0x5555555555555555555555555555555555555555', 300000], ['0x6666666666666666666666666666666666666666', 220000], ['0x7777777777777777777777777777777777777777', 150000], ['0x8888888888888888888888888888888888888888', 100000], ['0x9999999999999999999999999999999999999999', 60000]
  ].map(([TokenHolderAddress, TokenHolderQuantity]) => ({ TokenHolderAddress, TokenHolderQuantity })) }
};

const missingData = {
  name: 'Missing Data Token', symbol: 'MISS', chain: 'Base', contract: '0x9999999999999999999999999999999999999999',
  marketCap: 250000, volume: 12000, liquidity: 18000, priceChange24h: 4, mentions: 8, risk: 50,
  repo: '', pairUrl: '', website: '', docs: '', xLink: '', mentionText: ''
};

const projects = [healthy, hypeConflict, missingData].map(p => ({ ...p, scores: core.scoreProject(p) }));
const ranked = projects.slice().sort((a, b) => (b.scores.adjustedFinal ?? b.scores.final) - (a.scores.adjustedFinal ?? a.scores.final));
const snapshots = {
  [core.projectId(hypeConflict)]: [{ ...core.compactSnapshot({ ...hypeConflict, scores: core.scoreProject(hypeConflict) }), ts: Date.now() - 86400000, liquidity: 70000, top10Pct: 50, ownerOutPct: 0, whaleDirection: 'Broad Flow', final: 72, safety: 58 }],
  [core.projectId(healthy)]: [{ ...core.compactSnapshot({ ...healthy, scores: core.scoreProject(healthy) }), ts: Date.now() - 86400000, liquidity: 120000, top10Pct: 26, ownerOutPct: 0, whaleDirection: 'Broad Flow', final: 78, safety: 70 }]
};
const trends = Object.fromEntries(ranked.map(p => [core.projectId(p), core.riskDeltaEngine(p, snapshots)]));

const rows = ranked.map((p, i) => {
  const rel = core.sourceReliability(p);
  const adj = core.adjustedScore(p);
  const conflicts = core.contradictionDetector(p);
  const graph = core.evidenceGraph(p);
  const holder = core.holderRiskEngine(p);
  const whale = core.whaleFlowEngine(p);
  return {
    rank: i + 1,
    symbol: p.symbol,
    raw: Math.round(p.scores.final),
    adjusted: Math.round(adj.adjustedFinal),
    haircut: Number(adj.haircut.toFixed(1)),
    badge: rel.badge,
    reliability: rel.score,
    conflict: conflicts.label,
    conflictItems: conflicts.items.filter(x => x.level !== 'good').map(x => x.label),
    holderTier: holder.tier,
    whaleDirection: whale.direction,
    trend: trends[core.projectId(p)].status,
    topEvidenceGroups: graph.groups.map(g => `${g.category}:${g.level}`).slice(0, 6)
  };
});

const winner = ranked[0];
const kernels = core.agentKernel(winner, ranked[1]);
const consensus = core.consensusFromKernels(kernels);
const tasks = core.agentTasks(projects, ranked, trends);
const report = core.reportMarkdown(core.buildReportData({
  ranked,
  winner,
  kernels,
  consensus,
  debate: core.agentDebate(kernels, consensus, winner),
  review: core.selfReview(winner, kernels, consensus, ''),
  tasks,
  backtest: core.predictionStats([], ranked),
  scenarioResult: core.scenarioAnalysis(winner, ranked[1], { volumeMultiplier: 1, liquidityMultiplier: 1, mentionsMultiplier: 1, priceMoveDelta: 0, riskDelta: 0, lpStatus: 'same', socialBoost: false }),
  weights: core.DEFAULT_WEIGHTS
}));

console.log(JSON.stringify({ rows, winner: winner.symbol, consensus: consensus.label, topTasks: tasks.slice(0, 6), reportPreview: report.split('\n').slice(0, 42) }, null, 2));

assert.equal(ranked[0].symbol, 'HLTH', 'healthy token should win after adjusted scoring');
assert.ok(rows.find(r => r.symbol === 'HYPE').adjusted < rows.find(r => r.symbol === 'HYPE').raw, 'conflict token should receive haircut');
assert.ok(rows.find(r => r.symbol === 'HYPE').conflictItems.length >= 2, 'conflict token should show contradictions');
assert.ok(['Speculative', 'Insufficient Data'].includes(rows.find(r => r.symbol === 'MISS').badge), 'missing data token should not look verified');
assert.ok(tasks.some(t => t.priority === 'High'), 'simulation should produce high-priority follow-up tasks');
assert.ok(report.includes('Source Reliability') && report.includes('Contradiction Detector'), 'report should expose reliability and contradictions');
