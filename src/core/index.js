export const BASE_CHAIN = 'base';
export const ZERO = '0x0000000000000000000000000000000000000000';
export const STORAGE_KEY = 'agentarena.savedBattles.v1';
export const LLM_KEY = 'agentarena.openaiKey.v1';
export const BASESCAN_KEY = 'agentarena.basescanKey.v1';
export const NEYNAR_KEY = 'agentarena.neynarKey.v1';
export const SNAPSHOT_KEY = 'agentarena.snapshots.v1';
export const PREDICTION_KEY = 'agentarena.predictions.v1';
export const WEIGHTS_KEY = 'agentarena.weights.v1';
export const BASE_CHAIN_ID = '8453';

export const agents = [
  { name: 'Builder Agent', icon: 'GitBranch', color: '#69f0ae', focus: 'GitHub activity, docs, product depth' },
  { name: 'Trader Agent', icon: 'TrendingUp', color: '#67e8f9', focus: 'Base DEX volume, liquidity, price momentum' },
  { name: 'Risk Agent', icon: 'ShieldAlert', color: '#fb7185', focus: 'Base contract, holder, LP and rug signals' },
  { name: 'Meme Agent', icon: 'Sparkles', color: '#facc15', focus: 'narrative, shareability, social velocity' },
  { name: 'Whale Agent', icon: 'Coins', color: '#c084fc', focus: 'Base wallet flow and holder behavior' },
  { name: 'Skeptic Agent', icon: 'Bot', color: '#94a3b8', focus: 'weak spots and fake hype detection' }
];

export const emptyProject = () => ({ name: '', symbol: '', repo: '', chain: 'Base', contract: '', price: 0, marketCap: 0, volume: 0, liquidity: 0, stars: 0, commits: 0, forks: 0, openIssues: 0, mentions: 0, risk: 50, pairUrl: '', pairAddress: '', dexId: '', pairCreatedAt: 0, website: '', docs: '', xLink: '', farcaster: '', socialKeyword: '', tagline: '', narrative: '' });

export const defaults = [emptyProject()];

export function clamp(n, a = 0, b = 100) { return Math.max(a, Math.min(b, n)); }
export function num(n) { return Number.isFinite(Number(n)) ? Number(n) : 0; }
export function money(n, digits = 0) {
  const v = num(n);
  if (v > 0 && v < 1) return `$${v.toLocaleString(undefined, { maximumSignificantDigits: 4 })}`;
  return `$${Math.round(v).toLocaleString()}`;
}
export function shortAddr(addr = '') { return addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : ''; }
export function isAddress(value = '') { return /^0x[a-fA-F0-9]{40}$/.test(value.trim()); }
export function parseRepo(value = '') {
  const clean = value.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/^github\.com\//i, '').replace(/\.git$/i, '').split(/[?#]/)[0];
  const parts = clean.split('/').filter(Boolean);
  if (parts.length < 2) return null;
  return `${parts[0]}/${parts[1]}`;
}
export function tokenFromPair(pair) {
  const base = pair.baseToken || {};
  const quote = pair.quoteToken || {};
  const token = base.address && base.address.toLowerCase() === ZERO ? quote : base;
  return token || base;
}
export function boolRisk(value) { return value === '1' || value === 1 || value === true; }
export function pct(value) {
  const n = num(value);
  if (!n) return 0;
  return n <= 1 ? n * 100 : n;
}
export function readPredictions() {
  try { return JSON.parse(localStorage.getItem(PREDICTION_KEY) || '[]'); } catch { return []; }
}
export function writePredictions(items) { localStorage.setItem(PREDICTION_KEY, JSON.stringify(items)); }
export function outcomeFrom(before, now) {
  const pricePct = pctChange(num(now.price), num(before.price));
  const volumePct = pctChange(num(now.volume), num(before.volume));
  const liqPct = pctChange(num(now.liquidity), num(before.liquidity));
  const scoreDelta = num(now.scores?.final || scoreProject(now).final) - num(before.finalScore);
  let outcome = 'Neutral';
  if ((pricePct || 0) > 15 || scoreDelta > 7 || ((volumePct || 0) > 50 && (liqPct || 0) > 10)) outcome = 'Up';
  if ((pricePct || 0) < -15 || scoreDelta < -7 || (liqPct || 0) < -30) outcome = 'Down';
  return { outcome, pricePct, volumePct, liqPct, scoreDelta };
}
export function voteHit(vote, outcome) {
  if (outcome === 'Neutral') return vote === 'Neutral';
  if (outcome === 'Up') return vote === 'Bullish';
  if (outcome === 'Down') return vote === 'Bearish';
  return false;
}
export function predictionStats(predictions, ranked) {
  const resolved = [];
  for (const pred of predictions) {
    const now = ranked.find(p => projectId(p) === pred.projectId);
    if (!now) continue;
    const result = outcomeFrom(pred, now);
    resolved.push({ ...pred, result });
  }
  const agentNames = [...Object.keys(DEFAULT_WEIGHTS.agents), 'Consensus Agent'];
  const stats = Object.fromEntries(agentNames.map(a => [a, { total: 0, hits: 0, accuracy: 0 }]));
  for (const r of resolved) {
    for (const [agent, vote] of Object.entries(r.votes || {})) {
      if (!stats[agent]) stats[agent] = { total: 0, hits: 0, accuracy: 0 };
      stats[agent].total++;
      if (voteHit(vote, r.result.outcome)) stats[agent].hits++;
    }
    stats['Consensus Agent'].total++;
    if (voteHit(r.consensus, r.result.outcome)) stats['Consensus Agent'].hits++;
  }
  for (const s of Object.values(stats)) s.accuracy = s.total ? Math.round(s.hits / s.total * 100) : 0;
  return { resolved, stats };
}
export function readSnapshots() {
  try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY) || '{}'); } catch { return {}; }
}
export function writeSnapshots(items) { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(items)); }
export function projectId(p) { return (p.contract || p.symbol || p.name || '').toLowerCase(); }
export function compactSnapshot(p) {
  return {
    ts: Date.now(), name: p.name, symbol: p.symbol, contract: p.contract,
    final: Math.round(p.scores?.final || scoreProject(p).final),
    builder: Math.round(p.scores?.builder || scoreProject(p).builder),
    market: Math.round(p.scores?.market || scoreProject(p).market),
    meme: Math.round(p.scores?.meme || scoreProject(p).meme),
    safety: Math.round(p.scores?.safety || scoreProject(p).safety),
    confidence: Math.round(p.scores?.confidence || scoreProject(p).confidence),
    volume: num(p.volume), liquidity: num(p.liquidity), marketCap: num(p.marketCap), risk: num(p.risk), top10Pct: num(p.holders?.top10Pct || holderDistribution(p).top10Pct),
    holderScore: Math.round(holderDistribution(p).score), whaleScore: Math.round(whaleFlowIntel(p).score), whaleDirection: whaleFlowIntel(p).direction || 'Unknown',
    accumulationPct: num(whaleFlowIntel(p).accumulationPct), distributionPct: num(whaleFlowIntel(p).distributionPct), ownerOutPct: num(whaleFlowIntel(p).ownerOutPct), burstScore: num(whaleFlowIntel(p).burstScore)
  };
}
export function pctChange(now, before) {
  if (!before) return null;
  return (now - before) / Math.max(1, Math.abs(before)) * 100;
}
export function riskDeltaEngine(p, snapshots) {
  const id = projectId(p);
  const history = (snapshots[id] || []).slice().sort((a,b)=>a.ts-b.ts);
  const current = compactSnapshot({ ...p, scores: p.scores || scoreProject(p) });
  const prev = history.length ? history[history.length - 1] : null;
  if (!prev) return { status: 'New', level: 'neutral', severity: 0, history, current, prev: null, deltas: null, alerts: [{ level: 'neutral', label: 'No previous snapshot', detail: 'Save a snapshot, rescan later, then compare token health deltas.' }], summary: 'No previous snapshot yet.' };
  const deltas = {
    score: current.final - prev.final,
    safety: current.safety - num(prev.safety),
    volumePct: pctChange(current.volume, prev.volume),
    liquidityPct: pctChange(current.liquidity, prev.liquidity),
    marketCapPct: pctChange(current.marketCap, prev.marketCap),
    risk: current.risk - num(prev.risk),
    confidence: current.confidence - num(prev.confidence),
    top10Pct: current.top10Pct - num(prev.top10Pct),
    holderScore: current.holderScore - num(prev.holderScore),
    whaleScore: current.whaleScore - num(prev.whaleScore),
    accumulationPct: current.accumulationPct - num(prev.accumulationPct),
    distributionPct: current.distributionPct - num(prev.distributionPct),
    ownerOutPct: current.ownerOutPct - num(prev.ownerOutPct),
    burstScore: current.burstScore - num(prev.burstScore),
    whaleDirectionChanged: prev.whaleDirection && current.whaleDirection !== prev.whaleDirection
  };
  const alerts = [];
  let points = 0, severity = 0;
  const add = (level, label, detail, weight = 1) => { alerts.push({ level, label, detail }); if (level === 'good') points += weight; if (level === 'warn') { points -= weight; severity += weight; } if (level === 'danger') { points -= weight * 2; severity += weight * 2; } };
  if (deltas.score >= 5) add('good', 'Score improved', `Final score moved +${deltas.score}.`, 2); else if (deltas.score <= -5) add('warn', 'Score weakened', `Final score moved ${deltas.score}.`, 2);
  if ((deltas.liquidityPct || 0) >= 25) add('good', 'Liquidity improved', `Liquidity changed ${deltas.liquidityPct.toFixed(1)}%.`, 1); else if ((deltas.liquidityPct || 0) <= -35) add('danger', 'Liquidity dropped hard', `Liquidity changed ${deltas.liquidityPct.toFixed(1)}%.`, 2); else if ((deltas.liquidityPct || 0) <= -20) add('warn', 'Liquidity weakened', `Liquidity changed ${deltas.liquidityPct.toFixed(1)}%.`, 1);
  if ((deltas.volumePct || 0) >= 60) add('good', 'Volume expansion', `Volume changed ${deltas.volumePct.toFixed(1)}%.`, 1); else if ((deltas.volumePct || 0) <= -50) add('warn', 'Volume faded', `Volume changed ${deltas.volumePct.toFixed(1)}%.`, 1);
  if (deltas.risk <= -5) add('good', 'Risk score improved', `Manual/live risk moved ${deltas.risk}.`, 1); else if (deltas.risk >= 8) add('danger', 'Risk score worsened', `Manual/live risk moved +${deltas.risk}.`, 2); else if (deltas.risk >= 5) add('warn', 'Risk increased', `Manual/live risk moved +${deltas.risk}.`, 1);
  if (deltas.safety >= 5) add('good', 'Safety improved', `Safety score moved +${deltas.safety}.`, 1); else if (deltas.safety <= -8) add('danger', 'Safety deteriorated', `Safety score moved ${deltas.safety}.`, 2); else if (deltas.safety <= -5) add('warn', 'Safety weakened', `Safety score moved ${deltas.safety}.`, 1);
  if (deltas.top10Pct >= 8) add('danger', 'Top holders concentrated', `Top 10 holder share increased +${deltas.top10Pct.toFixed(1)}%.`, 2); else if (deltas.top10Pct >= 4) add('warn', 'Holder concentration rising', `Top 10 holder share increased +${deltas.top10Pct.toFixed(1)}%.`, 1); else if (deltas.top10Pct <= -4) add('good', 'Holder distribution improved', `Top 10 holder share decreased ${deltas.top10Pct.toFixed(1)}%.`, 1);
  if (deltas.holderScore <= -8) add('danger', 'Holder risk deteriorated', `Holder score moved ${deltas.holderScore}.`, 2);
  if (deltas.whaleScore <= -10) add('warn', 'Whale flow risk worsened', `Whale-flow score moved ${deltas.whaleScore}.`, 1);
  if (deltas.accumulationPct >= 12) add('warn', 'Whale accumulation increased', `Top receiver accumulation rose +${deltas.accumulationPct.toFixed(1)}%.`, 1);
  if (deltas.distributionPct >= 12) add('warn', 'Distribution pressure increased', `Top sender distribution rose +${deltas.distributionPct.toFixed(1)}%.`, 1);
  if (deltas.ownerOutPct >= 3) add(deltas.ownerOutPct >= 10 ? 'danger' : 'warn', 'Owner outflow appeared', `Owner/deployer outbound flow rose +${deltas.ownerOutPct.toFixed(1)}%.`, deltas.ownerOutPct >= 10 ? 2 : 1);
  if (deltas.burstScore >= 25) add('warn', 'Transfer burst increased', `Burst score rose +${deltas.burstScore.toFixed(0)}.`, 1);
  if (deltas.whaleDirectionChanged) add(current.whaleDirection === 'Owner Distribution' ? 'danger' : 'warn', 'Whale direction changed', `${prev.whaleDirection} → ${current.whaleDirection}.`, 1);
  if (!alerts.length) alerts.push({ level: 'neutral', label: 'No major delta', detail: 'No large token-health shift detected since last snapshot.' });
  const status = severity >= 5 || points <= -5 ? 'High Risk Shift' : points >= 3 ? 'Improving' : points <= -3 ? 'Deteriorating' : points > 0 ? 'Stable / Improving' : points < 0 ? 'Weakening' : 'Stable';
  const level = status === 'Improving' || status === 'Stable / Improving' ? 'good' : status === 'High Risk Shift' || status === 'Deteriorating' || status === 'Weakening' ? 'danger' : 'warn';
  const summary = `Score ${deltas.score >= 0 ? '+' : ''}${deltas.score}, liquidity ${deltas.liquidityPct===null?'N/A':`${deltas.liquidityPct.toFixed(1)}%`}, top10 ${deltas.top10Pct >= 0 ? '+' : ''}${deltas.top10Pct.toFixed(1)}%, whale ${deltas.whaleDirectionChanged ? `${prev.whaleDirection} → ${current.whaleDirection}` : current.whaleDirection}.`;
  return { status, level, severity, history, current, prev, deltas, alerts, summary };
}
export function trendFor(p, snapshots) {
  return riskDeltaEngine(p, snapshots);
}
export function lpAutoIntel(p) {
  const liquidity = num(p.liquidity);
  const pairAddress = p.pairAddress || '';
  const pairUrl = p.pairUrl || '';
  const flags = [];
  let confidence = 18;
  if (pairAddress) { confidence += 22; flags.push({ level: 'good', label: 'Pair address detected', detail: `Pair ${shortAddr(pairAddress)} is attached from DexScreener.` }); }
  else if (pairUrl) { confidence += 12; flags.push({ level: 'warn', label: 'Pair link only', detail: 'Chart link exists, but pair address is not available.' }); }
  else flags.push({ level: 'danger', label: 'Pair missing', detail: 'No pair/pool address is attached.' });
  if (liquidity >= 150000) { confidence += 24; flags.push({ level: 'good', label: 'Deep liquidity', detail: `${money(liquidity)} liquidity improves LP confidence.` }); }
  else if (liquidity >= 50000) { confidence += 16; flags.push({ level: 'good', label: 'Usable liquidity', detail: `${money(liquidity)} liquidity is usable for early review.` }); }
  else if (liquidity >= 15000) { confidence += 6; flags.push({ level: 'warn', label: 'Early liquidity', detail: `${money(liquidity)} liquidity is still early.` }); }
  else flags.push({ level: 'danger', label: 'Thin LP depth', detail: `${money(liquidity)} liquidity is too thin for strong confidence.` });
  if (p.lpStatus === 'locked') { confidence += 25; flags.push({ level: 'good', label: 'Manual LP lock verified', detail: 'User marked LP as locked.' }); }
  if (p.lpStatus === 'burned') { confidence += 30; flags.push({ level: 'good', label: 'Manual LP burn verified', detail: 'User marked LP as burned.' }); }
  if (p.lpStatus === 'unlocked') { confidence -= 30; flags.push({ level: 'danger', label: 'Manual LP unlock risk', detail: 'User marked LP as unlocked.' }); }
  if (p.lpProof) { confidence += 10; flags.push({ level: 'good', label: 'LP proof attached', detail: 'LP proof URL is attached for review.' }); }
  if (!p.lpProof && (!p.lpStatus || p.lpStatus === 'unknown')) flags.push({ level: 'warn', label: 'Manual proof missing', detail: 'LP lock/burn proof has not been attached.' });
  return { confidence: clamp(confidence, 0, 100), pairAddress, pairUrl, liquidity, flags };
}
export function ownerAddress(p) {
  const secOwner = p.security?.owner_address || '';
  if (secOwner && !/^0x0{40}$/i.test(secOwner)) return secOwner;
  return p.ownerAddress || '';
}
export function deployerIntel(p) {
  const owner = ownerAddress(p);
  const deployer = p.deployerAddress || p.deployer?.address || '';
  const scan = p.deployerScan || null;
  const holders = holderIntel(p);
  const flags = [];
  let score = 58;
  if (owner) { score -= 8; flags.push({ level: 'warn', label: 'Owner present', detail: `Owner ${shortAddr(owner)} should be reviewed.` }); }
  else if (p.security && !owner) { score += 12; flags.push({ level: 'good', label: 'Owner not active', detail: 'Security scan does not show an active owner address.' }); }
  else flags.push({ level: 'warn', label: 'Owner unknown', detail: 'Run Security Scan or add owner/deployer data.' });
  if (deployer) { score += 6; flags.push({ level: 'neutral', label: 'Deployer attached', detail: `Deployer ${shortAddr(deployer)} is available for review.` }); }
  if (scan) {
    const txCount = num(scan.txCount);
    const contractCreations = num(scan.contractCreations);
    const recentTx = num(scan.recentTx);
    const outboundEth = num(scan.outboundEth);
    if (txCount >= 300) { score -= 8; flags.push({ level: 'warn', label: 'Busy deployer wallet', detail: `${txCount} fetched transactions suggest an active operator wallet.` }); }
    else if (txCount > 0) flags.push({ level: 'neutral', label: 'Deployer tx history', detail: `${txCount} fetched transactions reviewed.` });
    if (contractCreations >= 8) { score -= 24; flags.push({ level: 'danger', label: 'Many contract creations', detail: `${contractCreations} contract-creation transactions found in fetched history.` }); }
    else if (contractCreations >= 3) { score -= 12; flags.push({ level: 'warn', label: 'Multiple contract creations', detail: `${contractCreations} contract-creation transactions found.` }); }
    else if (contractCreations > 0) flags.push({ level: 'neutral', label: 'Contract creation seen', detail: `${contractCreations} contract creation transaction found.` });
    if (recentTx >= 25) { score -= 7; flags.push({ level: 'warn', label: 'Recent wallet activity', detail: `${recentTx} transactions in the last 7 days.` }); }
    if (outboundEth >= 3) { score -= 8; flags.push({ level: 'warn', label: 'Outbound ETH flow', detail: `${outboundEth.toFixed(3)} ETH sent in fetched history.` }); }
    if (scan.firstTxAt) flags.push({ level: 'neutral', label: 'First seen', detail: new Date(scan.firstTxAt).toLocaleDateString() });
  } else flags.push({ level: 'warn', label: 'Deployer history not scanned', detail: 'Run Deployer Scan with BaseScan key for transaction-history risk.' });
  if (holders.available && holders.deployerPct >= 10) { score -= 14; flags.push({ level: 'warn', label: 'Deployer holder exposure', detail: `Deployer/creator may hold ${holders.deployerPct.toFixed(1)}%.` }); }
  if (holders.available && holders.top10Pct >= 70) { score -= 10; flags.push({ level: 'danger', label: 'Owner/whale concentration context', detail: 'Top holders are heavily concentrated.' }); }
  if (p.deployerNotes) flags.push({ level: 'neutral', label: 'Deployer notes', detail: p.deployerNotes });
  const confidence = scan ? 78 : deployer || owner ? 52 : 28;
  return { available: Boolean(scan || owner || deployer), score: clamp(score, 0, 100), confidence, owner, deployer, scan, flags };
}
export async function fetchDeployerScan(address, apiKey) {
  if (!apiKey) throw new Error('BaseScan API key required for deployer scan');
  if (!isAddress(address)) throw new Error('Invalid deployer/owner address');
  const url = `https://api.etherscan.io/v2/api?chainid=${BASE_CHAIN_ID}&module=account&action=txlist&address=${address}&page=1&offset=100&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BaseScan deployer request failed (${res.status})`);
  const data = await res.json();
  const rows = Array.isArray(data.result) ? data.result : [];
  if (!rows.length) throw new Error(typeof data.result === 'string' ? data.result : 'No deployer transactions returned');
  const now = Date.now();
  const sevenDays = 7 * 86400000;
  const contractCreations = rows.filter(r => !r.to || String(r.to).toLowerCase() === 'contract creation').length;
  const recentTx = rows.filter(r => now - num(r.timeStamp) * 1000 <= sevenDays).length;
  const outboundEth = rows.filter(r => String(r.from || '').toLowerCase() === address.toLowerCase()).reduce((sum, r) => sum + num(r.value) / 1e18, 0);
  const first = rows[rows.length - 1];
  const last = rows[0];
  return { address, txCount: rows.length, contractCreations, recentTx, outboundEth, firstTxAt: first?.timeStamp ? new Date(num(first.timeStamp) * 1000).toISOString() : '', lastTxAt: last?.timeStamp ? new Date(num(last.timeStamp) * 1000).toISOString() : '', sample: rows.slice(0, 8).map(r => ({ hash: r.hash, from: r.from, to: r.to || 'contract creation', valueEth: num(r.value) / 1e18, timeStamp: r.timeStamp })) };
}
export function lpDeployerIntel(p) {
  const sec = p.security || {};
  const holders = holderIntel(p);
  const auto = lpAutoIntel(p);
  const dep = deployerIntel(p);
  const flags = [...auto.flags, ...dep.flags];
  let score = auto.confidence * .65 + dep.score * .35;
  if (sec.owner_address && !/^0x0{40}$/i.test(sec.owner_address)) { score -= 12; flags.push({ level: 'warn', label: 'Owner wallet active', detail: `Owner ${shortAddr(sec.owner_address)} should be reviewed.` }); }
  if (boolRisk(sec.can_take_back_ownership)) { score -= 18; flags.push({ level: 'danger', label: 'Ownership reclaim risk', detail: 'Owner may be able to reclaim control.' }); }
  if (holders.available && holders.top10Pct >= 60) { score -= 14; flags.push({ level: 'warn', label: 'Deployer/whale exposure', detail: 'Top holder concentration can amplify deployer or whale risk.' }); }

  return { score: clamp(score, 0, 100), confidence: auto.confidence, deployerConfidence: dep.confidence, pairAddress: auto.pairAddress, liquidity: auto.liquidity, owner: dep.owner, deployer: dep.deployer, flags };
}
export function sourcePlugins(p) {
  const sec = securityIntel(p);
  const holders = holderIntel(p);
  const social = socialIntel(p);
  const farcaster = farcasterIntel(p);
  const whaleFlow = whaleFlowIntel(p);
  const lp = lpDeployerIntel(p);
  const dep = deployerIntel(p);
  const fresh = githubFreshness(p);
  const hasDex = Boolean(p.pairUrl || p.pairAddress || p.dexId);
  const plugins = [
    { id: 'market', name: 'DexScreener Source', category: 'Market', status: hasDex ? 'connected' : 'missing', confidence: hasDex && num(p.liquidity) && num(p.volume) ? 'High' : hasDex ? 'Medium' : 'Missing', detail: hasDex ? `${money(p.volume)} volume · ${money(p.liquidity)} liquidity` : 'Import a Base contract to attach live DEX data.' },
    { id: 'market-crosscheck', name: 'GeckoTerminal Source', category: 'Market', status: p.gecko ? 'connected' : 'missing', confidence: marketCrossCheck(p).confidence, detail: p.gecko ? `${money(p.gecko.volume)} volume · ${money(p.gecko.liquidity)} liquidity` : 'Run market cross-check to validate DEX data.' },
    { id: 'builder', name: 'GitHub Source', category: 'Builder', status: p.repo || p.repoUrl ? 'connected' : 'missing', confidence: p.repo || p.repoUrl ? (fresh.level === 'good' ? 'High' : fresh.level === 'danger' ? 'Low' : 'Medium') : 'Missing', detail: p.repo || p.repoUrl ? `${num(p.stars).toLocaleString()} stars · ${fresh.badge}` : 'Attach a repo for builder analysis.' },
    { id: 'security', name: 'GoPlus Source', category: 'Security', status: sec.available ? 'scanned' : 'missing', confidence: sec.available ? (sec.score >= 70 ? 'High' : sec.score >= 45 ? 'Medium' : 'Low') : 'Missing', detail: sec.available ? `${Math.round(sec.score)}/100 · ${sec.flags[0]?.label}` : 'Run Security Scan for contract flags.' },
    { id: 'holders', name: 'BaseScan Holder Source', category: 'Holders', status: holders.available ? 'scanned' : 'missing', confidence: holders.available ? (holders.top10Pct < 45 ? 'High' : holders.top10Pct < 70 ? 'Medium' : 'Low') : 'Missing', detail: holders.available ? `${holders.distribution.tier} · Top1 ${holders.top1Pct.toFixed(1)}% · Top10 ${holders.top10Pct.toFixed(1)}%` : 'Add BaseScan key and run Holder Scan.' },
    { id: 'whale-flow', name: 'BaseScan Transfer Flow Source', category: 'Whale Flow', status: whaleFlow.available ? 'scanned' : 'missing', confidence: whaleFlow.confidence, detail: whaleFlow.available ? `${whaleFlow.flow.transferCount} transfers · ${whaleFlow.flow.uniqueWallets} wallets` : 'Run Whale Flow scan for recent token transfers.' },
    { id: 'wallet-labels', name: 'Wallet Label Source', category: 'Wallet Labels', status: walletLabelIntel(p).available ? 'analyzed' : 'missing', confidence: walletLabelIntel(p).confidence, detail: walletLabelIntel(p).available ? `${walletLabelIntel(p).count} labels · ${walletLabelIntel(p).riskCount} risk wallets` : 'Run deployer/holder/flow scans to label wallets.' },
    { id: 'social', name: 'Manual Mentions Source', category: 'Social', status: social.scan.count ? 'analyzed' : 'missing', confidence: social.scan.count >= 15 && social.scan.spamScore < 35 ? 'High' : social.scan.count >= 5 ? 'Medium' : 'Missing', detail: social.scan.count ? `${social.scan.count} mentions · ${social.scan.sentiment} · spam ${Math.round(social.scan.spamScore)}/100` : 'Paste social mentions/casts/tweets.' },
    { id: 'farcaster', name: 'Neynar Farcaster Source', category: 'Social', status: farcaster.available ? 'scanned' : 'missing', confidence: farcaster.confidence, detail: farcaster.available ? `${farcaster.scan.castCount} casts · ${farcaster.scan.uniqueAuthors} authors · ${farcaster.scan.sentiment}` : 'Add Neynar key and run Farcaster scan.' },
    { id: 'lp', name: 'LP Auto-Verification Source', category: 'LP/Deployer', status: lp.pairAddress ? 'detected' : (p.lpStatus && p.lpStatus !== 'unknown' ? 'attached' : 'missing'), confidence: lp.score >= 70 ? 'High' : lp.score >= 45 ? 'Medium' : 'Low', detail: `${lp.pairAddress ? shortAddr(lp.pairAddress) : (p.lpStatus || 'unknown')} · ${lp.flags[0]?.label}` },
    { id: 'deployer', name: 'BaseScan Deployer Source', category: 'Deployer', status: dep.scan ? 'scanned' : dep.available ? 'attached' : 'missing', confidence: dep.score >= 72 ? 'High' : dep.score >= 48 ? 'Medium' : dep.available ? 'Low' : 'Missing', detail: dep.available ? `${dep.deployer || dep.owner ? shortAddr(dep.deployer || dep.owner) : 'wallet'} · ${dep.flags[0]?.label}` : 'Run Security Scan or add deployer address.' }
  ];
  const scoreMap = { High: 100, Medium: 65, Low: 35, Missing: 0 };
  const coverage = Math.round(plugins.reduce((a,b)=>a+scoreMap[b.confidence],0) / plugins.length);
  return { plugins, coverage };
}

