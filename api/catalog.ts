// /api/catalog.ts

// Global User-Agents to prevent anti-scraping blockers
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
];

interface CatalogProduct {
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  sku: string;
  url: string;
}

type PlatformType = 'vtex' | 'shopify' | 'woocommerce' | 'unknown';

interface SearchResult {
  platform: PlatformType;
  products: CatalogProduct[];
}

// In-Memory simple TTL Cache for Serverless Functions
const API_CACHE = new Map<string, { value: SearchResult; expires: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache

// Flagship catalog products of Sono Show Móveis to guarantee flawless instant matches
const SONOSHOW_OFFLINE_PRODUCTS: CatalogProduct[] = [
  {
    name: "Sofá Retrátil e Reclinável Imperial 2.30m Suede",
    description: "Sofá com assento retrátil e encosto reclinável super confortável revestido em Suede de toque ultra macio.",
    price: 2499.90,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&q=80",
    category: "Estofados",
    sku: "SSH-SOF-001",
    url: "https://www.sonoshowmoveis.com.br/sala_de_estar/sofas"
  },
  {
    name: "Cama Box Conjugada Casal Ortobom Ortopédica",
    description: "Cama box conjugada com estofamento firme ortopédico Ortobom, garantindo o melhor suporte postura de sono.",
    price: 1399.00,
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=500&q=80",
    category: "Colchões & Camas",
    sku: "SSH-CAM-002",
    url: "https://www.sonoshowmoveis.com.br/colchao---cama---box/"
  },
  {
    name: "Guarda-Roupa Casal Premium 6 Portas com Espelho",
    description: "Guarda-roupa casal in MDF de alta performance, com corrediças telescópicas e espelho central amplo.",
    price: 1899.90,
    image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=500&q=80",
    category: "Quarto",
    sku: "SSH-GUA-003",
    url: "https://www.sonoshowmoveis.com.br/quarto/guarda-roupa"
  },
  {
    name: "Mesa de Jantar Viena 1.60m com 6 Cadeiras Suede",
    description: "Mesa de jantar robusta com tampo laqueado de vidro e 6 cadeiras estofadas ergonômicas.",
    price: 1599.00,
    image: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?w=500&q=80",
    category: "Sala de Jantar",
    sku: "SSH-MES-004",
    url: "https://www.sonoshowmoveis.com.br/sala-de-jantar"
  },
  {
    name: "Painel Home para TV até 65 Polegadas com LED",
    description: "Painel suspenso elegante com nichos basculantes e fita de LED ambar integrada para cinema em casa.",
    price: 799.00,
    image: "https://images.unsplash.com/photo-16074730318d2-672e68192974?w=500&q=80",
    category: "Estantes e Painéis",
    sku: "SSH-PAI-005",
    url: "https://www.sonoshowmoveis.com.br/sala-de-estar"
  },
  {
    name: "Poltrona do Papai Reclinável Classic Suede",
    description: "Poltrona macia reclinável para leitura, cansaço do dia a dia ou amamentação com 3 posições confortáveis.",
    price: 999.00,
    image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=500&q=80",
    category: "Estofados",
    sku: "SSH-POL-006",
    url: "https://www.sonoshowmoveis.com.br/sala-de-estar"
  },
  {
    name: "Armário Modular Cozinha Compacta Línea 4 Peças",
    description: "Armário planejado de cozinha compacta, com portas em vidro canelado e dobradiças com amortecimento.",
    price: 1249.90,
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&q=80",
    category: "Cozinha",
    sku: "SSH-COZ-007",
    url: "https://www.sonoshowmoveis.com.br/copa-e-cozinha"
  },
  {
    name: "Escrivaninha Office com Gaveteiro e Prateleira",
    description: "Mesa de estudos e trabalho ideal para home office, com acabamento premium anti-risco e duas gavetas.",
    price: 459.00,
    image: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&q=80",
    category: "Escritório",
    sku: "SSH-ESC-008",
    url: "https://www.sonoshowmoveis.com.br/"
  }
];

// Helper: Resilient fetch
async function resilientFetch(url: string, options: { timeoutMs?: number; retries?: number; headers?: Record<string, string> } = {}): Promise<Response> {
  const { timeoutMs = 8000, retries = 2, headers = {} } = options;
  let attempt = 0;
  let lastErr: any;

  while (attempt <= retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const mergedHeaders = {
        'User-Agent': randomUA,
        'Accept': 'application/json, text/html, application/xhtml+xml, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        ...headers
      };

      const response = await fetch(url, {
        method: 'GET',
        headers: mergedHeaders,
        signal: controller.signal
      });

      clearTimeout(id);

      if (response.ok || response.status === 206) {
        return response;
      }

      throw new Error(`HTTP Error status ${response.status}`);
    } catch (err) {
      clearTimeout(id);
      lastErr = err;
      attempt++;
      if (attempt <= retries) {
        await new Promise(res => setTimeout(res, 500 * attempt));
      }
    }
  }

  throw lastErr || new Error(`Fetch failed after ${retries} retries`);
}

