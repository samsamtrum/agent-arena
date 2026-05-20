import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Download, GitBranch, Swords, Sparkles, ShieldAlert, TrendingUp, Bot, Coins, Radio, Trophy, Zap, Search, ExternalLink, Loader2, Code2, Copy, Check, Save, RotateCcw, Trash2, KeyRound, Brain, LockKeyhole } from 'lucide-react';
const agentIcons = { GitBranch, TrendingUp, ShieldAlert, Sparkles, Coins, Bot };
import { toPng } from 'html-to-image';
import '../styles.css';
import { agents, defaults, WEIGHT_PRESETS, DEFAULT_WEIGHTS, STORAGE_KEY, LLM_KEY, BASESCAN_KEY, NEYNAR_KEY, WEIGHTS_KEY, isAddress, parseRepo, money, shortAddr, num, clamp, readPredictions, readSnapshots, readWeights, writePredictions, writeSnapshots, scoreProject, sourcePlugins, selfReview, agentDebate, consensusFromKernels, agentKernel, trendFor, riskDeltaEngine, agentTasks, predictionStats, scenarioAnalysis, buildReportData, reportMarkdown, downloadText, projectId, compactSnapshot, fetchBaseProject, fetchGeckoMarket, fetchTokenSecurity, marketCrossCheck, deployerIntel, fetchDeployerScan, ownerAddress, farcasterIntel, fetchFarcasterScan, whaleFlowIntel, fetchTransferFlow, walletLabelIntel, makeCaption, getRiskIntel, securityIntel, holderIntel, holderDistribution, lpDeployerIntel, socialIntel, dataQuality, githubFreshness, battleVerdict, tokenReport, evidenceTrail, evidenceGraph, contradictionDetector, sourceReliability, adjustedScore, topWeakScore, scoreClass, readSavedBattles, writeSavedBattles, agentReports, buildLlmPrompt, kernelSummaryText, applyScenario, lineFor, verdict } from '../core/index.js';

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
  window.__AGENT_ARENA_WEIGHTS__ = weights;
  useEffect(() => { setSavedBattles(readSavedBattles()); setApiKey(localStorage.getItem(LLM_KEY) || ''); setBasescanKey(localStorage.getItem(BASESCAN_KEY) || ''); setNeynarKey(localStorage.getItem(NEYNAR_KEY) || ''); setSnapshots(readSnapshots()); setPredictions(readPredictions()); setWeights(readWeights()); }, []);
  const ranked = useMemo(() => projects.map(p => ({ ...p, scores: scoreProject(p) })).sort((a,b) => (b.scores.adjustedFinal ?? b.scores.final) - (a.scores.adjustedFinal ?? a.scores.final)), [projects]);
  const winner = ranked[0];
  const winnerIntel = getRiskIntel(winner);
  const verdictData = useMemo(() => battleVerdict(ranked), [ranked]);
  const reports = useMemo(() => agentReports(winner, ranked[1]), [winner, ranked]);
  const kernels = useMemo(() => agentKernel(winner, ranked[1]), [winner, ranked]);
  const consensus = useMemo(() => consensusFromKernels(kernels), [kernels]);
  const debate = useMemo(() => agentDebate(kernels, consensus, winner), [kernels, consensus, winner]);
  const review = useMemo(() => selfReview(winner, kernels, consensus, llmConsensus), [winner, kernels, consensus, llmConsensus]);
  const trends = useMemo(() => Object.fromEntries(ranked.map(p => [projectId(p), riskDeltaEngine(p, snapshots)])), [ranked, snapshots]);
  const tasks = useMemo(() => agentTasks(projects, ranked, trends), [projects, ranked, trends]);
  const backtest = useMemo(() => predictionStats(predictions, ranked), [predictions, ranked]);
  const scenarioResult = useMemo(() => scenarioAnalysis(winner, ranked[1], scenario), [winner, ranked, scenario]);
  const reportData = useMemo(() => buildReportData({ ranked, winner, kernels, consensus, debate, review, tasks, backtest, scenarioResult, weights }), [ranked, winner, kernels, consensus, debate, review, tasks, backtest, scenarioResult, weights]);
  const winnerQuality = dataQuality(winner);
  const caption = useMemo(() => makeCaption(winner, winnerIntel), [winner, winnerIntel]);
  const update = (i, key, value) => setProjects(ps => ps.map((p, idx) => idx === i ? { ...p, [key]: value } : p));
  const addProject = () => setProjects(ps => [...ps, { name: 'New Base Token', symbol: '', repo: '', chain: 'Base', contract: '', price: 0, marketCap: 100000, volume: 8000, liquidity: 30000, stars: 25, commits: 20, mentions: 15, risk: 50, pairUrl: '', pairAddress: '', dexId: '', pairCreatedAt: 0, website: '', docs: '', xLink: '', farcaster: '', socialKeyword: '', tagline: '', narrative: '' }]);
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

  return <main>
    <section className="hero">
      <div className="hero-copy">
        <div className="badge"><Radio size={16}/> Base-only AI Token Intelligence</div>
        <h1>AgentArena</h1>
        <p className="tagline">Score Base tokens with live DEX data, GitHub traction, security signals, and explainable agent consensus.</p>
        <div className="hero-actions"><a href="#arena" className="btn primary"><Swords size={18}/> Start Battle</a><a href="#report" className="btn"><TrendingUp size={18}/> View Report</a><button onClick={exportCard} className="btn"><Download size={18}/> Export Card</button><button onClick={saveBattle} className="btn"><Save size={18}/> Save Battle</button></div>
      </div>
      <div className="hero-dashboard" aria-label="AgentArena workflow summary">
        <div><small>Step 1</small><b>Import</b><span>Base contract or GitHub repo</span></div>
        <div><small>Step 2</small><b>Verify</b><span>Market, security, holders</span></div>
        <div><small>Step 3</small><b>Decide</b><span>Consensus score + export</span></div>
      </div>
    </section>


    <section className="bulk-panel panel">
      <div className="panel-head"><h2>Bulk Base Import</h2><div className="bulk-actions"><button onClick={bulkImport} disabled={bulkLoading}>{bulkLoading ? <Loader2 size={17} className="spin"/> : <Search size={17}/>} Import Battle</button><button onClick={scanAllMarket}><TrendingUp size={17}/> Cross-check Market</button><button onClick={scanAllSecurity}><LockKeyhole size={17}/> Scan Security</button><button onClick={scanAllHolders}><Coins size={17}/> Scan Holders</button><button onClick={scanAllDeployers}><ShieldAlert size={17}/> Scan Deployers</button><button onClick={scanAllWhaleFlow}><Coins size={17}/> Whale Flow</button><button onClick={scanAllFarcaster}><Sparkles size={17}/> Farcaster</button></div></div>
      <div className="holder-key-row"><input type="password" value={basescanKey} onChange={e=>setBasescanKey(e.target.value)} placeholder="Optional BaseScan API key for holder/flow scans"/><button onClick={saveBasescanKey}>Save BaseScan Key</button><button onClick={clearBasescanKey}>Clear</button></div><div className="holder-key-row"><input type="password" value={neynarKey} onChange={e=>setNeynarKey(e.target.value)} placeholder="Optional Neynar API key for Farcaster scans"/><button onClick={saveNeynarKey}>Save Neynar Key</button><button onClick={clearNeynarKey}>Clear</button></div>
      <textarea value={bulkText} onChange={e=>setBulkText(e.target.value)} placeholder="Paste Base contracts, one per line" />
      {bulkStatus && <p className={bulkStatus.includes('failed') || bulkStatus.startsWith('Paste') ? 'status' : 'status ok'}>{bulkStatus}</p>}
    </section>

    <section className="quick-nav" aria-label="Page sections"><a href="#arena">Setup</a><a href="#report">Report</a><a href="#quality">Reliability</a><a href="#tools">Tools</a><a href="#agents">Agents</a></section>

    <section className="grid" id="arena">
      <div className="panel controls">
        <div className="panel-head"><h2>Battle Setup</h2><button onClick={addProject}>+ Add</button></div>
        <label>Battle title<input value={battleTitle} onChange={e=>setBattleTitle(e.target.value)} /></label>
        {projects.map((p,i)=><div className="project-form" key={i}>
          <div className="import-row">
            <input value={p.contract} onChange={e=>update(i,'contract',e.target.value)} placeholder="Paste Base token contract" />
            <button onClick={()=>importBaseToken(i)} disabled={imports[i] === 'loading'}>{imports[i] === 'loading' ? <Loader2 size={17} className="spin"/> : <Search size={17}/>} Import</button><button onClick={()=>scanMarket(i)} disabled={marketStatus[i] === 'loading'}>{marketStatus[i] === 'loading' ? <Loader2 size={17} className="spin"/> : <TrendingUp size={17}/>} Market</button>
          </div>
          {imports[i] && imports[i] !== 'loading' && <p className={imports[i].startsWith('Imported') ? 'status ok' : 'status'}>{imports[i]}</p>}
          {marketStatus[i] && marketStatus[i] !== 'loading' && <p className={marketStatus[i].includes('complete') ? 'status ok' : 'status'}>{marketStatus[i]}</p>}
          <button className="security-button" onClick={()=>scanSecurity(i)} disabled={securityStatus[i] === 'loading'}>{securityStatus[i] === 'loading' ? <Loader2 size={16} className="spin"/> : <LockKeyhole size={16}/>} Security Scan</button>
          {securityStatus[i] && securityStatus[i] !== 'loading' && <p className={securityStatus[i].includes('complete') ? 'status ok' : 'status'}>{securityStatus[i]}</p>}
          <button className="security-button" onClick={()=>scanHolders(i)} disabled={holderStatus[i] === 'loading'}>{holderStatus[i] === 'loading' ? <Loader2 size={16} className="spin"/> : <Coins size={16}/>} Holder Scan</button>
          {holderStatus[i] && holderStatus[i] !== 'loading' && <p className={holderStatus[i].includes('complete') ? 'status ok' : 'status'}>{holderStatus[i]}</p>}
          <div className="import-row repo-row"><button onClick={()=>scanWhaleFlow(i)} disabled={whaleFlowStatus[i] === 'loading'}>{whaleFlowStatus[i] === 'loading' ? <Loader2 size={17} className="spin"/> : <Coins size={17}/>} Whale Flow</button><button onClick={()=>scanFarcaster(i)} disabled={farcasterStatus[i] === 'loading'}>{farcasterStatus[i] === 'loading' ? <Loader2 size={17} className="spin"/> : <Sparkles size={17}/>} Farcaster</button></div>
          {whaleFlowStatus[i] && whaleFlowStatus[i] !== 'loading' && <p className={whaleFlowStatus[i].includes('complete') ? 'status ok' : 'status'}>{whaleFlowStatus[i]}</p>}
          {farcasterStatus[i] && farcasterStatus[i] !== 'loading' && <p className={farcasterStatus[i].includes('complete') ? 'status ok' : 'status'}>{farcasterStatus[i]}</p>}
          <div className="import-row repo-row"><input value={p.deployerAddress || ''} onChange={e=>update(i,'deployerAddress',e.target.value)} placeholder="Optional deployer/owner address" /><button onClick={()=>scanDeployer(i)} disabled={deployerStatus[i] === 'loading'}>{deployerStatus[i] === 'loading' ? <Loader2 size={17} className="spin"/> : <ShieldAlert size={17}/>} Deployer</button></div>
          {deployerStatus[i] && deployerStatus[i] !== 'loading' && <p className={deployerStatus[i].includes('complete') ? 'status ok' : 'status'}>{deployerStatus[i]}</p>}
          <input value={p.name} onChange={e=>update(i,'name',e.target.value)} placeholder="Base token/project name" />
          <div className="import-row repo-row">
            <input value={p.repo} onChange={e=>update(i,'repo',e.target.value)} placeholder="GitHub repo or URL" />
            <button onClick={()=>importRepo(i)} disabled={repoImports[i] === 'loading'}>{repoImports[i] === 'loading' ? <Loader2 size={17} className="spin"/> : <Code2 size={17}/>} Repo</button>
          </div>
          {repoImports[i] && repoImports[i] !== 'loading' && <p className={repoImports[i].startsWith('Imported') ? 'status ok' : 'status'}>{repoImports[i]}</p>}
          <div className="market-strip">
            <span>{p.symbol || 'TOKEN'}</span><b>{money(p.price, 4)}</b><span>{money(p.marketCap)} cap</span>{p.repoUrl && <a href={p.repoUrl} target="_blank" rel="noreferrer">Repo <ExternalLink size={12}/></a>}{p.pairUrl && <a href={p.pairUrl} target="_blank" rel="noreferrer">Chart <ExternalLink size={12}/></a>}
          </div>
          <div className="mini-grid">
            <label>Stars<input type="number" value={p.stars} onChange={e=>update(i,'stars',+e.target.value)} /></label>
            <label>Commits<input type="number" value={p.commits} onChange={e=>update(i,'commits',+e.target.value)} /></label>
            <label>Forks<input type="number" value={p.forks || 0} onChange={e=>update(i,'forks',+e.target.value)} /></label>
            <label>Volume<input type="number" value={p.volume} onChange={e=>update(i,'volume',+e.target.value)} /></label>
            <label>Liquidity<input type="number" value={p.liquidity} onChange={e=>update(i,'liquidity',+e.target.value)} /></label>
            <label>Mentions<input type="number" value={p.mentions} onChange={e=>update(i,'mentions',+e.target.value)} /></label>
            <label>Issues<input type="number" value={p.openIssues || 0} onChange={e=>update(i,'openIssues',+e.target.value)} /></label>
            <label>Risk<input type="number" value={p.risk} onChange={e=>update(i,'risk',+e.target.value)} /></label>
          </div>
        </div>)}
      </div>

      <div className="panel card-panel">
        <div id="share-card" className="share-card">
          <div className="card-glow" />
          <div className="card-top"><span><Zap size={18}/> {battleTitle}</span><span>AgentArena · Base</span></div>
          <div className="battle-label">AI TOKEN BATTLE RESULT</div>
          <div className="winner"><Trophy size={42}/><div><small>AI Consensus Winner</small><h2>{winner.symbol ? `$${winner.symbol}` : winner.name}</h2><p>{winner.name} · {verdict(winner.scores.final)} · {Math.round(winner.scores.final)} / 100</p></div></div>
          <div className="winner-stats"><span>{money(winner.marketCap)} market cap</span><span>{money(winner.volume)} 24h volume</span><span>{money(winner.liquidity)} liquidity</span><span>{num(winner.priceChange24h).toFixed(1)}% 24h</span><span>{Math.round(winner.scores.confidence)}% confidence</span><span>{winnerQuality.completeness}% complete</span></div>
          <div className="risk-mini">{winnerIntel.flags.slice(0,3).map(flag=><span key={flag.label} className={flag.level}>{flag.label}</span>)}</div>
          <div className="score-radar">
            {['builder','market','meme','safety'].map(k=><div className="radar-item" key={k}><strong>{Math.round(winner.scores[k])}</strong><span>{k}</span></div>)}
          </div>
          <div className="score-bars compact">
            {['builder','market','meme','safety'].map(k=><div key={k}><span>{k}</span><b>{Math.round(winner.scores[k])}</b><div className="bar"><i style={{width:`${winner.scores[k]}%`}} /></div></div>)}
          </div>

          <div className="reason-stack">{['builder','market','meme','safety'].map(k=><div key={k}><b>{k}</b><span>{winner.scores.reasons[k]?.[0]?.text || 'No major note.'}</span></div>)}</div>
          {verdictData && <div className="card-verdict"><b>{verdictData.gap.toFixed(1)}pt gap</b><span>{verdictData.strongest} edge · {verdictData.upset} upset risk</span></div>}
          <div className="ranking card-ranking">{ranked.slice(0,4).map((p,i)=><div className="rank" key={`${p.name}-${i}`}><span>#{i+1} {p.symbol ? `$${p.symbol}` : p.name}</span><b>{Math.round(p.scores.adjustedFinal ?? p.scores.final)}</b></div>)}</div>
          <div className="card-cta"><span>Battle your Base token</span><b>agentarena.xyz</b></div>
        </div>
      </div>
    </section>










    <section className="token-report-panel panel" id="report">
      <div className="panel-head"><h2>Full Token Reports</h2><span className="base-chip">all contenders</span></div>
      <div className="token-report-grid">{ranked.map((p, rank) => { const report = tokenReport(p, rank); return <article className="token-report-card" key={`${p.name}-token-report`}>
        <div className="token-report-top"><div><small>#{report.rank}</small><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><span>{p.name}</span></div><b>{Math.round(p.scores.adjustedFinal ?? p.scores.final)}/100</b></div>
        <div className="token-report-meta"><span>Raw <b>{Math.round(p.scores.final)}</b></span><span>Reliability <b>{p.scores.reliabilityBadge || 'N/A'}</b></span><span>Confidence <b>{Math.round(p.scores.confidence)}%</b></span><span>Data <b>{report.quality.completeness}%</b></span></div>
        <p>{report.verdict}</p>
        {report.topRisk && <div className={`mini-risk ${report.topRisk.level}`}><b>{report.topRisk.label}</b><span>{report.topRisk.detail}</span></div>}
      </article> })}</div>
    </section>


    <section className="reliability-panel panel" id="quality">
      <div className="panel-head"><h2>Source Reliability + Adjusted Scoring</h2><span className="base-chip">verified score guard</span></div>
      <div className="source-grid">{ranked.map((p) => { const rel = sourceReliability(p); const adj = adjustedScore(p); return <article className="source-card" key={`${p.name}-reliability`}>
        <div className="source-title"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{rel.badge}</small></div><b>{Math.round(adj.adjustedFinal)}/100</b></div>
        <div className="risk-metrics"><span>Raw <b>{Math.round(adj.rawFinal)}</b></span><span>Haircut <b>-{adj.haircut.toFixed(1)}</b></span><span>Reliability <b>{rel.score}%</b></span><span>Critical missing <b>{rel.criticalMissing}</b></span></div>
        <div className="risk-flags">{rel.flags.map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
        <div className="source-list">{rel.sources.slice(0,8).map(src => <div className={`source-row ${src.confidence.toLowerCase()}`} key={src.id}><span>{src.category}</span><b>{src.status}</b><small>{src.reliability}%</small><em>{src.detail}</em></div>)}</div>
      </article> })}</div>
    </section>

    <section className="freshness-panel panel">
      <div className="panel-head"><h2>GitHub Freshness v2</h2><span className="base-chip">builder activity</span></div>
      <div className="freshness-grid">{ranked.map((p) => { const f = githubFreshness(p); return <article className="fresh-card" key={`${p.name}-fresh`}>
        <div className="fresh-head"><div><h3>{p.name}</h3><small>{p.repo || 'No repo'}</small></div><span className={f.level}>{f.badge}</span></div>
        <div className="risk-metrics">
          <span>Last push <b>{f.pushedDays !== null ? `${Math.round(f.pushedDays)}d` : 'N/A'}</b></span>
          <span>Repo age <b>{f.createdDays !== null ? `${Math.round(f.createdDays)}d` : 'N/A'}</b></span>
          <span>Fork ratio <b>{f.forkRatio ? `${(f.forkRatio*100).toFixed(1)}%` : 'N/A'}</b></span>
          <span>Issue load <b>{f.issueLoad ? `${(f.issueLoad*100).toFixed(1)}%` : 'N/A'}</b></span>
        </div>
        <div className="risk-flags">{f.flags.map(flag=><div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>







    <section className="sim-panel panel" id="tools">
      <div className="panel-head"><h2>Strategy Simulator</h2><button onClick={resetScenario}>Reset Scenario</button></div>
      <div className="sim-grid">
        <label>Volume x<b>{scenario.volumeMultiplier}x</b><input type="range" min="0.1" max="4" step="0.1" value={scenario.volumeMultiplier} onChange={e=>updateScenario('volumeMultiplier', Number(e.target.value))}/></label>
        <label>Liquidity x<b>{scenario.liquidityMultiplier}x</b><input type="range" min="0.1" max="4" step="0.1" value={scenario.liquidityMultiplier} onChange={e=>updateScenario('liquidityMultiplier', Number(e.target.value))}/></label>
        <label>Mentions x<b>{scenario.mentionsMultiplier}x</b><input type="range" min="0.1" max="5" step="0.1" value={scenario.mentionsMultiplier} onChange={e=>updateScenario('mentionsMultiplier', Number(e.target.value))}/></label>
        <label>24h move delta<b>{scenario.priceMoveDelta}%</b><input type="range" min="-80" max="120" step="5" value={scenario.priceMoveDelta} onChange={e=>updateScenario('priceMoveDelta', Number(e.target.value))}/></label>
        <label>Risk delta<b>{scenario.riskDelta}</b><input type="range" min="-50" max="50" step="5" value={scenario.riskDelta} onChange={e=>updateScenario('riskDelta', Number(e.target.value))}/></label>
        <label>LP status<select value={scenario.lpStatus} onChange={e=>updateScenario('lpStatus', e.target.value)}><option value="same">same</option><option value="locked">locked</option><option value="burned">burned</option><option value="unlocked">unlocked</option><option value="unknown">unknown</option></select></label>
        <label className="sim-check"><input type="checkbox" checked={scenario.socialBoost} onChange={e=>updateScenario('socialBoost', e.target.checked)}/> Social boost</label>
      </div>
      <div className="sim-result">
        <article><small>Current</small><h3>{consensus.label}</h3><b>{Math.round(winner.scores.final)}/100</b></article>
        <article><small>Simulated</small><h3>{scenarioResult.simulatedConsensus.label}</h3><b>{Math.round(scenarioResult.simulated.scores.final)}/100</b></article>
        <article><small>Delta</small><h3>{scenarioResult.simulated.scores.final - winner.scores.final >= 0 ? '+' : ''}{Math.round(scenarioResult.simulated.scores.final - winner.scores.final)}</h3><b>{scenarioResult.changes.length} agent changes</b></article>
      </div>
      <div className="scenario-changes">{scenarioResult.changes.length ? scenarioResult.changes.map(c => <div key={c.agent}><b>{c.agent}</b><span>{c.from} → {c.to}</span><em>{c.scoreDelta >= 0 ? '+' : ''}{c.scoreDelta.toFixed(1)} score</em></div>) : <p>No major agent vote/score changes under this scenario.</p>}</div>
    </section>

    <section className="weights-panel panel">
      <div className="panel-head"><h2>Agent Weights Studio</h2><span className="base-chip">{weights.preset}</span></div>
      <div className="preset-row">{Object.keys(WEIGHT_PRESETS).map(name => <button key={name} onClick={()=>applyPreset(name)} className={weights.preset===name?'active':''}>{name}</button>)}<button onClick={resetWeights}>Reset</button></div>
      <div className="weights-grid">
        <article><h3>Score Weights</h3>{Object.entries(weights.score).map(([k,v]) => <label key={k}>{k}<input type="range" min="0" max="60" value={v} onChange={e=>updateScoreWeight(k,e.target.value)} /><b>{v}%</b></label>)}</article>
        <article><h3>Agent Vote Weights</h3>{Object.entries(weights.agents).map(([k,v]) => <label key={k}>{k.replace(' Agent','')}<input type="range" min="0.5" max="2" step="0.05" value={v} onChange={e=>updateAgentWeight(k,e.target.value)} /><b>{v}x</b></label>)}</article>
        <article><h3>Risk Veto</h3><label>Risk confidence threshold<input type="range" min="50" max="95" value={weights.riskVeto} onChange={e=>updateRiskVeto(e.target.value)} /><b>{weights.riskVeto}%</b></label><p>When Risk Agent is Bearish above this confidence, consensus marks risk veto active.</p></article>
      </div>
    </section>

    <section className="backtest-panel panel">
      <div className="panel-head"><h2>Agent Backtesting</h2><div className="history-actions"><button onClick={savePredictions}><Save size={16}/> Save Predictions</button><button onClick={clearPredictions}><Trash2 size={16}/> Clear</button></div></div>
      {predictionStatus && <p className="status ok">{predictionStatus}</p>}
      <div className="accuracy-grid">{Object.entries(backtest.stats).map(([agent, stat]) => <article className="accuracy-card" key={agent}>
        <h3>{agent}</h3><b>{stat.total ? `${stat.accuracy}%` : 'N/A'}</b><span>{stat.hits}/{stat.total} hits</span>
      </article>)}</div>
      <div className="prediction-list">{backtest.resolved.slice(-8).reverse().map(item => <div className={`prediction-row ${item.result.outcome.toLowerCase()}`} key={item.id}>
        <span>{item.symbol ? `$${item.symbol}` : item.name}</span><b>{item.consensus}</b><em>{item.result.outcome} · score {item.result.scoreDelta >= 0 ? '+' : ''}{item.result.scoreDelta.toFixed(1)} · price {item.result.pricePct===null?'N/A':`${item.result.pricePct.toFixed(1)}%`}</em>
      </div>)}</div>
    </section>

    <section className="memory-panel panel">
      <div className="panel-head"><h2>Snapshot Compare v2 / Risk Delta Engine</h2><div className="history-actions"><button onClick={saveSnapshots}><Save size={16}/> Save Snapshot</button><button onClick={clearSnapshots}><Trash2 size={16}/> Clear Memory</button></div></div>
      {memoryStatus && <p className="status ok">{memoryStatus}</p>}
      <div className="memory-grid">{ranked.map((p) => { const t = trends[projectId(p)]; return <article className="memory-card" key={`${p.name}-memory`}>
        <div className="memory-head"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{t.history.length} saved snapshots</small></div><span className={t.level}>{t.status}</span></div>
        <p>{t.summary}</p>
        {t.deltas && <div className="risk-metrics"><span>Score <b>{t.deltas.score >= 0 ? '+' : ''}{t.deltas.score}</b></span><span>Liquidity <b>{t.deltas.liquidityPct===null?'N/A':`${t.deltas.liquidityPct.toFixed(1)}%`}</b></span><span>Risk <b>{t.deltas.risk >= 0 ? '+' : ''}{t.deltas.risk}</b></span><span>Top10 <b>{t.deltas.top10Pct >= 0 ? '+' : ''}{t.deltas.top10Pct.toFixed(1)}%</b></span><span>Owner out <b>{t.deltas.ownerOutPct >= 0 ? '+' : ''}{t.deltas.ownerOutPct.toFixed(1)}%</b></span><span>Whale <b>{t.current.whaleDirection}</b></span></div>}
        <div className="risk-flags">{(t.alerts || []).slice(0,4).map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>





    <section className="export-panel panel">
      <div className="panel-head"><h2>Agent Report Export Pack</h2><span className="base-chip">markdown + json</span></div>
      <div className="export-box">
        <div><h3>{winner.symbol ? `$${winner.symbol}` : winner.name} Battle Report</h3><p>Export the full agent analysis with ranking, evidence, source coverage, self-review, debate loop, tasks, backtesting stats, and strategy simulation.</p></div>
        <div className="export-actions"><button onClick={copyMarkdownReport}><Copy size={16}/> Copy Markdown</button><button onClick={downloadMarkdownReport}><Download size={16}/> Download MD</button><button onClick={downloadJsonReport}><Download size={16}/> Download JSON</button></div>
      </div>
      {reportStatus && <p className="status ok">{reportStatus}</p>}
    </section>

    <section className="task-panel panel">
      <div className="panel-head"><h2>Agent Task Planner</h2><span className="base-chip">next best checks</span></div>
      <div className="task-list">{tasks.map(task => <article className={`task-card ${task.priority.toLowerCase()}`} key={task.id}>
        <div><small>{task.agent} · {task.priority}</small><h3>{task.title}</h3><p>{task.reason}</p></div>
        {task.action === 'security' && <button onClick={()=>scanSecurity(task.index)}><LockKeyhole size={16}/> Security</button>}
        {task.action === 'holders' && <button onClick={()=>scanHolders(task.index)}><Coins size={16}/> Holders</button>}
        {task.action === 'deployer' && <button onClick={()=>scanDeployer(task.index)}><ShieldAlert size={16}/> Deployer</button>}
        {task.action === 'farcaster' && <button onClick={()=>scanFarcaster(task.index)}><Sparkles size={16}/> Farcaster</button>}
        {task.action === 'whale-flow' && <button onClick={()=>scanWhaleFlow(task.index)}><Coins size={16}/> Whale Flow</button>}
        {task.action === 'caption' && <button onClick={copyCaption}><Copy size={16}/> Caption</button>}
        {task.action === 'snapshot' && <button onClick={saveSnapshots}><Save size={16}/> Snapshot</button>}
        {task.action === 'prediction' && <button onClick={savePredictions}><Save size={16}/> Prediction</button>}
      </article>)}</div>
    </section>




    <section className="market-panel panel">
      <div className="panel-head"><h2>Market Data Cross-check</h2><span className="base-chip">DexScreener + GeckoTerminal</span></div>
      <div className="source-grid">{ranked.map((p) => { const mc = marketCrossCheck(p); return <article className="source-card" key={`${p.name}-market-check`}>
        <div className="source-title"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{mc.available ? `${mc.confidence} confidence` : 'Not checked'}</small></div><b>{Math.round(mc.score)}/100</b></div>
        <div className="risk-metrics"><span>Dex Vol <b>{money(p.volume)}</b></span><span>Gecko Vol <b>{p.gecko ? money(p.gecko.volume) : 'N/A'}</b></span><span>Dex Liq <b>{money(p.liquidity)}</b></span><span>Gecko Liq <b>{p.gecko ? money(p.gecko.liquidity) : 'N/A'}</b></span></div>
        <div className="risk-flags">{mc.flags.map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>



    <section className="wallet-label-panel panel">
      <div className="panel-head"><h2>Wallet Label Intelligence</h2><span className="base-chip">owner · deployer · whale · router-like</span></div>
      <div className="source-grid">{ranked.map((p) => { const wl = walletLabelIntel(p); return <article className="source-card" key={`${p.name}-wallet-labels`}>
        <div className="source-title"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{wl.available ? `${wl.confidence} confidence` : 'Not labeled'}</small></div><b>{Math.round(wl.score)}/100</b></div>
        <div className="risk-metrics"><span>Labels <b>{wl.count}</b></span><span>Risk wallets <b>{wl.riskCount}</b></span><span>Top receiver <b>{p.transferFlow?.topNetWallet ? shortAddr(p.transferFlow.topNetWallet) : 'N/A'}</b></span><span>Owner <b>{wl.labels?.some(x => x.labels.includes('Owner')) ? 'Yes' : 'No'}</b></span></div>
        <div className="source-list">{(wl.labels || []).slice(0,8).map(item => <div className={`source-row ${item.level}`} key={item.address}><span>{shortAddr(item.address)}</span><b>{item.summary}</b><small>{item.level}</small><em>{item.details?.[0] || 'Wallet context'}</em></div>)}</div>
        <div className="risk-flags">{wl.flags.map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="social-api-panel panel">
      <div className="panel-head"><h2>Real Farcaster Social API</h2><span className="base-chip">Neynar optional</span></div>
      <div className="source-grid">{ranked.map((p) => { const fc = farcasterIntel(p); return <article className="source-card" key={`${p.name}-farcaster`}>
        <div className="source-title"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{fc.available ? `${fc.confidence} confidence` : 'Not scanned'}</small></div><b>{Math.round(fc.score)}/100</b></div>
        <div className="risk-metrics"><span>Casts <b>{fc.scan ? fc.scan.castCount : 'N/A'}</b></span><span>Authors <b>{fc.scan ? fc.scan.uniqueAuthors : 'N/A'}</b></span><span>Sentiment <b>{fc.scan ? fc.scan.sentiment : 'N/A'}</b></span><span>Spam <b>{fc.scan ? Math.round(fc.scan.spamScore) : 'N/A'}</b></span></div>
        <div className="risk-flags">{fc.flags.map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="whale-flow-panel panel">
      <div className="panel-head"><h2>Token Transfer Flow v2 / Whale Flow</h2><span className="base-chip">accumulation · distribution · burst</span></div>
      <div className="source-grid">{ranked.map((p) => { const wf = whaleFlowIntel(p); return <article className="source-card" key={`${p.name}-whale-flow`}>
        <div className="source-title"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{wf.available ? `${wf.confidence} confidence` : 'Not scanned'}</small></div><b>{Math.round(wf.score)}/100</b></div>
        <div className="risk-metrics"><span>Direction <b>{wf.available ? wf.direction : 'N/A'}</b></span><span>Transfers <b>{wf.flow ? wf.flow.transferCount : 'N/A'}</b></span><span>Wallets <b>{wf.flow ? wf.flow.uniqueWallets : 'N/A'}</b></span><span>Large <b>{wf.flow ? wf.flow.largeTransferCount : 'N/A'}</b></span><span>Accumulation <b>{wf.available ? `${wf.accumulationPct.toFixed(1)}%` : 'N/A'}</b></span><span>Distribution <b>{wf.available ? `${wf.distributionPct.toFixed(1)}%` : 'N/A'}</b></span><span>Owner out <b>{wf.available ? `${wf.ownerOutPct.toFixed(1)}%` : 'N/A'}</b></span><span>Burst <b>{wf.available ? Math.round(wf.burstScore) : 'N/A'}</b></span></div>
        <div className="risk-flags">{wf.flags.map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="source-panel panel">
      <div className="panel-head"><h2>Agent Source Plugins</h2><span className="base-chip">pluggable data layer</span></div>
      <div className="source-grid">{ranked.map((p) => { const sp = sourcePlugins(p); return <article className="source-card" key={`${p.name}-sources`}>
        <div className="source-title"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{sp.coverage}% source coverage</small></div><b>{sp.plugins.filter(x=>x.status!=='missing').length}/{sp.plugins.length}</b></div>
        <div className="source-list">{sp.plugins.map(plugin => <div className={`source-row ${plugin.confidence.toLowerCase()}`} key={plugin.id}>
          <span>{plugin.name}</span><b>{plugin.status}</b><small>{plugin.confidence}</small><em>{plugin.detail}</em>
        </div>)}</div>
      </article> })}</div>
    </section>

    <section className="review-panel panel">
      <div className="panel-head"><h2>Self-Review Guard</h2><span className={`base-chip ${review.label.toLowerCase().replace(/\s+/g,'-')}`}>{review.label}</span></div>
      <div className="review-summary"><h3>{review.summary}</h3><p>Checks whether bullish claims, security claims, holder claims, and LLM wording are backed by available evidence.</p></div>
      <div className="review-grid">
        <article><h3>Warnings</h3>{review.warnings.length ? review.warnings.map(w => <div className={`flag ${w.level}`} key={w.label}><b>{w.label}</b><span>{w.detail}</span></div>) : <div className="flag good"><b>No major warning</b><span>Verdict is aligned with current evidence.</span></div>}</article>
        <article><h3>Unsupported Areas</h3>{review.unsupported.length ? review.unsupported.map(u => <div className="flag warn" key={u.label}><b>{u.label}</b><span>{u.detail}</span></div>) : <div className="flag good"><b>Core claims supported</b><span>No major unsupported area detected.</span></div>}</article>
      </div>
    </section>

    <section className="evidence-panel panel">
      <div className="panel-head"><h2>Evidence Graph + Contradiction Detector</h2><span className="base-chip">claim → source → conflict</span></div>
      <div className="evidence-grid">{ranked.map((p) => { const graph = evidenceGraph(p); const conflicts = contradictionDetector(p); return <article className="evidence-card" key={`${p.name}-evidence`}>
        <div className="evidence-title"><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{conflicts.label} · {graph.coverage}% evidence confidence</small></div>
        <div className="risk-metrics">{graph.groups.slice(0,6).map(g => <span key={g.category}>{g.category} <b>{g.level}</b></span>)}</div>
        <div className="risk-flags">{conflicts.items.slice(0,4).map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
        <div className="evidence-list">{evidenceTrail(p).slice(0,10).map((item)=><div className={`evidence-row ${item.level}`} key={`${item.claim}-${item.source}`}>
          <span>{item.claim}</span><b>{item.value}</b><small>{item.source}</small>
        </div>)}</div>
      </article> })}</div>
    </section>

    <section className="debate-panel panel">
      <div className="panel-head"><h2>Agent Debate Loop v2</h2><span className="base-chip">argue → object → revise</span></div>
      <div className="debate-timeline">{debate.map((d, i)=><article className="debate-card" key={`${d.round}-${i}`}>
        <div className="debate-index">{i+1}</div>
        <div><div className="debate-head"><small>{d.round}</small><span className={String(d.stance).toLowerCase().replace(/\s+/g,'-')}>{d.stance}</span></div><h3>{d.agent}</h3><p>{d.text}</p></div>
      </article>)}</div>
    </section>

    <section className="kernel-panel panel">
      <div className="panel-head"><h2>Agent Kernel v2</h2><span className="base-chip">weighted consensus</span></div>
      <div className="consensus-box">
        <div><small>Consensus</small><h3>{consensus.label}</h3><p>{kernelSummaryText(kernels, consensus)}</p></div>
        <div className="vote-bars">{Object.entries(consensus.totals).map(([k,v])=><span key={k}><b>{k}</b><i style={{width:`${Math.min(100,v*45)}%`}} /></span>)}</div>
      </div>
      <div className="kernel-grid">{kernels.map(k=><article className="kernel-card" key={k.name}>
        <div className="kernel-head"><h3>{k.name}</h3><span className={k.vote.toLowerCase()}>{k.vote}</span></div>
        <div className="token-report-meta"><span>Score <b>{Math.round(k.score)}</b></span><span>Confidence <b>{Math.round(k.confidence)}%</b></span><span>Weight <b>{k.weight}x</b></span></div>
        <div className="kernel-lists"><div><b>Bullish</b>{k.bullish.slice(0,3).map(x=><p key={x}>+ {x}</p>)}</div><div><b>Bearish</b>{k.bearish.slice(0,3).map(x=><p key={x}>- {x}</p>)}</div></div>
        <em>{k.changeMind}</em>
        {agentLlmReports[k.name] && <pre>{agentLlmReports[k.name]}</pre>}
      </article>)}</div>
      <button className="multi-agent-button" onClick={generateMultiAgentLlm} disabled={agentLlmLoading}>{agentLlmLoading ? <Loader2 size={16} className="spin"/> : <Brain size={16}/>} Run Multi-agent LLM Calls</button>
      {agentLlmStatus && <p className={agentLlmStatus.includes('failed') || agentLlmStatus.includes('first') ? 'status' : 'status ok'}>{agentLlmStatus}</p>}
      {llmConsensus && <div className="llm-consensus"><h3>LLM Consensus Agent</h3><pre>{llmConsensus}</pre></div>}
    </section>

    <section className="llm-panel panel">
      <div className="panel-head"><h2>LLM Agent Mode</h2><span className="base-chip">bring your own key</span></div>
      <div className="llm-settings">
        <label>OpenAI API key<input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder="sk-..." /></label>
        <label>Model<input value={llmModel} onChange={e=>setLlmModel(e.target.value)} placeholder="gpt-4o-mini" /></label>
        <div className="llm-actions"><button onClick={saveApiKey}><KeyRound size={16}/> Save Key</button><button onClick={clearApiKey}>Clear</button><button onClick={generateLlmReport} disabled={llmLoading}>{llmLoading ? <Loader2 size={16} className="spin"/> : <Brain size={16}/>} Generate Agent Report</button></div>
      </div>
      {llmStatus && <p className={llmStatus.includes('failed') || llmStatus.includes('first') || llmStatus.includes('failed') ? 'status' : 'status ok'}>{llmStatus}</p>}
      {llmReport && <div className="llm-output"><pre>{llmReport}</pre></div>}
    </section>

    <section className="report-panel panel">
      <div className="panel-head"><h2>Agent Report v2</h2><span className="base-chip">winner analysis</span></div>
      <div className="report-grid">{reports.map(report => <article className="report-card" key={report.name}>
        <div className="report-head"><h3>{report.name}</h3><b>{report.verdict}</b></div>
        <p>{report.text}</p>
      </article>)}</div>
    </section>

    <section className="compare-panel panel">
      <div className="panel-head"><h2>Compare Matrix</h2><span className="base-chip">score breakdown</span></div>
      <div className="compare-table-wrap"><table className="compare-table">
        <thead><tr><th>Project</th><th>Final</th><th>Builder</th><th>Market</th><th>Meme</th><th>Safety</th><th>Confidence</th><th>Data</th><th>Risk</th><th>Weakest</th></tr></thead>
        <tbody>{ranked.map((p,i) => { const q = dataQuality(p); const weak = topWeakScore(p.scores); return <tr key={`${p.name}-compare`} className={i===0?'winner-row':i===1?'runner-row':''}>
          <td><b>{i===0?'🏆 ':i===1?'⚔️ ':''}{p.symbol ? `$${p.symbol}` : p.name}</b><small>{p.name}</small></td>
          <td><span className={`score-pill ${scoreClass(p.scores.final)}`}>{Math.round(p.scores.final)}</span></td>
          <td><span className={`score-pill ${scoreClass(p.scores.builder)}`}>{Math.round(p.scores.builder)}</span></td>
          <td><span className={`score-pill ${scoreClass(p.scores.market)}`}>{Math.round(p.scores.market)}</span></td>
          <td><span className={`score-pill ${scoreClass(p.scores.meme)}`}>{Math.round(p.scores.meme)}</span></td>
          <td><span className={`score-pill ${scoreClass(p.scores.safety)}`}>{Math.round(p.scores.safety)}</span></td>
          <td><span className={`score-pill ${scoreClass(p.scores.confidence)}`}>{Math.round(p.scores.confidence)}%</span></td>
          <td><span className={`data-dot ${q.completeness>=80?'good':q.completeness>=55?'warn':'danger'}`}>{q.completeness}%</span></td>
          <td><span className={`data-dot ${p.risk<=35?'good':p.risk<=60?'warn':'danger'}`}>{p.risk}</span></td>
          <td><span className="weak-chip">{weak}</span></td>
        </tr> })}</tbody>
      </table></div>
    </section>

    <section className="quality-panel panel">
      <div className="panel-head"><h2>Data Quality Layer</h2><span className="base-chip">source transparency</span></div>
      <div className="quality-grid">{ranked.map((p) => { const q = dataQuality(p); return <article className="quality-card" key={`${p.name}-quality`}>
        <div className="quality-head"><div><h3>{p.name}</h3><small>{q.completeness}% complete · {Math.round(p.scores.confidence)}% confidence</small></div><div className="quality-ring" style={{'--q': `${q.completeness}%`}}>{q.completeness}</div></div>
        <div className="data-badges">{q.badges.map(b=><span className={b.level} key={b.label}>{b.label}</span>)}</div>
        <div className="missing-list">{q.missing.length ? q.missing.slice(0,4).map(m=><p key={m.label}><b>{m.label}</b> {m.note}</p>) : <p><b>Ready</b> Core data sources are present.</p>}</div>
      </article> })}</div>
    </section>

    <section className="verdict-panel panel">
      <div className="panel-head"><h2>Battle Verdict</h2><span className="base-chip">v2 comparison</span></div>
      {verdictData ? <div className="verdict-grid">
        <div className="verdict-main">
          <small>Why winner won</small>
          <h3>{verdictData.winner.symbol ? `$${verdictData.winner.symbol}` : verdictData.winner.name} beats {verdictData.runner.symbol ? `$${verdictData.runner.symbol}` : verdictData.runner.name}</h3>
          <p>{verdictData.reason}</p>
        </div>
        <div className="verdict-stat"><span>Score gap</span><b>{verdictData.gap.toFixed(1)}</b></div>
        <div className="verdict-stat"><span>Strongest edge</span><b>{verdictData.strongest}</b></div>
        <div className="verdict-stat"><span>Weakest area</span><b>{verdictData.weakest}</b></div>
        <div className="verdict-stat"><span>Runner-up threat</span><b>{verdictData.runnerThreat}</b></div>
        <div className={`verdict-stat ${verdictData.upset.toLowerCase()}`}><span>Upset potential</span><b>{verdictData.upset}</b></div>
        <div className={`verdict-stat ${verdictData.confidenceLabel.toLowerCase()}`}><span>Data confidence</span><b>{verdictData.confidenceLabel} · {verdictData.confidence}%</b></div>
      </div> : <p className="empty-history">Add at least two projects to generate a verdict.</p>}
    </section>

    <section className="history-panel panel">
      <div className="panel-head"><h2>Saved Battles</h2><div className="history-actions"><button onClick={newBattle}><RotateCcw size={16}/> New</button><button onClick={saveBattle}><Save size={16}/> Save</button><button onClick={clearBattles}><Trash2 size={16}/> Clear</button></div></div>
      {saveStatus && <p className="status ok">{saveStatus}</p>}
      <div className="history-list">{savedBattles.length ? savedBattles.map(item => <button className="history-item" key={item.id} onClick={()=>loadBattle(item)}>
        <span><b>{item.title}</b><small>{new Date(item.savedAt).toLocaleString()}</small></span>
        <span><strong>{item.winnerSymbol ? `$${item.winnerSymbol}` : item.winner}</strong><em>{item.score}/100</em></span>
      </button>) : <p className="empty-history">No saved battles yet. Build a battle, then hit Save.</p>}</div>
    </section>

    <section className="caption-panel panel">
      <div className="panel-head"><h2>Viral Caption</h2><button onClick={copyCaption}>{copied ? <Check size={17}/> : <Copy size={17}/>} {copied ? 'Copied' : 'Copy'}</button></div>
      <pre>{caption}</pre>
    </section>




    <section className="social-panel panel">
      <div className="panel-head"><h2>Social/Narrative Intelligence</h2><span className="base-chip">meme signal</span></div>
      <div className="security-grid">{ranked.map((p) => { const social = socialIntel(p); return <article className="security-card" key={`${p.name}-social`}>
        <div className="security-head"><div><h3>{p.name}</h3><small>{p.socialKeyword || p.tagline || 'No keyword'}</small></div><b>{Math.round(social.score)}/100</b></div>
        <div className="risk-metrics"><span>Website <b>{p.website ? 'Yes' : 'No'}</b></span><span>Docs <b>{p.docs ? 'Yes' : 'No'}</b></span><span>X/Farcaster <b>{p.xLink || p.farcaster ? 'Yes' : 'No'}</b></span><span>Mentions <b>{p.mentions}</b></span><span>Scan <b>{social.scan.count}</b></span><span>Tone <b>{social.scan.sentiment}</b></span></div>
        <div className="risk-flags">{social.flags.map(flag=><div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="holder-panel panel">
      <div className="panel-head"><h2>Holder Intelligence</h2><span className="base-chip">BaseScan optional</span></div>
      <div className="security-grid">{ranked.map((p) => { const h = holderIntel(p); return <article className="security-card" key={`${p.name}-holders`}>
        <div className="security-head"><div><h3>{p.name}</h3><small>{p.contract ? shortAddr(p.contract) : 'No contract'}</small></div><b>{h.available ? `${h.top10Pct.toFixed(1)}% top10` : 'Not scanned'}</b></div>
        <div className="risk-metrics"><span>Tier <b>{h.available ? h.distribution.tier : 'N/A'}</b></span><span>Top 1 <b>{h.available ? `${h.top1Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Top 5 <b>{h.available ? `${h.top5Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Top 10 <b>{h.available ? `${h.top10Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Top 20 <b>{h.available ? `${h.top20Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Holders <b>{h.holderCount || 'N/A'}</b></span><span>Score <b>{h.available ? Math.round(h.distribution.score) : 'N/A'}</b></span></div>
        <div className="risk-flags">{h.flags.map(flag=><div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>




    <section className="holder-distribution-panel panel">
      <div className="panel-head"><h2>Holder Distribution Risk Engine</h2><span className="base-chip">top1 · top5 · top10 · top20</span></div>
      <div className="source-grid">{ranked.map((p) => { const dist = holderDistribution(p); return <article className="source-card" key={`${p.name}-holder-distribution`}>
        <div className="source-title"><div><h3>{p.symbol ? `$${p.symbol}` : p.name}</h3><small>{dist.available ? dist.tier : 'Not scanned'}</small></div><b>{Math.round(dist.score)}/100</b></div>
        <div className="risk-metrics"><span>Top 1 <b>{dist.available ? `${dist.top1Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Top 5 <b>{dist.available ? `${dist.top5Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Top 10 <b>{dist.available ? `${dist.top10Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Top 20 <b>{dist.available ? `${dist.top20Pct.toFixed(1)}%` : 'N/A'}</b></span><span>Holders <b>{dist.holderCount || 'N/A'}</b></span></div>
        <div className="risk-flags">{dist.flags.map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="deployer-panel panel">
      <div className="panel-head"><h2>Deployer / Owner Intelligence</h2><span className="base-chip">BaseScan tx history + GoPlus owner</span></div>
      <div className="security-grid">{ranked.map((p) => { const dep = deployerIntel(p); return <article className="security-card" key={`${p.name}-deployer`}>
        <div className="security-head"><div><h3>{p.name}</h3><small>{dep.deployer ? `Deployer ${shortAddr(dep.deployer)}` : dep.owner ? `Owner ${shortAddr(dep.owner)}` : 'Wallet unknown'}</small></div><b>{Math.round(dep.score)}/100</b></div>
        <div className="risk-metrics"><span>Owner <b>{dep.owner ? shortAddr(dep.owner) : 'N/A'}</b></span><span>Deployer <b>{dep.deployer ? shortAddr(dep.deployer) : 'N/A'}</b></span><span>Txs <b>{dep.scan ? dep.scan.txCount : 'N/A'}</b></span><span>Creates <b>{dep.scan ? dep.scan.contractCreations : 'N/A'}</b></span><span>7d tx <b>{dep.scan ? dep.scan.recentTx : 'N/A'}</b></span><span>Sent ETH <b>{dep.scan ? dep.scan.outboundEth.toFixed(3) : 'N/A'}</b></span></div>
        <div className="risk-flags">{dep.flags.map(flag => <div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="lp-panel panel">
      <div className="panel-head"><h2>LP Lock + Deployer Risk</h2><span className="base-chip">manual proof + owner signals</span></div>
      <div className="security-grid">{ranked.map((p) => { const lp = lpDeployerIntel(p); return <article className="security-card" key={`${p.name}-lp`}>
        <div className="security-head"><div><h3>{p.name}</h3><small>{lp.pairAddress ? `Pair ${shortAddr(lp.pairAddress)}` : (p.lpStatus || 'LP unknown')}</small></div><b>{Math.round(lp.score)}/100</b></div>
        <div className="risk-metrics"><span>LP <b>{p.lpStatus || 'unknown'}</b></span><span>Auto confidence <b>{Math.round(lp.confidence)}%</b></span><span>Pair <b>{lp.pairAddress ? shortAddr(lp.pairAddress) : 'N/A'}</b></span><span>Liquidity <b>{money(lp.liquidity)}</b></span><span>Proof <b>{p.lpProof ? 'Yes' : 'No'}</b></span><span>Deployer <b>{p.deployerAddress ? shortAddr(p.deployerAddress) : 'N/A'}</b></span></div>
        <div className="risk-flags">{lp.flags.map(flag=><div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="security-panel panel">
      <div className="panel-head"><h2>Contract Security Layer</h2><span className="base-chip">GoPlus Base scan</span></div>
      <div className="security-grid">{ranked.map((p) => { const sec = securityIntel(p); return <article className="security-card" key={`${p.name}-security`}>
        <div className="security-head"><div><h3>{p.name}</h3><small>{p.contract ? shortAddr(p.contract) : 'No contract'}</small></div><b>{sec.available ? `${Math.round(sec.score)}/100` : 'Not scanned'}</b></div>
        <div className="risk-metrics"><span>Buy tax <b>{sec.available ? `${sec.buyTax.toFixed(1)}%` : 'N/A'}</b></span><span>Sell tax <b>{sec.available ? `${sec.sellTax.toFixed(1)}%` : 'N/A'}</b></span><span>Risk <b>{p.risk}/100</b></span><span>Flags <b>{sec.flags.length}</b></span></div>
        <div className="risk-flags">{sec.flags.map(flag=><div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="risk-panel panel">
      <div className="panel-head"><h2>Risk Intel Panel</h2><span className="base-chip">Base live data</span></div>
      <div className="risk-grid">{ranked.map((p) => { const intel = getRiskIntel(p); return <article className="risk-card" key={`${p.name}-risk`}>
        <div className="risk-head"><div><h3>{p.name}</h3><small>{p.contract ? shortAddr(p.contract) : 'No contract imported'}</small></div><b>{p.risk}/100 risk</b></div>
        <div className="risk-metrics">
          <span>Vol/Liq <b>{intel.volToLiq ? `${intel.volToLiq.toFixed(2)}x` : 'N/A'}</b></span>
          <span>FDV/Liq <b>{intel.fdvToLiq ? `${intel.fdvToLiq.toFixed(1)}x` : 'N/A'}</b></span>
          <span>24h Move <b>{intel.priceChange.toFixed(1)}%</b></span>
          <span>Buys/Sells <b>{intel.txns ? `${intel.buys}/${intel.sells}` : 'N/A'}</b></span>
        </div>
        <div className="risk-flags">{intel.flags.map(flag=><div className={`flag ${flag.level}`} key={flag.label}><b>{flag.label}</b><span>{flag.detail}</span></div>)}</div>
      </article> })}</div>
    </section>

    <section className="agents" id="agents">
      <h2>AI Debate Room</h2>
      <div className="agent-grid">{agents.map(A => { const Icon=agentIcons[A.icon] || Bot; return <article className="agent" key={A.name} style={{'--c':A.color}}><Icon/><h3>{A.name}</h3><p>{A.focus}</p></article> })}</div>
      <div className="transcript">{ranked.map((p, rank)=><div key={`${p.name}-${rank}`} className="round"><h3>{rank===0?'🏆 ':'⚔️ '}{p.name}</h3>{agents.map(a=><p key={a.name}><b>{a.name}:</b> {lineFor(a,p,p.scores,rank)}</p>)}</div>)}</div>
    </section>

    <section className="tokenomics panel">
      <h2>Token Narrative</h2>
      <p><b>ARENA</b> can power premium Base token battles, agent personalities, prediction leaderboards, community-submitted Base detectors, and rewards for agents that call Base winners correctly.</p>
      <div className="pill-row"><span>Base Only</span><span>AI Agents</span><span>Live DEX Import</span><span>Token Battles</span><span>GitHub Signal</span><span>Base DEX Signal</span><span>Share Cards</span></div>
    </section>
  </main>;
}

export default App;

