// /server/utils/fetchHelper.ts

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
];

interface FetchOptions {
  timeoutMs?: number;
  retries?: number;
  headers?: Record<string, string>;
  method?: string;
  body?: string;
}

/**
 * Resilient fetching helper with customizable timeouts, retries,
 * status code flexibility (e.g. 206 for VTEX), and anti-blocking User-Agents.
 */
export async function resilientFetch(url: string, options: FetchOptions = {}): Promise<Response> {
  const {
    timeoutMs = 8000,
    retries = 2,
    headers = {},
    method = 'GET',
    body
  } = options;

  let attempt = 0;
  let lastErr: any;

  while (attempt <= retries) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // Pick random user agent to minimize scrap-blocking
      const randomUA = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
      const mergedHeaders = {
        'User-Agent': randomUA,
        'Accept': 'application/json, text/html, application/xhtml+xml, */*',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
        ...headers
      };

      const response = await fetch(url, {
        method,
        headers: mergedHeaders,
        body,
        signal: controller.signal
      });

      clearTimeout(id);

      // Support 200 (OK) and 206 (Partial Content - highly common for VTEX catalog search API)
      if (response.ok || response.status === 206) {
        return response;
      }

      throw new Error(`HTTP Error status ${response.status}`);
    } catch (err) {
      clearTimeout(id);
      lastErr = err;
      attempt++;
      if (attempt <= retries) {
        // Linear delay backoff
        await new Promise(res => setTimeout(res, 500 * attempt));
      }
    }
  }

  throw lastErr || new Error(`Fetch failed after ${retries} retries`);
}
