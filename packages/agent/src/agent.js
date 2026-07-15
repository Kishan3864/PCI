/**
 * ScriptProof runtime agent (Phase 3.1).
 *
 * Dependency-free ES2017 IIFE, <6KB. Embedded on merchant payment pages via:
 *   <script src="https://app.example.com/agent.js" data-site-key="SITE_KEY" async></script>
 *
 * Reports the page's scripts — including scripts injected at runtime — to
 * <origin-of-this-script>/api/ingest/agent/<siteKey> as text/plain JSON (no
 * CORS preflight). The snippet is intentionally dumb: ALL validation, plan
 * gating and rate limiting happen server-side. It must NEVER break or slow
 * the host page, so every code path is wrapped and it emits no console output.
 */
(function () {
  try {
    var el = document.currentScript;
    if (!el || !el.src) return;
    var key = el.getAttribute('data-site-key');
    if (!key) return;
    var endpoint = new URL(el.src).origin + '/api/ingest/agent/' + encodeURIComponent(key);

    var MAX_BATCHES = 5; // 1 on-load payload + up to 4 runtime follow-ups
    var MAX_SCRIPTS = 100;
    var MAX_URL = 2000;
    var THROTTLE_MS = 2000;
    var sent = 0;
    var seen = {};
    var queue = [];
    var timer = null;

    function idOf(r) {
      return r.src ? 's:' + r.src : 'i:' + (r.sha256 || '') + ':' + (r.size || 0);
    }

    function hashInline(text) {
      return new Promise(function (resolve) {
        try {
          if (!window.crypto || !window.crypto.subtle || !window.TextEncoder) return resolve(null);
          window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(
            function (buf) {
              var b = new Uint8Array(buf);
              var hex = '';
              for (var i = 0; i < b.length; i++) hex += (b[i] < 16 ? '0' : '') + b[i].toString(16);
              resolve(hex);
            },
            function () {
              resolve(null);
            },
          );
        } catch (_e) {
          resolve(null);
        }
      });
    }

    function toReport(node, injected) {
      return new Promise(function (resolve) {
        try {
          if (node.src) {
            var r = { src: String(node.src).slice(0, MAX_URL) };
            if (injected) r.injected = true;
            return resolve(r);
          }
          var text = node.text || node.textContent || '';
          if (!text) return resolve(null);
          hashInline(text).then(function (hex) {
            if (!hex) return resolve(null);
            var ri = { sha256: hex, size: text.length };
            if (injected) ri.injected = true;
            resolve(ri);
          });
        } catch (_e) {
          resolve(null);
        }
      });
    }

    function send(reports) {
      try {
        if (sent >= MAX_BATCHES || reports.length === 0) return;
        sent++;
        var body = JSON.stringify({
          v: 1,
          url: String(location.href).slice(0, MAX_URL),
          scripts: reports.slice(0, MAX_SCRIPTS),
        });
        if (navigator.sendBeacon && navigator.sendBeacon(endpoint, body)) return;
        if (window.fetch) {
          fetch(endpoint, { method: 'POST', body: body, keepalive: true, mode: 'no-cors' }).catch(
            function () {
              /* fail-silent */
            },
          );
        }
      } catch (_e) {
        /* never break the host page */
      }
    }

    function fresh(reports) {
      var out = [];
      for (var i = 0; i < reports.length; i++) {
        var r = reports[i];
        if (!r) continue;
        var id = idOf(r);
        if (seen[id]) continue;
        seen[id] = true;
        out.push(r);
      }
      return out;
    }

    function enqueue(report) {
      try {
        var batch = fresh([report]);
        if (batch.length === 0) return;
        queue.push(batch[0]);
        if (timer) return;
        timer = setTimeout(function () {
          timer = null;
          send(queue.splice(0, MAX_SCRIPTS));
        }, THROTTLE_MS);
      } catch (_e) {
        /* fail-silent */
      }
    }

    function collectAll() {
      try {
        var nodes = [].slice.call(document.scripts, 0, MAX_SCRIPTS);
        Promise.all(
          nodes.map(function (n) {
            return toReport(n, false);
          }),
        ).then(
          function (reports) {
            send(fresh(reports));
          },
          function () {
            /* fail-silent */
          },
        );
      } catch (_e) {
        /* fail-silent */
      }
    }

    try {
      var mo = new MutationObserver(function (mutations) {
        try {
          for (var i = 0; i < mutations.length; i++) {
            var added = mutations[i].addedNodes;
            for (var j = 0; j < added.length; j++) {
              var n = added[j];
              if (n && n.tagName === 'SCRIPT') {
                toReport(n, true).then(enqueue, function () {
                  /* fail-silent */
                });
              }
            }
          }
        } catch (_e) {
          /* fail-silent */
        }
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    } catch (_e) {
      /* MutationObserver unavailable — on-load inventory still works */
    }

    if (document.readyState === 'complete') collectAll();
    else window.addEventListener('load', collectAll);
  } catch (_e) {
    /* fail-silent by design */
  }
})();
