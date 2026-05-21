import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Download, GitBranch, Swords, Sparkles, ShieldAlert, TrendingUp, Bot, Coins, Radio, Trophy, Zap, Search, ExternalLink, Loader2, Code2, Copy, Check, Save, RotateCcw, Trash2, KeyRound, Brain, LockKeyhole, Crown } from 'lucide-react';
const agentIcons = { GitBranch, TrendingUp, ShieldAlert, Sparkles, Coins, Bot };
import { toPng } from 'html-to-image';
import '../styles.css';
import { agents, defaults, emptyProject, WEIGHT_PRESETS, DEFAULT_WEIGHTS, STORAGE_KEY, LLM_KEY, BASESCAN_KEY, NEYNAR_KEY, WEIGHTS_KEY, isAddress, parseRepo, money, shortAddr, num, clamp, readPredictions, readSnapshots, readWeights, writePredictions, writeSnapshots, scoreProject, sourcePlugins, selfReview, agentDebate, consensusFromKernels, agentKernel, trendFor, riskDeltaEngine, agentTasks, predictionStats, scenarioAnalysis, buildReportData, reportMarkdown, downloadText, projectId, compactSnapshot, fetchBaseProject, fetchGeckoMarket, fetchTokenSecurity, marketCrossCheck, fetchHolderIntel, deployerIntel, fetchDeployerScan, ownerAddress, farcasterIntel, fetchFarcasterScan, whaleFlowIntel, fetchTransferFlow, walletLabelIntel, makeCaption, getRiskIntel, securityIntel, holderIntel, holderDistribution, lpDeployerIntel, socialIntel, dataQuality, githubFreshness, battleVerdict, tokenReport, evidenceTrail, evidenceGraph, contradictionDetector, sourceReliability, adjustedScore, topWeakScore, scoreClass, tokenIntelligence, riskSentinel, evidenceAudit, redTeamChallenge, crossSourceJudge, nextBestAction, tokenThesis, evaluationMatrix, calibrationAgent, comparativeJudge, riskAdjustedUpside, outcomeAgent, evidenceConflictArbiter, manipulationPatternAgent, readSavedBattles, writeSavedBattles, agentReports, buildLlmPrompt, kernelSummaryText, applyScenario, lineFor, verdict } from '../core/index.js';

const hasProjectData = (p = {}) => Boolean(p.name || p.symbol || p.contract || p.repo || p.repoUrl || p.pairUrl || num(p.marketCap) || num(p.volume) || num(p.liquidity) || num(p.stars) || num(p.commits) || num(p.mentions));

