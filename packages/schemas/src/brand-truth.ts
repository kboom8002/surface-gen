import { z } from 'zod';

/**
 * Brand truth sheet schema.
 * Output of the brand_truth node — classifies what we know, what we assume,
 * what needs review, and what is forbidden to claim.
 *
 * Non-negotiables (AGENTS.md):
 * - Never invent reviews, awards, certifications, partnerships, media mentions.
 * - Never invent exact prices, refund terms, delivery guarantees.
 * - Missing facts go in reviewRequired; fabricated claims are forbidden.
 */

export const BrandTruthProgramSchema = z.object({
  name: z.string().min(1),
  included: z.array(z.string()).optional(),
  excluded: z.array(z.string()).optional(),
});

export const BrandTruthPolicySchema = z.object({
  type: z.string().min(1),
  summary: z.string().min(1),
});

export const VerifiedFactSchema = z.object({
  fact: z.string().min(1),
  source: z.string().min(1),
});

export const AssumptionSchema = z.object({
  assumption: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

export const ReviewRequiredItemSchema = z.object({
  field: z.string().min(1),
  reason: z.string().min(1),
});

export const BrandTruthSheetSchema = z.object({
  tenantSlug: z.string().min(1),
  officialBrandName: z.string().min(1),
  positioning: z.string().optional(),
  coreAudience: z.array(z.string()).optional(),
  doNotMisread: z.array(z.string()).optional(),
  serviceDomains: z.array(z.string()).optional(),
  programs: z.array(BrandTruthProgramSchema).optional(),
  pricingBasis: z.string().optional(),
  policies: z.array(BrandTruthPolicySchema).optional(),
  verifiedFacts: z.array(VerifiedFactSchema).optional(),
  assumptions: z.array(AssumptionSchema).optional(),
  reviewRequired: z.array(ReviewRequiredItemSchema).optional(),
  forbiddenClaims: z.array(z.string()).optional(),
});

export type BrandTruthSheet = z.infer<typeof BrandTruthSheetSchema>;
export type BrandTruthProgram = z.infer<typeof BrandTruthProgramSchema>;
export type BrandTruthPolicy = z.infer<typeof BrandTruthPolicySchema>;
export type VerifiedFact = z.infer<typeof VerifiedFactSchema>;
export type Assumption = z.infer<typeof AssumptionSchema>;
export type ReviewRequiredItem = z.infer<typeof ReviewRequiredItemSchema>;
