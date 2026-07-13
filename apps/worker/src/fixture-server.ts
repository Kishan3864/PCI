import http from 'node:http';

/**
 * Serves deterministic "merchant checkout" pages for local dev, the seed demo
 * site, and the e2e test. Never started in production (test/dev mode only).
 *
 * POST /__fixture/variant {"variant":"baseline"|"modified"} switches content so
 * change detection can be exercised:
 *   modified = checkout.js content changes + a new injected.js script tag
 *              + weakened CSP (script-src directive dropped).
 */

export type FixtureVariant = 'baseline' | 'modified';

let variant: FixtureVariant = 'baseline';
/** Set via POST /__fixture/verify-token; served as a real ScriptProof meta tag. */
let verifyToken: string | null = null;

const SCRIPTS: Record<string, Record<FixtureVariant, string>> = {
  '/js/site.js': {
    baseline: "console.log('site v1');",
    modified: "console.log('site v1');",
  },
  '/js/checkout.js': {
    baseline: "window.checkout = { version: '1.0.0', init: function () {} };",
    modified: "window.checkout = { version: '1.0.1', init: function () {}, extra: true };",
  },
  '/js/analytics.js': {
    baseline: "window.analytics = { track: function () {} };",
    modified: "window.analytics = { track: function () {} };",
  },
  '/js/injected.js': {
    baseline: '',
    modified: "console.log('freshly injected third-party tag');",
  },
};

function homeHtml(): string {
  const verifyMeta = verifyToken
    ? `\n    <meta name="scriptproof-verify" content="${verifyToken}">`
    : '';
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Fixture Shop</title>${verifyMeta}</head>
  <body>
    <h1>Fixture Shop</h1>
    <a href="/checkout">Checkout</a>
    <script src="/js/site.js"></script>
  </body>
</html>`;
}

function checkoutHtml(current: FixtureVariant): string {
  const injected =
    current === 'modified' ? '\n    <script src="/js/injected.js"></script>' : '';
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><title>Checkout — Fixture Shop</title></head>
  <body>
    <h1>Checkout</h1>
    <form action="/pay" method="post"><input name="card" placeholder="Card number"></form>
    <script src="/js/checkout.js" integrity="sha384-fixture-demo-value"></script>
    <script src="/js/analytics.js"></script>
    <script>window.__cart = { total: 42 };</script>${injected}
  </body>
</html>`;
}

function pageHeaders(current: FixtureVariant): Record<string, string> {
  return {
    'content-type': 'text/html; charset=utf-8',
    'content-security-policy':
      current === 'baseline' ? "default-src 'self'; script-src 'self'" : "default-src 'self'",
    'x-frame-options': 'DENY',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
  };
}

export function startFixtureServer(port: number): http.Server {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? '/', `http://localhost:${port}`);

    if (url.pathname === '/__fixture/verify-token' && req.method === 'POST') {
      let body = '';
      req.on('data', (chunk: Buffer) => (body += chunk.toString()));
      req.on('end', () => {
        try {
          const parsed = JSON.parse(body) as { token?: string };
          verifyToken = typeof parsed.token === 'string' ? parsed.token : null;
          res.writeHead(200, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ token: verifyToken }));
        } catch {
          res.writeHead(400, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: 'expected {"token":"..."}' }));
        }
      });
      return;
    }

    if (url.pathname === '/__fixture/variant') {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk: Buffer) => (body += chunk.toString()));
        req.on('end', () => {
          try {
            const parsed = JSON.parse(body) as { variant?: string };
            if (parsed.variant === 'baseline' || parsed.variant === 'modified') {
              variant = parsed.variant;
              res.writeHead(200, { 'content-type': 'application/json' });
              res.end(JSON.stringify({ variant }));
              return;
            }
          } catch {
            // fall through to 400
          }
          res.writeHead(400, { 'content-type': 'application/json' });
          res.end(JSON.stringify({ error: 'expected {"variant":"baseline"|"modified"}' }));
        });
        return;
      }
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ variant }));
      return;
    }

    const script = SCRIPTS[url.pathname];
    if (script) {
      res.writeHead(200, { 'content-type': 'application/javascript; charset=utf-8' });
      res.end(script[variant]);
      return;
    }

    if (url.pathname === '/checkout') {
      res.writeHead(200, pageHeaders(variant));
      res.end(checkoutHtml(variant));
      return;
    }
    if (url.pathname === '/') {
      res.writeHead(200, pageHeaders(variant));
      res.end(homeHtml());
      return;
    }

    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  });

  server.listen(port, () => {
    console.log(`[fixture] serving fixture shop on http://localhost:${port}`);
  });
  return server;
}