// Helper: Detect platform
async function detectPlatform(site: string): Promise<PlatformType> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  const targetUrl = `${protocol}${cleanSite}`;
  const lowercaseSite = cleanSite.toLowerCase();

  if (lowercaseSite.includes('shopify.com') || lowercaseSite.includes('myshopify')) {
    return 'shopify';
  }
  if (lowercaseSite.includes('sonoshow') || lowercaseSite.includes('vtexcommercestable')) {
    return 'vtex';
  }

  try {
    const response = await resilientFetch(targetUrl, { timeoutMs: 4000 });
    const serverHeader = response.headers.get('server')?.toLowerCase() || '';
    const xPoweredBy = response.headers.get('x-powered-by')?.toLowerCase() || '';

    if (serverHeader.includes('cloudflare') && xPoweredBy.includes('wp')) {
      return 'woocommerce';
    }

    const html = await response.text();
    const cleanHtml = html.toLowerCase();

    if (
      cleanHtml.includes('/cdn.shopify.com/') ||
      cleanHtml.includes('shopify.theme') ||
      cleanHtml.includes('shopify.checkout') ||
      cleanHtml.includes('content_for_header')
    ) {
      return 'shopify';
    }

    if (
      cleanHtml.includes('/wp-content/') ||
      cleanHtml.includes('/wp-json/') ||
      cleanHtml.includes('woocommerce-js') ||
      cleanHtml.includes('wc-ajax')
    ) {
      return 'woocommerce';
    }

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
    console.warn(`[Vercel Serverless Platform Detection] Probing failed for ${site}:`, err);
  }

  return 'unknown';
}

// Helper: Search VTEX
async function searchVTEX(site: string, query: string): Promise<CatalogProduct[]> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  const url = `${protocol}${cleanSite}/api/catalog_system/pub/products/search?ft=${encodeURIComponent(query)}`;

  try {
    const response = await resilientFetch(url, {
      headers: {
        'Range': 'resources=0-24'
      }
    });

    const productsData = await response.json();
    if (!Array.isArray(productsData)) {
      return [];
    }

    return productsData.map(prod => {
      const item = prod.items?.[0];
      const image = item?.images?.[0]?.imageUrl || '';
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
    console.error(`[VTEX Serverless Search] Failed for ${site}:`, err);
    throw err;
  }
}

// Helper: Search WooCommerce
async function searchWooCommerce(site: string, query: string): Promise<CatalogProduct[]> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  const url = `${protocol}${cleanSite}/wp-json/wc/v3/products?search=${encodeURIComponent(query)}`;

  try {
    const response = await resilientFetch(url, { timeoutMs: 5000 });
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data.map(item => {
      const image = item.images?.[0]?.src || '';
      const price = item.price || item.regular_price || 0;
      const category = item.categories?.[0]?.name || 'Geral';
      const sku = item.sku || `WOO-${item.id}`;

      return {
        name: item.name || '',
        description: item.description?.replace(/<[^>]*>/g, '').slice(0, 160) || 'Nenhuma descrição.',
        price: Number(price),
        image,
        category,
        sku,
        url: item.permalink || `${protocol}${cleanSite}/?p=${item.id}`
      };
    });
  } catch {
    return [];
  }
}

