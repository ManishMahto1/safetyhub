interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * Simple in-memory Map-based cache with per-entry TTL. Deliberately not
 * backed by Mongo — this is request-shaping cache (Overpass/photo lookups),
 * not data that needs to persist or be shared across server instances.
 */
class CacheService {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async wrap<T>(key: string, ttlMs: number, fn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;
    const value = await fn();
    this.set(key, value, ttlMs);
    return value;
  }
}

export const cacheService = new CacheService();
