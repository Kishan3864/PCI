export type ScriptStatus = 'pending' | 'authorized' | 'blocked';

export type ChangeType =
  | 'new_script'
  | 'script_modified'
  | 'script_removed'
  | 'header_changed'
  | 'sri_removed';

export type ChangeSeverity = 'info' | 'warning' | 'critical';

export type ScanFrequency = 'daily' | '6h';

export type PlanId = 'starter' | 'pro' | 'agency';

/** A script as observed by the crawler in a single page scan. */
export interface ObservedScript {
  /** Identity key: absolute URL without query/fragment, or `inline:<sha256>`. */
  urlKey: string;
  /** Absolute source URL (with query) or null for inline scripts. */
  srcUrl: string | null;
  isInline: boolean;
  sha256: string;
  byteSize: number;
  sriPresent: boolean;
  attrs: Record<string, string>;
}

/** Current inventory state of a script, as needed by the diff engine. */
export interface KnownScript {
  id: string;
  urlKey: string;
  isInline: boolean;
  status: ScriptStatus;
  latestSha256: string | null;
  latestSriPresent: boolean;
  missingStreak: number;
  /** True when this script was last seen on the page being diffed. */
  expectedOnPage: boolean;
}

export interface DiffInput {
  pageLabel: string;
  /** True when this page has no previous successful scan (baseline). */
  isBaseline: boolean;
  observed: ObservedScript[];
  /** Full site inventory. */
  known: KnownScript[];
  /** Normalized (lowercase-keyed) response headers of this scan. */
  headers: Record<string, string>;
  /** Headers of the previous successful scan, or null if none. */
  prevHeaders: Record<string, string> | null;
}

export interface ProposedChange {
  type: ChangeType;
  severity: ChangeSeverity;
  /** Inventory id for changes on known scripts; null for header changes. */
  scriptId: string | null;
  /** Identity key for script changes (lets the caller link new_script rows). */
  urlKey: string | null;
  detail: Record<string, unknown>;
}

export interface ScriptUpdate {
  scriptId: string;
  /** True when the script was observed in this scan. */
  seen: boolean;
  missingStreak: number;
  latestSha256?: string;
  latestByteSize?: number;
  latestSriPresent?: boolean;
  srcUrl?: string | null;
}

export interface DiffResult {
  changes: ProposedChange[];
  /** New scripts to insert into the inventory with status `pending`. */
  toCreate: ObservedScript[];
  updates: ScriptUpdate[];
}