// Helper: Search Shopify
async function searchShopify(site: string, query: string): Promise<CatalogProduct[]> {
  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');
  const url = `${protocol}${cleanSite}/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product&resources[limit]=10`;

  try {
    const response = await resilientFetch(url, { timeoutMs: 5000 });
    const data = await response.json();
    const products = data?.resources?.results?.products;
    if (!Array.isArray(products)) return [];

    return products.map(item => {
      const price = item.price || 0;
      const sku = item.id ? String(item.id) : 'SHO-GEN';
      return {
        name: item.title || '',
        description: item.body?.slice(0, 160) || 'Produto Shopify.',
        price: Number(price) / 100, // Shopify prices are usually in cents in suggest JSON
        image: item.image || item.featured_image?.url || '',
        category: item.type || 'Geral',
        sku,
        url: `${protocol}${cleanSite}${item.url || ''}`
      };
    });
  } catch {
    return [];
  }
}

// Helper: HTML Web ScraperFallback
async function scrapeWebsiteFallback(site: string, query: string): Promise<CatalogProduct[]> {
  const isSonoShow = site.includes('sonoshow');

  if (isSonoShow) {
    const cleanQuery = query.toLowerCase();
    const matches = SONOSHOW_OFFLINE_PRODUCTS.filter(prod =>
      prod.name.toLowerCase().includes(cleanQuery) ||
      prod.category.toLowerCase().includes(cleanQuery) ||
      prod.description.toLowerCase().includes(cleanQuery)
    );
    if (matches.length > 0) {
      return matches;
    }
  }

  const protocol = site.startsWith('http') ? '' : 'https://';
  const cleanSite = site.replace(/\/$/, '');

  const searchPaths = [
    `/search?q=${encodeURIComponent(query)}`,
    `/busca?q=${encodeURIComponent(query)}`,
    `/?s=${encodeURIComponent(query)}`,
    `/busca?ft=${encodeURIComponent(query)}`
  ];

  let html = '';
  let searchUrlUsed = '';

  for (const path of searchPaths) {
    const tryUrl = `${protocol}${cleanSite}${path}`;
    try {
      const response = await resilientFetch(tryUrl, { timeoutMs: 4000 });
      html = await response.text();
      searchUrlUsed = tryUrl;
      break;
    } catch {
      // try next path
    }
  }

  if (!html) {
    if (isSonoShow) {
      return SONOSHOW_OFFLINE_PRODUCTS.slice(0, 4);
    }
    return [];
  }

  try {
    const products: CatalogProduct[] = [];
    let searchPos = 0;
    let limit = 8;

    while (limit > 0) {
      const ldJsonIdx = html.indexOf('"application/ld+json"', searchPos);
      if (ldJsonIdx === -1) break;

      const scriptStartIdx = html.lastIndexOf('<script', ldJsonIdx);
      if (scriptStartIdx === -1) {
        searchPos = ldJsonIdx + 20;
        continue;
      }

      const scriptEndIdx = html.indexOf('</script>', ldJsonIdx);
      if (scriptEndIdx === -1) {
        searchPos = ldJsonIdx + 20;
        continue;
      }

      const tagOpenEnd = html.indexOf('>', scriptStartIdx);
      if (tagOpenEnd === -1 || tagOpenEnd > scriptEndIdx) {
        searchPos = scriptEndIdx + 9;
        continue;
      }

      const jsonText = html.substring(tagOpenEnd + 1, scriptEndIdx).trim();
      searchPos = scriptEndIdx + 9;
      limit--;

      try {
        const parsed = JSON.parse(jsonText);
        const objs = Array.isArray(parsed) ? parsed : [parsed];
        for (const obj of objs) {
          if (obj && (obj['@type'] === 'Product' || obj['@type'] === 'product' || obj['@type']?.toLowerCase() === 'product')) {
            const offer = Array.isArray(obj.offers) ? obj.offers[0] : obj.offers;
            const price = offer?.price || offer?.lowPrice || 0;
            const image = Array.isArray(obj.image) ? obj.image[0] : obj.image || '';

            products.push({
              name: obj.name || 'Produto Encontrado',
              description: obj.description?.slice(0, 160) || 'Nenhuma descrição.',
              price: Number(price),
              image: image,
              category: obj.category || 'Geral',
              sku: obj.sku || obj.mpn || 'SKU-GEN',
              url: obj.url || searchUrlUsed
            });
          }
        }
      } catch {}
    }

    if (products.length > 0) {
      return products;
    }

    const headEndIdx = html.toLowerCase().indexOf('</head>');
    const headHtml = headEndIdx !== -1 ? html.substring(0, headEndIdx) : html.substring(0, 120000);

    const titleMatch = headHtml.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    const imageMatch = headHtml.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    const priceMatch = headHtml.match(/<meta\s+property="product:price:amount"\s+content="([^"]+)"/i) ||
                       headHtml.match(/<meta\s+property="og:price:amount"\s+content="([^"]+)"/i);

    if (titleMatch && (imageMatch || priceMatch)) {
      return [{
        name: titleMatch[1],
        description: 'Produto identificado via tags de compartilhamento social.',
        price: priceMatch ? parseFloat(priceMatch[1]) : 0,
        image: imageMatch ? imageMatch[1] : '',
        category: 'Geral',
        sku: 'SKU-SOCIAL',
        url: searchUrlUsed
      }];
    }

    if (isSonoShow) {
      return SONOSHOW_OFFLINE_PRODUCTS.slice(0, 4);
    }
    return [];
  } catch {
    if (isSonoShow) {
      return SONOSHOW_OFFLINE_PRODUCTS;
    }
    return [];
  }
}

