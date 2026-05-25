// /server/services/catalogService.ts

import { detectPlatform, PlatformType } from '../detectors/platformDetector';
import { searchVTEX, CatalogProduct } from '../adapters/vtex';
import { searchShopify } from '../adapters/shopify';
import { searchWooCommerce } from '../adapters/woocommerce';
import { scrapeWebsiteFallback } from '../adapters/scraper';
import { CatalogCache } from '../cache/catalogCache';

interface SearchResult {
  platform: PlatformType;
  products: CatalogProduct[];
}

/**
 * High-performance orchestrator for Universal Catalog Search
 * Incorporates platform auto-detection, TTL caching, and graceful failure isolation.
 */
export async function queryUniversalCatalog(site: string, query: string): Promise<SearchResult> {
  const cleanSite = site.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const cleanQuery = query.trim();

  const cacheKey = `${cleanSite}:${cleanQuery.toLowerCase()}`;
  const cachedData = CatalogCache.get(cacheKey);
  
  if (cachedData) {
    console.log(`[Universal Catalog] Serving cached response for key: ${cacheKey}`);
    return cachedData;
  }

  // 1. Detect Platform
  const platform = await detectPlatform(cleanSite);
  console.log(`[Universal Catalog] Auto-detected platform for "${cleanSite}": ${platform.toUpperCase()}`);

  let products: CatalogProduct[] = [];
  let success = false;

  // 2. Query targeted adapter with retry guardrails
  try {
    switch (platform) {
      case 'vtex':
        products = await searchVTEX(cleanSite, cleanQuery);
        success = true;
        break;
      case 'shopify':
        products = await searchShopify(cleanSite, cleanQuery);
        success = true;
        break;
      case 'woocommerce':
        products = await searchWooCommerce(cleanSite, cleanQuery);
        success = true;
        break;
      default:
        // Try scraper fallback
        products = await scrapeWebsiteFallback(cleanSite, cleanQuery);
        success = products.length > 0;
        break;
    }
  } catch (err) {
    console.error(`[Universal Catalog] Preferred platform adapter failed for ${cleanSite}. Engaging scraper fallback...`, err);
  }

  // 3. Fallback recovery if specific API adapter returns empty or throws error
  if (!success || products.length === 0) {
    try {
      console.log(`[Universal Catalog] Running Scraper Fallback for "${cleanSite}" with query "${cleanQuery}"`);
      products = await scrapeWebsiteFallback(cleanSite, cleanQuery);
    } catch (fallbackErr) {
      console.error(`[Universal Catalog] Scraper Fallback also failed for ${cleanSite}:`, fallbackErr);
    }
  }

  const result: SearchResult = {
    platform,
    products
  };

  // 4. Save to TTL Cache
  CatalogCache.set(cacheKey, result);

  return result;
}
