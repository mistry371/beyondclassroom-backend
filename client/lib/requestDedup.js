const inflight = new Map()

export function dedupeGet(key, fetcher) {
  if (inflight.has(key)) return inflight.get(key)
  const p = fetcher().finally(() => inflight.delete(key))
  inflight.set(key, p)
  return p
}