export function sourceReliability(p) {
  const sp = sourcePlugins(p);
  const conflicts = contradictionDetector(p);
  const scoreMap = { High: 95, Medium: 68, Low: 38, Missing: 0 };
  const critical = new Set(['market', 'security', 'holders', 'whale-flow', 'market-crosscheck']);
  const sources = sp.plugins.map(plugin => {
    let score = scoreMap[plugin.confidence] ?? 50;
    if (plugin.status === 'missing') score = 0;
    if (critical.has(plugin.id) && plugin.status === 'missing') score -= 8;
    if (plugin.id === 'market-crosscheck' && marketCrossCheck(p).available && marketCrossCheck(p).score < 45) score -= 20;
    if (plugin.id === 'social' && socialIntel(p).scan.spamScore > 45) score -= 18;
    if (plugin.id === 'builder' && githubFreshness(p).level === 'danger') score -= 16;
    return { ...plugin, reliability: clamp(score, 0, 100) };
  });
  const base = sources.reduce((sum, x) => sum + x.reliability, 0) / Math.max(1, sources.length);
  const criticalMissing = sources.filter(x => critical.has(x.id) && x.status === 'missing').length;
  const conflictPenalty = Math.min(22, conflicts.severity * 4);
  const missingPenalty = Math.min(18, criticalMissing * 4);
  const score = clamp(base - conflictPenalty - missingPenalty, 0, 100);
  const badge = score >= 82 ? 'Verified' : score >= 62 ? 'Partially Verified' : score >= 42 ? 'Speculative' : 'Insufficient Data';
  const flags = [];
  if (criticalMissing) flags.push({ level: 'warn', label: 'Critical source missing', detail: `${criticalMissing} critical source checks are missing.` });
  if (conflicts.severity >= 2) flags.push({ level: 'warn', label: 'Conflict penalty applied', detail: `${conflicts.label} reduced reliability.` });
  if (!flags.length) flags.push({ level: 'good', label: 'Source reliability acceptable', detail: `${badge} with ${Math.round(score)}% source reliability.` });
  return { score: Math.round(score), badge, sources, criticalMissing, conflictPenalty, missingPenalty, conflicts, flags };
}
export function adjustedScore(p) {
  const raw = p.scores || scoreProject(p);
  const reliability = sourceReliability({ ...p, scores: raw });
  const haircut = clamp((75 - reliability.score) * .35 + reliability.conflicts.severity * 1.8, 0, 28);
  const adjustedFinal = clamp(raw.final - haircut, 0, 100);
  const confidenceAdjusted = clamp(raw.confidence * .72 + reliability.score * .28 - reliability.conflicts.severity * 2, 0, 100);
  return { rawFinal: raw.final, adjustedFinal, haircut, confidenceAdjusted, reliability, badge: reliability.badge };
}

