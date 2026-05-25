const cache = new Map()
const DEFAULT_TTL = 60 * 1000

export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCached(key, data, ttlMs = DEFAULT_TTL) {
  cache.set(key, { data, expires: Date.now() + ttlMs })
}

export function invalidateCache(prefix) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key)
  }
}
