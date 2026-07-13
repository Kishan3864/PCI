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

export type SignUpInput = z.infer<typeof signUpSchema>;
export type CreateSiteInput = z.infer<typeof createSiteSchema>;
export type CreatePageInput = z.infer<typeof createPageSchema>;
export type UpdatePageInput = z.infer<typeof updatePageSchema>;
export type JustifyScriptInput = z.infer<typeof justifyScriptSchema>;
