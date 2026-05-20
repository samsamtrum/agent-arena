# Source Plugin Contract

AgentArena uses source plugins to make token analysis explainable and extensible. A source plugin describes one data source, its status, confidence, and the evidence it contributes to the agent council.

The current app is frontend-first, but this contract is intentionally simple so forks can move sources into a backend later.

## Plugin Shape

Every source plugin should return this shape:

```js
{
  id: 'market',
  name: 'DexScreener Source',
  category: 'Market',
  status: 'connected',
  confidence: 'High',
  detail: '$180,000 volume · $220,000 liquidity'
}
```

## Fields

### `id`

Stable machine-readable ID.

Examples:

- `market`
- `builder`
- `security`
- `holders`
- `social`
- `lp`
- `market-crosscheck`
- `deployer`

### `name`

Human-readable source name.

Examples:

- `DexScreener Source`
- `GitHub Source`
- `GoPlus Source`
- `BaseScan Holder Source`
- `Manual Mentions Source`
- `LP Auto-Verification Source`
- `GeckoTerminal Source`
- `BaseScan Deployer Source`

### `category`

The analysis area supported by the source.

Common categories:

- `Market`
- `Builder`
- `Security`
- `Holders`
- `Social`
- `LP/Deployer`
- `Deployer`

### `status`

Current source status.

Suggested values:

- `connected` — live data is attached
- `scanned` — scan completed
- `analyzed` — manual/social content was analyzed
- `attached` — manual proof or user-provided data exists
- `detected` — app detected a useful onchain object such as a pair address
- `missing` — source is not available yet
- `failed` — source request failed
- `rate_limited` — source was blocked or rate limited

### `confidence`

How trustworthy/complete the source is for the current token.

Allowed values:

- `High`
- `Medium`
- `Low`
- `Missing`

### `detail`

Short source-specific evidence string for UI, reports, and LLM context.

Examples:

```text
$180,000 volume · $220,000 liquidity
1,400 stars · Fresh
82/100 · No major contract flag
Top 10 34.2%
18 mentions · Bullish · spam 12/100
0x1234…abcd · Usable liquidity
24 txs · 1 contract creation
```

## Confidence Rules

A source should be conservative.

Use `High` when:

- live source data exists
- values are complete enough for scoring
- no major source-specific warnings exist

Use `Medium` when:

- source exists but is partial
- data is manually supplied
- source is useful but not conclusive

Use `Low` when:

- source exists but raises concerns
- output is incomplete, stale, thin, or risky

Use `Missing` when:

- source has not been attached or scanned
- API key is absent
- source failed and there is no fallback data

## Current Source Plugins

AgentArena currently exposes these source plugins:

| Source | Category | Purpose |
| --- | --- | --- |
| DexScreener Source | Market | Base DEX price, volume, liquidity, market cap, pair URL, pair address |
| GeckoTerminal Source | Market | second-source market validation for volume, liquidity, FDV, and pair mismatch warnings |
| GitHub Source | Builder | stars, forks, commits, issues, repo freshness |
| GoPlus Source | Security | honeypot, blacklist, owner risk, mintability, proxy, tax, source verification |
| BaseScan Holder Source | Holders | top1/top5/top10/top20 concentration, holder distribution score, whale tier, and wallet-label overlap risk |
| BaseScan Transfer Flow Source | Whale Flow | recent token transfers, unique wallets, large-transfer clusters, top net receiver concentration |
| Wallet Label Source | Wallet Labels | local classification for owner, deployer, top holder, whale receiver, LP pair, router-like, high-activity, and factory-like wallets |
| BaseScan Deployer Source | Deployer | owner/deployer transaction history, contract-creation count, recent activity, outbound ETH flow |
| Manual Mentions Source | Social | pasted mention/cast/tweet analysis, sentiment, velocity, spam/shill warning |
| Neynar Farcaster Source | Social | live Farcaster cast search, author spread, social sentiment, spam/shill warning |
| LP Auto-Verification Source | LP/Deployer | pair/pool address, liquidity-depth confidence, LP proof/status, deployer notes |

## How Source Plugins Affect Agents

Source plugins are not just UI labels. They feed multiple core layers:

1. **Source Coverage** — each token gets a source coverage percentage.
2. **Evidence Trail** — claims are backed by source/value pairs.
3. **Self-Review Guard** — weak coverage triggers caution labels.
4. **Agent Kernel** — agents use source confidence to set votes and confidence.
5. **LLM Payload** — optional LLM reports receive source plugin status to avoid unsupported claims.
6. **Report Export** — Markdown/JSON exports include source plugin coverage.

## Adding a New Source

A new source usually needs three parts:

1. Fetch or parse source data.
2. Store normalized fields on the project object.
3. Add a plugin entry in `sourcePlugins(project)`.

Example sketch:

```js
function farcasterSource(project) {
  const scan = project.farcasterScan;

  if (!scan) {
    return {
      id: 'farcaster',
      name: 'Farcaster Source',
      category: 'Social',
      status: 'missing',
      confidence: 'Missing',
      detail: 'Run a Farcaster scan to attach cast data.'
    };
  }

  return {
    id: 'farcaster',
    name: 'Farcaster Source',
    category: 'Social',
    status: 'scanned',
    confidence: scan.castCount >= 25 && scan.spamScore < 35 ? 'High' : 'Medium',
    detail: `${scan.castCount} casts · ${scan.sentiment} · spam ${scan.spamScore}/100`
  };
}
```

Then include it in the plugin list:

```js
const plugins = [
  marketSource(project),
  builderSource(project),
  securitySource(project),
  holderSource(project),
  whaleFlowSource(project),
  socialSource(project),
  farcasterSource(project),
  lpSource(project)
];
```

## API Key Policy

Public forks should not hardcode private API keys.

Recommended patterns:

- let users paste keys in the browser for local-only use
- store keys in `localStorage` only when necessary
- document optional keys in `.env.example` without real values
- use a backend proxy only if the fork becomes production-grade
- never commit personal keys, paid API keys, or private endpoint secrets

## Good Source Design

A good source plugin should:

- fail safely
- return `Missing` or `Low` instead of pretending confidence is high
- expose short evidence strings
- avoid unsupported claims
- degrade gracefully when rate limited
- make manual data clearly different from live data

## Recommended Future Sources

Useful additions for forks:

- X/Twitter mention scan
- Birdeye market source
- TokenSniffer-style risk source
- DeFiLlama protocol/source data
- LP locker-specific source
- holder label source
- wallet label and CEX/router classification
