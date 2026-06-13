import { InputReadinessReportSchema } from '@surface-gen/schemas';
import type { FactoryJobState, InputReadinessReport } from '../state/factory-job-state';
import { createJobStep, completeJobStep } from '../services/job-state-store';

/**
 * intake_audit node — Task 010
 *
 * Deterministic readiness check: no LLM call needed.
 * Scores the job inputs and identifies missing critical fields.
 *
 * Scoring:
 *   hasBrandName      → 30 pts
 *   hasFactsheet      → 40 pts
 *   imagesSufficient  → 30 pts (15 pts if images present but < 20)
 *
 * Acceptance criteria (Task 010):
 *   - Valid fixture produces readiness report
 *   - Missing brand name fails or blocks
 *   - Images fewer than 20 are flagged
 */
export async function inputAuditNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'intake_audit');

  try {
    const hasFactsheet = state.inputs.brandFactsheetFileIds.length > 0;
    const imageCount = state.inputs.imageFileIds.length;
    const imageCountSufficient = imageCount >= 20;
    const hasBrandName = Boolean(state.tenantSlug && state.tenantSlug.length > 0);

    const missingCritical: string[] = [];
    const missingRecommended: string[] = [];
    const warnings: string[] = [];

    if (!hasBrandName) missingCritical.push('official_brand_name');
    if (!hasFactsheet) missingCritical.push('brand_factsheet');

    if (imageCount === 0) {
      missingCritical.push('wedding_images (minimum 20 required)');
    } else if (!imageCountSufficient) {
      warnings.push(
        `Image count ${imageCount} is below the recommended minimum of 20. ` +
          'Results may be limited.',
      );
    }

    if (imageCount < 50) {
      missingRecommended.push('More images recommended (50+ for best taxonomy and docent results)');
    }

    const canProceed = missingCritical.length === 0;
    const overallScore = Math.round(
      (hasBrandName ? 30 : 0) +
        (hasFactsheet ? 40 : 0) +
        (imageCountSufficient ? 30 : imageCount > 0 ? 15 : 0),
    );

    const rawReport = {
      overallScore,
      hasBrandName,
      hasFactsheet,
      imageCount,
      imageCountSufficient,
      missingCritical,
      missingRecommended,
      warnings,
      canProceed,
    };

    // CRITICAL: Always Zod-parse before persisting — no raw LLM/computed output allowed
    const report: InputReadinessReport = InputReadinessReportSchema.parse(rawReport);

    if (!canProceed) {
      const failReason = `Input audit failed — missing critical fields: ${missingCritical.join(', ')}`;
      await completeJobStep(stepId, false, failReason);
      return {
        intermediate: { ...state.intermediate, inputReadinessReport: report },
        runtime: {
          ...state.runtime,
          currentNode: 'intake_audit',
          completedNodes: [...state.runtime.completedNodes, 'intake_audit'],
          status: 'failed',
          errorMessage: failReason,
        },
      };
    }

    await completeJobStep(
      stepId,
      true,
      `Score: ${overallScore}/100, images: ${imageCount}, canProceed: true`,
    );

    return {
      intermediate: { ...state.intermediate, inputReadinessReport: report },
      runtime: {
        ...state.runtime,
        currentNode: 'brand_truth',
        completedNodes: [...state.runtime.completedNodes, 'intake_audit'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    throw err;
  }
}