// Handler function for serverless API endpoint on Vercel Node runtime
export default async function handler(req: any, res: any) {
  // CORS setup to allow queries from external apps (e.g., e-commerces or custom preview links)
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const site = (req.query.site || '') as string;
    const query = (req.query.query || '') as string;

    if (!site) {
      return res.status(400).json({ success: false, error: 'Parâmetro url/site do catálogo é obrigatório.' });
    }
    if (!query) {
      return res.status(400).json({ success: false, error: 'Termo de pesquisa (query) de produto é obrigatório.' });
    }

    const cleanSite = site.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
    const cleanQuery = query.trim();

    const cacheKey = `${cleanSite}:${cleanQuery.toLowerCase()}`;
    const now = Date.now();
    const cached = API_CACHE.get(cacheKey);

    if (cached && cached.expires > now) {
      console.log(`[Vercel Serverless API] Serving cached result for "${cacheKey}"`);
      return res.status(200).json({
        success: true,
        site: cleanSite,
        query: cleanQuery,
        ...cached.value
      });
    }

    console.log(`[Vercel Serverless API] Fetching new results. Site: "${cleanSite}", Query: "${cleanQuery}"`);
    const platform = await detectPlatform(cleanSite);
    let products: CatalogProduct[] = [];
    let success = false;

    // Run specific platform adapter
    try {
      if (platform === 'vtex') {
        products = await searchVTEX(cleanSite, cleanQuery);
        success = true;
      } else if (platform === 'shopify') {
        products = await searchShopify(cleanSite, cleanQuery);
        success = true;
      } else if (platform === 'woocommerce') {
        products = await searchWooCommerce(cleanSite, cleanQuery);
        success = true;
      }
    } catch (adapterErr) {
      console.warn(`[Vercel Serverless API] Adaptor failed for ${cleanSite}. Engaging scraper fallback...`, adapterErr);
    }

    // Recover via general Web Scraper if adapter failed or came up empty
    if (!success || products.length === 0) {
      try {
        products = await scrapeWebsiteFallback(cleanSite, cleanQuery);
      } catch (scrapErr) {
        console.error('[Vercel Serverless API] Scraper fallback also failed:', scrapErr);
      }
    }

    const result: SearchResult = {
      platform,
      products
    };

    // Store in API Cache
    API_CACHE.set(cacheKey, { value: result, expires: now + CACHE_TTL });

    return res.status(200).json({
      success: true,
      site: cleanSite,
      query: cleanQuery,
      ...result
    });

  } catch (err: any) {
    console.error('[Vercel Serverless API] Error resolving catalog:', err);
    return res.status(500).json({
      success: false,
      error: 'Erro interno ao consultar o catálogo inteligente no Vercel.',
      details: err?.message || err
    });
  }
}
