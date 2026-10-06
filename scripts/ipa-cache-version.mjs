// Re-running the historic IPA installer must never downgrade a newer cache.
export function upgradeIpaCacheVersion(source) {
  return source.replace("const CACHE_NAME = CACHE_PREFIX + 'v8';", "const CACHE_NAME = CACHE_PREFIX + 'v9';");
}
