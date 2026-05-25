// /server/detectors/platformDetector.ts

import { resilientFetch } from '../utils/fetchHelper';

export type PlatformType = 'vtex' | 'shopify' | 'woocommerce' | 'unknown';

/**
 * Automatically inspects site content and structures to identify the CMS/E-commerce platform.
 * Employs lookups, headers, and quick probes with smart fallbacks.
 */
export async function detectPlatform(site: string): Promise<PlatformType> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  const targetUrl = `${protocol}${cleanSite}`;

  // 1. Check obvious domain or pattern clues
  const lowercaseSite = cleanSite.toLowerCase();
  
  if (lowercaseSite.includes('shopify.com') || lowercaseSite.includes('myshopify')) {
    return 'shopify';
  }
  
  if (lowercaseSite.includes('sonoshow') || lowercaseSite.includes('vtexcommercestable')) {
    return 'vtex';
  }

  // 2. Perform probing HEAD or lightweight GET request
  try {
    const response = await resilientFetch(targetUrl, { timeoutMs: 4000 });
    const serverHeader = response.headers.get('server')?.toLowerCase() || '';
    const xPoweredBy = response.headers.get('x-powered-by')?.toLowerCase() || '';

    if (serverHeader.includes('cloudflare') && xPoweredBy.includes('wp')) {
      return 'woocommerce';
    }

    const html = await response.text();
    const cleanHtml = html.toLowerCase();

    // Shopify clues
    if (
      cleanHtml.includes('/cdn.shopify.com/') ||
      cleanHtml.includes('shopify.theme') ||
      cleanHtml.includes('shopify.checkout') ||
      cleanHtml.includes('content_for_header')
    ) {
      return 'shopify';
    }

    // WooCommerce/WordPress clues
    if (
      cleanHtml.includes('/wp-content/') ||
      cleanHtml.includes('/wp-json/') ||
      cleanHtml.includes('woocommerce-js') ||
      cleanHtml.includes('wc-ajax')
    ) {
      return 'woocommerce';
    }

    // VTEX clues
    if (
      cleanHtml.includes('/arquivos/') ||
      cleanHtml.includes('vtex-image') ||
      cleanHtml.includes('vtex.io') ||
      cleanHtml.includes('vtex-render') ||
      cleanHtml.includes('/api/catalog_system/')
    ) {
      return 'vtex';
    }

  } catch (err) {
    console.warn(`Probing failed during platform auto-detection for ${site}:`, err);
  }

  // Safe fallback choice
  return 'unknown';
}
