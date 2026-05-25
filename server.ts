// /server.ts

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { queryUniversalCatalog } from './server/services/catalogService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support JSON payload parsed correctly
  app.use(express.json());

  // Log all system API calls
  app.use((req, res, next) => {
    console.log(`[Radar Comercial Server] ${req.method} ${req.url}`);
    next();
  });

  // --- MÓDULO 1: API UNIVERSAL DE CATÁLOGO ---
  // Endpoint format: /api/catalog?site=catalogo.sonoshowmoveis.com.br&query=sofa
  app.get('/api/catalog', async (req, res) => {
    try {
      const site = req.query.site as string;
      const query = req.query.query as string;

      if (!site) {
        return res.status(400).json({ error: 'Parâmetro url/site do catálogo é obrigatório.' });
      }
      if (!query) {
        return res.status(400).json({ error: 'Termo de pesquisa (query) de produto é obrigatório.' });
      }

      console.log(`[Catalog Query API] Searching site: "${site}" for: "${query}"`);
      const result = await queryUniversalCatalog(site, query);
      
      return res.json({
        success: true,
        site,
        query,
        ...result
      });
    } catch (err: any) {
      console.error('[Catalog Query API] Error resolving catalog:', err);
      return res.status(500).json({
        success: false,
        error: 'Erro interno ao consultar o catálogo inteligente.',
        details: err?.message || err
      });
    }
  });

  // Live health-check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'Radar Comercial SaaS API' });
  });

  // Vite middleware setup to mount fullstack development engine
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Radar Server] Running in Development Mode. Mounting Vite Dev Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    console.log('[Radar Server] Running in Production Mode. Serving static files from /dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Radar Server] Listening at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[Radar Server] Bootstrapping failed:', err);
});
