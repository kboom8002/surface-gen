import { z } from 'zod';

/**
 * Input readiness report schema.
 * Output of the intake_audit node — determines if the job can proceed.
 *
 * Scoring:
 *   hasBrandName   → 30 points
 *   hasFactsheet   → 40 points
 *   imagesSufficient → 30 points (15 if present but < 20)
 *
 * canProceed = true only when missingCritical is empty.
 */
export const InputReadinessReportSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  hasBrandName: z.boolean(),
  hasFactsheet: z.boolean(),
  imageCount: z.number().int().nonnegative(),
  imageCountSufficient: z.boolean(),
  missingCritical: z.array(z.string()),
  missingRecommended: z.array(z.string()),
  warnings: z.array(z.string()),
  canProceed: z.boolean(),
});

export type InputReadinessReport = z.infer<typeof InputReadinessReportSchema>;
