import assert from 'node:assert/strict';

const store = new Map();
globalThis.localStorage = {
  getItem: key => store.has(key) ? store.get(key) : null,
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: key => store.delete(key),
  clear: () => store.clear()
};

const core = await import('../src/core/index.js');

const addr = n => `0x${String(n).repeat(40).slice(0, 40)}`;
const mkHolders = (amounts, holderCount = 1000, addresses = []) => ({
  supply: 1_000_000,
  holderCount,
  topHolders: amounts.map((amount, i) => ({ TokenHolderAddress: addresses[i] || addr((i + 1) % 10), TokenHolderQuantity: amount }))
});
const mkFlow = ({ ownerOut = false, accumulation = false, burst = false, sparse = false } = {}) => {
  const owner = addr(5);
  const rows = [];
  const baseTs = 1779250000;
  for (let i = 0; i < (sparse ? 8 : 80); i++) {
    rows.push({
      from: ownerOut && i < 8 ? owner : addr(((i % 4) + 1)),
      to: accumulation && i < 24 ? addr(6) : addr(((i % 4) + 6)),
      amount: ownerOut && i < 8 ? 4000 : accumulation && i < 24 ? 2500 : 500,
      timeStamp: String(baseTs + (burst ? i * 12 : i * 3600))
    });
  }
  const total = rows.reduce((a, b) => a + b.amount, 0);
  return { transferCount: rows.length, uniqueWallets: sparse ? 6 : 40, largeTransferCount: ownerOut || accumulation ? 8 : 1, netToTopWalletPct: accumulation ? 36 : 5, exchangeLikeCount: 0, totalObserved: total, medianTransfer: 500, topNetWallet: addr(6), transfers: rows, sample: rows.slice(0, 8) };
};

const template = {
  chain: 'Base',
  contract: addr(1),
  price: 0.01,
  marketCap: 500_000,
  volume: 50_000,
  liquidity: 80_000,
  priceChange24h: 8,
  buys24h: 120,
  sells24h: 80,
  mentions: 40,
  risk: 35,
  pairUrl: 'https://dexscreener.com/base/pair',
  pairAddress: addr(2),
  repo: 'base/project',
  repoUrl: 'https://github.com/base/project',
  stars: 100,
  forks: 10,
  commits: 80,
  openIssues: 4,
  pushedAt: new Date().toISOString(),
  website: 'https://example.com',
  docs: 'https://example.com/docs',
  xLink: 'https://x.com/example',
  socialKeyword: 'base ai',
  mentionText: 'base ai project\ncommunity likes this\nshipping product',
  lpStatus: 'locked',
  lpProof: 'https://example.com/lp',
  gecko: { volume: 52_000, liquidity: 78_000, marketCap: 510_000, pairAddress: addr(2) },
  security: { owner_address: '0x0000000000000000000000000000000000000000', is_honeypot: '0', is_blacklisted: '0', is_open_source: '1' },
  deployerAddress: addr(5),
  deployerScan: { txCount: 20, contractCreations: 1, recentTx: 2, outboundEth: 0.1, firstTxAt: '2025-01-01T00:00:00.000Z' },
  holders: mkHolders([70000, 50000, 35000, 25000, 18000, 12000, 9000, 7000, 6000, 5000], 2000),
  transferFlow: mkFlow(),
  farcasterScan: { castCount: 12, uniqueAuthors: 8, bullish: 3, bearish: 1, sentiment: 'Neutral', spamScore: 15, phrases: ['base', 'ai'] }
};

