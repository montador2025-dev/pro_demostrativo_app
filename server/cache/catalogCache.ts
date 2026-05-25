// /server/cache/catalogCache.ts

interface CacheEntry {
  data: any;
  expiresAt: number;
}

export class CatalogCache {
  private static cache = new Map<string, CacheEntry>();
  // Default cache TTL = 10 minutes (600,000 ms)
  private static DEFAULT_TTL = 10 * 60 * 1000;

  static set(key: string, data: any, ttlMs: number = this.DEFAULT_TTL): void {
    const expiresAt = Date.now() + ttlMs;
    this.cache.set(key, { data, expiresAt });
  }

  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  static clear(): void {
    this.cache.clear();
  }
}