export function marketCrossCheck(p) {
  const gt = p.gecko || null;
  const flags = [];
  let score = 55;
  if (!gt) return { available: false, score: 45, confidence: 'Missing', flags: [{ level: 'warn', label: 'No market cross-check', detail: 'Run GeckoTerminal cross-check to validate market data.' }] };
  const comparisons = [];
  const compare = (label, a, b, warn = 25, danger = 55) => {
    const av = num(a), bv = num(b);
    if (!av || !bv) return;
    const diff = Math.abs(av - bv) / Math.max(av, bv) * 100;
    comparisons.push({ label, diff });
    if (diff <= warn) { score += 8; flags.push({ level: 'good', label: `${label} aligned`, detail: `${label} differs by ${diff.toFixed(1)}%.` }); }
    else if (diff <= danger) { score -= 8; flags.push({ level: 'warn', label: `${label} mismatch`, detail: `${label} differs by ${diff.toFixed(1)}%.` }); }
    else { score -= 18; flags.push({ level: 'danger', label: `${label} major mismatch`, detail: `${label} differs by ${diff.toFixed(1)}%.` }); }
  };
  compare('Liquidity', p.liquidity, gt.liquidity);
  compare('Volume', p.volume, gt.volume);
  compare('FDV', p.marketCap, gt.marketCap);
  if (gt.pairAddress && p.pairAddress && gt.pairAddress.toLowerCase() === p.pairAddress.toLowerCase()) { score += 10; flags.push({ level: 'good', label: 'Pair match', detail: `Both sources point to ${shortAddr(gt.pairAddress)}.` }); }
  else if (gt.pairAddress && p.pairAddress) { score -= 14; flags.push({ level: 'warn', label: 'Pair mismatch', detail: `Dex ${shortAddr(p.pairAddress)} vs Gecko ${shortAddr(gt.pairAddress)}.` }); }
  if (!comparisons.length && !gt.pairAddress) flags.push({ level: 'warn', label: 'Cross-check incomplete', detail: 'GeckoTerminal data returned partial market fields.' });
  const confidence = score >= 75 ? 'High' : score >= 55 ? 'Medium' : score >= 35 ? 'Low' : 'Missing';
  return { available: true, score: clamp(score, 0, 100), confidence, flags, comparisons, gecko: gt };
}
export async function fetchGeckoMarket(contract, preferredPairAddress = '') {
  if (!isAddress(contract)) throw new Error('Invalid address');
  const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/tokens/${contract}/pools`);
  if (!res.ok) throw new Error(`GeckoTerminal request failed (${res.status})`);
  const data = await res.json();
  const pools = data.data || [];
  if (!pools.length) throw new Error('No GeckoTerminal Base pool found');
  const pairId = String(preferredPairAddress || '').toLowerCase();
  const normalized = pools.map(pool => {
    const attrs = pool.attributes || {};
    const address = String((pool.id || '').split('_').pop() || attrs.address || '').toLowerCase();
    return { pool, attrs, address };
  });
  const matched = pairId ? normalized.find(x => x.address === pairId) : null;
  const best = matched || normalized.slice().sort((a,b)=>num(b.attrs?.reserve_in_usd)-num(a.attrs?.reserve_in_usd))[0];
  const a = best.attrs || {};
  return {
    source: 'geckoterminal',
    pairAddress: best.address || '',
    pairUrl: a.url || '',
    price: num(a.base_token_price_usd || a.token_price_usd),
    liquidity: num(a.reserve_in_usd),
    volume: num(a.volume_usd?.h24),
    marketCap: num(a.fdv_usd || a.market_cap_usd),
    priceChange24h: num(a.price_change_percentage?.h24),
    poolName: a.name || '',
    matchedPreferredPair: Boolean(matched),
    poolCount: pools.length,
    checkedAt: new Date().toISOString()
  };
}
export function analyzeMentionsText(text = '', keyword = '') {
  const raw = String(text || '').trim();
  if (!raw) return { count: 0, bullish: 0, bearish: 0, neutral: 0, sentiment: 'Unknown', velocity: 'Unknown', phrases: [], spamScore: 0, flags: [{ level: 'warn', label: 'Mentions not scanned', detail: 'Paste social mentions or casts to analyze narrative traction.' }] };
  const lines = raw.split(/\n+/).map(x => x.trim()).filter(Boolean);
  const lower = raw.toLowerCase();
  const bullWords = ['bullish','moon','send','gem','ape','based','winner','alpha','breakout','accumulate','strong','pump','cook','undervalued'];
  const bearWords = ['rug','scam','dump','dead','avoid','honeypot','sell','bearish','fake','unlocked','risk','warning'];
  const narrativeWords = ['ai','agent','base','meme','launch','builder','dev','community','farcaster','bankr','token','arena'];
  const bullish = bullWords.reduce((n,w)=>n+(lower.match(new RegExp(`\\b${w}\\b`,'g'))||[]).length,0);
  const bearish = bearWords.reduce((n,w)=>n+(lower.match(new RegExp(`\\b${w}\\b`,'g'))||[]).length,0);
  const phrases = narrativeWords.filter(w => lower.includes(w)).slice(0,8);
  const repeated = lines.length ? 1 - new Set(lines.map(x=>x.toLowerCase())).size / lines.length : 0;
  const spamScore = clamp(repeated * 70 + (/(.)\1{5,}/.test(lower) ? 15 : 0) + ((lower.match(/http/g)||[]).length > lines.length ? 15 : 0));
  const sentiment = bullish > bearish * 1.4 ? 'Bullish' : bearish > bullish * 1.2 ? 'Bearish' : 'Neutral';
  const velocity = lines.length >= 25 ? 'High' : lines.length >= 8 ? 'Medium' : 'Low';
  const flags = [];
  if (lines.length >= 15) flags.push({ level: 'good', label: 'Mention traction', detail: `${lines.length} pasted mentions/casts available.` });
  else flags.push({ level: 'warn', label: 'Low mention sample', detail: `Only ${lines.length} mention lines available.` });
  if (sentiment === 'Bullish') flags.push({ level: 'good', label: 'Bullish social tone', detail: `${bullish} bullish cues vs ${bearish} bearish cues.` });
  if (sentiment === 'Bearish') flags.push({ level: 'danger', label: 'Bearish social tone', detail: `${bearish} bearish cues vs ${bullish} bullish cues.` });
  if (phrases.length) flags.push({ level: 'good', label: 'Narrative phrases found', detail: phrases.join(', ') });
  if (spamScore > 45) flags.push({ level: 'warn', label: 'Spam/shill pattern', detail: `Repetition/spam score ${Math.round(spamScore)}/100.` });
  if (keyword && !lower.includes(String(keyword).toLowerCase())) flags.push({ level: 'warn', label: 'Keyword missing', detail: `Mentions do not clearly include "${keyword}".` });
  return { count: lines.length, bullish, bearish, neutral: Math.max(0, lines.length - bullish - bearish), sentiment, velocity, phrases, spamScore, flags };
}
export function farcasterIntel(p) {
  const scan = p.farcasterScan || null;
  const flags = [];
  if (!scan) return { available: false, score: 28, confidence: 'Missing', scan: null, flags: [{ level: 'warn', label: 'Farcaster not scanned', detail: 'Run Farcaster scan with Neynar key or paste mentions manually.' }] };
  let score = 35;
  if (scan.castCount >= 25) { score += 24; flags.push({ level: 'good', label: 'Farcaster traction', detail: `${scan.castCount} casts found.` }); }
  else if (scan.castCount >= 8) { score += 12; flags.push({ level: 'warn', label: 'Early Farcaster traction', detail: `${scan.castCount} casts found.` }); }
  else flags.push({ level: 'warn', label: 'Low Farcaster sample', detail: `${scan.castCount} casts found.` });
  if (scan.uniqueAuthors >= 12) { score += 14; flags.push({ level: 'good', label: 'Author spread', detail: `${scan.uniqueAuthors} unique authors.` }); }
  else if (scan.uniqueAuthors > 0) flags.push({ level: 'warn', label: 'Thin author spread', detail: `${scan.uniqueAuthors} unique authors.` });
  if (scan.sentiment === 'Bullish') { score += 12; flags.push({ level: 'good', label: 'Bullish Farcaster tone', detail: `${scan.bullish} bullish cues vs ${scan.bearish} bearish cues.` }); }
  if (scan.sentiment === 'Bearish') { score -= 14; flags.push({ level: 'danger', label: 'Bearish Farcaster tone', detail: `${scan.bearish} bearish cues vs ${scan.bullish} bullish cues.` }); }
  if (scan.spamScore > 45) { score -= 12; flags.push({ level: 'warn', label: 'Farcaster spam pattern', detail: `Spam score ${Math.round(scan.spamScore)}/100.` }); }
  const confidence = score >= 75 ? 'High' : score >= 55 ? 'Medium' : score >= 35 ? 'Low' : 'Missing';
  return { available: true, score: clamp(score), confidence, scan, flags };
}
export async function fetchFarcasterScan(query, apiKey) {
  if (!apiKey) throw new Error('Neynar API key required for Farcaster scan');
  const q = String(query || '').trim();
  if (!q) throw new Error('Farcaster keyword required');
  const url = `https://api.neynar.com/v2/farcaster/cast/search?q=${encodeURIComponent(q)}&limit=25`;
  const res = await fetch(url, { headers: { accept: 'application/json', api_key: apiKey } });
  if (!res.ok) throw new Error(`Neynar Farcaster request failed (${res.status})`);
  const data = await res.json();
  const casts = data.casts || data.result?.casts || [];
  const lines = casts.map(c => c.text || c.body || '').filter(Boolean);
  const authors = new Set(casts.map(c => c.author?.fid || c.author?.username || c.author?.custody_address).filter(Boolean));
  const scan = analyzeMentionsText(lines.join('\n'), q);
  return { query: q, castCount: lines.length, uniqueAuthors: authors.size, bullish: scan.bullish, bearish: scan.bearish, sentiment: scan.sentiment, spamScore: scan.spamScore, phrases: scan.phrases, sample: casts.slice(0, 6).map(c => ({ text: c.text || '', author: c.author?.username || c.author?.display_name || '', hash: c.hash || '', timestamp: c.timestamp || '' })), checkedAt: new Date().toISOString() };
}
export function socialIntel(p) {
  const text = `${p.name || ''} ${p.symbol || ''} ${p.tagline || ''} ${p.narrative || ''}`.toLowerCase();
  const scan = analyzeMentionsText(p.mentionText, p.socialKeyword || p.symbol || p.name);
  const farcaster = farcasterIntel(p);
  const flags = [...scan.flags, ...farcaster.flags];
  let score = 20 + Math.min(24, scan.count * 1.2) + (scan.sentiment === 'Bullish' ? 10 : scan.sentiment === 'Bearish' ? -10 : 0) - Math.min(16, scan.spamScore * .2) + farcaster.score * .22;
  if (p.website) { score += 14; flags.push({ level: 'good', label: 'Website present', detail: 'Project has a website link.' }); }
  else flags.push({ level: 'warn', label: 'Missing website', detail: 'No website link added.' });
  if (p.docs) { score += 10; flags.push({ level: 'good', label: 'Docs present', detail: 'Docs link improves builder trust.' }); }
  else flags.push({ level: 'warn', label: 'Missing docs', detail: 'No docs link added.' });
  if (p.xLink || p.farcaster) { score += 16; flags.push({ level: 'good', label: 'Social link present', detail: 'X/Farcaster link gives the Meme Agent social context.' }); }
  else flags.push({ level: 'warn', label: 'No social proof', detail: 'No X/Farcaster link added.' });
  if (p.socialKeyword) { score += 12; flags.push({ level: 'good', label: 'Narrative keyword', detail: `Tracking keyword: ${p.socialKeyword}.` }); }
  if (text.includes('ai') || text.includes('agent')) { score += 12; flags.push({ level: 'good', label: 'Clear AI narrative', detail: 'AI/agent wording is present in project narrative.' }); }
  if (text.includes('base')) { score += 8; flags.push({ level: 'good', label: 'Base-native narrative', detail: 'Base positioning is clear.' }); }
  if ((p.symbol || '').length >= 3 && (p.symbol || '').length <= 6) { score += 5; flags.push({ level: 'good', label: 'Ticker-friendly', detail: 'Ticker is short enough to share.' }); }
  if (!p.narrative && !p.tagline) flags.push({ level: 'warn', label: 'Weak shareability', detail: 'Add a tagline or short narrative for social posts.' });
  return { score: clamp(score), flags, scan, farcaster };
}
export function walletLabels(p) {
  const labels = new Map();
  const add = (addr, label, level = 'neutral', detail = '') => {
    const a = String(addr || '').toLowerCase();
    if (!isAddress(a)) return;
    const item = labels.get(a) || { address: a, labels: [], level: 'neutral', details: [] };
    if (!item.labels.includes(label)) item.labels.push(label);
    if (detail) item.details.push(detail);
    const rank = { neutral: 0, good: 1, warn: 2, danger: 3 };
    if (rank[level] > rank[item.level]) item.level = level;
    labels.set(a, item);
  };
  add(ownerAddress(p), 'Owner', 'warn', 'Owner address from security/manual data.');
  add(p.deployerAddress || p.deployer?.address, 'Deployer', 'warn', 'Token deployer/creator wallet.');
  add(p.pairAddress, 'LP Pair', 'neutral', 'DEX pair/pool address.');
  if (p.transferFlow?.topNetWallet) add(p.transferFlow.topNetWallet, 'Whale Receiver', p.transferFlow.netToTopWalletPct >= 10 ? 'danger' : 'warn', `Top net receiver ${num(p.transferFlow.netToTopWalletPct).toFixed(1)}% of observed transfer volume.`);
  if (Array.isArray(p.holders?.topHolders)) p.holders.topHolders.slice(0, 10).forEach((h, i) => add(h.TokenHolderAddress || h.address || h.holderAddress, i === 0 ? 'Top Holder #1' : 'Top Holder', i < 3 ? 'warn' : 'neutral', `Top holder rank ${i + 1}.`));
  if (Array.isArray(p.transferFlow?.sample)) {
    const counts = new Map();
    p.transferFlow.sample.forEach(tx => [tx.from, tx.to].forEach(addr => { const a = String(addr || '').toLowerCase(); if (isAddress(a)) counts.set(a, (counts.get(a) || 0) + 1); }));
    for (const [addr, count] of counts.entries()) if (count >= 4) add(addr, 'Router-like', 'neutral', `${count} appearances in sampled transfers.`);
  }
  if (p.deployerScan?.txCount >= 300) add(p.deployerAddress || ownerAddress(p), 'High Activity Wallet', 'warn', `${p.deployerScan.txCount} fetched transactions.`);
  if (p.deployerScan?.contractCreations >= 3) add(p.deployerAddress || ownerAddress(p), 'Factory-like Deployer', p.deployerScan.contractCreations >= 8 ? 'danger' : 'warn', `${p.deployerScan.contractCreations} contract creations in fetched history.`);
  const rows = [...labels.values()].map(item => ({ ...item, summary: item.labels.join(', ') }));
  return { labels: rows, count: rows.length, riskCount: rows.filter(x => x.level === 'danger' || x.level === 'warn').length };
}
export function walletLabelIntel(p) {
  const labeled = walletLabels(p);
  const flags = [];
  let score = 55;
  if (!labeled.count) return { available: false, score: 45, confidence: 'Missing', ...labeled, flags: [{ level: 'warn', label: 'No wallet labels', detail: 'Run deployer, holder, or whale-flow scans to classify wallets.' }] };
  if (labeled.count >= 4) { score += 10; flags.push({ level: 'good', label: 'Wallet context attached', detail: `${labeled.count} relevant wallets labeled.` }); }
  else flags.push({ level: 'warn', label: 'Limited wallet context', detail: `${labeled.count} wallets labeled.` });
  const dangerous = labeled.labels.filter(x => x.level === 'danger');
  const warnings = labeled.labels.filter(x => x.level === 'warn');
  if (dangerous.length) { score -= 22; flags.push({ level: 'danger', label: 'Danger wallet labels', detail: dangerous.slice(0, 3).map(x => `${shortAddr(x.address)} ${x.summary}`).join(' · ') }); }
  if (warnings.length) { score -= Math.min(16, warnings.length * 4); flags.push({ level: 'warn', label: 'Wallet warnings', detail: warnings.slice(0, 3).map(x => `${shortAddr(x.address)} ${x.summary}`).join(' · ') }); }
  if (labeled.labels.some(x => x.labels.includes('Router-like')) && !dangerous.length) { score += 6; flags.push({ level: 'neutral', label: 'Router-like flow context', detail: 'Some repeated transfer hubs look router-like rather than pure whale wallets.' }); }
  const confidence = score >= 75 ? 'High' : score >= 55 ? 'Medium' : score >= 35 ? 'Low' : 'Missing';
  return { available: true, score: clamp(score), confidence, ...labeled, flags };
}
export function whaleFlowEngine(p) {
  const flow = p.transferFlow || null;
  const labelIntel = walletLabelIntel(p);
  const flags = [];
  if (!flow) return { available: false, score: 45, confidence: 'Missing', flow: null, direction: 'Unknown', accumulationPct: 0, distributionPct: 0, ownerOutPct: 0, burstScore: 0, hubCount: 0, flags: [{ level: 'warn', label: 'Transfer flow not scanned', detail: 'Run Whale Flow scan with BaseScan key for recent token transfers.' }] };
  const transfers = Array.isArray(flow.transfers) ? flow.transfers : Array.isArray(flow.sample) ? flow.sample : [];
  const total = num(flow.totalObserved) || transfers.reduce((sum, tx) => sum + num(tx.amount || tx.value), 0);
  const ownerSet = new Set([ownerAddress(p), p.deployerAddress, p.deployer?.address, p.security?.creator_address].filter(Boolean).map(x => String(x).toLowerCase()));
  const normalize = tx => ({ ...tx, from: String(tx.from || '').toLowerCase(), to: String(tx.to || '').toLowerCase(), amount: num(tx.amount || tx.value), ts: num(tx.timeStamp || tx.timestamp) });
  const rows = transfers.map(normalize).filter(tx => tx.amount >= 0);
  const net = new Map();
  const counts = new Map();
  const amountByWallet = new Map();
  let ownerOut = 0, ownerIn = 0;
  for (const tx of rows) {
    if (isAddress(tx.from)) { net.set(tx.from, (net.get(tx.from) || 0) - tx.amount); counts.set(tx.from, (counts.get(tx.from) || 0) + 1); amountByWallet.set(tx.from, (amountByWallet.get(tx.from) || 0) + tx.amount); }
    if (isAddress(tx.to)) { net.set(tx.to, (net.get(tx.to) || 0) + tx.amount); counts.set(tx.to, (counts.get(tx.to) || 0) + 1); amountByWallet.set(tx.to, (amountByWallet.get(tx.to) || 0) + tx.amount); }
    if (ownerSet.has(tx.from)) ownerOut += tx.amount;
    if (ownerSet.has(tx.to)) ownerIn += tx.amount;
  }
  const positive = [...net.entries()].filter(([,v]) => v > 0).sort((a,b)=>b[1]-a[1]);
  const negative = [...net.entries()].filter(([,v]) => v < 0).sort((a,b)=>a[1]-b[1]);
  const accumulationPct = total ? positive.slice(0, 3).reduce((a,[,v])=>a+v,0) / total * 100 : num(flow.netToTopWalletPct);
  const distributionPct = total ? Math.abs(negative.slice(0, 3).reduce((a,[,v])=>a+v,0)) / total * 100 : 0;
  const ownerOutPct = total ? ownerOut / total * 100 : num(flow.ownerOutPct);
  const ownerInPct = total ? ownerIn / total * 100 : num(flow.ownerInPct);
  const hubCount = num(flow.exchangeLikeCount) || [...counts.values()].filter(v => v >= 8).length;
  const timestamps = rows.map(x => x.ts).filter(Boolean).sort((a,b)=>a-b);
  let burstScore = num(flow.burstScore);
  if (!burstScore && timestamps.length >= 8) {
    const span = Math.max(1, timestamps[timestamps.length - 1] - timestamps[0]);
    const perHour = timestamps.length / Math.max(1, span / 3600);
    burstScore = clamp(perHour * 12, 0, 100);
  }
  const topNetWallet = flow.topNetWallet || positive[0]?.[0] || '';
  let score = 58;
  if (num(flow.transferCount) >= 80) { score += 10; flags.push({ level: 'good', label: 'Active transfer flow', detail: `${flow.transferCount} recent transfers reviewed.` }); }
  else if (num(flow.transferCount) >= 20) flags.push({ level: 'neutral', label: 'Moderate transfer flow', detail: `${flow.transferCount} recent transfers reviewed.` });
  else { score -= 8; flags.push({ level: 'warn', label: 'Thin transfer flow', detail: `${num(flow.transferCount)} recent transfers reviewed.` }); }
  if (num(flow.uniqueWallets) >= 40) { score += 10; flags.push({ level: 'good', label: 'Wallet spread', detail: `${flow.uniqueWallets} unique wallets in recent transfers.` }); }
  else if (num(flow.uniqueWallets) > 0) { score -= 6; flags.push({ level: 'warn', label: 'Limited wallet spread', detail: `${flow.uniqueWallets} unique wallets in recent transfers.` }); }
  if (num(flow.largeTransferCount) >= 6) { score -= 12; flags.push({ level: 'warn', label: 'Large transfer cluster', detail: `${flow.largeTransferCount} large transfers detected.` }); }
  if (accumulationPct >= 18 || num(flow.netToTopWalletPct) >= 10) { score -= accumulationPct >= 30 ? 24 : 16; flags.push({ level: accumulationPct >= 30 ? 'danger' : 'warn', label: 'Whale accumulation risk', detail: `Top net receivers absorbed about ${accumulationPct.toFixed(1)}% of observed transfer volume${topNetWallet ? ` (${shortAddr(topNetWallet)})` : ''}.` }); }
  if (distributionPct >= 25) { score -= 12; flags.push({ level: 'warn', label: 'Whale distribution pressure', detail: `Top net senders distributed about ${distributionPct.toFixed(1)}% of observed flow.` }); }
  if (ownerOutPct >= 5) { score -= ownerOutPct >= 15 ? 24 : 12; flags.push({ level: ownerOutPct >= 15 ? 'danger' : 'warn', label: 'Owner/deployer outbound flow', detail: `Owner/deployer-linked wallets sent about ${ownerOutPct.toFixed(1)}% of observed transfer volume.` }); }
  if (burstScore >= 70) { score -= 12; flags.push({ level: 'warn', label: 'Transfer burst', detail: 'Recent transfers are tightly clustered in time; check for coordinated distribution.' }); }
  if (hubCount >= 8) flags.push({ level: 'neutral', label: 'Exchange/router-like flow', detail: `${hubCount} repeated hub transfers detected.` });
  if (labelIntel.available && labelIntel.score < 45) { score -= 8; flags.push({ level: 'warn', label: 'Wallet labels increase risk', detail: labelIntel.flags[0]?.detail || 'Wallet context adds risk.' }); }
  const direction = ownerOutPct >= 5 ? 'Owner Distribution' : accumulationPct >= 18 ? 'Whale Accumulation' : distributionPct >= 25 ? 'Whale Distribution' : num(flow.uniqueWallets) >= 40 ? 'Broad Flow' : 'Thin Flow';
  const confidence = score >= 75 ? 'High' : score >= 55 ? 'Medium' : score >= 35 ? 'Low' : 'Missing';
  return { available: true, score: clamp(score), confidence, flow: { ...flow, topNetWallet }, direction, accumulationPct, distributionPct, ownerOutPct, ownerInPct, burstScore, hubCount, topReceivers: positive.slice(0, 5).map(([address, amount]) => ({ address, amount, pct: total ? amount / total * 100 : 0 })), topSenders: negative.slice(0, 5).map(([address, amount]) => ({ address, amount: Math.abs(amount), pct: total ? Math.abs(amount) / total * 100 : 0 })), labels: labelIntel.labels, flags };
}
export function whaleFlowIntel(p) {
  return whaleFlowEngine(p);
}
export async function fetchTransferFlow(contract, apiKey) {
  if (!apiKey) throw new Error('BaseScan API key required for transfer flow scan');
  if (!isAddress(contract)) throw new Error('Invalid token contract');
  const url = `https://api.etherscan.io/v2/api?chainid=${BASE_CHAIN_ID}&module=account&action=tokentx&contractaddress=${contract}&page=1&offset=100&sort=desc&apikey=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`BaseScan transfer request failed (${res.status})`);
  const data = await res.json();
  const rows = Array.isArray(data.result) ? data.result : [];
  if (!rows.length) throw new Error(typeof data.result === 'string' ? data.result : 'No token transfers returned');
  const decimals = num(rows[0]?.tokenDecimal) || 18;
  const scale = 10 ** Math.min(decimals, 18);
  const amounts = rows.map(r => num(r.value) / scale).filter(v => Number.isFinite(v));
  const total = amounts.reduce((a,b)=>a+b,0);
  const sorted = amounts.slice().sort((a,b)=>a-b);
  const median = sorted.length ? sorted[Math.floor(sorted.length/2)] : 0;
  const largeThreshold = Math.max(median * 8, total * .02);
  const largeTransferCount = amounts.filter(v => v >= largeThreshold && v > 0).length;
  const wallets = new Set();
  const net = new Map();
  const counts = new Map();
  rows.forEach((r, idx) => {
    const from = String(r.from || '').toLowerCase();
    const to = String(r.to || '').toLowerCase();
    const amount = amounts[idx] || 0;
    if (from) { wallets.add(from); net.set(from, (net.get(from) || 0) - amount); counts.set(from, (counts.get(from) || 0) + 1); }
    if (to) { wallets.add(to); net.set(to, (net.get(to) || 0) + amount); counts.set(to, (counts.get(to) || 0) + 1); }
  });
  const topNet = [...net.entries()].sort((a,b)=>b[1]-a[1])[0] || ['', 0];
  const exchangeLikeCount = [...counts.values()].filter(v => v >= 8).length;
  return { contract, transferCount: rows.length, uniqueWallets: wallets.size, totalObserved: total, medianTransfer: median, largeTransferCount, netToTopWallet: topNet[1], netToTopWalletPct: total ? topNet[1] / total * 100 : 0, topNetWallet: topNet[0], exchangeLikeCount, transfers: rows.slice(0, 100).map((r, idx) => ({ hash: r.hash, from: r.from, to: r.to, value: r.value, amount: amounts[idx] || 0, tokenSymbol: r.tokenSymbol, timeStamp: r.timeStamp })), sample: rows.slice(0, 8).map((r, idx) => ({ hash: r.hash, from: r.from, to: r.to, value: r.value, amount: amounts[idx] || 0, tokenSymbol: r.tokenSymbol, timeStamp: r.timeStamp })), checkedAt: new Date().toISOString() };
}
export function holderRiskEngine(p) {
  const h = p.holders || null;
  const flags = [];
  if (!h) return { available: false, score: 45, tier: 'Unknown', top1Pct: 0, top5Pct: 0, top10Pct: 0, top20Pct: 0, holderCount: 0, concentrationIndex: 0, clusterRiskPct: 0, ownerPct: 0, whaleReceiverPct: 0, topRows: [], flags: [{ level: 'warn', label: 'Holder distribution unknown', detail: 'Run Holder Scan to compute top holder tiers.' }] };
  const rows = (Array.isArray(h.topHolders) ? h.topHolders : []).map((r, i) => {
    const address = String(r.TokenHolderAddress || r.address || r.holderAddress || '').toLowerCase();
    return { ...r, rank: i + 1, address, balance: num(r.TokenHolderQuantity || r.balance || r.value || r.quantity), pct: num(r.pct || r.percentage) };
  });
  const supply = num(h.supply || h.totalSupply || h.tokenSupply) || rows.reduce((sum, r) => sum + r.balance, 0);
  const withPct = rows.map(r => ({ ...r, pct: r.pct || (supply ? r.balance / supply * 100 : 0) }));
  const sumPct = (n) => withPct.slice(0, n).reduce((a,b)=>a+b.pct,0);
  const top1Pct = num(h.top1Pct) || sumPct(1);
  const top5Pct = num(h.top5Pct) || sumPct(5);
  const top10Pct = num(h.top10Pct) || sumPct(10);
  const top20Pct = num(h.top20Pct) || sumPct(20) || top10Pct;
  const holderCount = num(h.holderCount);
  const concentrationIndex = clamp(top1Pct * .42 + top5Pct * .28 + top10Pct * .2 + top20Pct * .1, 0, 100);
  const labels = walletLabelIntel(p).labels || [];
  const labelFor = (addr) => labels.find(x => x.address === String(addr || '').toLowerCase());
  const ownerLike = new Set([ownerAddress(p), p.deployerAddress, p.deployer?.address, p.security?.creator_address].filter(Boolean).map(x => String(x).toLowerCase()));
  const ownerRows = withPct.filter(r => ownerLike.has(r.address) || (labelFor(r.address)?.labels || []).some(l => l === 'Owner' || l === 'Deployer'));
  const whaleRows = withPct.filter(r => (labelFor(r.address)?.labels || []).includes('Whale Receiver'));
  const ownerPct = ownerRows.reduce((a,b)=>a+b.pct,0) || num(h.deployerPct);
  const whaleReceiverPct = whaleRows.reduce((a,b)=>a+b.pct,0);
  const clusterRiskPct = ownerPct + whaleReceiverPct + (p.transferFlow?.netToTopWalletPct >= 10 ? num(p.transferFlow.netToTopWalletPct) : 0);
  let score = 90;
  score -= concentrationIndex * .55;
  if (top1Pct >= 25) flags.push({ level: 'danger', label: 'Top holder dominance', detail: `Top holder controls about ${top1Pct.toFixed(1)}%.` });
  else if (top1Pct >= 12) flags.push({ level: 'warn', label: 'Large top holder', detail: `Top holder controls about ${top1Pct.toFixed(1)}%.` });
  else if (top1Pct > 0) { score += 4; flags.push({ level: 'good', label: 'Top holder contained', detail: `Top holder is about ${top1Pct.toFixed(1)}%.` }); }
  if (top5Pct >= 55) flags.push({ level: 'danger', label: 'Top 5 concentration', detail: `Top 5 holders control about ${top5Pct.toFixed(1)}%.` });
  else if (top5Pct >= 35) flags.push({ level: 'warn', label: 'Top 5 concentration', detail: `Top 5 holders control about ${top5Pct.toFixed(1)}%.` });
  if (top10Pct >= 75) flags.push({ level: 'danger', label: 'Dangerous top 10', detail: `Top 10 holders control about ${top10Pct.toFixed(1)}%.` });
  else if (top10Pct >= 55) flags.push({ level: 'warn', label: 'Top-heavy holders', detail: `Top 10 holders control about ${top10Pct.toFixed(1)}%.` });
  else if (top10Pct > 0) { score += 5; flags.push({ level: 'good', label: 'Top 10 spread acceptable', detail: `Top 10 holders control about ${top10Pct.toFixed(1)}%.` }); }
  if (holderCount && holderCount < 250) { score -= 10; flags.push({ level: 'warn', label: 'Small holder base', detail: `${holderCount} holders suggests early distribution.` }); }
  else if (holderCount >= 1000) { score += 6; flags.push({ level: 'good', label: 'Broad holder base', detail: `${holderCount} holders.` }); }
  if (ownerPct >= 10) { score -= ownerPct >= 25 ? 26 : 15; flags.push({ level: ownerPct >= 25 ? 'danger' : 'warn', label: 'Owner/deployer is top holder', detail: `Owner/deployer-linked wallets hold about ${ownerPct.toFixed(1)}%.` }); }
  if (whaleReceiverPct >= 8) { score -= 12; flags.push({ level: 'warn', label: 'Whale receiver still top holder', detail: `Recent top receiver holds about ${whaleReceiverPct.toFixed(1)}%.` }); }
  if (clusterRiskPct >= 35) { score -= 16; flags.push({ level: 'danger', label: 'Clustered holder risk', detail: `Owner, whale, or flow-linked wallets represent about ${clusterRiskPct.toFixed(1)}% combined risk exposure.` }); }
  const dangerCount = flags.filter(f => f.level === 'danger').length;
  const warnCount = flags.filter(f => f.level === 'warn').length;
  score -= dangerCount * 8 + warnCount * 3;
  const tier = score >= 76 ? 'Healthy' : score >= 56 ? 'Concentrated' : score >= 36 ? 'Top-heavy' : 'Dangerous';
  return { available: true, score: clamp(score), tier, top1Pct, top5Pct, top10Pct, top20Pct, holderCount, concentrationIndex, clusterRiskPct, ownerPct, whaleReceiverPct, ownerTop: ownerRows[0] || null, whaleTop: whaleRows[0] || null, topRows: withPct.slice(0, 20), flags };
}
export function holderDistribution(p) {
  return holderRiskEngine(p);
}
export function holderIntel(p) {
  const h = p.holders || null;
  const whale = whaleFlowIntel(p);
  const dist = holderDistribution(p);
  const flags = [...whale.flags, ...dist.flags];
  if (!h) return { available: false, top1Pct: 0, top5Pct: 0, top10Pct: 0, top20Pct: 0, holderCount: 0, deployerPct: 0, whale, distribution: dist, flags: [...flags, { level: 'warn', label: 'Holders not checked', detail: 'Run holder scan to estimate concentration and whale risk.' }] };
  const deployerPct = num(h.deployerPct);
  if (deployerPct >= 10) flags.push({ level: 'warn', label: 'Deployer exposure', detail: `Deployer/creator wallet may hold about ${deployerPct.toFixed(1)}%.` });
  if (!flags.length) flags.push({ level: 'good', label: 'No holder red flag', detail: 'Fetched holder data shows no major concentration flag.' });
  return { available: true, top1Pct: dist.top1Pct, top5Pct: dist.top5Pct, top10Pct: dist.top10Pct, top20Pct: dist.top20Pct, deployerPct, holderCount: dist.holderCount, whale, distribution: dist, flags };
}
export async function fetchHolderIntel(contract, apiKey) {
  if (!apiKey) throw new Error('BaseScan API key required for holder scan');
  if (!isAddress(contract)) throw new Error('Invalid token contract');
  const supplyUrl = `https://api.etherscan.io/v2/api?chainid=${BASE_CHAIN_ID}&module=stats&action=tokensupply&contractaddress=${contract}&apikey=${apiKey}`;
  const holdersUrl = `https://api.etherscan.io/v2/api?chainid=${BASE_CHAIN_ID}&module=token&action=tokenholderlist&contractaddress=${contract}&page=1&offset=20&apikey=${apiKey}`;
  const [supplyRes, holdersRes] = await Promise.all([fetch(supplyUrl), fetch(holdersUrl)]);
  const supplyData = await supplyRes.json();
  const holdersData = await holdersRes.json();
  const supply = num(supplyData.result);
  const rows = Array.isArray(holdersData.result) ? holdersData.result : [];
  if (!rows.length) throw new Error(holdersData.result || 'No holder list returned');
  const balances = rows.map(r => num(r.TokenHolderQuantity || r.balance || r.value));
  const sumN = (n) => balances.slice(0, n).reduce((a,b)=>a+b,0);
  const top1Pct = supply ? sumN(1) / supply * 100 : 0;
  const top5Pct = supply ? sumN(5) / supply * 100 : 0;
  const top10Pct = supply ? sumN(10) / supply * 100 : 0;
  const top20Pct = supply ? sumN(20) / supply * 100 : 0;
  return { holderCount: num(holdersData.message?.match?.(/\d+/)?.[0]) || 0, supply, top1Pct, top5Pct, top10Pct, top20Pct, topHolders: rows.slice(0,20), deployerPct: 0 };
}
export function securityIntel(p) {
  const sec = p.security || null;
  const flags = [];
  if (!sec) return { available: false, score: 50, flags: [{ level: 'warn', label: 'Security not checked', detail: 'Run contract security scan for tax, honeypot, owner, and mint signals.' }] };
  const buyTax = pct(sec.buy_tax);
  const sellTax = pct(sec.sell_tax);
  if (boolRisk(sec.is_honeypot)) flags.push({ level: 'danger', label: 'Honeypot risk', detail: 'Security API marks this token as honeypot risk.' });
  if (boolRisk(sec.is_blacklisted)) flags.push({ level: 'danger', label: 'Blacklist function', detail: 'Contract may include blacklist controls.' });
  if (boolRisk(sec.can_take_back_ownership)) flags.push({ level: 'danger', label: 'Ownership risk', detail: 'Owner may be able to reclaim control.' });
  if (boolRisk(sec.is_mintable)) flags.push({ level: 'warn', label: 'Mintable', detail: 'Supply may be expandable by privileged roles.' });
  if (boolRisk(sec.is_proxy)) flags.push({ level: 'warn', label: 'Proxy contract', detail: 'Implementation may be upgradeable.' });
  if (buyTax > 5 || sellTax > 5) flags.push({ level: buyTax > 15 || sellTax > 15 ? 'danger' : 'warn', label: 'High tax', detail: `Buy tax ${buyTax.toFixed(1)}%, sell tax ${sellTax.toFixed(1)}%.` });
  if (sec.is_open_source === '0') flags.push({ level: 'warn', label: 'Unverified source', detail: 'Contract source may not be open/verified.' });
  if (sec.owner_address && !/^0x0{40}$/i.test(sec.owner_address)) flags.push({ level: 'warn', label: 'Owner present', detail: `Owner address ${shortAddr(sec.owner_address)} should be reviewed.` });
  if (!flags.length) flags.push({ level: 'good', label: 'No major contract flag', detail: 'Security API did not return major tax/honeypot/owner flags.' });
  let score = 78;
  for (const flag of flags) {
    if (flag.level === 'danger') score -= 24;
    if (flag.level === 'warn') score -= 9;
    if (flag.level === 'good') score += 6;
  }
  return { available: true, score: clamp(score, 5, 95), buyTax, sellTax, flags };
}
export async function fetchTokenSecurity(contract) {
  if (!isAddress(contract)) throw new Error('Invalid address');
  const res = await fetch(`https://api.gopluslabs.io/api/v1/token_security/${BASE_CHAIN_ID}?contract_addresses=${contract}`);
  if (!res.ok) throw new Error(`Security request failed (${res.status})`);
  const data = await res.json();
  const result = data.result || {};
  const security = result[contract.toLowerCase()] || result[contract] || null;
  if (!security || !Object.keys(security).length) throw new Error('No security result returned');
  return security;
}
export function getRiskIntel(p) {
  const liquidity = num(p.liquidity);
  const volume = num(p.volume);
  const marketCap = num(p.marketCap);
  const priceChange = num(p.priceChange24h);
  const buys = num(p.buys24h);
  const sells = num(p.sells24h);
  const txns = buys + sells;
  const volToLiq = liquidity ? volume / liquidity : 0;
  const fdvToLiq = liquidity ? marketCap / liquidity : 0;
  const buySellRatio = sells ? buys / sells : buys ? 99 : 0;
  const secIntel = securityIntel(p);
  const hIntel = holderIntel(p);
  const lpIntel = lpDeployerIntel(p);
  const flags = [...secIntel.flags, ...hIntel.flags, ...lpIntel.flags];
  if (liquidity < 15000) flags.push({ level: 'danger', label: 'Thin liquidity', detail: 'Liquidity is low for a live Base token.' });
  else if (liquidity < 75000) flags.push({ level: 'warn', label: 'Early liquidity', detail: 'Liquidity is usable but still fragile.' });
  else flags.push({ level: 'good', label: 'Liquidity base', detail: 'Liquidity is strong enough for cleaner reads.' });
  if (volToLiq > 1.5) flags.push({ level: 'warn', label: 'Hot flow', detail: '24h volume is high compared with liquidity.' });
  else if (volToLiq > .25) flags.push({ level: 'good', label: 'Healthy DEX flow', detail: 'Volume/liquidity ratio shows active trading.' });
  else flags.push({ level: 'warn', label: 'Quiet flow', detail: 'DEX activity is still light.' });
  if (fdvToLiq > 120) flags.push({ level: 'danger', label: 'High FDV/liquidity', detail: 'Valuation is stretched versus available liquidity.' });
  else if (fdvToLiq > 45) flags.push({ level: 'warn', label: 'Watch valuation', detail: 'FDV/liquidity ratio needs monitoring.' });
  else if (fdvToLiq > 0) flags.push({ level: 'good', label: 'Balanced valuation', detail: 'FDV/liquidity ratio is not extreme.' });
  if (Math.abs(priceChange) > 60) flags.push({ level: 'warn', label: 'Extreme 24h move', detail: 'Large move can invite pullbacks and FOMO risk.' });
  if (txns > 0 && (buySellRatio > 3 || buySellRatio < .33)) flags.push({ level: 'warn', label: 'Skewed buys/sells', detail: 'Buy/sell activity is unusually one-sided.' });
  return { liquidity, volume, marketCap, priceChange, buys, sells, txns, volToLiq, fdvToLiq, buySellRatio, security: secIntel, holders: hIntel, lpDeployer: lpIntel, flags };
}
export function riskFromPair(pair) {
  const draft = {
    liquidity: num(pair.liquidity?.usd),
    volume: num(pair.volume?.h24),
    marketCap: num(pair.fdv || pair.marketCap),
    priceChange24h: num(pair.priceChange?.h24),
    buys24h: num(pair.txns?.h24?.buys),
    sells24h: num(pair.txns?.h24?.sells)
  };
  const intel = getRiskIntel(draft);
  let risk = 48;
  for (const flag of intel.flags) {
    if (flag.level === 'danger') risk += 18;
    if (flag.level === 'warn') risk += 7;
    if (flag.level === 'good') risk -= 7;
  }
  if (intel.liquidity >= 250000) risk -= 8;
  return Math.round(clamp(risk, 8, 92));
}
export function mentionsFromPair(pair) {
  const volume = num(pair.volume?.h24);
  const txns = num(pair.txns?.h24?.buys) + num(pair.txns?.h24?.sells);
  return Math.round(clamp(Math.log10(volume + 100) * 12 + Math.log10(txns + 10) * 16, 10, 95));
}
export function reason(text, level = 'neutral') { return { text, level }; }
function daysSince(value) {
  if (!value) return null;
  const days = (Date.now() - new Date(value).getTime()) / 86400000;
  return Number.isFinite(days) ? Math.max(0, days) : null;
}
export function githubFreshness(p) {
  const pushedDays = daysSince(p.lastPushed);
  const createdDays = daysSince(p.repoCreatedAt);
  const issueLoad = num(p.openIssues) / Math.max(1, num(p.stars));
  const forkRatio = num(p.forks) / Math.max(1, num(p.stars));
  const secIntel = securityIntel(p);
  const hIntel = holderIntel(p);
  const lpIntel = lpDeployerIntel(p);
  const flags = [...secIntel.flags, ...hIntel.flags, ...lpIntel.flags];
  let badge = 'Unknown';
  let level = 'neutral';
  if (pushedDays === null) flags.push({ level: 'warn', label: 'No push data', detail: 'Import GitHub repo to verify freshness.' });
  else if (pushedDays <= 14) { badge = 'Fresh'; level = 'good'; flags.push({ level: 'good', label: 'Fresh repo', detail: 'Repo was pushed within 14 days.' }); }
  else if (pushedDays <= 60) { badge = 'Active'; level = 'good'; flags.push({ level: 'good', label: 'Active repo', detail: 'Repo has recent activity.' }); }
  else if (pushedDays <= 180) { badge = 'Stale'; level = 'warn'; flags.push({ level: 'warn', label: 'Stale repo', detail: 'Repo has not moved recently.' }); }
  else { badge = 'Abandoned Risk'; level = 'danger'; flags.push({ level: 'danger', label: 'Abandoned risk', detail: 'Repo looks inactive for more than 180 days.' }); }
  if (createdDays !== null && createdDays <= 60 && num(p.commits) >= 20) flags.push({ level: 'good', label: 'New but building', detail: 'Young repo already has visible commit depth.' });
  if (num(p.stars) >= 500 && num(p.commits) < 50) flags.push({ level: 'warn', label: 'Stars ahead of build', detail: 'Star count is high compared with commit depth.' });
  if (forkRatio >= .15) flags.push({ level: 'good', label: 'Fork interest', detail: 'Fork ratio suggests developer interest.' });
  if (issueLoad > .35 && num(p.openIssues) > 20) flags.push({ level: 'warn', label: 'Issue pressure', detail: 'Open issues are high relative to stars.' });
  return { pushedDays, createdDays, issueLoad, forkRatio, badge, level, flags };
}
function freshnessDays(p) { return daysSince(p.lastPushed); }
export function scoreProject(p) {
  const intel = getRiskIntel(p);
  const hasRepo = Boolean(parseRepo(p.repo || '') || p.repoUrl);
  const hasDex = Boolean(p.pairUrl || p.pairAddress || p.dexId);
  const fresh = githubFreshness(p);
  const days = fresh.pushedDays;
  const marketCheck = marketCrossCheck(p);
  const reasons = { builder: [], market: [], meme: [], safety: [], confidence: [] };

  let builder = 18;
  if (hasRepo) { builder += 14; reasons.builder.push(reason('GitHub repo is attached.', 'good')); }
  else reasons.builder.push(reason('No GitHub repo imported; builder score is capped.', 'warn'));
  builder += clamp(Math.log10(num(p.stars) + 1) * 13, 0, 28);
  builder += clamp(Math.log10(num(p.commits) + 1) * 9, 0, 20);
  builder += clamp(Math.log10(num(p.forks) + 1) * 8, 0, 14);
  if (days !== null && days <= 14) { builder += 12; reasons.builder.push(reason('Repo was updated recently.', 'good')); }
  else if (days !== null && days <= 60) { builder += 6; reasons.builder.push(reason('Repo has recent activity.', 'good')); }
  else if (days !== null && days > 180) { builder -= 16; reasons.builder.push(reason('Repo has abandoned-risk freshness.', 'danger')); }
  else if (days !== null && days > 90) { builder -= 10; reasons.builder.push(reason('Repo looks stale.', 'warn')); }
  for (const flag of fresh.flags.slice(1)) reasons.builder.push(reason(flag.detail, flag.level));
  if (num(p.stars) >= 500) reasons.builder.push(reason('Strong star count gives social proof.', 'good'));
  if (num(p.commits) < 20) reasons.builder.push(reason('Commit history is still thin.', 'warn'));
  builder = clamp(builder);

  let market = 10;
  if (hasDex) { market += 12; reasons.market.push(reason('Live Base DEX data is attached.', 'good')); }
  else reasons.market.push(reason('No live DEX pair imported; market score uses manual inputs.', 'warn'));
  market += clamp(Math.log10(num(p.volume) + 100) * 13, 0, 32);
  market += clamp(Math.log10(num(p.liquidity) + 100) * 10, 0, 28);
  market += clamp(Math.log10(num(p.marketCap) + 1000) * 4, 0, 15);
  if (marketCheck.available && marketCheck.score >= 75) { market += 6; reasons.market.push(reason('Market data is cross-checked by GeckoTerminal.', 'good')); }
  if (marketCheck.available && marketCheck.score < 45) { market -= 10; reasons.market.push(reason('Market source mismatch needs review.', 'warn')); }
  if (intel.volToLiq > .25 && intel.volToLiq <= 1.5) reasons.market.push(reason('Volume/liquidity ratio shows active but not overheated trading.', 'good'));
  if (intel.volToLiq > 1.5) { market -= 7; reasons.market.push(reason('Volume is hot versus liquidity; momentum may be unstable.', 'warn')); }
  if (num(p.liquidity) < 15000) { market -= 12; reasons.market.push(reason('Liquidity is too thin for a clean market read.', 'danger')); }
  if (!hasDex) { market = Math.min(market, 62); reasons.market.push(reason('Market score is capped until live DEX pair data is imported.', 'warn')); }
  market = clamp(market);

  const social = socialIntel(p);
  const lpDep = lpDeployerIntel(p);
  let meme = 12 + clamp(Math.log10(num(p.mentions) + 5) * 20, 0, 40) + clamp(Math.max(0, num(p.priceChange24h)) * .18, 0, 16) + clamp(Math.log10(intel.txns + 10) * 7, 0, 14) + social.score * .3;
  if (num(p.priceChange24h) > 20) reasons.meme.push(reason('Positive 24h move is easy to package into a narrative.', 'good'));
  if (intel.txns > 100) reasons.meme.push(reason('Buy/sell activity suggests attention is present.', 'good'));
  if (num(p.mentions) < 20) reasons.meme.push(reason('Narrative signal is still light.', 'warn'));
  for (const flag of social.flags.slice(0,3)) reasons.meme.push(reason(flag.detail, flag.level));
  meme = clamp(meme);

  const holderRisk = holderRiskEngine(p);
  let safety = clamp((100 - num(p.risk)) * .62 + lpDep.score * .2 + holderRisk.score * .18);
  for (const flag of holderRisk.flags.slice(0,4)) reasons.safety.push(reason(flag.detail, flag.level));
  for (const flag of intel.flags) {
    reasons.safety.push(reason(flag.detail, flag.level));
    if (flag.level === 'danger') safety -= 10;
    if (flag.level === 'warn') safety -= 3;
    if (flag.level === 'good') safety += 2;
  }
  safety = clamp(safety);

  const quality = dataQuality(p);
  let confidence = Math.max(20, quality.completeness * .45);
  if (hasDex) { confidence += 30; reasons.confidence.push(reason('DexScreener data imported.', 'good')); }
  else reasons.confidence.push(reason('Missing live DEX import.', 'warn'));
  if (hasRepo) { confidence += 22; reasons.confidence.push(reason('GitHub data imported or attached.', 'good')); }
  else reasons.confidence.push(reason('Missing GitHub import.', 'warn'));
  if (num(p.volume) && num(p.liquidity)) confidence += 8;
  if (num(p.mentions)) confidence += 5;
  if (quality.completeness < 60) reasons.confidence.push(reason('Data completeness is low; score should be treated as provisional.', 'danger'));
  confidence = clamp(confidence);

  const final = clamp(builder * .27 + market * .35 + meme * .2 + safety * .18);
  if (p.__skipAdjusted) return { builder, market, meme, safety, confidence, final, adjustedFinal: final, reliabilityBadge: 'Unscored', reasons, quality };
  const reliability = sourceReliability({ ...p, scores: { builder, market, meme, safety, confidence, final }, __skipAdjusted: true });
  const haircut = clamp((75 - reliability.score) * .35 + reliability.conflicts.severity * 1.8, 0, 28);
  const adjustedFinal = clamp(final - haircut);
  return { builder, market, meme, safety, confidence, final, adjustedFinal, reliability: reliability.score, reliabilityBadge: reliability.badge, haircut, reasons, quality };
}

