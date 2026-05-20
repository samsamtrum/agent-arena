# AgentArena

![CI](https://github.com/bentam/agent-arena/actions/workflows/ci.yml/badge.svg)

**Base-only AI agents that battle tokens, repos, DEX flow, and risk signals to find the next Base winner.**

AgentArena is a Web3-native discovery dashboard for Base projects. Paste Base token contracts or GitHub repos, let the agent lineup score each contender, then export a shareable battle card and viral caption.

It is built for token hunters, builders, launch communities, and Base-native projects that want a fast way to compare product traction, market flow, narrative strength, and risk.

## Why AgentArena

Most token discovery tools focus on price. AgentArena turns discovery into an explainable AI battle:

- **Builder signal** from GitHub activity and freshness
- **Market signal** from Base DEX volume, liquidity, market cap, and price movement
- **Narrative signal** from mentions, tx activity, and shareability
- **Risk signal** from liquidity depth, FDV/liquidity, buy/sell skew, and volatility
- **Data quality** so every score shows how much live data supports it

The result is a clean winner, a ranked battle matrix, detailed agent reports, and social-ready output.

## Why Base-only

AgentArena focuses on Base so every score uses the same assumptions:

- Base DEX liquidity
- Base token contracts
- Base-native creator culture
- Base wallet flow
- Bankr-friendly token launches
- Farcaster/X distribution loops

A narrower chain focus makes the signal sharper and easier to trust.

## Features

### Token Import

- Paste a single Base contract and import live DexScreener data
- Bulk Base import: paste multiple contracts and generate a battle in one click
- Import validation for invalid addresses, duplicates, no Base pair, multi-pair tokens, low liquidity, missing price, and missing market cap
- Contract Security Layer using GoPlus Base token security data
- Holder Intelligence v2 using an optional user-provided BaseScan API key
- Holder Distribution Risk Engine with top1/top5/top10/top20 concentration, concentration index, owner/deployer-linked exposure, whale receiver overlap, and cluster-risk explanation
- LP Auto-Verification v2 with DexScreener pair/pool address detection, liquidity-depth confidence, manual LP proof, LP locked/burned/unlocked status, owner wallet signals, and deployer review notes
- Holder flags for top-holder concentration, small holder base, deployer exposure, and clustered whale risk
- Token Transfer Flow v2 / Whale Flow Engine for whale accumulation, distribution pressure, owner/deployer outbound flow, transfer bursts, hub/router-like activity, and top net receiver/sender summaries
- Security flags for honeypot risk, blacklist controls, ownership risk, mintability, proxy contracts, tax levels, unverified source, and owner presence
- Auto-fill token name, symbol, price, volume, liquidity, market cap, chart link, 24h move, buys/sells, and risk signal

### GitHub Import

- Paste `owner/repo` or a GitHub URL
- Auto-fill stars, forks, open issues, repo link, pushed date, repo age, and commit signal
- GitHub Freshness v2 with activity badges: Fresh, Active, Stale, Abandoned Risk, Unknown
- Builder flags for fork interest, issue pressure, repo freshness, and stars-vs-build imbalance

### Scoring Engine

- Scoring Engine v2 with reason breakdowns
- Builder, Market, Meme/Narrative, Safety, Confidence, and Final scores
- Data Quality Layer with source badges, completeness %, missing-data warnings, and confidence impact
- Source Reliability Engine with Verified / Partially Verified / Speculative / Insufficient Data badges and confidence-adjusted scoring haircuts when critical sources are missing or contradictions are high
- Compare Matrix v2 for every contender
- Battle Verdict v2 explaining why the winner beat the runner-up
- Upset potential and runner-up threat detection

### Agent Reports

- Agent Report Export Pack for full Markdown/JSON battle reports, copyable research, and downloadable due diligence artifacts
- Agent Source Plugin System with source status, confidence, coverage, and pluggable data-layer framing
- Evidence Graph + Contradiction Detector groups market/security/holder/whale/social evidence, ranks risk/support signals, and flags conflicts such as hot volume on thin liquidity or social bullishness against weak wallet risk
- Real Social Mention Scanner with manual mention/cast paste analysis, sentiment cues, narrative keywords, velocity, and spam/shill warning
- Self-Review Guard that checks whether bullish, security, holder, social, and LLM claims are supported by evidence
- Strategy Simulator / What-if Lab for testing how volume, liquidity, mentions, risk, LP status, and social boosts would change score, votes, and consensus
- Agent Weights Studio with Balanced, Degen, Safe, Builder, and Meme Hunter presets
- Configurable score weights, agent vote weights, and risk veto threshold
- Social/Narrative Intelligence for website, docs, X/Farcaster, social keywords, tagline, AI/Base narrative, and shareability flags
- Agent Backtesting with local prediction records, outcome comparison, and per-agent accuracy stats
- Agent Task Planner that recommends next best checks with priorities and action buttons
- Evidence Audit Trail mapping each major claim to a source and value
- Agent Debate Loop v2 where agents open a case, object, respond, challenge, and revise consensus
- Agent Memory + Trend Intelligence with local token snapshots, score/volume/liquidity/risk deltas, and improving/weakening status
- Agent Kernel v2 with per-agent votes, confidence, bullish evidence, bearish evidence, and what-would-change-my-mind logic
- Weighted Consensus Voting across Builder, Trader, Risk, Meme, Whale, and Skeptic agents
- Multi-agent LLM calls: run separate OpenAI analysis per agent with a user-provided API key
- Real LLM Consensus Debate: a Consensus Agent synthesizes specialist outputs, evidence, weighted votes, and debate loop into a final verdict
- Rule-based agent reports work out of the box
- Optional LLM Agent Mode with a user-provided OpenAI API key
- Builder Agent — GitHub activity, docs, freshness, and product depth
- Trader Agent — Base DEX volume, liquidity, market cap, and momentum
- Risk Agent — Base contract, liquidity, FDV/liquidity, LP, and rug-risk signals
- Meme Agent — narrative, shareability, social links, AI/Base positioning, social keywords, and tx activity
- Whale Agent — Base wallet flow, liquidity depth, and market movement
- Skeptic Agent — weak spots, runner-up threat, and pre-hype validation

### Sharing & Workflow

- Export battle card as PNG
- One-click viral caption for X/Farcaster posts
- Full Token Reports for every contender
- Local saved battles/history in the browser
- Snapshot Compare v2 / Risk Delta Engine for token monitoring across rescans: liquidity drops, holder concentration changes, whale-flow direction shifts, owner outflow, burst changes, and high-risk-shift alerts
- Local prediction history for tracking agent accuracy over future rescans
- New, save, load, and clear battle controls

## How It Works

1. Paste Base token contracts or import them in bulk.
2. Add GitHub repos for projects that have builder activity.
3. AgentArena pulls live DEX and repo data.
4. The scoring engine compares builder, market, meme, safety, and confidence signals.
5. AI agents generate battle analysis and pick a consensus winner.
6. Export the share card or copy a viral caption.

## Architecture

- [Source Plugin Contract](docs/SOURCES.md) — how to add or replace data sources.

```text
src/
  main.jsx          # React entry point
  app/App.jsx       # Dashboard UI and interaction flow
  core/index.js     # Scoring, sources, agent kernels, consensus, reports, memory, and utilities
  styles.css        # App styling
```

The app is frontend-first, but the analysis core is separated from the UI so forks can replace data sources, tune agent weights, or move the core into a backend later.

## Tech Stack

- React
- Vite
- DexScreener public API
- GitHub public API
- GoPlus token security API
- lucide-react
- html-to-image

## Run Locally

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

## Test

```bash
npm test
```

The core test suite covers scoring, consensus/risk veto, source coverage, social mention analysis, LP confidence, and report export.

## Build

```bash
npm run build
npm run preview
```

## Deploy

AgentArena is a static Vite app. Any static host works.

### Vercel

```bash
npm install
npm run build
```

Build command:

```bash
npm run build
```

Output directory:

```bash
dist
```

### Netlify

Build command:

```bash
npm run build
```

Publish directory:

```bash
dist
```

## Notes

- DexScreener import uses public token endpoints.
- GitHub import uses public repo endpoints and may be rate-limited without authentication.
- Scores are transparent and rule-based so users can inspect why a project won.
- LLM Agent Mode is optional and uses the user's own OpenAI API key stored locally in their browser.
- Holder Intelligence is optional and uses the user's own BaseScan API key stored locally in their browser.
- This app is for discovery and comparison, not financial advice.

## Roadmap

- Base holder concentration checks
- Bankr token link support
- Farcaster/X mention importer
- Public Base battle leaderboard
- Historical prediction accuracy per agent
- Community-submitted Base detector rules

## Tagline

**Where AI agents battle to find the next Base winner.**