const cases = [
  {
    name: 'empty/minimal input never throws',
    project: { name: '', symbol: '', chain: 'Base' },
    expect: p => {
      assert.ok(Number.isFinite(p.scores.final));
      assert.ok(p.scores.adjustedFinal <= p.scores.final);
      assert.equal(core.sourceReliability(p).badge, 'Insufficient Data');
    }
  },
  {
    name: 'invalid/malformed numeric strings are clamped safely',
    project: { ...template, name: 'Malformed', symbol: 'BADNUM', volume: 'abc', liquidity: Infinity, marketCap: NaN, risk: 'wat', holders: { supply: 'no', topHolders: [{ TokenHolderAddress: 'bad', TokenHolderQuantity: 'oops' }] } },
    expect: p => {
      assert.ok(Number.isFinite(p.scores.final));
      assert.ok(core.holderRiskEngine(p).score >= 0);
      assert.doesNotThrow(() => core.reportMarkdown(core.buildReportData(minReportInput([p]))));
    }
  },
  {
    name: 'owner outflow + price up creates danger contradiction and haircut',
    project: { ...template, name: 'Owner Outflow', symbol: 'OUT', priceChange24h: 45, transferFlow: mkFlow({ ownerOut: true, burst: true }), holders: mkHolders([120000, 80000, 60000, 40000, 25000], 450, [addr(5), addr(6), addr(7), addr(8), addr(9)]) },
    expect: p => {
      const conflicts = core.contradictionDetector(p);
      assert.ok(conflicts.items.some(x => x.label === 'Price up while owner sends out'));
      assert.ok(core.adjustedScore(p).haircut > 0);
      assert.ok(core.whaleFlowEngine(p).direction === 'Owner Distribution');
    }
  },
  {
    name: 'market source mismatch lowers reliability',
    project: { ...template, name: 'Mismatch', symbol: 'MISM', gecko: { volume: 1_000, liquidity: 2_000, marketCap: 40_000, pairAddress: addr(9) } },
    expect: p => {
      assert.ok(core.marketCrossCheck(p).score < 45);
      assert.ok(core.sourceReliability(p).score < core.sourcePlugins(p).coverage);
      assert.ok(core.contradictionDetector(p).items.some(x => x.label === 'Market source conflict'));
    }
  },
  {
    name: 'manual market without pair is capped and unverified',
    project: { ...template, name: 'Manual Only', symbol: 'MAN', pairUrl: '', pairAddress: '', dexId: '', gecko: null, security: null, holders: null, transferFlow: null, repo: '', repoUrl: '' },
    expect: p => {
      assert.ok(p.scores.market <= 62);
      assert.ok(p.scores.adjustedFinal < p.scores.final);
      assert.equal(core.sourceReliability(p).badge, 'Insufficient Data');
    }
  },
  {
    name: 'social spam does not become strong social proof',
    project: { ...template, name: 'Spam Social', symbol: 'SPAM', mentionText: 'moon moon moon\nmoon moon moon\nmoon moon moon\nmoon moon moon', socialKeyword: 'base ai', farcasterScan: { castCount: 50, uniqueAuthors: 2, bullish: 20, bearish: 0, sentiment: 'Bullish', spamScore: 85, phrases: ['moon'] } },
    expect: p => {
      assert.ok(core.socialIntel(p).scan.spamScore > 40);
      assert.ok(core.sourceReliability(p).sources.find(x => x.id === 'social').reliability < 60);
      assert.ok(core.farcasterIntel(p).score < 65);
    }
  },
  {
    name: 'snapshot high-risk shift is detected',
    project: { ...template, name: 'Trend Break', symbol: 'TRND', liquidity: 20_000, risk: 65, holders: mkHolders([180000, 120000, 90000, 70000, 50000], 300), transferFlow: mkFlow({ ownerOut: true, accumulation: true }) },
    expect: p => {
      const prev = { ...core.compactSnapshot({ ...p, scores: p.scores }), ts: Date.now() - 86400000, liquidity: 100_000, top10Pct: 25, ownerOutPct: 0, whaleDirection: 'Broad Flow', final: 78, safety: 75 };
      const trend = core.riskDeltaEngine(p, { [core.projectId(p)]: [prev] });
      assert.equal(trend.status, 'High Risk Shift');
      assert.ok(trend.alerts.some(x => x.label === 'Liquidity dropped hard'));
    }
  }
];

function minReportInput(ranked) {
  const winner = ranked[0];
  const runner = ranked[1] || ranked[0];
  const kernels = core.agentKernel(winner, runner);
  const consensus = core.consensusFromKernels(kernels);
  return {
    ranked,
    winner,
    kernels,
    consensus,
    debate: core.agentDebate(kernels, consensus, winner),
    review: core.selfReview(winner, kernels, consensus, ''),
    tasks: core.agentTasks(ranked, ranked, {}),
    backtest: core.predictionStats([], ranked),
    scenarioResult: core.scenarioAnalysis(winner, runner, { volumeMultiplier: 1, liquidityMultiplier: 1, mentionsMultiplier: 1, priceMoveDelta: 0, riskDelta: 0, lpStatus: 'same', socialBoost: false }),
    weights: core.DEFAULT_WEIGHTS
  };
}

const summary = [];
for (const c of cases) {
  const project = { ...c.project, scores: core.scoreProject(c.project) };
  assert.doesNotThrow(() => {
    core.sourcePlugins(project);
    core.sourceReliability(project);
    core.adjustedScore(project);
    core.evidenceGraph(project);
    core.contradictionDetector(project);
    core.holderRiskEngine(project);
    core.whaleFlowEngine(project);
    core.dataQuality(project);
  }, c.name);
  c.expect(project);
  summary.push({
    case: c.name,
    final: Math.round(project.scores.final),
    adjusted: Math.round(project.scores.adjustedFinal ?? project.scores.final),
    badge: core.sourceReliability(project).badge,
    conflicts: core.contradictionDetector(project).items.filter(x => x.level !== 'good').map(x => x.label)
  });
}

console.log(JSON.stringify({ ok: true, cases: summary }, null, 2));
