import {
  botUserAgent,
  CRAWL_TIMEOUT_MS,
  dedupeObserved,
  inlineUrlKey,
  normalizeHeaders,
  normalizeScriptUrl,
  scriptUrlKey,
  sha256Hex,
  type ObservedScript,
} from '@scriptproof/core';
import type { Browser } from 'playwright';
import { botInfoUrl } from './env';

/** Script tags as seen in the DOM (static + injected at runtime). */
interface RawScriptTag {
  src: string | null;
  text: string | null;
  integrity: string | null;
  attrs: Record<string, string>;
}

export interface CrawlOutcome {
  httpStatus: number;
  headers: Record<string, string>;
  observed: ObservedScript[];
}

const MAX_SCRIPT_BYTES = 5 * 1024 * 1024;
/** Courtesy spacing between external script fetches during a scan. */
const SCRIPT_FETCH_DELAY_MS = 250;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Records script tags injected after load, before any page script runs. */
const INIT_OBSERVER_SCRIPT = `
(() => {
  window.__spScripts = [];
  const record = (node) => {
    if (!node || node.tagName !== 'SCRIPT') return;
    const attrs = {};
    for (const attr of node.attributes) attrs[attr.name] = attr.value;
    window.__spScripts.push({
      src: node.getAttribute('src'),
      text: node.src ? null : node.textContent,
      integrity: node.getAttribute('integrity'),
      attrsJson: JSON.stringify(attrs),
    });
  };
  new MutationObserver((mutations) => {
    for (const mutation of mutations) mutation.addedNodes.forEach(record);
  }).observe(document.documentElement || document, { childList: true, subtree: true });
})();
`;

/** Collects the union of document.scripts and runtime-injected scripts. */
const COLLECT_SCRIPTS_SCRIPT = `
(() => {
  const collected = new Map();
  const add = (tag) => {
    const key = tag.src ? 'src:' + tag.src : 'inline:' + (tag.text || '');
    if (!collected.has(key)) collected.set(key, tag);
  };
  for (const s of Array.from(document.scripts)) {
    const attrs = {};
    for (const attr of s.attributes) attrs[attr.name] = attr.value;
    add({
      src: s.getAttribute('src'),
      text: s.src ? null : s.textContent,
      integrity: s.getAttribute('integrity'),
      attrs,
    });
  }
  for (const s of (window.__spScripts || [])) {
    add({
      src: s.src,
      text: s.text,
      integrity: s.integrity,
      attrs: JSON.parse(s.attrsJson),
    });
  }
  return Array.from(collected.values());
})();
`;

/** Cache of external script contents, shared across the pages of one site scan. */
export type ScriptContentCache = Map<string, { sha256: string; byteSize: number } | null>;

async function fetchExternalScript(
  url: string,
  cache: ScriptContentCache,
): Promise<{ sha256: string; byteSize: number } | null> {
  if (cache.has(url)) return cache.get(url) ?? null;

  let result: { sha256: string; byteSize: number } | null = null;
  try {
    const res = await fetch(url, {
      headers: { 'user-agent': botUserAgent(botInfoUrl()) },
      redirect: 'follow',
      signal: AbortSignal.timeout(CRAWL_TIMEOUT_MS),
    });
    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.byteLength <= MAX_SCRIPT_BYTES) {
        result = { sha256: sha256Hex(buf), byteSize: buf.byteLength };
      }
    }
  } catch {
    result = null; // unreachable script: recorded with a sentinel hash below
  }
  cache.set(url, result);
  await sleep(SCRIPT_FETCH_DELAY_MS);
  return result;
}

/**
 * Crawls one page (spec 5.1): bot UA, networkidle + 3s settle, collects every
 * script element including ones injected after load (via MutationObserver
 * installed before any page script runs), captures main-document headers.
 * Never submits forms or interacts with the page.
 */
export async function crawlPage(
  browser: Browser,
  pageUrl: string,
  cache: ScriptContentCache,
): Promise<CrawlOutcome> {
  const context = await browser.newContext({
    userAgent: botUserAgent(botInfoUrl()),
    viewport: { width: 1366, height: 900 },
    serviceWorkers: 'block',
  });
  try {
    const page = await context.newPage();

    // Raw strings (not closures): tsx/esbuild transforms inject helpers like
    // `__name` that do not exist inside the browser context.
    await page.addInitScript(INIT_OBSERVER_SCRIPT);

    const response = await page.goto(pageUrl, {
      waitUntil: 'networkidle',
      timeout: CRAWL_TIMEOUT_MS,
    });
    if (!response) throw new Error('No response received for page');
    await page.waitForTimeout(3000);

    const rawTags = (await page.evaluate(COLLECT_SCRIPTS_SCRIPT)) as RawScriptTag[];

    const observed: ObservedScript[] = [];
    for (const tag of rawTags) {
      if (tag.src !== null && tag.src.trim() !== '') {
        const absolute = normalizeScriptUrl(tag.src, pageUrl);
        if (!absolute || (!absolute.startsWith('http://') && !absolute.startsWith('https://'))) {
          continue; // data:/blob:/javascript: srcs have no stable fetchable identity
        }
        const content = await fetchExternalScript(absolute, cache);
        observed.push({
          urlKey: scriptUrlKey(absolute),
          srcUrl: absolute,
          isInline: false,
          // Unfetchable scripts get a sentinel so repeat failures don't churn hashes.
          sha256: content?.sha256 ?? 'unfetchable',
          byteSize: content?.byteSize ?? 0,
          sriPresent: tag.integrity !== null && tag.integrity.trim() !== '',
          attrs: tag.attrs,
        });
      } else {
        const text = tag.text ?? '';
        if (text.trim() === '') continue;
        const hash = sha256Hex(text);
        observed.push({
          urlKey: inlineUrlKey(hash),
          srcUrl: null,
          isInline: true,
          sha256: hash,
          byteSize: Buffer.byteLength(text, 'utf8'),
          sriPresent: false,
          attrs: tag.attrs,
        });
      }
    }

    return {
      httpStatus: response.status(),
      headers: normalizeHeaders(response.headers()),
      observed: dedupeObserved(observed),
    };
  } finally {
    await context.close();
  }
}
