// /server/adapters/shopify.ts

import { resilientFetch } from '../utils/fetchHelper';
import { CatalogProduct } from './vtex';

/**
 * Adapter for Shopify e-commerce platform using public catalog suggest and product list endpoints
 */
export async function searchShopify(site: string, query: string): Promise<CatalogProduct[]> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  
  // Try suggest API first
  const suggestUrl = `${protocol}${cleanSite}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product`;
  
  try {
    const response = await resilientFetch(suggestUrl);
    const json = await response.json();
    const products = json?.resources?.results?.products;
    
    if (Array.isArray(products) && products.length > 0) {
      return products.map((prod: any) => ({
        name: prod.title || '',
        description: prod.body || prod.vendor || 'Produto Shopify',
        price: Number(prod.price || 0),
        image: prod.image || prod.featured_image?.url || '',
        category: prod.type || 'Feminino/Masculino',
        sku: prod.id?.toString() || '',
        url: `${protocol}${cleanSite}${prod.url}`
      }));
    }
  } catch (err) {
    console.warn(`Shopify Suggest API failed/not-enabled for ${site}, falling back to products.json...`, err);
  }

  // Fallback: Fetch /products.json and filter locally
  const listUrl = `${protocol}${cleanSite}/products.json?limit=50`;
  try {
    const response = await resilientFetch(listUrl);
    const json = await response.json();
    const products = json?.products;

    if (!Array.isArray(products)) {
      return [];
    }

    // Filter products containing query in title or tags
    const cleanQuery = query.toLowerCase();
    const filtered = products.filter((prod: any) => 
      prod.title?.toLowerCase().includes(cleanQuery) || 
      prod.body_html?.toLowerCase().includes(cleanQuery) ||
      prod.tags?.some((t: string) => t.toLowerCase().includes(cleanQuery))
    );

    return filtered.map((prod: any) => {
      const variant = prod.variants?.[0];
      const image = prod.images?.[0]?.src || '';
      return {
        name: prod.title || '',
        description: prod.body_html?.replace(/<[^>]*>/g, '').slice(0, 160) || '',
        price: Number(variant?.price || 0),
        image: image,
        category: prod.product_type || 'Geral',
        sku: variant?.sku || prod.id?.toString() || '',
        url: `${protocol}${cleanSite}/products/${prod.handle}`
      };
    });
  } catch (err) {
    console.error(`Shopify list Adapter failed for ${site}:`, err);
    throw err;
  }
}