export function tokenIntelligence(p) {
  const scored = p.scores || scoreProject(p);
  const quality = dataQuality(p);
  const reliability = sourceReliability({ ...p, scores: scored, __skipAdjusted: true });
  const conflicts = contradictionDetector(p);
  const security = securityIntel(p);
  const holders = holderIntel(p);
  const whales = whaleFlowIntel(p);
  const market = marketCrossCheck(p);
  const deployer = deployerIntel(p);
  const final = Math.round(scored.adjustedFinal ?? scored.final ?? 0);
  const confidence = Math.round(clamp((scored.confidence || 0) * .45 + reliability.score * .35 + quality.completeness * .2 - conflicts.severity * 3, 0, 100));
  const reasons = [];
  const add = (level, label, detail) => reasons.push({ level, label, detail });
  if (quality.completeness < 45) add('warn', 'Missing evidence', `${quality.missing.slice(0, 3).map(x => x.label).join(', ') || 'Key data'} not available yet.`);
  if (reliability.criticalMissing) add('warn', 'Critical scans missing', `${reliability.criticalMissing} high-value checks are missing.`);
  if (security.available && security.score < 55) add('danger', 'Contract risk', security.flags[0]?.label || 'Security scan has risk flags.');
  if (holders.available && holders.score < 50) add('danger', 'Holder concentration', holders.flags[0]?.label || 'Holder distribution looks risky.');
  if (whales.available && whales.score < 45) add('danger', 'Whale/deployer flow', whales.flags[0]?.label || 'Transfer flow is risky.');
  if (market.available && market.score < 45) add('warn', 'Market mismatch', market.flags[0]?.label || 'Market sources disagree.');
  if (deployer.score < 45 && (p.deployerScan || p.deployerAddress || ownerAddress(p))) add('danger', 'Deployer risk', deployer.flags[0]?.label || 'Deployer/owner history needs review.');
  if (!reasons.length && confidence >= 65) add('good', 'Evidence acceptable', 'Core data is available and no major contradiction is active.');
  if (!reasons.length) add('warn', 'Early signal only', 'Import more evidence before trusting this score.');
  let label = 'Insufficient Data';
  if (quality.completeness < 35 || confidence < 35) label = 'Insufficient Data';
  else if (final >= 78 && confidence >= 70 && !reasons.some(r => r.level === 'danger')) label = 'Safe to Watch';
  else if (final >= 58 && confidence >= 45 && reasons.filter(r => r.level === 'danger').length <= 1) label = 'Speculative';
  else if (final >= 38 || reasons.some(r => r.level === 'danger')) label = 'High Risk';
  else label = 'Avoid';
  return { label, score: final, confidence, reliability: reliability.score, completeness: quality.completeness, reasons: reasons.slice(0, 3), missing: quality.missing.slice(0, 4), conflicts: conflicts.items?.slice?.(0, 3) || [] };
}

