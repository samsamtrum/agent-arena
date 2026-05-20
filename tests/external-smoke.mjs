import assert from 'node:assert/strict';
import {
  fetchBaseProject,
  fetchGeckoMarket,
  fetchTokenSecurity,
  fetchHolderIntel,
  fetchTransferFlow,
  fetchDeployerScan,
  fetchFarcasterScan
} from '../src/core/index.js';

const timeout = Number(process.env.SMOKE_TIMEOUT_MS || 15000);
const originalFetch = globalThis.fetch;
globalThis.fetch = (url, opts = {}) => originalFetch(url, { ...opts, signal: AbortSignal.timeout(timeout) });

const contract = process.env.SMOKE_CONTRACT || '0x4200000000000000000000000000000000000006';
const randomAddress = '0x9999999999999999999999999999999999999999';
const basescanKey = process.env.VITE_BASESCAN_API_KEY || process.env.BASESCAN_API_KEY || '';
const neynarKey = process.env.VITE_NEYNAR_API_KEY || process.env.NEYNAR_API_KEY || '';

async function mustReject(label, fn, pattern) {
  let error = null;
  try { await fn(); } catch (err) { error = err; }
  assert.ok(error, `${label} should reject`);
  assert.match(String(error.message || error), pattern, label);
  return error.message || String(error);
}

const dex = await fetchBaseProject(contract);
assert.equal(dex.project.symbol, 'WETH');
assert.ok(dex.project.liquidity > 0, 'DexScreener should return live liquidity');
assert.ok(dex.project.pairAddress, 'DexScreener should attach a pair address');

const gecko = await fetchGeckoMarket(contract, dex.project.pairAddress);
assert.ok(gecko.poolCount >= 1, 'GeckoTerminal should return pools');
assert.ok(gecko.pairAddress, 'GeckoTerminal should attach a pair address');
assert.equal(gecko.pairAddress.toLowerCase(), dex.project.pairAddress.toLowerCase(), 'preferred GeckoTerminal pair should match imported DexScreener pair when available');

const security = await fetchTokenSecurity(contract);
assert.ok(Object.keys(security).length > 0, 'GoPlus should return a non-empty security object');
assert.ok('is_honeypot' in security || 'is_open_source' in security, 'GoPlus result should include core security fields');

const guardResults = [];
guardResults.push(['BaseScan holder no-key', await mustReject('BaseScan holder no-key', () => fetchHolderIntel(contract, ''), /BaseScan API key required/)]);
guardResults.push(['BaseScan transfer no-key', await mustReject('BaseScan transfer no-key', () => fetchTransferFlow(contract, ''), /BaseScan API key required/)]);
guardResults.push(['BaseScan deployer no-key', await mustReject('BaseScan deployer no-key', () => fetchDeployerScan(contract, ''), /BaseScan API key required/)]);
guardResults.push(['Neynar no-key', await mustReject('Neynar no-key', () => fetchFarcasterScan('base ai agent', ''), /Neynar API key required/)]);
guardResults.push(['GoPlus invalid address', await mustReject('GoPlus invalid address', () => fetchTokenSecurity('not-an-address'), /Invalid address/)]);
guardResults.push(['GoPlus empty result', await mustReject('GoPlus empty result', () => fetchTokenSecurity(randomAddress), /No security result returned|Security request failed/)]);

const optional = [];
if (basescanKey) {
  const transfers = await fetchTransferFlow(contract, basescanKey);
  assert.ok(transfers.transferCount > 0, 'BaseScan transfer flow should return rows with a valid key');
  optional.push({ name: 'BaseScan transfer live', transferCount: transfers.transferCount, uniqueWallets: transfers.uniqueWallets });
}
if (neynarKey) {
  const scan = await fetchFarcasterScan('base ai agent', neynarKey);
  assert.ok(scan.castCount >= 0, 'Neynar should return a scan object with a valid key');
  optional.push({ name: 'Neynar live', castCount: scan.castCount, uniqueAuthors: scan.uniqueAuthors });
}

console.log(JSON.stringify({
  ok: true,
  contract,
  publicSources: {
    dexscreener: { symbol: dex.project.symbol, liquidity: dex.project.liquidity, pairAddress: dex.project.pairAddress, pairCount: dex.pairCount },
    geckoterminal: { poolName: gecko.poolName, liquidity: gecko.liquidity, pairAddress: gecko.pairAddress, matchedPreferredPair: gecko.matchedPreferredPair, poolCount: gecko.poolCount },
    goplus: { keys: Object.keys(security).slice(0, 8), is_honeypot: security.is_honeypot, is_open_source: security.is_open_source }
  },
  guards: guardResults.map(([name, message]) => ({ name, message })),
  optional
}, null, 2));
