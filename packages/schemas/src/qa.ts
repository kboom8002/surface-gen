import { z } from 'zod';

/**
 * QA report and gate result schemas.
 * The 12-gate validation system outputs these structures.
 */

export const GateFailureSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  fileName: z.string().optional(),
  assetId: z.string().optional(),
  fieldPath: z.string().optional(),
  expected: z.unknown().optional(),
  actual: z.unknown().optional(),
  recommendedAction: z.string().min(1),
  repairNode: z.string().optional(),
});

export const GateWarningSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
  fieldPath: z.string().optional(),
  assetId: z.string().optional(),
});

export const GateResultSchema = z.object({
  gateId: z.string().min(1),
  gateName: z.string().min(1),
  status: z.enum(['pass', 'warning', 'fail', 'blocked']),
  severity: z.enum(['info', 'warning', 'blocking', 'fatal']),
  checkedAt: z.string().datetime(),
  failures: z.array(GateFailureSchema),
  warnings: z.array(GateWarningSchema),
  summary: z.string().min(1),
});

export const QaReportSchema = z.object({
  projectId: z.string().uuid(),
  jobId: z.string().uuid().optional(),
  tenantSlug: z.string().min(1),
  checkedAt: z.string().datetime(),
  overallStatus: z.enum(['pass', 'warning', 'fail', 'blocked']),
  exportAllowed: z.boolean(),
  exportStatus: z.enum([
    'onboarding_ready',
    'conditional_onboarding_ready',
    'blocked',
  ]),
  gateResults: z.array(GateResultSchema),
  totalFailures: z.number().int().nonnegative(),
  totalWarnings: z.number().int().nonnegative(),
  fatalErrors: z.array(z.string()),
});

export type GateFailure = z.infer<typeof GateFailureSchema>;
export type GateWarning = z.infer<typeof GateWarningSchema>;
export type GateResult = z.infer<typeof GateResultSchema>;
export type QaReport = z.infer<typeof QaReportSchema>;