export function readSavedBattles() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
}
export function writeSavedBattles(items) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }
export function dataQuality(p) {
  const checks = [
    ['Contract', isAddress(p.contract || ''), 'Live DEX identity is missing.'],
    ['Pair', Boolean(p.pairUrl), 'DexScreener pair link is missing.'],
    ['Price', num(p.price) > 0, 'Price data is missing.'],
    ['Volume', num(p.volume) > 0, '24h volume is missing.'],
    ['Liquidity', num(p.liquidity) > 0, 'Liquidity data is missing.'],
    ['Market cap', num(p.marketCap) > 0, 'Market cap/FDV is missing.'],
    ['Repo', Boolean(parseRepo(p.repo || '') || p.repoUrl), 'GitHub repo is missing.'],
    ['Stars', num(p.stars) > 0, 'GitHub stars are missing.'],
    ['Commits', num(p.commits) > 0, 'Commit signal is missing.'],
    ['Risk', num(p.risk) > 0, 'Risk score is missing.']
  ];
  const passed = checks.filter(([, ok]) => ok).length;
  const completeness = Math.round((passed / checks.length) * 100);
  const missing = checks.filter(([, ok]) => !ok).map(([label, , note]) => ({ label, note }));
  const badges = [];
  if (p.pairUrl && isAddress(p.contract || '')) badges.push({ label: 'Live DEX', level: 'good' });
  else badges.push({ label: 'Missing DEX', level: 'warn' });
  if (p.repoUrl || parseRepo(p.repo || '')) badges.push({ label: 'GitHub', level: 'good' });
  else badges.push({ label: 'Missing Repo', level: 'warn' });
  if (!p.pairUrl || !p.repoUrl) badges.push({ label: 'Manual Inputs', level: 'neutral' });
  if (completeness < 55) badges.push({ label: 'Low Confidence', level: 'danger' });
  else if (completeness < 80) badges.push({ label: 'Medium Confidence', level: 'warn' });
  else badges.push({ label: 'High Confidence', level: 'good' });
  return { completeness, missing, badges };
}
export function projectFromPair(contract, pair, fallback = {}) {
  const token = tokenFromPair(pair);
  return {
    name: token.name || fallback.name || 'Base Token',
    symbol: token.symbol || fallback.symbol || '',
    repo: fallback.repo || '',
    chain: 'Base',
    contract,
    price: num(pair.priceUsd),
    marketCap: num(pair.marketCap || pair.fdv || fallback.marketCap),
    volume: num(pair.volume?.h24),
    liquidity: num(pair.liquidity?.usd),
    priceChange24h: num(pair.priceChange?.h24),
    buys24h: num(pair.txns?.h24?.buys),
    sells24h: num(pair.txns?.h24?.sells),
    mentions: mentionsFromPair(pair),
    risk: riskFromPair(pair),
    stars: fallback.stars || 0,
    commits: fallback.commits || 0,
    forks: fallback.forks || 0,
    openIssues: fallback.openIssues || 0,
    pairUrl: pair.url || fallback.pairUrl || '',
    pairAddress: pair.pairAddress || fallback.pairAddress || '',
    dexId: pair.dexId || fallback.dexId || '',
    pairCreatedAt: pair.pairCreatedAt || fallback.pairCreatedAt || 0
  };
}
export async function fetchBaseProject(contract, fallback = {}) {
  if (!isAddress(contract)) throw new Error('Invalid address');
  const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${contract}`);
  if (!res.ok) throw new Error('DexScreener request failed');
  const data = await res.json();
  const allPairs = data.pairs || [];
  if (!allPairs.length) throw new Error('No DEX pair found');
  const pairs = allPairs.filter(p => p.chainId === BASE_CHAIN);
  if (!pairs.length) throw new Error(`No Base pair found (${allPairs[0]?.chainId || 'other chain'} only)`);
  const pair = pairs.sort((a,b) => num(b.liquidity?.usd) - num(a.liquidity?.usd))[0];
  const project = projectFromPair(contract, pair, fallback);
  const warnings = [];
  if (pairs.length > 1) warnings.push(`${pairs.length} Base pairs found; picked highest liquidity`);
  if (num(pair.liquidity?.usd) < 15000) warnings.push('low liquidity');
  if (!num(pair.priceUsd)) warnings.push('missing price');
  if (!num(pair.marketCap || pair.fdv)) warnings.push('missing market cap');
  return { project, warnings, pairCount: pairs.length };
}
export function scoreClass(value) {
  if (value >= 75) return 'good';
  if (value >= 55) return 'warn';
  return 'danger';
}
export function topWeakScore(scores = {}) {
  const keys = ['builder', 'market', 'meme', 'safety'];
  return keys.reduce((worst, k) => num(scores[k]) < num(scores[worst]) ? k : worst, keys[0]);
}
function scoreLabel(value) {
  if (value >= 80) return 'High';
  if (value >= 60) return 'Medium';
  return 'Low';
}
export const DEFAULT_WEIGHTS = {
  score: { builder: 26, market: 34, meme: 22, safety: 18 },
  agents: { 'Builder Agent': 1.05, 'Trader Agent': 1.2, 'Risk Agent': 1.35, 'Meme Agent': .95, 'Whale Agent': 1, 'Skeptic Agent': 1.15 },
  riskVeto: 70,
  preset: 'Balanced'
};
export const WEIGHT_PRESETS = {
  Balanced: DEFAULT_WEIGHTS,
  Degen: { score: { builder: 16, market: 42, meme: 30, safety: 12 }, agents: { 'Builder Agent': .85, 'Trader Agent': 1.45, 'Risk Agent': .9, 'Meme Agent': 1.35, 'Whale Agent': 1.1, 'Skeptic Agent': .8 }, riskVeto: 82, preset: 'Degen' },
  Safe: { score: { builder: 22, market: 24, meme: 12, safety: 42 }, agents: { 'Builder Agent': 1, 'Trader Agent': .9, 'Risk Agent': 1.7, 'Meme Agent': .65, 'Whale Agent': 1.15, 'Skeptic Agent': 1.5 }, riskVeto: 62, preset: 'Safe' },
  Builder: { score: { builder: 44, market: 22, meme: 12, safety: 22 }, agents: { 'Builder Agent': 1.65, 'Trader Agent': .95, 'Risk Agent': 1.05, 'Meme Agent': .65, 'Whale Agent': .85, 'Skeptic Agent': 1.1 }, riskVeto: 70, preset: 'Builder' },
  'Meme Hunter': { score: { builder: 14, market: 30, meme: 40, safety: 16 }, agents: { 'Builder Agent': .75, 'Trader Agent': 1.15, 'Risk Agent': 1, 'Meme Agent': 1.7, 'Whale Agent': 1, 'Skeptic Agent': .85 }, riskVeto: 78, preset: 'Meme Hunter' }
};
export function readWeights() { try { return JSON.parse(localStorage.getItem(WEIGHTS_KEY) || 'null') || DEFAULT_WEIGHTS; } catch { return DEFAULT_WEIGHTS; } }
export function normalizeScoreWeights(w) { const total = Object.values(w.score).reduce((a,b)=>a+num(b),0) || 100; return Object.fromEntries(Object.entries(w.score).map(([k,v])=>[k,num(v)/total])); }

function voteFromScore(score, bearish = false) {
  if (bearish) return score >= 68 ? 'Bearish' : score >= 45 ? 'Neutral' : 'Bullish';
  return score >= 68 ? 'Bullish' : score >= 48 ? 'Neutral' : 'Bearish';
}
export function agentKernel(p, runner) {
  const s = p.scores || scoreProject(p);
  const intel = getRiskIntel(p);
  const sec = securityIntel(p);
  const fresh = githubFreshness(p);
  const quality = dataQuality(p);
  const trend = trendFor(p, readSnapshots());
  const social = socialIntel(p);
  const lpDep = lpDeployerIntel(p);
  const marketCheck = marketCrossCheck(p);
  const weak = topWeakScore(s);
  const kernels = [
    {
      name: 'Builder Agent', weight: (globalThis.__AGENT_ARENA_WEIGHTS__ || DEFAULT_WEIGHTS).agents['Builder Agent'], score: s.builder, vote: voteFromScore(s.builder), confidence: clamp((s.confidence*.45)+(s.builder*.55)),
      bullish: [p.repo && 'Repo attached', fresh.level === 'good' && `${fresh.badge} GitHub activity`, num(p.stars) >= 100 && 'Visible star traction', num(p.forks) > 0 && 'Fork interest'].filter(Boolean),
      bearish: [!p.repo && 'No repo evidence', fresh.level === 'warn' && 'Repo freshness is weakening', fresh.level === 'danger' && 'Abandoned repo risk', num(p.commits) < 20 && 'Thin commit history'].filter(Boolean),
      changeMind: 'Recent commits, clear roadmap, releases, and stronger fork activity would improve builder conviction.'
    },
    {
      name: 'Trader Agent', weight: (globalThis.__AGENT_ARENA_WEIGHTS__ || DEFAULT_WEIGHTS).agents['Trader Agent'], score: s.market, vote: voteFromScore(s.market), confidence: clamp((s.confidence*.4)+(s.market*.6)),
      bullish: [intel.volToLiq > .25 && 'Active volume/liquidity ratio', num(p.liquidity) >= 75000 && 'Usable liquidity base', num(p.volume) >= 25000 && 'Visible 24h DEX flow', num(p.priceChange24h) > 0 && 'Positive 24h momentum', trend.level === 'good' && `Trend: ${trend.status}`, marketCheck.available && marketCheck.score >= 75 && 'Market data cross-check is aligned'].filter(Boolean),
      bearish: [num(p.liquidity) < 15000 && 'Thin liquidity', intel.volToLiq > 1.5 && 'Flow may be overheated', trend.level === 'danger' && `Trend: ${trend.status}`, num(p.volume) < 5000 && 'Low 24h volume', marketCheck.available && marketCheck.score < 45 && 'Market source mismatch'].filter(Boolean),
      changeMind: 'Sustained volume for 48h with deeper liquidity would increase market conviction.'
    },
    {
      name: 'Risk Agent', weight: (globalThis.__AGENT_ARENA_WEIGHTS__ || DEFAULT_WEIGHTS).agents['Risk Agent'], score: s.safety, vote: s.safety <= 45 ? 'Bearish' : s.safety <= 68 ? 'Neutral' : 'Bullish', confidence: clamp((s.confidence*.35)+((100-s.safety)*.65)),
      bullish: [sec.available && sec.score >= 70 && 'Security scan has no major contract flag', num(p.liquidity) >= 75000 && 'Liquidity is not extremely thin'].filter(Boolean),
      bearish: [...intel.flags.filter(f=>f.level!=='good').slice(0,4).map(f=>f.label), !sec.available && 'Contract security not scanned', lpDep.score < 50 && 'LP/deployer proof is weak'].filter(Boolean),
      changeMind: 'Renounced/safer ownership, lower tax, locked liquidity, and clean holder data would reduce risk veto.'
    },
    {
      name: 'Meme Agent', weight: (globalThis.__AGENT_ARENA_WEIGHTS__ || DEFAULT_WEIGHTS).agents['Meme Agent'], score: s.meme, vote: voteFromScore(s.meme), confidence: clamp((s.confidence*.35)+(s.meme*.65)),
      bullish: [num(p.mentions) >= 50 && 'Narrative mentions are visible', social.score >= 70 && 'Social narrative package is strong', social.scan.count >= 8 && `Social scan: ${social.scan.velocity} velocity / ${social.scan.sentiment}`, num(p.priceChange24h) > 15 && '24h move is shareable', intel.txns > 100 && 'Transaction activity supports attention'].filter(Boolean),
      bearish: [num(p.mentions) < 20 && 'Narrative signal is light', social.score < 50 && 'Social proof is incomplete', social.scan.spamScore > 45 && 'Social sample looks spammy/repetitive', intel.txns < 30 && 'Low transaction attention'].filter(Boolean),
      changeMind: 'More social mentions, stronger token story, and sustained tx activity would improve meme conviction.'
    },
    {
      name: 'Whale Agent', weight: (globalThis.__AGENT_ARENA_WEIGHTS__ || DEFAULT_WEIGHTS).agents['Whale Agent'], score: clamp((s.market*.55)+(s.safety*.25)+(quality.completeness*.2)), vote: voteFromScore(clamp((s.market*.55)+(s.safety*.25)+(quality.completeness*.2))), confidence: clamp((s.confidence*.5)+(quality.completeness*.5)),
      bullish: [num(p.volume) > num(p.marketCap)*.03 && 'Volume is meaningful versus market cap', num(p.liquidity) >= 75000 && 'Liquidity can absorb more flow'].filter(Boolean),
      bearish: [num(p.liquidity) < 30000 && 'Whales can move price too easily', intel.fdvToLiq > 120 && 'FDV/liquidity is stretched'].filter(Boolean),
      changeMind: 'Deeper liquidity, lower top-holder concentration, and healthier holder distribution would improve whale-flow confidence.'
    },
    {
      name: 'Skeptic Agent', weight: (globalThis.__AGENT_ARENA_WEIGHTS__ || DEFAULT_WEIGHTS).agents['Skeptic Agent'], score: clamp(100 - ((100-quality.completeness)*.35) - (100-s.safety)*.45 - (100-s[weak])*.2), vote: voteFromScore(clamp(100 - ((100-quality.completeness)*.35) - (100-s.safety)*.45 - (100-s[weak])*.2)), confidence: clamp((100-s[weak])*.55 + s.confidence*.45),
      bullish: [quality.completeness >= 80 && 'Data coverage is strong', s.final >= 75 && 'Overall score is hard to ignore'].filter(Boolean),
      bearish: [`Weakest area is ${weak}`, quality.completeness < 70 && 'Data quality is incomplete', trend.level === 'danger' && trend.summary, runner && runner.scores[weak] > s[weak] && 'Runner-up threatens the weakest area'].filter(Boolean),
      changeMind: 'More complete data, stronger weakest category, and fewer risk flags would reduce skepticism.'
    }
  ];
  return kernels.map(k => ({ ...k, bullish: k.bullish.length ? k.bullish : ['No strong bullish evidence yet'], bearish: k.bearish.length ? k.bearish : ['No major bearish evidence in this lens'] }));
}
export function consensusFromKernels(kernels) {
  const totals = { Bullish: 0, Neutral: 0, Bearish: 0 };
  for (const k of kernels) totals[k.vote] += k.weight * (k.confidence / 100);
  const sorted = Object.entries(totals).sort((a,b)=>b[1]-a[1]);
  const top = sorted[0][0];
  const spread = sorted[0][1] - sorted[1][1];
  const riskVetoLevel = (globalThis.__AGENT_ARENA_WEIGHTS__ || DEFAULT_WEIGHTS).riskVeto;
  const riskVeto = kernels.some(k => k.name === 'Risk Agent' && k.vote === 'Bearish' && k.confidence >= riskVetoLevel);
  const disagreement = spread < .25 ? 'High' : spread < .75 ? 'Medium' : 'Low';
  const label = riskVeto && top === 'Bullish' ? 'Speculative Bullish' : top;
  return { totals, label, disagreement, riskVeto, spread };
}
export function applyScenario(p, scenario) {
  const clone = JSON.parse(JSON.stringify(p));
  clone.volume = Math.max(0, num(clone.volume) * num(scenario.volumeMultiplier || 1));
  clone.liquidity = Math.max(0, num(clone.liquidity) * num(scenario.liquidityMultiplier || 1));
  clone.mentions = Math.max(0, Math.round(num(clone.mentions) * num(scenario.mentionsMultiplier || 1)));
  clone.priceChange24h = num(clone.priceChange24h) + num(scenario.priceMoveDelta || 0);
  clone.risk = clamp(num(clone.risk) + num(scenario.riskDelta || 0), 0, 100);
  if (scenario.lpStatus && scenario.lpStatus !== 'same') clone.lpStatus = scenario.lpStatus;
  if (scenario.socialBoost) {
    clone.website = clone.website || 'simulated';
    clone.xLink = clone.xLink || 'simulated';
    clone.socialKeyword = clone.socialKeyword || `${clone.symbol || clone.name} narrative`;
    clone.tagline = clone.tagline || 'Simulated stronger social narrative';
    clone.narrative = clone.narrative || 'Simulated stronger shareability and social proof.';
  }
  clone.scores = scoreProject(clone);
  return clone;
}
export function selfReview(p, kernels, consensus, llmText = '') {
  const q = dataQuality(p);
  const sec = securityIntel(p);
  const holders = holderIntel(p);
  const lp = lpDeployerIntel(p);
  const evidence = evidenceTrail(p);
  const conflicts = contradictionDetector(p);
  const warnings = [];
  const unsupported = [];
  const riskAgent = kernels.find(k => k.name === 'Risk Agent');
  const bullishVotes = kernels.filter(k => k.vote === 'Bullish').length;
  const bearishVotes = kernels.filter(k => k.vote === 'Bearish').length;
  if (q.completeness < 65) warnings.push({ level: 'warn', label: 'Low data completeness', detail: `Only ${q.completeness}% complete; verdict should stay cautious.` });
  if (sourcePlugins(p).coverage < 50) warnings.push({ level: 'warn', label: 'Weak source coverage', detail: `Source plugin confidence is ${sourcePlugins(p).coverage}%.` });
  if (!sec.available) unsupported.push({ label: 'Contract safety unsupported', detail: 'Security scan has not been run.' });
  if (!holders.available) unsupported.push({ label: 'Holder distribution unsupported', detail: 'Holder scan has not been run.' });
  if (!p.mentionText) unsupported.push({ label: 'Social traction unsupported', detail: 'No pasted social mentions/casts are available.' });
  if (lp.score < 55) warnings.push({ level: 'warn', label: 'LP/deployer not clean', detail: 'LP proof or deployer risk needs verification before strong bullish claims.' });
  if (conflicts.severity >= 4) warnings.push({ level: 'danger', label: 'Evidence contradiction', detail: conflicts.items.filter(x=>x.level!=='good').slice(0,2).map(x=>x.label).join(' · ') });
  if (riskAgent?.vote === 'Bearish' && consensus.label.includes('Bullish')) warnings.push({ level: 'danger', label: 'Bullish with risk veto', detail: 'Consensus is bullish while Risk Agent is bearish.' });
  if (bullishVotes >= 4 && bearishVotes >= 2) warnings.push({ level: 'warn', label: 'High disagreement', detail: 'Many bullish votes exist, but bearish objections are still material.' });
  const lower = String(llmText || '').toLowerCase();
  const riskyTerms = ['guaranteed', 'safe investment', 'will pump', 'risk-free', 'certain winner', 'audited'];
  for (const term of riskyTerms) if (lower.includes(term)) warnings.push({ level: 'danger', label: 'Overstated LLM wording', detail: `LLM output contains risky wording: "${term}".` });
  const backed = evidence.filter(e => e.level === 'good').length;
  let label = 'Evidence-backed';
  if (warnings.some(w => w.level === 'danger')) label = 'Needs verification';
  else if (unsupported.length || q.completeness < 75 || warnings.length) label = 'Partially supported';
  if (q.completeness < 50) label = 'Low-confidence';
  return { label, backedClaims: backed, warnings, unsupported, summary: `${label}: ${backed} strong evidence points, ${warnings.length} warnings, ${unsupported.length} unsupported areas.` };
}
export function scenarioAnalysis(winner, runner, scenario) {
  const simulated = applyScenario(winner, scenario);
  const currentKernels = agentKernel(winner, runner);
  const simulatedKernels = agentKernel(simulated, runner);
  const currentConsensus = consensusFromKernels(currentKernels);
  const simulatedConsensus = consensusFromKernels(simulatedKernels);
  const changes = simulatedKernels.map((k, i) => ({ agent: k.name, from: currentKernels[i].vote, to: k.vote, scoreDelta: k.score - currentKernels[i].score })).filter(x => x.from !== x.to || Math.abs(x.scoreDelta) >= 5);
  return { simulated, currentKernels, simulatedKernels, currentConsensus, simulatedConsensus, changes };
}
export function buildReportData({ ranked, winner, kernels, consensus, debate, review, tasks, backtest, scenarioResult, weights }) {
  return {
    generatedAt: new Date().toISOString(),
    winner: { name: winner.name, symbol: winner.symbol, final: Math.round(winner.scores.final), adjustedFinal: Math.round(winner.scores.adjustedFinal ?? winner.scores.final), reliabilityBadge: winner.scores.reliabilityBadge, consensus: consensus.label },
    ranking: ranked.map((p, i) => ({ rank: i + 1, name: p.name, symbol: p.symbol, scores: p.scores, reliability: sourceReliability(p), adjusted: adjustedScore(p), sources: sourcePlugins(p), evidence: evidenceTrail(p), evidenceGraph: evidenceGraph(p), contradictions: contradictionDetector(p), riskExplanation: explainRisk(p), riskFlags: getRiskIntel(p).flags.slice(0, 8) })),
    agentKernels: kernels,
    consensus,
    debate,
    selfReview: review,
    tasks,
    backtest: { stats: backtest.stats, recent: backtest.resolved.slice(-8) },
    scenario: { consensus: scenarioResult.simulatedConsensus, simulatedWinner: { name: scenarioResult.simulated.name, symbol: scenarioResult.simulated.symbol, scores: scenarioResult.simulated.scores }, changes: scenarioResult.changes },
    weights
  };
}
export function reportMarkdown(data) {
  const lines = [];
  lines.push(`# AgentArena Battle Report`);
  lines.push(``);
  lines.push(`Generated: ${data.generatedAt}`);
  lines.push(``);
  lines.push(`## Winner`);
  lines.push(`**${data.winner.symbol ? `$${data.winner.symbol}` : data.winner.name}** — adjusted ${data.winner.adjustedFinal || data.winner.final}/100 (raw ${data.winner.final}/100)`);
  lines.push(`Consensus: **${data.winner.consensus}** · Reliability: **${data.winner.reliabilityBadge || 'N/A'}**`);
  lines.push(``);
  lines.push(`## Ranking`);
  data.ranking.forEach(p => lines.push(`${p.rank}. ${p.symbol ? `$${p.symbol}` : p.name} — adjusted ${Math.round(p.scores.adjustedFinal ?? p.scores.final)}/100 · raw ${Math.round(p.scores.final)}/100 · Builder ${Math.round(p.scores.builder)} · Market ${Math.round(p.scores.market)} · Meme ${Math.round(p.scores.meme)} · Safety ${Math.round(p.scores.safety)} · Confidence ${Math.round(p.scores.confidence)}%`));
  lines.push(``);
  lines.push(`## Source Reliability`);
  data.ranking.forEach(p => lines.push(`- ${p.symbol ? `$${p.symbol}` : p.name}: ${p.reliability.badge} · adjusted ${Math.round(p.adjusted.adjustedFinal)}/100 · raw ${Math.round(p.adjusted.rawFinal)}/100 · reliability ${p.reliability.score}%`));
  lines.push(``);
  lines.push(`## Source Coverage`);
  data.ranking.forEach(p => lines.push(`- ${p.symbol ? `$${p.symbol}` : p.name}: ${p.sources.coverage}% coverage (${p.sources.plugins.map(x=>`${x.category}:${x.confidence}`).join(', ')})`));
  lines.push(``);
  lines.push(`## Agent Votes`);
  data.agentKernels.forEach(k => lines.push(`- ${k.name}: **${k.vote}** · score ${Math.round(k.score)} · confidence ${Math.round(k.confidence)}% · weight ${k.weight}x`));
  lines.push(``);
  lines.push(`## Debate Loop`);
  data.debate.forEach(d => lines.push(`- **${d.round} / ${d.agent}:** ${d.text}`));
  lines.push(``);
  lines.push(`## Self-Review`);
  lines.push(`Status: **${data.selfReview.label}**`);
  lines.push(data.selfReview.summary);
  if (data.selfReview.warnings.length) data.selfReview.warnings.forEach(w => lines.push(`- Warning: ${w.label} — ${w.detail}`));
  if (data.selfReview.unsupported.length) data.selfReview.unsupported.forEach(u => lines.push(`- Unsupported: ${u.label} — ${u.detail}`));
  lines.push(``);
  lines.push(`## Evidence Graph — Winner`);
  const winnerGraph = data.ranking[0]?.evidenceGraph;
  if (winnerGraph) winnerGraph.groups.forEach(g => lines.push(`- ${g.category}: ${g.summary} · confidence ${g.confidence}%`));
  const winnerContradictions = data.ranking[0]?.contradictions;
  if (winnerContradictions) { lines.push(``); lines.push(`## Contradiction Detector — Winner`); winnerContradictions.items.forEach(c => lines.push(`- ${c.level.toUpperCase()}: ${c.label} — ${c.detail}`)); }
  lines.push(``);
  lines.push(`## Evidence Trail — Winner`);
  const winnerEvidence = data.ranking[0]?.evidence || [];
  winnerEvidence.forEach(e => lines.push(`- ${e.claim}: ${e.value} (${e.source})`));
  lines.push(``);
  lines.push(`## Next Agent Tasks`);
  data.tasks.slice(0, 10).forEach(t => lines.push(`- [${t.priority}] ${t.agent}: ${t.title} — ${t.reason}`));
  lines.push(``);
  lines.push(`## Strategy Simulation`);
  lines.push(`Simulated consensus: **${data.scenario.consensus.label}**`);
  data.scenario.changes.forEach(c => lines.push(`- ${c.agent}: ${c.from} → ${c.to} (${c.scoreDelta >= 0 ? '+' : ''}${c.scoreDelta.toFixed(1)})`));
  lines.push(``);
  lines.push(`_For discovery and comparison only. Not financial advice._`);
  return lines.join('\n');
}
export function downloadText(filename, text, type = 'text/plain') {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}
export function agentTasks(projects, ranked, trends) {
  const tasks = [];
  const add = (agent, priority, title, reason, action, index = null) => tasks.push({ id: `${agent}-${title}-${index ?? 'all'}`, agent, priority, title, reason, action, index });
  ranked.forEach((p, i) => {
    const q = dataQuality(p);
    const sec = securityIntel(p);
    const holders = holderIntel(p);
    const intel = getRiskIntel(p);
    const fresh = githubFreshness(p);
    const trend = trends[projectId(p)];
    const social = socialIntel(p);
    const lpDep = lpDeployerIntel(p);
    const marketCheck = marketCrossCheck(p);
    const dep = deployerIntel(p);
    const farcaster = farcasterIntel(p);
    const whaleFlow = whaleFlowIntel(p);
    if (!p.mentionText) add('Meme Agent', 'Medium', `Paste social mentions for ${p.symbol || p.name}`, 'Meme Agent needs real mention samples to judge narrative velocity.', null, i);
    if (!farcaster.available && (p.socialKeyword || p.symbol || p.name)) add('Meme Agent', 'Medium', `Run Farcaster scan for ${p.symbol || p.name}`, 'Real Farcaster casts improve social conviction.', 'farcaster', i);
    if (!p.website || !p.xLink && !p.farcaster || !p.socialKeyword) add('Meme Agent', 'Medium', `Improve social narrative for ${p.symbol || p.name}`, `Social score is ${Math.round(social.score)}/100; add website, X/Farcaster, keyword, or tagline.`, null, i);
    if (!p.repo && !p.repoUrl) add('Builder Agent', 'High', `Import GitHub for ${p.symbol || p.name}`, 'Builder confidence is capped without repo evidence.', null, projects.findIndex(x => x === p || projectId(x) === projectId(p)));
    if (fresh.level === 'danger' || fresh.level === 'warn') add('Builder Agent', 'Medium', `Review repo freshness for ${p.symbol || p.name}`, `GitHub freshness is ${fresh.badge}.`, null, i);
    if (lpDeployerIntel(p).score < 55) add('Risk Agent', 'High', `Verify LP/deployer risk for ${p.symbol || p.name}`, 'LP lock/burn proof or deployer risk is not clean yet.', null, i);
    if (!dep.scan && (dep.owner || dep.deployer || p.contract)) add('Risk Agent', 'High', `Run deployer scan for ${p.symbol || p.name}`, 'Deployer/owner transaction history is not scanned yet.', 'deployer', i);
    if (!sec.available) add('Risk Agent', 'High', `Run security scan for ${p.symbol || p.name}`, 'Contract security has not been checked yet.', 'security', i);
    if (!holders.available) add('Whale Agent', 'High', `Run holder scan for ${p.symbol || p.name}`, 'Holder concentration is unknown.', 'holders', i);
    if (!whaleFlow.available && isAddress(p.contract || '')) add('Whale Agent', 'High', `Run whale flow scan for ${p.symbol || p.name}`, 'Recent token transfer flow is unknown.', 'whale-flow', i);
    if (intel.volToLiq > 1.5) add('Trader Agent', 'Medium', `Watch hot flow on ${p.symbol || p.name}`, `Volume/liquidity is ${intel.volToLiq.toFixed(2)}x, which can reverse quickly.`, null, i);
    if (num(p.liquidity) < 15000) add('Risk Agent', 'High', `Verify liquidity depth for ${p.symbol || p.name}`, `Liquidity is only ${money(p.liquidity)}.`, null, i);
    if (Math.abs(num(p.priceChange24h)) > 60) add('Skeptic Agent', 'Medium', `Recheck after volatility cools`, `${p.symbol || p.name} moved ${num(p.priceChange24h).toFixed(1)}% in 24h.`, null, i);
    if (q.completeness < 70) add('Skeptic Agent', 'High', `Improve data quality for ${p.symbol || p.name}`, `Completeness is ${q.completeness}%, so confidence is limited.`, null, i);
    if (trend?.level === 'danger') add('Skeptic Agent', 'High', `Investigate weakening trend`, `${p.symbol || p.name}: ${trend.summary}`, null, i);
  });
  if (ranked[0]?.scores?.final >= 70) add('Meme Agent', 'Low', 'Copy viral caption', 'Winner has enough score to package for X/Farcaster.', 'caption');
  add('Consensus Agent', 'Medium', 'Save current snapshot', 'Saving snapshots lets agents detect improving or deteriorating trends later.', 'snapshot');
  add('Consensus Agent', 'Low', 'Save prediction record', 'Prediction records let agents build local accuracy stats after future rescans.', 'prediction');
  const order = { High: 0, Medium: 1, Low: 2 };
  return tasks.sort((a,b)=>order[a.priority]-order[b.priority]).slice(0, 12);
}
export function evidenceTrail(p) {
  const intel = getRiskIntel(p);
  const sec = securityIntel(p);
  const holders = holderIntel(p);
  const fresh = githubFreshness(p);
  const quality = dataQuality(p);
  const items = [];
  const add = (claim, source, value, level = 'neutral') => items.push({ claim, source, value, level });
  add('Base DEX liquidity', 'DexScreener', money(p.liquidity), num(p.liquidity) >= 75000 ? 'good' : num(p.liquidity) < 15000 ? 'danger' : 'warn');
  add('24h Base DEX volume', 'DexScreener', money(p.volume), num(p.volume) >= 25000 ? 'good' : num(p.volume) < 5000 ? 'warn' : 'neutral');
  add('Volume/liquidity ratio', 'DexScreener', intel.volToLiq ? `${intel.volToLiq.toFixed(2)}x` : 'N/A', intel.volToLiq > 1.5 ? 'warn' : intel.volToLiq > .25 ? 'good' : 'warn');
  add('FDV/liquidity ratio', 'DexScreener', intel.fdvToLiq ? `${intel.fdvToLiq.toFixed(1)}x` : 'N/A', intel.fdvToLiq > 120 ? 'danger' : intel.fdvToLiq > 45 ? 'warn' : 'good');
  add('24h price move', 'DexScreener', `${num(p.priceChange24h).toFixed(1)}%`, Math.abs(num(p.priceChange24h)) > 60 ? 'warn' : 'neutral');
  add('GitHub freshness', 'GitHub', fresh.pushedDays !== null ? `${Math.round(fresh.pushedDays)} days ago · ${fresh.badge}` : 'Not imported', fresh.level);
  add('GitHub traction', 'GitHub', `${num(p.stars).toLocaleString()} stars · ${num(p.forks).toLocaleString()} forks · ${num(p.commits).toLocaleString()} commits`, num(p.stars) >= 100 || num(p.commits) >= 50 ? 'good' : 'warn');
  add('Contract security scan', 'GoPlus', sec.available ? `${Math.round(sec.score)}/100 · ${sec.flags.slice(0,2).map(f=>f.label).join(', ')}` : 'Not scanned', sec.available ? (sec.score >= 70 ? 'good' : sec.score >= 45 ? 'warn' : 'danger') : 'warn');
  add('Holder concentration', 'BaseScan', holders.available ? `${holders.distribution.tier} · Top 10 holders ${holders.top10Pct.toFixed(1)}%` : 'Not scanned', holders.available ? (holders.distribution.score >= 70 ? 'good' : holders.distribution.score >= 45 ? 'warn' : 'danger') : 'warn');
  add('Holder distribution tiers', 'BaseScan holder list', holders.available ? `Top1 ${holders.top1Pct.toFixed(1)}% · Top5 ${holders.top5Pct.toFixed(1)}% · Top10 ${holders.top10Pct.toFixed(1)}% · Top20 ${holders.top20Pct.toFixed(1)}%` : 'Not scanned', holders.available ? (holders.distribution.score >= 70 ? 'good' : holders.distribution.score >= 45 ? 'warn' : 'danger') : 'warn');
  add('LP/deployer risk', 'DexScreener pair + Manual + GoPlus', `${lpDeployerIntel(p).pairAddress ? shortAddr(lpDeployerIntel(p).pairAddress) : (p.lpStatus || 'unknown')} · ${Math.round(lpDeployerIntel(p).confidence)}% LP confidence · ${lpDeployerIntel(p).flags.slice(0,2).map(f=>f.label).join(', ')}`, lpDeployerIntel(p).score >= 70 ? 'good' : lpDeployerIntel(p).score >= 45 ? 'warn' : 'danger');
  add('Deployer transaction history', 'BaseScan txlist + GoPlus owner', deployerIntel(p).available ? `${Math.round(deployerIntel(p).score)}/100 · ${deployerIntel(p).flags.slice(0,2).map(f=>f.label).join(', ')}` : 'Not scanned', deployerIntel(p).score >= 72 ? 'good' : deployerIntel(p).score >= 48 ? 'warn' : 'danger');
  add('Social mention scan', 'Manual mentions', `${socialIntel(p).scan.count} mentions · ${socialIntel(p).scan.sentiment} · spam ${Math.round(socialIntel(p).scan.spamScore)}/100`, socialIntel(p).scan.count >= 8 ? (socialIntel(p).scan.spamScore > 45 ? 'warn' : 'good') : 'warn');
  add('Farcaster social scan', 'Neynar Farcaster API', farcasterIntel(p).available ? `${farcasterIntel(p).scan.castCount} casts · ${farcasterIntel(p).scan.uniqueAuthors} authors · ${farcasterIntel(p).scan.sentiment}` : 'Not scanned', farcasterIntel(p).score >= 70 ? 'good' : farcasterIntel(p).score >= 45 ? 'warn' : 'danger');
  add('Whale transfer flow', 'BaseScan token transfers', whaleFlowIntel(p).available ? `${whaleFlowIntel(p).flow.transferCount} transfers · ${whaleFlowIntel(p).flow.uniqueWallets} wallets · ${whaleFlowIntel(p).flow.largeTransferCount} large` : 'Not scanned', whaleFlowIntel(p).score >= 70 ? 'good' : whaleFlowIntel(p).score >= 45 ? 'warn' : 'danger');
  add('Wallet label context', 'Local wallet classifier', walletLabelIntel(p).available ? `${walletLabelIntel(p).count} labels · ${walletLabelIntel(p).riskCount} risk wallets · ${walletLabelIntel(p).flags.slice(0,2).map(f=>f.label).join(', ')}` : 'Not labeled', walletLabelIntel(p).score >= 70 ? 'good' : walletLabelIntel(p).score >= 45 ? 'warn' : 'danger');
  add('Source plugin coverage', 'Source plugin layer', `${sourcePlugins(p).coverage}% source confidence`, sourcePlugins(p).coverage >= 75 ? 'good' : sourcePlugins(p).coverage >= 45 ? 'warn' : 'danger');
  add('Market cross-check', 'DexScreener + GeckoTerminal', marketCrossCheck(p).available ? `${marketCrossCheck(p).confidence} · ${marketCrossCheck(p).flags.slice(0,2).map(f=>f.label).join(', ')}` : 'Not checked', marketCrossCheck(p).score >= 75 ? 'good' : marketCrossCheck(p).score >= 45 ? 'warn' : 'danger');
  add('Data completeness', 'Local scoring engine', `${quality.completeness}% complete · ${Math.round(p.scores?.confidence || scoreProject(p).confidence)}% confidence`, quality.completeness >= 80 ? 'good' : quality.completeness >= 55 ? 'warn' : 'danger');
  return items;
}

