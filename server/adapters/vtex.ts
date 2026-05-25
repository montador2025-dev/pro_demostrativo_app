// /server/adapters/vtex.ts

import { resilientFetch } from '../utils/fetchHelper';

export interface CatalogProduct {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sku: string;
  url: string;
}

/**
 * Adapter for VTEX e-commerce platform API search system
 */
export async function searchVTEX(site: string, query: string): Promise<CatalogProduct[]> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  
  // VTEX Search API Endpoint
  const url = `${protocol}${cleanSite}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}`;
  
  try {
    const response = await resilientFetch(url, {
      headers: {
        // Range 0-25 tells VTEX to only return the first 25 items and avoids some 206 pagination errors
        'Range': 'resources=0-24'
      }
    });

    const productsData = await response.json();

    if (!Array.isArray(productsData)) {
      return [];
    }

    return productsData.map(prod => {
      // Find the first available SKU item
      const item = prod.items?.[0];
      const image = item?.images?.[0]?.imageUrl || '';
      
      // Determine the commercial price safely
      const price = item?.sellers?.[0]?.commertialRecord?.Price || 0;
      const category = prod.categories?.[0]?.replace(/^\/|\/$/g, '').split('/')?.[0] || 'Geral';
      const sku = item?.itemId || prod.productId || '';
      const productUrl = prod.link || `${protocol}${cleanSite}/${prod.linkText}/p`;

      return {
        name: prod.productName || prod.brand || '',
        description: prod.description || 'Nenhuma descrição detalhada disponível.',
        price: Number(price),
        image: image,
        category: category,
        sku: sku,
        url: productUrl
      };
    });
  } catch (err) {
    console.error(`VTEX Adapter failed for ${site}:`, err);
    throw err;
  }
}
