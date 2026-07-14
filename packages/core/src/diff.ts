import { diffTrackedHeaders } from './headers';
import { dedupeObserved, isPaymentPage } from './scripts';
import type { DiffInput, DiffResult, ProposedChange, ScriptUpdate } from './types';

/** An authorized script must be absent this many consecutive scans before `script_removed` fires. */
export const REMOVAL_STREAK_THRESHOLD = 3;

/**
 * Pure diff engine (spec 5.2). Compares one page scan against the site's
 * current inventory state and the page's previous headers. Persistence is the
 * caller's job: create `toCreate` as pending, apply `updates`, store `changes`.
 */
export function diffScan(input: DiffInput): DiffResult {
  const observed = dedupeObserved(input.observed);

  // First scan of a page = baseline: inventory rows only, no alerts. Scripts
  // already in the site inventory (seen on another page) are only touched for
  // presence bookkeeping — their recorded hash/SRI are preserved so a tamper
  // that happened before this new page was added is not silently absorbed.
  if (input.isBaseline) {
    const knownKeys = new Set(input.known.map((k) => k.urlKey));
    return {
      changes: [],
      toCreate: observed.filter((o) => !knownKeys.has(o.urlKey)),
      updates: observed.flatMap((o) => {
        const known = input.known.find((k) => k.urlKey === o.urlKey);
        return known ? [seenBookkeeping(known.id)] : [];
      }),
    };
  }

  const changes: ProposedChange[] = [];
  const updates: ScriptUpdate[] = [];
  const toCreate: DiffResult['toCreate'] = [];

  const knownByKey = new Map(input.known.map((k) => [k.urlKey, k]));
  const observedKeys = new Set(observed.map((o) => o.urlKey));
  const paymentPage = isPaymentPage(input.pageLabel);

  for (const obs of observed) {
    const known = knownByKey.get(obs.urlKey);

    if (!known) {
      // Never seen anywhere on this site before.
      toCreate.push(obs);
      changes.push({
        type: 'new_script',
        severity: paymentPage ? 'critical' : 'warning',
        scriptId: null,
        urlKey: obs.urlKey,
        detail: {
          srcUrl: obs.srcUrl,
          isInline: obs.isInline,
          sha256: obs.sha256,
          byteSize: obs.byteSize,
          sriPresent: obs.sriPresent,
        },
      });
      continue;
    }

    updates.push(seenUpdate(known.id, obs));

    // Unfetchable scripts carry a placeholder hash — never a real content
    // change. Skip modified detection so a transient network blip can't raise a
    // false critical alert or overwrite the last known good hash.
    if (!obs.unfetchable && known.latestSha256 !== null && known.latestSha256 !== obs.sha256) {
      changes.push({
        type: 'script_modified',
        severity: known.status === 'authorized' ? 'critical' : 'warning',
        scriptId: known.id,
        urlKey: known.urlKey,
        detail: {
          srcUrl: obs.srcUrl,
          before: known.latestSha256,
          after: obs.sha256,
          byteSize: obs.byteSize,
        },
      });
    }

    if (known.latestSriPresent && !obs.sriPresent) {
      changes.push({
        type: 'sri_removed',
        severity: 'warning',
        scriptId: known.id,
        urlKey: known.urlKey,
        detail: { srcUrl: obs.srcUrl, sha256: obs.sha256 },
      });
    }
  }

  // Missing scripts: only evaluated for scripts anchored to this page, so
  // scans of other pages never advance a script's missing streak.
  for (const known of input.known) {
    if (!known.expectedOnPage || observedKeys.has(known.urlKey)) continue;

    const missingStreak = known.missingStreak + 1;
    updates.push({ scriptId: known.id, seen: false, missingStreak });

    if (known.status === 'authorized' && missingStreak === REMOVAL_STREAK_THRESHOLD) {
      changes.push({
        type: 'script_removed',
        severity: 'info',
        scriptId: known.id,
        urlKey: known.urlKey,
        detail: { urlKey: known.urlKey, missedScans: missingStreak },
      });
    }
  }

  if (input.prevHeaders !== null) {
    changes.push(...diffTrackedHeaders(input.prevHeaders, input.headers));
  }

  return { changes, toCreate, updates };
}

/** Full "seen" update; preserves the last known good hash when unfetchable. */
function seenUpdate(scriptId: string, obs: DiffResult['toCreate'][number]): ScriptUpdate {
  if (obs.unfetchable) {
    // Present in the DOM (so reset the missing streak and record SRI), but the
    // body could not be fetched — leave the recorded hash/size untouched.
    return {
      scriptId,
      seen: true,
      missingStreak: 0,
      latestSriPresent: obs.sriPresent,
      srcUrl: obs.srcUrl,
    };
  }
  return {
    scriptId,
    seen: true,
    missingStreak: 0,
    latestSha256: obs.sha256,
    latestByteSize: obs.byteSize,
    latestSriPresent: obs.sriPresent,
    srcUrl: obs.srcUrl,
  };
}

/** Presence-only update: marks the script seen without altering its recorded state. */
function seenBookkeeping(scriptId: string): ScriptUpdate {
  return { scriptId, seen: true, missingStreak: 0 };
}