export function evidenceGraph(p) {
  const ev = evidenceTrail(p);
  const categoryFor = (e) => {
    const text = `${e.claim} ${e.source}`.toLowerCase();
    if (text.includes('dex') || text.includes('market') || text.includes('liquidity') || text.includes('volume')) return 'Market';
    if (text.includes('security') || text.includes('goplus') || text.includes('contract')) return 'Security';
    if (text.includes('holder')) return 'Holders';
    if (text.includes('whale') || text.includes('transfer')) return 'Whale Flow';
    if (text.includes('deployer') || text.includes('owner') || text.includes('lp')) return 'LP / Deployer';
    if (text.includes('social') || text.includes('farcaster') || text.includes('mention')) return 'Social';
    if (text.includes('github') || text.includes('repo')) return 'Builder';
    return 'Quality';
  };
  const confidenceScore = { good: 85, neutral: 62, warn: 42, danger: 18 };
  const nodes = ev.map((e, i) => ({
    id: `${categoryFor(e).toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${i}`, category: categoryFor(e), claim: e.claim, source: e.source, value: e.value, level: e.level, confidence: confidenceScore[e.level] || 50, explanation: `${e.claim}: ${e.value} from ${e.source}.`
  }));
  const groups = Object.values(nodes.reduce((acc, n) => {
    acc[n.category] ||= { category: n.category, nodes: [], good: 0, warn: 0, danger: 0, confidence: 0, level: 'neutral' };
    acc[n.category].nodes.push(n);
    if (n.level === 'good') acc[n.category].good++;
    if (n.level === 'warn') acc[n.category].warn++;
    if (n.level === 'danger') acc[n.category].danger++;
    return acc;
  }, {})).map(g => {
    g.confidence = Math.round(g.nodes.reduce((a,n)=>a+n.confidence,0) / Math.max(1, g.nodes.length));
    g.level = g.danger ? 'danger' : g.warn ? 'warn' : g.good ? 'good' : 'neutral';
    g.summary = `${g.nodes.length} evidence nodes · ${g.good} good · ${g.warn} warn · ${g.danger} danger`;
    return g;
  });
  const strongest = nodes.filter(n => n.level === 'good').slice(0, 5);
  const risks = nodes.filter(n => n.level === 'danger' || n.level === 'warn').sort((a,b)=>a.confidence-b.confidence).slice(0, 7);
  return { nodes, groups, strongest, risks, coverage: Math.round(nodes.reduce((a,n)=>a+n.confidence,0) / Math.max(1, nodes.length)) };
}
export function contradictionDetector(p) {
  const intel = getRiskIntel(p);
  const social = socialIntel(p);
  const holders = holderDistribution(p);
  const whale = whaleFlowIntel(p);
  const market = marketCrossCheck(p);
  const items = [];
  const add = (level, label, detail) => items.push({ level, label, detail });
  if (num(p.volume) >= 50000 && num(p.liquidity) < 15000) add('danger', 'Hot volume on thin liquidity', `${money(p.volume)} volume is running on only ${money(p.liquidity)} liquidity.`);
  if (intel.volToLiq > 1.5 && num(p.priceChange24h) > 20) add('warn', 'Momentum may be unstable', `24h move is ${num(p.priceChange24h).toFixed(1)}% while volume/liquidity is ${intel.volToLiq.toFixed(2)}x.`);
  if (social.score >= 70 && (holders.score < 55 || whale.score < 50)) add('warn', 'Social bullish but wallet risk weak', `Social score is ${Math.round(social.score)}, but holder/whale scores are ${Math.round(holders.score)}/${Math.round(whale.score)}.`);
  if (num(p.marketCap) >= 1000000 && num(p.liquidity) < 30000) add('warn', 'Market cap/liquidity mismatch', `${money(p.marketCap)} market cap has only ${money(p.liquidity)} liquidity.`);
  if (holders.top10Pct >= 60 && whale.direction === 'Whale Accumulation') add('danger', 'Concentrated holders plus accumulation', `Top10 holders control ${holders.top10Pct.toFixed(1)}% while flow direction is ${whale.direction}.`);
  if (whale.ownerOutPct >= 5 && num(p.priceChange24h) > 0) add('danger', 'Price up while owner sends out', `Token is up ${num(p.priceChange24h).toFixed(1)}%, but owner/deployer outbound flow is ${whale.ownerOutPct.toFixed(1)}%.`);
  if (market.available && market.score < 45 && num(p.volume) > 25000) add('warn', 'Market source conflict', `DEX activity exists, but second-source market check is ${market.confidence}.`);
  if (!items.length) add('good', 'No major contradiction', 'Core market, social, holder, and whale signals do not show a major conflict.');
  const severity = items.reduce((sum, x) => sum + (x.level === 'danger' ? 2 : x.level === 'warn' ? 1 : 0), 0);
  return { severity, label: severity >= 4 ? 'High conflict' : severity >= 2 ? 'Moderate conflict' : severity ? 'Low conflict' : 'Clean', items };
}
export function explainRisk(p) {
  const graph = evidenceGraph(p);
  const conflicts = contradictionDetector(p);
  const topRisks = graph.risks.slice(0, 3).map(x => `${x.claim} (${x.value})`);
  const topGood = graph.strongest.slice(0, 3).map(x => `${x.claim} (${x.value})`);
  return {
    summary: `${conflicts.label}: ${topRisks.length ? `main risks are ${topRisks.join('; ')}` : 'no major risk evidence'}${topGood.length ? `. Strongest support: ${topGood.join('; ')}` : ''}.`,
    topRisks, topGood, conflicts
  };
}