function App() {
  const [projects, setProjects] = useState(defaults);
  const [battleTitle, setBattleTitle] = useState('Base AI Token Battle');
  const [imports, setImports] = useState({});
  const [repoImports, setRepoImports] = useState({});
  const [copied, setCopied] = useState(false);
  const [savedBattles, setSavedBattles] = useState([]);
  const [saveStatus, setSaveStatus] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [securityStatus, setSecurityStatus] = useState({});
  const [marketStatus, setMarketStatus] = useState({});
  const [apiKey, setApiKey] = useState('');
  const [llmModel, setLlmModel] = useState('gpt-4o-mini');
  const [llmReport, setLlmReport] = useState('');
  const [llmStatus, setLlmStatus] = useState('');
  const [llmLoading, setLlmLoading] = useState(false);
  const [agentLlmReports, setAgentLlmReports] = useState({});
  const [agentLlmStatus, setAgentLlmStatus] = useState('');
  const [agentLlmLoading, setAgentLlmLoading] = useState(false);
  const [llmConsensus, setLlmConsensus] = useState('');
  const [basescanKey, setBasescanKey] = useState('');
  const [neynarKey, setNeynarKey] = useState('');
  const [holderStatus, setHolderStatus] = useState({});
  const [farcasterStatus, setFarcasterStatus] = useState({});
  const [whaleFlowStatus, setWhaleFlowStatus] = useState({});
  const [deployerStatus, setDeployerStatus] = useState({});
  const [snapshots, setSnapshots] = useState({});
  const [memoryStatus, setMemoryStatus] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [predictionStatus, setPredictionStatus] = useState('');
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [scenario, setScenario] = useState({ volumeMultiplier: 1, liquidityMultiplier: 1, mentionsMultiplier: 1, priceMoveDelta: 0, riskDelta: 0, lpStatus: 'same', socialBoost: false });
  const [reportStatus, setReportStatus] = useState('');
  const [analyzeStatus, setAnalyzeStatus] = useState({});
  useEffect(() => { setSavedBattles(readSavedBattles()); setApiKey(localStorage.getItem(LLM_KEY) || ''); setBasescanKey(localStorage.getItem(BASESCAN_KEY) || ''); setNeynarKey(localStorage.getItem(NEYNAR_KEY) || ''); setSnapshots(readSnapshots()); setPredictions(readPredictions()); setWeights(readWeights()); }, []);
  const activeProjects = useMemo(() => projects.filter(hasProjectData), [projects]);
  const ranked = useMemo(() => activeProjects.map(p => ({ ...p, scores: scoreProject(p) })).sort((a,b) => (b.scores.adjustedFinal ?? b.scores.final) - (a.scores.adjustedFinal ?? a.scores.final)), [activeProjects]);
  const hasBattleData = ranked.length > 0;
  const displayProject = hasBattleData ? ranked[0] : { ...emptyProject(), name: 'No token loaded', symbol: '', scores: scoreProject(emptyProject()), __empty: true };
  const winner = displayProject;
  const winnerIntel = getRiskIntel(winner);
  const verdictData = useMemo(() => battleVerdict(ranked), [ranked]);
  const reports = useMemo(() => agentReports(winner, ranked[1]), [winner, ranked]);
  window.__AGENT_ARENA_WEIGHTS__ = weights;
  const kernels = useMemo(() => agentKernel(winner, ranked[1]), [winner, ranked, weights]);
  const consensus = useMemo(() => consensusFromKernels(kernels), [kernels]);
  const debate = useMemo(() => agentDebate(kernels, consensus, winner), [kernels, consensus, winner]);
  const review = useMemo(() => selfReview(winner, kernels, consensus, llmConsensus), [winner, kernels, consensus, llmConsensus]);
  const trends = useMemo(() => Object.fromEntries(ranked.map(p => [projectId(p), riskDeltaEngine(p, snapshots)])), [ranked, snapshots]);
  const tasks = useMemo(() => agentTasks(projects, ranked, trends), [projects, ranked, trends]);
  const backtest = useMemo(() => predictionStats(predictions, ranked), [predictions, ranked]);
  const scenarioResult = useMemo(() => scenarioAnalysis(winner, ranked[1], scenario), [winner, ranked, scenario]);
  const reportData = useMemo(() => buildReportData({ ranked, winner, kernels, consensus, debate, review, tasks, backtest, scenarioResult, weights, snapshots }), [ranked, winner, kernels, consensus, debate, review, tasks, backtest, scenarioResult, weights, snapshots]);
  const winnerQuality = dataQuality(winner);
  const winnerIntelV2 = useMemo(() => tokenIntelligence(winner), [winner]);
  const sentinel = useMemo(() => riskSentinel(winner), [winner]);
  const audit = useMemo(() => evidenceAudit(winner), [winner]);
  const redTeam = useMemo(() => redTeamChallenge(winner, ranked[1]), [winner, ranked]);
  const sourceJudge = useMemo(() => crossSourceJudge(winner), [winner]);
  const nextAction = useMemo(() => nextBestAction(winner, ranked), [winner, ranked]);
  const thesis = useMemo(() => tokenThesis(winner, ranked[1]), [winner, ranked]);
  const evalMatrix = useMemo(() => evaluationMatrix(winner), [winner]);
  const calibrationEval = useMemo(() => calibrationAgent(winner), [winner]);
  const comparativeEval = useMemo(() => comparativeJudge(winner, ranked, ranked[1]), [winner, ranked]);
  const upsideEval = useMemo(() => riskAdjustedUpside(winner), [winner]);
  const outcomeEval = useMemo(() => outcomeAgent(winner, backtest.recent || backtest.resolved || []), [winner, backtest]);
  const conflictEval = useMemo(() => evidenceConflictArbiter(winner), [winner]);
  const manipulationEval = useMemo(() => manipulationPatternAgent(winner), [winner]);
  const caption = useMemo(() => makeCaption(winner, winnerIntel), [winner, winnerIntel]);
  const update = (i, key, value) => setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, [key]: value } : p));
  const addProject = () => setProjects(ps => [...ps, emptyProject()]);
  const newBattle = () => { setBattleTitle('Base AI Token Battle'); setProjects(defaults); setSaveStatus('Started a fresh battle.'); };
  const copyMarkdownReport = async () => { await navigator.clipboard.writeText(reportMarkdown(reportData)); setReportStatus('Markdown report copied.'); };
  const downloadMarkdownReport = () => { downloadText(`agentarena-${winner.symbol || winner.name}-report.md`.toLowerCase().replace(/[^a-z0-9.-]+/g,'-'), reportMarkdown(reportData), 'text/markdown'); setReportStatus('Markdown report downloaded.'); };
  const downloadJsonReport = () => { downloadText(`agentarena-${winner.symbol || winner.name}-report.json`.toLowerCase().replace(/[^a-z0-9.-]+/g,'-'), JSON.stringify(reportData, null, 2), 'application/json'); setReportStatus('JSON report downloaded.'); };
  const updateScenario = (key, value) => setScenario(sc => ({ ...sc, [key]: value }));
  const resetScenario = () => setScenario({ volumeMultiplier: 1, liquidityMultiplier: 1, mentionsMultiplier: 1, priceMoveDelta: 0, riskDelta: 0, lpStatus: 'same', socialBoost: false });
  const applyPreset = (name) => { const next = JSON.parse(JSON.stringify(WEIGHT_PRESETS[name] || DEFAULT_WEIGHTS)); setWeights(next); localStorage.setItem(WEIGHTS_KEY, JSON.stringify(next)); };
  const updateScoreWeight = (key, value) => { const next = { ...weights, preset: 'Custom', score: { ...weights.score, [key]: Number(value) } }; setWeights(next); localStorage.setItem(WEIGHTS_KEY, JSON.stringify(next)); };
  const updateAgentWeight = (key, value) => { const next = { ...weights, preset: 'Custom', agents: { ...weights.agents, [key]: Number(value) } }; setWeights(next); localStorage.setItem(WEIGHTS_KEY, JSON.stringify(next)); };
  const updateRiskVeto = (value) => { const next = { ...weights, preset: 'Custom', riskVeto: Number(value) }; setWeights(next); localStorage.setItem(WEIGHTS_KEY, JSON.stringify(next)); };
  const resetWeights = () => applyPreset('Balanced');
  const saveSnapshots = () => {
    const next = { ...snapshots };
    for (const p of ranked) {
      const id = projectId(p);
      if (!id) continue;
      next[id] = [...(next[id] || []), compactSnapshot(p)].slice(-20);
    }
    setSnapshots(next); writeSnapshots(next); setMemoryStatus(`Saved ${ranked.length} token snapshots.`);
  };
  const clearSnapshots = () => { setSnapshots({}); writeSnapshots({}); setMemoryStatus('Agent memory cleared.'); };
  const savePredictions = () => {
    const items = ranked.map(p => {
      const ks = agentKernel(p, ranked.find(x => projectId(x) !== projectId(p)));
      const con = consensusFromKernels(ks);
      return {
        id: `${projectId(p)}-${Date.now()}`,
        ts: Date.now(), projectId: projectId(p), name: p.name, symbol: p.symbol, contract: p.contract,
        price: num(p.price), volume: num(p.volume), liquidity: num(p.liquidity), finalScore: Math.round(p.scores.final),
        votes: Object.fromEntries(ks.map(k => [k.name, k.vote])), consensus: con.label.includes('Bullish') ? 'Bullish' : con.label
      };
    });
    const next = [...predictions, ...items].slice(-120);
    setPredictions(next); writePredictions(next); setPredictionStatus(`Saved ${items.length} prediction records.`);
  };
  const clearPredictions = () => { setPredictions([]); writePredictions([]); setPredictionStatus('Prediction history cleared.'); };
  const saveBattle = () => {
    const item = { id: Date.now(), title: battleTitle || 'Untitled Battle', savedAt: new Date().toISOString(), winner: winner?.name || '', winnerSymbol: winner?.symbol || '', score: Math.round(winner?.scores?.final || 0), projects };
    const next = [item, ...savedBattles].slice(0, 12);
    setSavedBattles(next); writeSavedBattles(next); setSaveStatus('Battle saved locally.');
  };
  const loadBattle = (item) => { setBattleTitle(item.title); setProjects(item.projects || defaults); setSaveStatus(`Loaded ${item.title}.`); };
  const clearBattles = () => { writeSavedBattles([]); setSavedBattles([]); setSaveStatus('Saved battles cleared.'); };
  const exportCard = async () => {
    const node = document.getElementById('share-card');
    const dataUrl = await toPng(node, { cacheBust: true, pixelRatio: 2, backgroundColor: '#07111f' });
    const a = document.createElement('a'); a.download = 'agentarena-battle-card.png'; a.href = dataUrl; a.click();
  };
  const saveApiKey = () => { localStorage.setItem(LLM_KEY, apiKey.trim()); setLlmStatus(apiKey.trim() ? 'API key saved locally in this browser.' : 'API key cleared.'); };
  const clearApiKey = () => { localStorage.removeItem(LLM_KEY); setApiKey(''); setLlmStatus('API key cleared.'); };
  const generateLlmReport = async () => {
    if (!apiKey.trim()) return setLlmStatus('Add your OpenAI API key first.');
    setLlmLoading(true);
    setLlmStatus('Generating LLM agent report...');
    try {
      const text = await callOpenAiReport({ apiKey: apiKey.trim(), model: llmModel, winner, runner: ranked[1], reports, verdictData });
      setLlmReport(text);
      setLlmStatus('LLM report generated.');
    } catch (err) {
      setLlmStatus(err.message || 'LLM report failed.');
    } finally {
      setLlmLoading(false);
    }
  };
  const callOneAgentLlm = async (kernel) => {
    const prompt = `You are ${kernel.name} inside AgentArena, a Base-only AI token battle app. Use only supplied data. No invented facts. No financial advice. Return concise markdown with: Vote, Confidence, Bullish Evidence, Bearish Evidence, What Would Change My Mind.\n\nKERNEL:\n${JSON.stringify(kernel, null, 2)}\n\nWINNER DATA:\n${JSON.stringify({ name:winner.name, symbol:winner.symbol, scores:winner.scores, risk:getRiskIntel(winner), security:securityIntel(winner), quality:dataQuality(winner), github:githubFreshness(winner) }, null, 2)}`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({ model: llmModel || 'gpt-4o-mini', temperature: 0.35, messages: [{ role:'system', content:'You are a careful Web3 analysis agent. Ground every claim in JSON data.' }, { role:'user', content: prompt }] })
    });
    if (!res.ok) throw new Error(`${kernel.name} failed (${res.status})`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response.';
  };
  const callConsensusLlm = async (agentOutputs) => {
    const payload = {
      winner: { name: winner.name, symbol: winner.symbol, scores: winner.scores },
      runnerUp: ranked[1] ? { name: ranked[1].name, symbol: ranked[1].symbol, scores: ranked[1].scores } : null,
      weightedConsensus: consensus,
      kernels,
      evidenceTrail: evidenceTrail(winner),
      sourcePlugins: sourcePlugins(winner),
      debateLoop: debate,
      selfReview: selfReview(winner, kernels, consensus, ''),
      agentOutputs
    };
    const prompt = `You are the Consensus Agent for AgentArena. Read six specialist agent outputs, weighted kernel votes, evidence trail, and debate loop. Use only supplied data. Do not invent facts. No financial advice. Return concise markdown with exact sections: Final Verdict, Vote Summary, Strongest Argument, Biggest Objection, Risk Veto, Upgrade Conditions, Downgrade Conditions.\n\nDATA:\n${JSON.stringify(payload, null, 2)}`;
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey.trim()}` },
      body: JSON.stringify({ model: llmModel || 'gpt-4o-mini', temperature: 0.3, messages: [{ role:'system', content:'You synthesize multi-agent Web3 analysis. Stay grounded in evidence.' }, { role:'user', content: prompt }] })
    });
    if (!res.ok) throw new Error(`Consensus Agent failed (${res.status})`);
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No consensus returned.';
  };
  const generateMultiAgentLlm = async () => {
    if (!apiKey.trim()) return setAgentLlmStatus('Add your OpenAI API key first.');
    setAgentLlmLoading(true); setAgentLlmStatus('Running separate LLM calls for each agent...');
    const out = {};
    try {
      for (const kernel of kernels) out[kernel.name] = await callOneAgentLlm(kernel);
      setAgentLlmReports(out);
      setAgentLlmStatus('Specialist agents complete. Running Consensus Agent...');
      const final = await callConsensusLlm(out);
      setLlmConsensus(final);
      setAgentLlmStatus('Multi-agent LLM debate and consensus generated.');
    } catch (err) { setAgentLlmStatus(err.message || 'Multi-agent LLM failed.'); }
    finally { setAgentLlmLoading(false); }
  };
  const copyCaption = async () => {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };
  const saveBasescanKey = () => { localStorage.setItem(BASESCAN_KEY, basescanKey.trim()); setBulkStatus(basescanKey.trim() ? 'BaseScan key saved locally.' : 'BaseScan key cleared.'); };
  const clearBasescanKey = () => { localStorage.removeItem(BASESCAN_KEY); setBasescanKey(''); setBulkStatus('BaseScan key cleared.'); };
  const saveNeynarKey = () => { localStorage.setItem(NEYNAR_KEY, neynarKey.trim()); setBulkStatus(neynarKey.trim() ? 'Neynar key saved locally.' : 'Neynar key cleared.'); };
  const clearNeynarKey = () => { localStorage.removeItem(NEYNAR_KEY); setNeynarKey(''); setBulkStatus('Neynar key cleared.'); };
  const scanHolders = async (i) => {
    const contract = projects[i].contract?.trim();
    if (!isAddress(contract)) return setHolderStatus(st => ({ ...st, [i]: 'Paste/import a valid Base contract first.' }));
    setHolderStatus(st => ({ ...st, [i]: 'loading' }));
    try {
      const holders = await fetchHolderIntel(contract, basescanKey.trim());
      setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, holders } : p));
      setHolderStatus(st => ({ ...st, [i]: `Holder scan complete · top10 ${holders.top10Pct.toFixed(1)}%` }));
    } catch (err) { setHolderStatus(st => ({ ...st, [i]: err.message || 'Holder scan failed.' })); }
  };
  const scanAllHolders = async () => {
    const targets = projects.map((p, i) => [p.contract, i]).filter(([c]) => isAddress(c || ''));
    if (!targets.length) return setBulkStatus('No valid imported contracts to scan holders.');
    let ok = 0, failed = 0;
    setBulkStatus(`Scanning holders for ${targets.length} contracts...`);
    for (const [contract, i] of targets) {
      try { const holders = await fetchHolderIntel(contract, basescanKey.trim()); setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, holders } : p)); ok++; }
      catch { failed++; }
    }
    setBulkStatus(`Holder scan complete: ${ok} scanned${failed ? ` · ${failed} failed` : ''}.`);
  };
  const scanFarcaster = async (i) => {
    const p = projects[i];
    const query = p.socialKeyword || p.symbol || p.name;
    if (!neynarKey.trim()) return setFarcasterStatus(st => ({ ...st, [i]: 'Add Neynar API key first.' }));
    if (!query) return setFarcasterStatus(st => ({ ...st, [i]: 'Add social keyword, symbol, or name first.' }));
    setFarcasterStatus(st => ({ ...st, [i]: 'loading' }));
    try {
      const farcasterScan = await fetchFarcasterScan(query, neynarKey.trim());
      setProjects(ps => ps.map((x, idx) => idx === i ? { ...x, farcasterScan, socialKeyword: x.socialKeyword || query } : x));
      const intel = farcasterIntel({ ...p, farcasterScan });
      setFarcasterStatus(st => ({ ...st, [i]: `Farcaster scan complete · ${intel.confidence}` }));
    } catch (err) { setFarcasterStatus(st => ({ ...st, [i]: err.message || 'Farcaster scan failed.' })); }
  };
  const scanWhaleFlow = async (i) => {
    const contract = projects[i].contract?.trim();
    if (!basescanKey.trim()) return setWhaleFlowStatus(st => ({ ...st, [i]: 'Add BaseScan API key first.' }));
    if (!isAddress(contract || '')) return setWhaleFlowStatus(st => ({ ...st, [i]: 'Paste/import a valid Base contract first.' }));
    setWhaleFlowStatus(st => ({ ...st, [i]: 'loading' }));
    try {
      const transferFlow = await fetchTransferFlow(contract, basescanKey.trim());
      setProjects(ps => ps.map((x, idx) => idx === i ? { ...x, transferFlow } : x));
      const intel = whaleFlowIntel({ ...projects[i], transferFlow });
      setWhaleFlowStatus(st => ({ ...st, [i]: `Whale flow complete · ${intel.confidence}` }));
    } catch (err) { setWhaleFlowStatus(st => ({ ...st, [i]: err.message || 'Whale flow scan failed.' })); }
  };
  const scanAllFarcaster = async () => {
    if (!neynarKey.trim()) return setBulkStatus('Add Neynar API key first.');
    const targets = projects.map((p, i) => [p.socialKeyword || p.symbol || p.name, i]).filter(([q]) => String(q || '').trim());
    if (!targets.length) return setBulkStatus('No social keywords available.');
    let ok = 0, failed = 0;
    setBulkStatus(`Scanning Farcaster for ${targets.length} tokens...`);
    for (const [query, i] of targets) {
      try { const farcasterScan = await fetchFarcasterScan(query, neynarKey.trim()); setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, farcasterScan, socialKeyword: p.socialKeyword || query } : p)); ok++; }
      catch { failed++; }
    }
    setBulkStatus(`Farcaster scan complete: ${ok} scanned${failed ? ` · ${failed} failed` : ''}.`);
  };
  const scanAllWhaleFlow = async () => {
    if (!basescanKey.trim()) return setBulkStatus('Add BaseScan API key first.');
    const targets = projects.map((p, i) => [p.contract, i]).filter(([c]) => isAddress(c || ''));
    if (!targets.length) return setBulkStatus('No valid imported contracts to scan transfer flow.');
    let ok = 0, failed = 0;
    setBulkStatus(`Scanning whale flow for ${targets.length} tokens...`);
    for (const [contract, i] of targets) {
      try { const transferFlow = await fetchTransferFlow(contract, basescanKey.trim()); setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, transferFlow } : p)); ok++; }
      catch { failed++; }
    }
    setBulkStatus(`Whale flow scan complete: ${ok} scanned${failed ? ` · ${failed} failed` : ''}.`);
  };
  const scanDeployer = async (i) => {
    const p = projects[i];
    const address = p.deployerAddress || ownerAddress(p);
    if (!basescanKey.trim()) return setDeployerStatus(st => ({ ...st, [i]: 'Add BaseScan API key first.' }));
    if (!isAddress(address || '')) return setDeployerStatus(st => ({ ...st, [i]: 'Add deployer address or run Security Scan for owner address first.' }));
    setDeployerStatus(st => ({ ...st, [i]: 'loading' }));
    try {
      const deployerScan = await fetchDeployerScan(address, basescanKey.trim());
      setProjects(ps => ps.map((x, idx) => idx === i ? { ...x, deployerAddress: x.deployerAddress || address, deployerScan } : x));
      const intel = deployerIntel({ ...p, deployerAddress: p.deployerAddress || address, deployerScan });
      setDeployerStatus(st => ({ ...st, [i]: `Deployer scan complete · ${Math.round(intel.score)}/100` }));
    } catch (err) { setDeployerStatus(st => ({ ...st, [i]: err.message || 'Deployer scan failed.' })); }
  };
  const scanAllDeployers = async () => {
    if (!basescanKey.trim()) return setBulkStatus('Add BaseScan API key first.');
    const targets = projects.map((p, i) => [p.deployerAddress || ownerAddress(p), i]).filter(([a]) => isAddress(a || ''));
    if (!targets.length) return setBulkStatus('No deployer/owner addresses available. Run Security Scan or add deployer addresses.');
    let ok = 0, failed = 0;
    setBulkStatus(`Scanning deployer history for ${targets.length} wallets...`);
    for (const [address, i] of targets) {
      try { const deployerScan = await fetchDeployerScan(address, basescanKey.trim()); setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, deployerAddress: p.deployerAddress || address, deployerScan } : p)); ok++; }
      catch { failed++; }
    }
    setBulkStatus(`Deployer scan complete: ${ok} scanned${failed ? ` · ${failed} failed` : ''}.`);
  };
  const scanMarket = async (i) => {
    const contract = projects[i].contract?.trim();
    if (!isAddress(contract)) return setMarketStatus(st => ({ ...st, [i]: 'Paste/import a valid Base contract first.' }));
    setMarketStatus(st => ({ ...st, [i]: 'loading' }));
    try {
      const gecko = await fetchGeckoMarket(contract, projects[i].pairAddress);
      setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, gecko } : p));
      const check = marketCrossCheck({ ...projects[i], gecko });
      setMarketStatus(st => ({ ...st, [i]: `Market cross-check complete · ${check.confidence}` }));
    } catch (err) { setMarketStatus(st => ({ ...st, [i]: err.message || 'Market cross-check failed.' })); }
  };
  const scanAllMarket = async () => {
    const targets = projects.map((p, i) => [p.contract, i]).filter(([c]) => isAddress(c || ''));
    if (!targets.length) return setBulkStatus('No valid imported contracts to cross-check.');
    let ok = 0, failed = 0;
    setBulkStatus(`Cross-checking market data for ${targets.length} contracts...`);
    for (const [contract, i] of targets) {
      try { const gecko = await fetchGeckoMarket(contract, projects[i].pairAddress); setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, gecko } : p)); ok++; }
      catch { failed++; }
    }
    setBulkStatus(`Market cross-check complete: ${ok} checked${failed ? ` · ${failed} failed` : ''}.`);
  };
  const scanSecurity = async (i) => {
    const contract = projects[i].contract?.trim();
    if (!isAddress(contract)) return setSecurityStatus(st => ({ ...st, [i]: 'Paste/import a valid Base contract first.' }));
    setSecurityStatus(st => ({ ...st, [i]: 'loading' }));
    try {
      const security = await fetchTokenSecurity(contract);
      if (!security) throw new Error('No security result returned');
      const secIntel = securityIntel({ security });
      setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, security, risk: Math.round(clamp((p.risk || 45) * .55 + (100 - secIntel.score) * .45, 5, 95)) } : p));
      setSecurityStatus(st => ({ ...st, [i]: `Security scan complete · ${secIntel.flags.slice(0,2).map(f=>f.label).join(', ')}` }));
    } catch (err) {
      setSecurityStatus(st => ({ ...st, [i]: err.message || 'Security scan failed.' }));
    }
  };
  const scanAllSecurity = async () => {
    const targets = projects.map((p, i) => [p.contract, i]).filter(([c]) => isAddress(c || ''));
    if (!targets.length) return setBulkStatus('No valid imported contracts to scan.');
    setBulkStatus(`Scanning ${targets.length} contracts...`);
    let ok = 0, failed = 0;
    for (const [contract, i] of targets) {
      try {
        const security = await fetchTokenSecurity(contract);
        if (!security) throw new Error('No result');
        const secIntel = securityIntel({ security });
        setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, security, risk: Math.round(clamp((p.risk || 45) * .55 + (100 - secIntel.score) * .45, 5, 95)) } : p));
        ok++;
      } catch { failed++; }
    }
    setBulkStatus(`Security scan complete: ${ok} scanned${failed ? ` · ${failed} failed` : ''}.`);
  };
  const bulkImport = async () => {
    const rawMatches = bulkText.match(/0x[a-zA-Z0-9]{1,64}/g) || [];
    const invalid = rawMatches.filter(x => !isAddress(x));
    const contracts = [...new Set(rawMatches.filter(isAddress).map(x => x.trim()))];
    const duplicates = rawMatches.filter(isAddress).length - contracts.length;
    if (!contracts.length) return setBulkStatus(invalid.length ? `${invalid.length} invalid address found.` : 'Paste one or more Base contract addresses.');
    setBulkLoading(true);
    setBulkStatus(`Importing ${contracts.length} Base contracts...`);
    const imported = [];
    const failed = [];
    const warnings = [];
    for (const contract of contracts) {
      try {
        const result = await fetchBaseProject(contract);
        imported.push(result.project);
        if (result.warnings.length) warnings.push(`${result.project.symbol || shortAddr(contract)}: ${result.warnings.join(', ')}`);
      }
      catch (err) { failed.push(`${shortAddr(contract)}: ${err.message || 'failed'}`); }
    }
    if (imported.length) setProjects(imported);
    setBulkLoading(false);
    setBulkStatus(`${imported.length} imported${duplicates ? ` · ${duplicates} duplicate skipped` : ''}${invalid.length ? ` · ${invalid.length} invalid` : ''}${failed.length ? ` · ${failed.length} failed (${failed.join(', ')})` : ''}${warnings.length ? ` · warnings: ${warnings.join('; ')}` : ''}.`);
  };
  const importRepo = async (i) => {
    const repo = parseRepo(projects[i].repo);
    if (!repo) return setRepoImports(s => ({ ...s, [i]: 'Paste owner/repo or a GitHub repo URL.' }));
    setRepoImports(s => ({ ...s, [i]: 'loading' }));
    try {
      const [metaRes, commitRes] = await Promise.all([
        fetch(`https://api.github.com/repos/${repo}`),
        fetch(`https://api.github.com/repos/${repo}/commits?per_page=1`)
      ]);
      if (!metaRes.ok) throw new Error('GitHub repo not found or rate limited');
      const meta = await metaRes.json();
      let recentCommits = num(projects[i].commits);
      const link = commitRes.headers.get('link') || '';
      const last = link.match(/[?&]page=(\d+)>; rel=\"last\"/);
      if (last) recentCommits = num(last[1]);
      else if (commitRes.ok) {
        const commits = await commitRes.json();
        recentCommits = Array.isArray(commits) ? commits.length : recentCommits;
      }
      setProjects(ps => ps.map((p, idx) => idx === i ? {
        ...p,
        repo,
        stars: num(meta.stargazers_count),
        forks: num(meta.forks_count),
        openIssues: num(meta.open_issues_count),
        commits: recentCommits,
        repoUrl: meta.html_url,
        lastPushed: meta.pushed_at,
        repoCreatedAt: meta.created_at,
        repoUpdatedAt: meta.updated_at,
        description: meta.description || p.description
      } : p));
      setRepoImports(s => ({ ...s, [i]: `Imported ${repo} from GitHub.` }));
    } catch (err) {
      setRepoImports(s => ({ ...s, [i]: err.message || 'GitHub import failed.' }));
    }
  };
  const importBaseToken = async (i) => {
    const contract = projects[i].contract?.trim();
    if (!isAddress(contract)) return setImports(s => ({ ...s, [i]: 'Paste a valid Base contract address.' }));
    setImports(s => ({ ...s, [i]: 'loading' }));
    try {
      const result = await fetchBaseProject(contract, projects[i]);
      const imported = result.project;
      setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, ...imported, repo: p.repo, repoUrl: p.repoUrl, stars: p.stars, commits: p.commits, forks: p.forks, openIssues: p.openIssues, lastPushed: p.lastPushed } : p));
      setImports(s => ({ ...s, [i]: `Imported ${imported.symbol || imported.name || 'Base token'}${result.warnings.length ? ` · ${result.warnings.join(', ')}` : ''}.` }));
    } catch (err) {
      setImports(s => ({ ...s, [i]: err.message || 'Import failed.' }));
    }
  };
  const analyzeToken = async (i) => {
    const current = projects[i] || {};
    const contract = current.contract?.trim();
    if (!isAddress(contract)) return setAnalyzeStatus(st => ({ ...st, [i]: 'Paste a valid Base contract first.' }));
    setAnalyzeStatus(st => ({ ...st, [i]: 'loading' }));
    const next = { ...current };
    const notes = [];
    try {
      try {
        const result = await fetchBaseProject(contract, next);
        Object.assign(next, result.project);
        if (result.warnings?.length) notes.push(...result.warnings);
      } catch (err) { notes.push(`Import: ${err.message || 'failed'}`); }
      try {
        next.gecko = await fetchGeckoMarket(contract, next.pairAddress);
      } catch (err) { notes.push(`Market: ${err.message || 'failed'}`); }
      try {
        const security = await fetchTokenSecurity(contract);
        if (!security) throw new Error('No security result returned');
        const secIntel = securityIntel({ security });
        next.security = security;
        next.risk = Math.round(clamp((next.risk || 45) * .55 + (100 - secIntel.score) * .45, 5, 95));
      } catch (err) { notes.push(`Security: ${err.message || 'failed'}`); }
      if (basescanKey.trim()) {
        try { next.holders = await fetchHolderIntel(contract, basescanKey.trim()); } catch (err) { notes.push(`Holders: ${err.message || 'failed'}`); }
        try { next.transferFlow = await fetchTransferFlow(contract, basescanKey.trim()); } catch (err) { notes.push(`Whale flow: ${err.message || 'failed'}`); }
        const deployer = next.deployerAddress || ownerAddress(next);
        if (isAddress(deployer || '')) {
          try { next.deployerAddress = deployer; next.deployerScan = await fetchDeployerScan(deployer, basescanKey.trim()); } catch (err) { notes.push(`Deployer: ${err.message || 'failed'}`); }
        }
      } else notes.push('BaseScan key missing: holder, whale, deployer skipped');
      if (neynarKey.trim()) {
        const query = next.socialKeyword || next.symbol || next.name;
        if (query) {
          try { next.farcasterScan = await fetchFarcasterScan(query, neynarKey.trim()); next.socialKeyword = next.socialKeyword || query; } catch (err) { notes.push(`Farcaster: ${err.message || 'failed'}`); }
        }
      } else notes.push('Neynar key missing: Farcaster skipped');
      const scoredNext = { ...next, scores: scoreProject(next) };
      const id = projectId(scoredNext);
      let delta = null;
      if (id) {
        delta = riskDeltaEngine(scoredNext, snapshots);
        const snap = compactSnapshot(scoredNext);
        const nextSnapshots = { ...snapshots, [id]: [...(snapshots[id] || []), snap].slice(-20) };
        setSnapshots(nextSnapshots);
        writeSnapshots(nextSnapshots);
      }
      setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, ...next } : p));
      const intel = tokenIntelligence(scoredNext);
      setAnalyzeStatus(st => ({ ...st, [i]: `Analyze complete · ${intel.label} · ${intel.score}/100 · ${intel.confidence}% confidence${delta?.prev ? ` · ${delta.status}: ${delta.summary}` : ' · snapshot saved'}${notes.length ? ` · ${notes.slice(0, 2).join('; ')}` : ''}` }));
    } catch (err) {
      setAnalyzeStatus(st => ({ ...st, [i]: err.message || 'Analyze failed.' }));
    }
  };

  return <main className="saas-app ux-app">
    <section className="ux-hero" id="scan">
      <div className="ux-hero-main">
        <div className="saas-eyebrow"><img src="/avatar-192.png" alt="AgentArena avatar"/> Base AI Token Risk Dashboard</div>
        <h1>Base token battles, ranked by evidence.</h1>
        <p className="saas-tagline">Paste Base contracts, run the scans that matter, then compare score, confidence, evidence gaps, and export-ready verdicts in one flow.</p>
        <div className="ux-stepper" aria-label="Main workflow">
          <a className="active" href="#scan"><b>1</b><span>Input</span><em>Paste contracts</em></a>
          <a href="#verdict"><b>2</b><span>Verdict</span><em>Top token + reasons</em></a>
          <a href="#leaderboard"><b>3</b><span>Compare</span><em>Leaderboard</em></a>
          <a href="#reports"><b>4</b><span>Export</span><em>MD / JSON</em></a>
        </div>
      </div>
      <div className="ux-summary-card">
        <span>Current verdict</span>
        <strong>{hasBattleData ? `#1 ${winner.symbol ? `$${winner.symbol}` : winner.name || 'Token'}` : 'Ready to rank'}</strong>
        <p>{hasBattleData ? `${winnerIntelV2.label} · ${winnerIntelV2.score}/100 · ${winnerIntelV2.confidence}% confidence` : 'No demo metrics. No fake token data. Start with real Base contracts.'}</p>
      </div>
    </section>

    <section className="ux-workspace">
      <section className="ux-primary-card saas-panel">
        <div className="saas-panel-head ux-head"><div><span>Step 1 · Input</span><h2>Start with real contracts</h2><p>Use the bulk box for a battle, or open a single-token card when you need manual enrichment. The page stays empty until real data is imported.</p></div><button className="ghost-action" onClick={newBattle}><RotateCcw size={16}/> Reset</button></div>
        <div className="input-layout">
          <div className="bulk-entry-card">
            <label className="saas-field">Base contracts to rank<textarea aria-label="Paste multiple Base contracts" value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder={"0x... one contract per line\n0x... paste another contract"} /></label>
            <div className="bulk-entry-actions"><button className="saas-btn primary" onClick={bulkImport} disabled={bulkLoading}>{bulkLoading ? <Loader2 size={17} className="spin"/> : <Crown size={17}/>} Import and rank</button><span>Best for comparing 2+ tokens quickly.</span></div>
            {bulkStatus && <p className={bulkStatus.includes('failed') || bulkStatus.startsWith('Paste') || bulkStatus.includes('invalid') ? 'saas-status' : 'saas-status ok'}>{bulkStatus}</p>}
          </div>
          <aside className="battle-settings-card">
            <label className="saas-field compact-title">Battle title<input aria-label="Battle title" value={battleTitle} onChange={e=>setBattleTitle(e.target.value)} /></label>
            <div className="flow-hints"><b>Recommended flow</b><span>1. Paste contracts</span><span>2. Import + rank</span><span>3. Add optional scans only for finalists</span></div>
          </aside>
        </div>
        <div className="token-stack">
        {projects.map((p,i)=><article className="token-card ux-token-card" key={i}>
          <header><div><small>Manual token {i+1}</small><h3>{p.symbol ? `$${p.symbol}` : p.name || 'Single-token scan'}</h3><span>{p.contract ? shortAddr(p.contract) : 'Paste a Base contract address'}</span></div><b>{hasProjectData(p) ? Math.round(p.scores?.adjustedFinal ?? p.scores?.final ?? scoreProject(p).adjustedFinal ?? 0) : '—'}</b></header>
          <div className="ux-contract-row">
            <label className="saas-field wide">Base contract<input aria-label="Paste Base token contract" value={p.contract} onChange={e=>update(i,'contract',e.target.value)} placeholder="0x... Base token contract" /></label>
            <button className="saas-btn primary big-cta" onClick={()=>analyzeToken(i)} disabled={analyzeStatus[i] === 'loading'}>{analyzeStatus[i] === 'loading' ? <Loader2 size={18} className="spin"/> : <Zap size={18}/>} Analyze Token</button>
            <button className="saas-btn secondary-cta" onClick={()=>importBaseToken(i)} disabled={imports[i] === 'loading'}>{imports[i] === 'loading' ? <Loader2 size={17} className="spin"/> : <Search size={17}/>} Import only</button>
          </div>
          {[analyzeStatus[i], imports[i], marketStatus[i], repoImports[i], securityStatus[i], holderStatus[i], whaleFlowStatus[i], farcasterStatus[i], deployerStatus[i]].filter(x=>x && x !== 'loading').map((x,idx)=><p className={String(x).includes('complete') || String(x).startsWith('Imported') ? 'saas-status ok' : 'saas-status'} key={idx}>{x}</p>)}
          <div className="ux-details">
            <div className="ux-details-title">Optional enrichment scans</div>
            <div className="secondary-grid">
              <label className="saas-field">GitHub repo or URL<input aria-label="GitHub repo or URL" value={p.repo} onChange={e=>update(i,'repo',e.target.value)} placeholder="owner/repo or GitHub URL" /></label>
              <label className="saas-field">Deployer/owner address<input aria-label="Optional deployer or owner address" value={p.deployerAddress || ''} onChange={e=>update(i,'deployerAddress',e.target.value)} placeholder="Optional deployer/owner address" /></label>
            </div>
            <div className="tool-row compact-tools">
              <button onClick={()=>scanMarket(i)} disabled={marketStatus[i] === 'loading'}><TrendingUp size={16}/> Market</button><button onClick={()=>importRepo(i)} disabled={repoImports[i] === 'loading'}><Code2 size={16}/> Repo</button><button onClick={()=>scanSecurity(i)} disabled={securityStatus[i] === 'loading'}><LockKeyhole size={16}/> Security</button><button onClick={()=>scanHolders(i)} disabled={holderStatus[i] === 'loading'}><Coins size={16}/> Holders</button><button onClick={()=>scanWhaleFlow(i)} disabled={whaleFlowStatus[i] === 'loading'}><Coins size={16}/> Whale flow</button><button onClick={()=>scanFarcaster(i)} disabled={farcasterStatus[i] === 'loading'}><Sparkles size={16}/> Farcaster</button><button onClick={()=>scanDeployer(i)} disabled={deployerStatus[i] === 'loading'}><ShieldAlert size={16}/> Deployer</button>
            </div>
          </div>
          {hasProjectData(p) && <div className="token-meta"><span>{p.symbol || 'TOKEN'}</span>{p.price ? <b>{money(p.price, 4)}</b> : null}{p.marketCap ? <span>{money(p.marketCap)} cap</span> : null}{p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer">Repo <ExternalLink size={12}/></a>}{p.pairUrl && <a href={p.pairUrl} target="_blank" rel="noreferrer">Chart <ExternalLink size={12}/></a>}</div>}
        </article>)}
        </div>
        <button className="add-token-link" onClick={addProject}>+ Compare another token</button>
      </section>

      <section className="ux-results-grid" id="verdict">
        <div id="share-card" className={`verdict-card ux-verdict-card ${hasBattleData ? 'winner-glow' : ''}`}>
          <div className="verdict-header"><span>Step 2 · Verdict</span><b>{hasBattleData ? 'Live result' : 'Waiting for input'}</b></div>
          <div className="verdict-title"><div className="winner-crown"><Crown size={36}/></div><div><small>{hasBattleData ? 'TOP 1 TOKEN' : 'Empty state'}</small><h2>{hasBattleData ? (winner.symbol ? `$${winner.symbol}` : winner.name) : 'No token analyzed yet'}</h2><p>{hasBattleData ? `${winner.name} · ${verdict(winner.scores.final)} · ${Math.round(winner.scores.final)}/100` : 'Paste a real Base contract above. The dashboard will stay blank until data is imported.'}</p></div></div>
          {hasBattleData ? <><div className="verdict-metrics"><div><strong>{winnerIntelV2.score}</strong><span>Risk score</span></div><div><strong>{winnerIntelV2.confidence}%</strong><span>Confidence</span></div><div><strong>{winnerQuality.completeness}%</strong><span>Complete</span></div></div><div className="risk-tags">{winnerIntelV2.reasons.map(flag=><span key={flag.label} className={flag.level}>{flag.label}</span>)}</div></> : <div className="clean-empty"><b>No fake sample loaded</b><span>No demo market cap, no fake volume, no placeholder score.</span></div>}
        </div>
        <div className="saas-panel evidence-panel"><div className="saas-panel-head"><div><span>Step 2 · Evidence</span><h2>Why it ranks #1</h2><p>Four readable signals before the deeper agent audit.</p></div></div>{hasBattleData ? <div className="evidence-list">{['builder','market','meme','safety'].map(k=><div key={k}><b>{k}</b><span>{winner.scores.reasons[k]?.[0]?.text || 'No major note.'}</span><em>{Math.round(winner.scores[k])}</em></div>)}</div> : <p className="muted">Evidence appears after Analyze Token.</p>}</div>
      </section>


      <section className="saas-panel leaderboard-panel" id="leaderboard">
        <div className="saas-panel-head"><div><span>Step 3 · Compare</span><h2>Token leaderboard</h2><p>Sorted by adjusted score, with confidence and data completeness visible before the detailed agent audit.</p></div><span className="mini-chip">{ranked.length || 0} ranked</span></div>
        {hasBattleData ? <div className="leaderboard-list">{ranked.map((p, idx) => { const intel = tokenIntelligence(p); const quality = dataQuality(p); return <div className={`leaderboard-row ${idx === 0 ? 'top-one' : ''}`} key={`${projectId(p)}-${idx}`}>
          <div className="rank-badge">{idx === 0 ? <Crown size={16}/> : `#${idx + 1}`}</div>
          <div className="rank-token"><b>{p.symbol ? `$${p.symbol}` : p.name || shortAddr(p.contract) || 'Token'}</b><span>{p.contract ? shortAddr(p.contract) : p.name || 'Manual token'}</span></div>
          <div><strong>{Math.round(p.scores.adjustedFinal ?? p.scores.final ?? 0)}</strong><span>Score</span></div>
          <div><strong>{intel.confidence}%</strong><span>Confidence</span></div>
          <div><strong>{quality.completeness}%</strong><span>Complete</span></div>
          <div className={`rank-verdict ${scoreClass(p.scores.adjustedFinal ?? p.scores.final)}`}>{idx === 0 ? 'TOP 1 · ' : ''}{intel.label}</div>
        </div>})}</div> : <div className="clean-empty"><b>No ranking yet</b><span>Paste multiple real Base contracts to generate the leaderboard.</span></div>}
      </section>


      <section className="saas-panel agent-upgrade-panel" id="agent-council">
        <div className="saas-panel-head"><div><span>Step 4 · Deep audit</span><h2>Agent council</h2><p>Claim/evidence/confidence signals, hard veto checks, conflict arbitration, and manipulation risk after the leaderboard.</p></div><span className={`mini-chip ${consensus.riskVeto || consensus.evidenceVeto ? 'danger' : 'ok'}`}>{consensus.riskVeto ? 'Risk veto active' : consensus.evidenceVeto ? 'Evidence veto active' : 'No veto'}</span></div>
        {hasBattleData ? <>
          <div className="sentinel-grid">
            <div className={`sentinel-card ${sentinel.hardVeto ? 'danger' : 'ok'}`}><b>Risk Sentinel</b><strong>{sentinel.gate}</strong><span>{sentinel.summary}</span><em>Penalty -{sentinel.totalPenalty}</em></div>
            <div className="sentinel-card"><b>Evidence Agent</b><strong>{audit.score}/100</strong><span>{audit.summary}</span><em>{audit.missingCritical.length} critical gaps</em></div>
            <div className="sentinel-card"><b>Consensus</b><strong>{consensus.label}</strong><span>Disagreement: {consensus.disagreement}</span><em>{kernels.length} agents voting</em></div>
          </div>
          <div className="kernel-grid">{kernels.map(k => <div className="kernel-card" key={k.name}><div><b>{k.name}</b><span>{k.vote} · {Math.round(k.confidence)}%</span></div><strong>{Math.round(k.score)}</strong><p>{k.bearish[0] || k.bullish[0]}</p></div>)}</div>
          <div className="audit-list"><b>Top audit trail</b>{audit.claims.slice(0, 5).map(c => <span className={c.level} key={`${c.claim}-${c.source}`}>{c.claim}: {c.value} · {c.source}</span>)}</div>
          <div className="agent-deep-grid">
            <div><b>Red Team</b><strong>{redTeam.level}</strong><span>{redTeam.summary}</span><em>{redTeam.recommendedCheck}</em></div>
            <div><b>Source Judge</b><strong>{sourceJudge.verdict}</strong><span>{sourceJudge.summary}</span><em>Penalty -{sourceJudge.penalty}</em></div>
            <div><b>Next Best Action</b><strong>{nextAction.priority}</strong><span>{nextAction.nextScan}</span><em>{nextAction.expectedImpact}</em></div>
            <div><b>Token Thesis</b><strong>{thesis.verdict}</strong><span>{thesis.bullCase}</span><em>{thesis.changeMind}</em></div>
          </div>
          <div className="agent-eval-grid">
            <div><b>Evaluation Matrix</b><strong>{evalMatrix.score}/100</strong><span>{evalMatrix.summary}</span><em>Weakest: {evalMatrix.weakest[0]?.label}</em></div>
            <div><b>Calibration</b><strong>{calibrationEval.label}</strong><span>Raw {calibrationEval.rawScore} → calibrated {calibrationEval.calibratedScore}</span><em>Cap {calibrationEval.confidenceCap}% · unlock {calibrationEval.requiredEvidenceToUnlock[0]}</em></div>
            <div><b>Comparative Judge</b><strong>{comparativeEval.margin ?? 'N/A'}</strong><span>{comparativeEval.finalRankingRationale}</span><em>{comparativeEval.runnerUpThreat}</em></div>
            <div><b>Risk-Adjusted Upside</b><strong>{upsideEval.riskRewardRatio}</strong><span>{upsideEval.positionType}</span><em>{upsideEval.allocationHint}</em></div>
          </div>
          <div className="agent-eval-grid agent-verdict-grid">
            <div><b>Outcome Agent</b><strong>{outcomeEval.predictionAccuracy}%</strong><span>{outcomeEval.summary}</span><em>{outcomeEval.weightAdjustmentSuggestion}</em></div>
            <div><b>Conflict Arbiter</b><strong>{conflictEval.label}</strong><span>Trust: {conflictEval.trustedSide}</span><em>Haircut -{conflictEval.scoreHaircut} · Review {conflictEval.manualReviewRequired ? 'Yes' : 'No'}</em></div>
            <div><b>Manipulation Pattern</b><strong>{manipulationEval.manipulationRisk}/100</strong><span>{manipulationEval.label}</span><em>{manipulationEval.exitRiskWindow}</em></div>
          </div>
        </> : <p className="muted">Agent council activates after real token data is imported.</p>}
      </section>

      <section className="saas-panel report-panel" id="reports">
        <div className="saas-panel-head"><div><span>Step 5 · Export</span><h2>Export report</h2><p>Download Markdown/JSON after reviewing the verdict. Reports include ranking, evidence, source coverage, gaps, and next verification tasks.</p></div><span className="mini-chip">MD + JSON</span></div>
        <div className="report-actions"><button onClick={copyMarkdownReport}><Copy size={16}/> Copy Markdown</button><button onClick={downloadMarkdownReport}><Download size={16}/> Download MD</button><button onClick={downloadJsonReport}><Download size={16}/> Download JSON</button><button onClick={exportCard}><Download size={16}/> Export Card</button><button onClick={saveBattle}><Save size={16}/> Save Battle</button></div>
        {reportStatus && <p className="saas-status ok">{reportStatus}</p>}{saveStatus && <p className="saas-status ok">{saveStatus}</p>}
      </section>

      <details className="saas-panel sources-panel ux-advanced" id="sources">
        <summary><span>Advanced sources and bulk tools</span><small>Optional API keys, bulk import, and deeper scans</small></summary>
        <div className="secondary-grid"><label className="saas-field">Optional BaseScan API key<input aria-label="Optional BaseScan API key" type="password" value={basescanKey} onChange={e=>setBasescanKey(e.target.value)} placeholder="Optional BaseScan API key for holder/flow scans"/></label><label className="saas-field">Optional Neynar API key<input aria-label="Optional Neynar API key" type="password" value={neynarKey} onChange={e=>setNeynarKey(e.target.value)} placeholder="Optional Neynar API key for Farcaster scans"/></label></div>
        <div className="tool-row"><button onClick={saveBasescanKey}>Save BaseScan Key</button><button onClick={clearBasescanKey}>Clear BaseScan</button><button onClick={saveNeynarKey}>Save Neynar Key</button><button onClick={clearNeynarKey}>Clear Neynar</button></div>
        <label className="saas-field">Bulk contracts mirror<textarea aria-label="Paste Base contracts one per line" value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder="Paste Base contracts, one per line" /></label>
        <div className="tool-row"><button onClick={bulkImport} disabled={bulkLoading}>{bulkLoading ? <Loader2 size={17} className="spin"/> : <Search size={17}/>} Import Battle</button><button onClick={scanAllMarket}>Cross-check Market</button><button onClick={scanAllSecurity}>Scan Security</button><button onClick={scanAllHolders}>Scan Holders</button><button onClick={scanAllDeployers}>Scan Deployers</button><button onClick={scanAllWhaleFlow}>Whale Flow</button><button onClick={scanAllFarcaster}>Farcaster</button></div>
        {bulkStatus && <p className={bulkStatus.includes('failed') || bulkStatus.startsWith('Paste') ? 'saas-status' : 'saas-status ok'}>{bulkStatus}</p>}
      </details>
    </section>
  </main>;
}

export default App;

