// /server/adapters/woocommerce.ts

import { resilientFetch } from '../utils/fetchHelper';
import { CatalogProduct } from './vtex';

/**
 * Adapter for WooCommerce e-commerce platform using public JSON feeds and search endpoints
 */
export async function searchWooCommerce(site: string, query: string): Promise<CatalogProduct[]> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  
  // Try WordPress/WooCommerce public JSON Feed first
  const feedUrl = `${protocol}${cleanSite}/?feed=json&s=${encodeURIComponent(query)}`;
  
  try {
    const response = await resilientFetch(feedUrl);
    const data = await response.json();
    
    const items = data?.items || data;
    if (Array.isArray(items) && items.length > 0) {
      return items.map((item: any) => {
        // Woo feed objects
        const image = item.image || item.thumbnail || item.attachments?.[0]?.url || '';
        // Extract price if documented in text or custom fields
        const docText = item.content_html || item.content_text || '';
        const priceRegex = /(?:R\$|USD|\$)\s?([0-9.,]+)/i;
        const match = priceRegex.exec(docText);
        const price = match ? parseFloat(match[1].replace('.', '').replace(',', '.')) : 0;

        return {
          name: item.title || '',
          description: docText.replace(/<[^>]*>/g, '').slice(0, 160) || '',
          price: price,
          image: image,
          category: item.categories?.[0] || 'WooCommerce',
          sku: item.id?.toString() || '',
          url: item.url || `${protocol}${cleanSite}/?p=${item.id}`
        };
      });
    }
  } catch (err) {
    console.warn(`WooCommerce json feed failed/not-enabled for ${site}, falling back to public posts API...`, err);
  }

  // Fallback: wp-json products or posts search
  const postsUrl = `${protocol}${cleanSite}/wp-json/wp/v2/posts?search=${encodeURIComponent(query)}&_embed`;
  try {
    const response = await resilientFetch(postsUrl);
    const posts = await response.json();

    if (!Array.isArray(posts)) {
      return [];
    }

    return posts.map((post: any) => {
      const title = post.title?.rendered || '';
      // Fetch media attachments
      const embeddedMedia = post._embedded?.['wp:featuredmedia']?.[0];
      const image = embeddedMedia?.source_url || '';
      const docText = post.excerpt?.rendered || post.content?.rendered || '';
      
      const priceRegex = /(?:R\$|USD|\$)\s?([0-9.,]+)/i;
      const match = priceRegex.exec(docText);
      const price = match ? parseFloat(match[1].replace('.', '').replace(',', '.')) : 0;

      return {
        name: title,
        description: docText.replace(/<[^>]*>/g, '').slice(0, 160),
        price: price,
        image: image,
        category: 'Moda & Utilidades',
        sku: post.id?.toString() || '',
        url: post.link || `${protocol}${cleanSite}/?p=${post.id}`
      };
    });
  } catch (err) {
    console.error(`WooCommerce posts API failed for ${site}:`, err);
    throw err;
  }
}
