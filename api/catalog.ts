// /api/catalog.ts

import { queryUniversalCatalog } from '../server/services/catalogService';

export default async function handler(req: any, res: any) {
  // CORS setup to allow queries from external apps (e.g. AI Studio development preview)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const site = req.query.site as string;
    const query = req.query.query as string;

    if (!site) {
      return res.status(400).json({ error: 'Parâmetro url/site do catálogo é obrigatório.' });
    }
    if (!query) {
      return res.status(400).json({ error: 'Termo de pesquisa (query) de produto é obrigatório.' });
    }

    console.log(`[Vercel Serverless API] Querying site: "${site}" for: "${query}"`);
    const result = await queryUniversalCatalog(site, query);

    return res.status(200).json({
      success: true,
      site,
      query,
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
