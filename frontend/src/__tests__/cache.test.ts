import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { CacheService } from '../lib/server/cache';

describe('CacheService Unit & Integration Tests', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  it('sets and retrieves cached values with type-safety', async () => {
    const key = cache.buildKey({ orgId: 'org_acme', projectId: 'prj_01', resource: 'stats' });
    assert.equal(await cache.get(key), null);

    const data = { totalEvents: 500, unresolved: 12 };
    await cache.set(key, data, { ttlSeconds: 30 });

    const retrieved = await cache.get<typeof data>(key);
    assert.deepEqual(retrieved, data);
  });

  it('implements cache-aside wrap pattern and avoids duplicate computations', async () => {
    const key = cache.buildKey({ orgId: 'org_acme', resource: 'expensive-query' });
    let computeCount = 0;

    const fetcher = async () => {
      computeCount += 1;
      return { answer: 42, computeCount };
    };

    // First call computes
    const res1 = await cache.wrap(key, fetcher, { ttlSeconds: 10 });
    assert.equal(res1.answer, 42);
    assert.equal(computeCount, 1);

    // Second call hits cache, doesn't compute
    const res2 = await cache.wrap(key, fetcher, { ttlSeconds: 10 });
    assert.equal(res2.answer, 42);
    assert.equal(computeCount, 1);
  });

  it('expires entries past their TTL', async () => {
    const key = cache.buildKey({ resource: 'short-lived' });
    // Set 0-second TTL (expires immediately)
    await cache.set(key, 'temp-val', { ttlSeconds: 0 });

    // Wait a brief tick
    await new Promise((resolve) => setTimeout(resolve, 10));

    const result = await cache.get(key);
    assert.equal(result, null);
  });

  it('invalidates cache entries by project tag without affecting other projects', async () => {
    const p1Key = cache.buildKey({ orgId: 'org_acme', projectId: 'prj_1', resource: 'stats' });
    const p2Key = cache.buildKey({ orgId: 'org_acme', projectId: 'prj_2', resource: 'stats' });

    await cache.set(p1Key, { proj: 1 }, { tags: ['proj:prj_1'] });
    await cache.set(p2Key, { proj: 2 }, { tags: ['proj:prj_2'] });

    assert.ok(await cache.get(p1Key));
    assert.ok(await cache.get(p2Key));

    // Invalidate project 1
    const invalidated = cache.invalidateProject('prj_1');
    assert.equal(invalidated, 1);

    assert.equal(await cache.get(p1Key), null);
    assert.deepEqual(await cache.get(p2Key), { proj: 2 });
  });

  it('invalidates cache entries by organization tag for tenant switching', async () => {
    const org1Key = cache.buildKey({ orgId: 'org_1', resource: 'overview' });
    const org2Key = cache.buildKey({ orgId: 'org_2', resource: 'overview' });

    await cache.set(org1Key, { org: 1 }, { tags: ['org:org_1'] });
    await cache.set(org2Key, { org: 2 }, { tags: ['org:org_2'] });

    const invalidated = cache.invalidateOrg('org_1');
    assert.equal(invalidated, 1);

    assert.equal(await cache.get(org1Key), null);
    assert.deepEqual(await cache.get(org2Key), { org: 2 });
  });

  it('tracks hits, misses, and calculates hit ratio accurately', async () => {
    const key = 'test:metrics:key';
    await cache.set(key, 'hello', { ttlSeconds: 60 });

    await cache.get(key); // hit 1
    await cache.get(key); // hit 2
    await cache.get('missing-key-1'); // miss 1
    await cache.get('missing-key-2'); // miss 2

    const diag = cache.getDiagnostics();
    assert.equal(diag.hits, 2);
    assert.equal(diag.misses, 2);
    assert.equal(diag.hitRatio, 50.0);
    assert.equal(diag.status, 'operational');
  });

  it('handles cache clearing and reset cleanly', async () => {
    await cache.set('k1', 'val1');
    await cache.set('k2', 'val2');

    cache.clear();

    assert.equal(await cache.get('k1'), null);
    assert.equal(await cache.get('k2'), null);
    assert.equal(cache.getDiagnostics().keysCount, 0);
  });
});
