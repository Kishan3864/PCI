import { z } from 'zod';

// Zod schemas for every external input boundary (hard rule 6).

export const signUpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.email().max(254),
  password: z.string().min(8).max(128),
});

export const signInSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(1).max(128),
});

export const createSiteSchema = z.object({
  domain: z.string().trim().min(1).max(253),
});

export const verifySiteSchema = z.object({
  siteId: z.string().min(1),
  method: z.enum(['dns', 'meta']),
});

export const createPageSchema = z.object({
  siteId: z.string().min(1),
  url: z.url().max(2000),
  label: z.string().trim().min(1).max(40),
  scanFrequency: z.enum(['daily', '6h']),
});

export const updatePageSchema = z.object({
  pageId: z.string().min(1),
  label: z.string().trim().min(1).max(40).optional(),
  scanFrequency: z.enum(['daily', '6h']).optional(),
  isActive: z.boolean().optional(),
});

export const deletePageSchema = z.object({
  pageId: z.string().min(1),
});

/** 6.4.3 authorization workflow: written justification is REQUIRED (min 10 chars). */
export const justifyScriptSchema = z.object({
  scriptId: z.string().min(1),
  action: z.enum(['authorized', 'blocked']),
  justification: z
    .string()
    .trim()
    .min(10, 'Justification must be at least 10 characters')
    .max(2000),
});

export const acknowledgeChangeSchema = z.object({
  changeId: z.string().min(1),
});

export const scanNowSchema = z.object({
  siteId: z.string().min(1),
  pageId: z.string().min(1).optional(),
});

export const freeScanSubmitSchema = z.object({
  url: z.url().max(2000),
});

// ── Runtime agent ingest (Phase 3.1) ─────────────────────────────────────────
// The browser snippet is dumb and fail-silent; ALL validation happens here.

/** Hard cap on the raw request body accepted by the agent ingest route. */
export const AGENT_MAX_BODY_BYTES = 64 * 1024;
/** Max scripts reported in a single agent payload. */
export const AGENT_MAX_SCRIPTS = 100;
/** Max length of any URL (page or script src) in an agent payload (≤2KB). */
export const AGENT_MAX_URL_LENGTH = 2048;

/** One script observed by the runtime agent in a real shopper's browser. */
export const agentScriptReportSchema = z
  .object({
    /** External script src (absolute or relative to the page URL). */
    src: z.string().min(1).max(AGENT_MAX_URL_LENGTH).optional(),
    /** SHA-256 hex of inline script text (when crypto.subtle was available). */
    sha256: z
      .string()
      .regex(/^[0-9a-f]{64}$/)
      .optional(),
    /** Inline script text length in characters. */
    size: z.number().int().min(0).max(10_000_000).optional(),
    /** True when the script was injected after page load (MutationObserver). */
    injected: z.boolean().optional(),
  })
  .refine((s) => s.src !== undefined || s.sha256 !== undefined, {
    message: 'script must carry a src or an inline sha256',
  });

export const agentIngestSchema = z.object({
  v: z.literal(1),
  /** location.href of the page the agent ran on. */
  url: z.string().min(1).max(AGENT_MAX_URL_LENGTH),
  scripts: z.array(agentScriptReportSchema).min(1).max(AGENT_MAX_SCRIPTS),
});

export const freeScanEmailSchema = z.object({
  scanId: z.string().min(1),
  email: z.email().max(254),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type JustifyScriptInput = z.infer<typeof justifyScriptSchema>;
export type AgentScriptReport = z.infer<typeof agentScriptReportSchema>;
export type AgentIngestPayload = z.infer<typeof agentIngestSchema>;
