import test from 'node:test';
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

const VALID = '0x4200000000000000000000000000000000000006';
const PAIR = '0x6c561b446416e1a00e8e93e221854d6ea4171372';
const OTHER_PAIR = '0xe069aa5dc92da51c90d4fea0f5af7ede3d5e7f22';

function jsonResponse(body, init = {}) {
  return new Response(JSON.stringify(body), { status: init.status || 200, headers: { 'content-type': 'application/json' } });
}

async function withFetchMock(handler, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = async (url, opts) => handler(String(url), opts || {});
  try { return await fn(); }
  finally { globalThis.fetch = original; }
}

async function rejectsWith(fn, pattern) {
  let error = null;
  try { await fn(); } catch (err) { error = err; }
  assert.ok(error, 'expected function to reject');
  assert.match(String(error.message || error), pattern);
}

test('DexScreener failures are surfaced as import errors', async () => {
  await withFetchMock(() => new Response('bad gateway', { status: 502 }), async () => {
    await rejectsWith(() => fetchBaseProject(VALID), /DexScreener request failed/);
  });
  await withFetchMock(() => jsonResponse({ pairs: [] }), async () => {
    await rejectsWith(() => fetchBaseProject(VALID), /No DEX pair found/);
  });
  await withFetchMock(() => jsonResponse({ pairs: [{ chainId: 'ethereum' }] }), async () => {
    await rejectsWith(() => fetchBaseProject(VALID), /No Base pair found/);
  });
});

test('GeckoTerminal chooses preferred pair and handles degraded responses', async () => {
  await withFetchMock(() => jsonResponse({ data: [
    { id: `base_${OTHER_PAIR}`, attributes: { name: 'OTHER / WETH', reserve_in_usd: '999999999', volume_usd: { h24: '5' }, fdv_usd: '1' } },
    { id: `base_${PAIR}`, attributes: { name: 'WETH / USDC', reserve_in_usd: '120000000', volume_usd: { h24: '42000000' }, fdv_usd: '0' } }
  ] }), async () => {
    const gecko = await fetchGeckoMarket(VALID, PAIR);
    assert.equal(gecko.pairAddress, PAIR);
    assert.equal(gecko.matchedPreferredPair, true);
    assert.equal(gecko.poolName, 'WETH / USDC');
  });
  await withFetchMock(() => new Response('not found', { status: 404 }), async () => {
    await rejectsWith(() => fetchGeckoMarket(VALID), /GeckoTerminal request failed \(404\)/);
  });
  await withFetchMock(() => jsonResponse({ data: [] }), async () => {
    await rejectsWith(() => fetchGeckoMarket(VALID), /No GeckoTerminal Base pool found/);
  });
});

test('GoPlus security rejects invalid, failed, and empty responses', async () => {
  await rejectsWith(() => fetchTokenSecurity('not-an-address'), /Invalid address/);
  await withFetchMock(() => new Response('rate limited', { status: 429 }), async () => {
    await rejectsWith(() => fetchTokenSecurity(VALID), /Security request failed \(429\)/);
  });
  await withFetchMock(() => jsonResponse({ result: {} }), async () => {
    await rejectsWith(() => fetchTokenSecurity(VALID), /No security result returned/);
  });
  await withFetchMock(() => jsonResponse({ result: { [VALID.toLowerCase()]: { is_honeypot: '0', is_open_source: '1' } } }), async () => {
    const security = await fetchTokenSecurity(VALID);
    assert.equal(security.is_honeypot, '0');
  });
});

test('BaseScan and Neynar key guards run before network calls', async () => {
  let calls = 0;
  await withFetchMock(() => { calls++; return jsonResponse({}); }, async () => {
    await rejectsWith(() => fetchHolderIntel(VALID, ''), /BaseScan API key required/);
    await rejectsWith(() => fetchTransferFlow(VALID, ''), /BaseScan API key required/);
    await rejectsWith(() => fetchDeployerScan(VALID, ''), /BaseScan API key required/);
    await rejectsWith(() => fetchFarcasterScan('base ai', ''), /Neynar API key required/);
  });
  assert.equal(calls, 0, 'missing API keys should not trigger network calls');
});

test('BaseScan malformed and plan-limited payloads become useful scan errors', async () => {
  await withFetchMock(() => jsonResponse({ result: 'Max rate limit reached' }), async () => {
    await rejectsWith(() => fetchTransferFlow(VALID, 'bad-key'), /Max rate limit reached/);
    await rejectsWith(() => fetchDeployerScan(VALID, 'bad-key'), /Max rate limit reached/);
  });
  await withFetchMock(() => jsonResponse({ result: 'Free API access is not supported for this chain. Please upgrade your api plan for full chain coverage.' }), async () => {
    await rejectsWith(() => fetchHolderIntel(VALID, 'free-plan-key'), /Free API access is not supported for this chain/);
    await rejectsWith(() => fetchTransferFlow(VALID, 'free-plan-key'), /Free API access is not supported for this chain/);
    await rejectsWith(() => fetchDeployerScan(VALID, 'free-plan-key'), /Free API access is not supported for this chain/);
  });
  await withFetchMock((url) => url.includes('tokensupply') ? jsonResponse({ result: '1000000' }) : jsonResponse({ result: 'NOTOK' }), async () => {
    await rejectsWith(() => fetchHolderIntel(VALID, 'bad-key'), /NOTOK/);
  });
});

test('Neynar degraded payloads stay parse-safe', async () => {
  await withFetchMock(() => new Response('unauthorized', { status: 401 }), async () => {
    await rejectsWith(() => fetchFarcasterScan('base ai', 'bad-key'), /Neynar Farcaster request failed \(401\)/);
  });
  await withFetchMock(() => jsonResponse({ casts: [{ text: 'base ai agent looks bullish', author: { username: 'builder' }, hash: '0x1' }] }), async () => {
    const scan = await fetchFarcasterScan('base ai', 'key');
    assert.equal(scan.castCount, 1);
    assert.equal(scan.uniqueAuthors, 1);
    assert.equal(scan.sentiment, 'Bullish');
  });
  await withFetchMock(() => jsonResponse({ result: { casts: [] } }), async () => {
    const scan = await fetchFarcasterScan('base ai', 'key');
    assert.equal(scan.castCount, 0);
    assert.equal(scan.uniqueAuthors, 0);
  });
});