export function findKernel(kernels, name) { return kernels.find(k => k.name === name) || kernels[0]; }
export function agentDebate(kernels, consensus, winner) {
  const builder = findKernel(kernels, 'Builder Agent');
  const trader = findKernel(kernels, 'Trader Agent');
  const risk = findKernel(kernels, 'Risk Agent');
  const meme = findKernel(kernels, 'Meme Agent');
  const whale = findKernel(kernels, 'Whale Agent');
  const skeptic = findKernel(kernels, 'Skeptic Agent');
  const symbol = winner.symbol ? `$${winner.symbol}` : winner.name;
  const strongest = kernels.slice().sort((a,b)=>b.score-a.score)[0];
  const weakest = kernels.slice().sort((a,b)=>a.score-b.score)[0];
  const riskFlags = risk.bearish.slice(0, 2).join(' · ');
  return [
    { round: 'Opening Case', agent: builder.name, stance: builder.vote, text: `${symbol} opens with ${builder.vote.toLowerCase()} builder conviction. ${builder.bullish.slice(0,2).join(' · ')}.` },
    { round: 'Market Check', agent: trader.name, stance: trader.vote, text: `Market lens votes ${trader.vote}. ${trader.bullish.slice(0,2).join(' · ')}${trader.bearish.length ? `; concern: ${trader.bearish[0]}.` : '.'}` },
    { round: 'Risk Objection', agent: risk.name, stance: risk.vote, text: `Risk objection: ${riskFlags || 'no major blocker'}. Risk confidence is ${Math.round(risk.confidence)}%, so ${risk.vote === 'Bearish' ? 'the council cannot mark this as clean bullish yet.' : 'risk does not block the trade thesis.'}` },
    { round: 'Narrative Response', agent: meme.name, stance: meme.vote, text: `Meme response is ${meme.vote}. ${meme.bullish.slice(0,2).join(' · ')}. Narrative still changes if: ${meme.changeMind}` },
    { round: 'Whale Flow', agent: whale.name, stance: whale.vote, text: `Whale lens votes ${whale.vote}. ${whale.bullish.slice(0,2).join(' · ')}${whale.bearish.length ? `; whale concern: ${whale.bearish[0]}.` : '.'}` },
    { round: 'Skeptic Challenge', agent: skeptic.name, stance: skeptic.vote, text: `Skeptic highlights weakest agent: ${weakest.name} at ${Math.round(weakest.score)}/100. ${skeptic.bearish.slice(0,2).join(' · ')}.` },
    { round: 'Consensus Revision', agent: 'Consensus Agent', stance: consensus.label, text: `Final council result: ${consensus.label}. Strongest voice: ${strongest.name}; weakest voice: ${weakest.name}. Disagreement is ${consensus.disagreement}${consensus.riskVeto ? ', with risk veto active' : ''}.` }
  ];
}
export function kernelSummaryText(kernels, consensus) {
  return `Consensus: ${consensus.label}. Votes: ${kernels.map(k=>`${k.name.replace(' Agent','')}: ${k.vote}`).join(' · ')}. Disagreement: ${consensus.disagreement}${consensus.riskVeto ? ' · Risk veto active' : ''}.`;
}
export function tokenReport(p, rank) {
  const keys = ['builder', 'market', 'meme', 'safety'];
  const strongest = keys.reduce((best, k) => p.scores[k] > p.scores[best] ? k : best, keys[0]);
  const weakest = topWeakScore(p.scores);
  const intel = getRiskIntel(p);
  const quality = dataQuality(p);
  const topRisk = intel.flags.find(f => f.level === 'danger') || intel.flags.find(f => f.level === 'warn') || intel.flags[0];
  const lines = {
    builder: 'wins attention through product and repo proof',
    market: 'wins attention through Base DEX flow',
    meme: 'wins attention through narrative velocity',
    safety: 'wins attention through cleaner risk profile'
  };
  const weakLines = {
    builder: 'needs stronger builder evidence',
    market: 'needs stronger market flow',
    meme: 'needs a sharper narrative catalyst',
    safety: 'needs more risk validation'
  };
  const verdict = `${p.symbol ? `$${p.symbol}` : p.name} ${lines[strongest]}, but ${weakLines[weakest]}. ${topRisk ? `Watch: ${topRisk.label}.` : ''}`;
  return { rank: rank + 1, strongest, weakest, topRisk, quality, verdict };
}
export function buildLlmPrompt(winner, runner, reports, verdictData) {
  const payload = {
    winner: {
      name: winner.name,
      symbol: winner.symbol,
      scores: winner.scores,
      market: { price: winner.price, marketCap: winner.marketCap, volume: winner.volume, liquidity: winner.liquidity, priceChange24h: winner.priceChange24h, buys24h: winner.buys24h, sells24h: winner.sells24h },
      github: { repo: winner.repo, stars: winner.stars, forks: winner.forks, commits: winner.commits, openIssues: winner.openIssues, lastPushed: winner.lastPushed },
      riskIntel: getRiskIntel(winner),
      dataQuality: dataQuality(winner),
      evidenceTrail: evidenceTrail(winner),
      sourcePlugins: sourcePlugins(winner)
    },
    runnerUp: runner ? { name: runner.name, symbol: runner.symbol, scores: runner.scores } : null,
    battleVerdict: verdictData,
    ruleReports: reports
  };
  return `You are writing analysis for AgentArena, a Base-only AI token battle app. Use only the provided JSON data. Do not invent facts, prices, holders, partnerships, audits, or guarantees. Keep it concise and useful for crypto builders and token hunters. Return markdown with these exact sections: Builder Agent, Trader Agent, Risk Agent, Meme Agent, Whale Agent, Skeptic Agent, Consensus.\n\nDATA:\n${JSON.stringify(payload, null, 2)}`;
}
async function callOpenAiReport({ apiKey, model, winner, runner, reports, verdictData }) {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      temperature: 0.45,
      messages: [
        { role: 'system', content: 'You are a careful Web3 analyst. Ground every claim in supplied data. No financial advice.' },
        { role: 'user', content: buildLlmPrompt(winner, runner, reports, verdictData) }
      ]
    })
  });
  if (!res.ok) throw new Error(`OpenAI request failed (${res.status})`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'No analysis returned.';
}
export function agentReports(winner, runner) {
  const s = winner.scores;
  const intel = getRiskIntel(winner);
  const quality = dataQuality(winner);
  const weak = topWeakScore(s);
  const runnerName = runner ? (runner.symbol ? `$${runner.symbol}` : runner.name) : 'the runner-up';
  const fresh = githubFreshness(winner);
  const repoFresh = fresh.pushedDays !== null ? `${Math.round(fresh.pushedDays)} days ago · ${fresh.badge}` : 'unknown';
  return [
    {
      name: 'Builder Agent',
      verdict: s.builder >= 70 ? 'Builder signal is strong' : s.builder >= 50 ? 'Builder signal is usable' : 'Builder signal is weak',
      text: `${winner.repo ? `Repo ${winner.repo}` : 'No repo imported'} gives ${winner.name} a builder score of ${Math.round(s.builder)}/100. Stars ${num(winner.stars).toLocaleString()}, forks ${num(winner.forks).toLocaleString()}, commits ${num(winner.commits).toLocaleString()}, last push ${repoFresh}. Builder flags: ${fresh.flags.slice(0,3).map(f=>f.label).join(' · ') || 'none'}.`
    },
    {
      name: 'Trader Agent',
      verdict: s.market >= 75 ? 'Market structure leads the battle' : s.market >= 55 ? 'Market structure is active' : 'Market structure is early',
      text: `${money(winner.volume)} 24h volume against ${money(winner.liquidity)} liquidity gives a ${intel.volToLiq ? intel.volToLiq.toFixed(2) : '0.00'}x volume/liquidity ratio. Market cap is ${money(winner.marketCap)} and 24h move is ${num(winner.priceChange24h).toFixed(1)}%. ${s.reasons.market[0]?.text || 'DEX data needs more confirmation.'} ${marketCrossCheck(winner).available ? `Cross-check: ${marketCrossCheck(winner).confidence}.` : ''}`
    },
    {
      name: 'Risk Agent',
      verdict: s.safety >= 70 ? 'Risk is acceptable for discovery' : s.safety >= 50 ? 'Risk needs monitoring' : 'Risk is the main blocker',
      text: `Risk is ${winner.risk}/100 with safety score ${Math.round(s.safety)}/100. FDV/liquidity is ${intel.fdvToLiq ? intel.fdvToLiq.toFixed(1)+'x' : 'N/A'}, buys/sells are ${intel.txns ? `${intel.buys}/${intel.sells}` : 'N/A'}. Top flags: ${intel.flags.slice(0,3).map(f=>f.label).join(' · ') || 'none'}.`
    },
    {
      name: 'Meme Agent',
      verdict: s.meme >= 70 ? 'Narrative is highly shareable' : s.meme >= 50 ? 'Narrative has early traction' : 'Narrative needs a catalyst',
      text: `${winner.name} has ${num(winner.mentions).toLocaleString()} narrative mentions, ${intel.txns.toLocaleString()} 24h txns, and ${num(winner.priceChange24h).toFixed(1)}% 24h move. Meme score is ${Math.round(s.meme)}/100. ${s.reasons.meme[0]?.text || 'The story needs more social proof.'}`
    },
    {
      name: 'Whale Agent',
      verdict: intel.volToLiq > .8 ? 'Flow can move price quickly' : 'Flow still needs depth',
      text: `${shortAddr(winner.contract) || 'No contract'} shows ${money(winner.volume)} daily flow on ${money(winner.liquidity)} liquidity. Fresh wallets can move this if liquidity holds, but thin liquidity can also cut both ways. Data completeness is ${quality.completeness}%.`
    },
    {
      name: 'Skeptic Agent',
      verdict: `Weakest area: ${weak}`,
      text: `${winner.name} wins, but the weakest score is ${weak} at ${Math.round(s[weak])}/100. ${runner ? `${runnerName} can still threaten if it improves ${battleVerdict([winner, runner])?.runnerThreat || 'its strongest signal'}.` : ''} Validate contract, holder concentration, LP status, and whether the narrative can survive after the first hype spike.`
    }
  ];
}
export function battleVerdict(ranked) {
  const winner = ranked[0];
  const runner = ranked[1];
  if (!winner || !runner) return null;
  const keys = ['builder', 'market', 'meme', 'safety'];
  const gap = winner.scores.final - runner.scores.final;
  const strongest = keys.reduce((best, k) => winner.scores[k] > winner.scores[best] ? k : best, keys[0]);
  const weakest = keys.reduce((worst, k) => winner.scores[k] < winner.scores[worst] ? k : worst, keys[0]);
  const runnerThreat = keys.reduce((best, k) => (runner.scores[k] - winner.scores[k]) > (runner.scores[best] - winner.scores[best]) ? k : best, keys[0]);
  const threatGap = runner.scores[runnerThreat] - winner.scores[runnerThreat];
  const upset = gap <= 4 ? 'High' : gap <= 10 || threatGap > 12 ? 'Medium' : 'Low';
  const confidence = Math.round((winner.scores.confidence + runner.scores.confidence) / 2);
  const confidenceLabel = scoreLabel(confidence);
  const reason = `${winner.symbol ? `$${winner.symbol}` : winner.name} beats ${runner.symbol ? `$${runner.symbol}` : runner.name} by ${gap.toFixed(1)} points. Strongest edge: ${strongest}. Weakest area: ${weakest}.`;
  return { winner, runner, gap, strongest, weakest, runnerThreat, threatGap, upset, confidence, confidenceLabel, reason };
}
export function makeCaption(winner, intel) {
  const symbol = winner.symbol ? `$${winner.symbol}` : winner.name;
  const flags = intel.flags.slice(0, 3).map(f => f.label).join(' · ');
  return [
    `AI agents picked ${symbol} as the current Base battle winner.`,
    '',
    `Score: ${Math.round(winner.scores.final)}/100`,
    `Volume: ${money(winner.volume)} · Liquidity: ${money(winner.liquidity)}`,
    `Market cap: ${money(winner.marketCap)} · 24h: ${num(winner.priceChange24h).toFixed(1)}%`,
    `Risk flags: ${flags || 'None'}`,
    '',
    'Battle your Base token on AgentArena.'
  ].join('\n');
}
export function verdict(score) {
  if (score >= 80) return 'Strong Bullish';
  if (score >= 68) return 'Bullish';
  if (score >= 55) return 'Speculative';
  return 'High Risk';
}
export function lineFor(agent, p, s, rank) {
  const intel = getRiskIntel(p);
  const volToLiq = intel.volToLiq;
  const lines = {
    'Builder Agent': `${p.name} has a ${Math.round(s.builder)}/100 builder signal. ${s.reasons.builder[0]?.text || 'Builder data is limited.'}`,
    'Trader Agent': `${money(p.volume)} Base volume against ${money(p.liquidity)} liquidity. ${s.reasons.market[0]?.text || 'Market data is still forming.'}`,
    'Risk Agent': `Risk score is ${p.risk}/100. ${intel.flags.slice(0,2).map(f => f.label).join(' · ') || 'No major risk flag'} — ${s.safety > 65 ? 'setup is relatively clean.' : 'needs holder, LP, and contract checks before hype.'}`,
    'Meme Agent': `${p.mentions} narrative mentions and ${num(p.priceChange24h).toFixed(1)}% 24h move. ${s.reasons.meme[0]?.text || 'Narrative needs more proof.'}`,
    'Whale Agent': `${shortAddr(p.contract) || 'Base flow'} shows ${money(p.marketCap)} cap with ${money(p.volume)} daily volume. Fresh wallets can move this fast if liquidity holds.`,
    'Skeptic Agent': rank === 0 ? `Winner, but still validate contract, holders, and unlocks before FOMO. FDV/liquidity: ${intel.fdvToLiq ? intel.fdvToLiq.toFixed(1)+'x' : 'N/A'}.` : `Interesting, but it needs a sharper catalyst to beat the leader.`
  };
  return lines[agent.name];
}
