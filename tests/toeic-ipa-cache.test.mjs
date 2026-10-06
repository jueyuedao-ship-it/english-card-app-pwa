import test from 'node:test';
import assert from 'node:assert/strict';
let upgradeIpaCacheVersion;
try {
  ({ upgradeIpaCacheVersion } = await import('../scripts/ipa-cache-version.mjs'));
} catch (error) {
  if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error;
}

test('IPA regeneration preserves current and future PWA cache versions', () => {
  assert.equal(typeof upgradeIpaCacheVersion, 'function');
  for (const version of [9, 10, 11]) {
    const source = `const CACHE_NAME = CACHE_PREFIX + 'v${version}';\n`;
    assert.equal(upgradeIpaCacheVersion(source), source);
  }
});

test('IPA regeneration upgrades the original v8 cache for the pronunciation asset', () => {
  assert.equal(typeof upgradeIpaCacheVersion, 'function');
  assert.equal(upgradeIpaCacheVersion("const CACHE_NAME = CACHE_PREFIX + 'v8';\n"), "const CACHE_NAME = CACHE_PREFIX + 'v9';\n");
});
