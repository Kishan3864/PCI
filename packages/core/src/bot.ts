/** Crawler identity (hard rule 3): honest UA pointing at the bot info page. */
export function botUserAgent(infoUrl: string): string {
  return `ScriptProofBot/1.0 (+${infoUrl})`;
}

export const CRAWL_TIMEOUT_MS = 30_000;
/** Minimum spacing between page fetches on the same site. */
export const PER_SITE_FETCH_INTERVAL_MS = 2_000;
