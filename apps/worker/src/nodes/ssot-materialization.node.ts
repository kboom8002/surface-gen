import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import { supabaseAdmin } from '../services/supabase-admin.js';
import type { FactoryJobState } from '../state/factory-job-state.js';
import {
  UniversalContentAssetSchema,
  FORBIDDEN_PUBLIC_UCA_TYPES,
} from '@surface-gen/schemas';
import type { UniversalContentAsset } from '@surface-gen/schemas';

interface RejectedAsset {
  id: string;
  type: string;
  reason: string;
}

export async function ssotMaterializationNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'ssot_materialization');
  try {
    const inter = state.intermediate;
    const allRawAssets: unknown[] = [
      ...((inter.portfolioAssets as unknown[]) ?? []),
      ...((inter.catalogAssets as unknown[]) ?? []),
      ...((inter.answerAssets as unknown[]) ?? []),
      ...((inter.articleAssets as unknown[]) ?? []),
      ...((inter.aboutContactAssets as unknown[]) ?? []),
    ];

    const validatedAssets: UniversalContentAsset[] = [];
    const rejectedAssets: RejectedAsset[] = [];

    for (const raw of allRawAssets) {
      const rawObj = raw as Record<string, unknown>;
      const id = (rawObj['id'] as string | undefined) ?? 'unknown';
      const type = (rawObj['type'] as string | undefined) ?? 'unknown';

      // Block forbidden UCA types
      if (FORBIDDEN_PUBLIC_UCA_TYPES.includes(type as never)) {
        rejectedAssets.push({ id, type, reason: 'FORBIDDEN_UCA_TYPE' });
        continue;
      }

      // Always Zod-parse — no raw LLM output goes to DB
      const parsed = UniversalContentAssetSchema.safeParse(raw);
      if (!parsed.success) {
        rejectedAssets.push({ id, type, reason: parsed.error.message });
        continue;
      }
      validatedAssets.push(parsed.data);
    }

    // Enforce unique IDs
    const ids = validatedAssets.map((a) => a.id);
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (duplicates.length > 0) {
      throw new Error(`Duplicate UCA IDs: ${duplicates.join(', ')}`);
    }

    // Persist to generated_assets table
    if (validatedAssets.length > 0) {
      const { error } = await supabaseAdmin.from('generated_assets').insert(
        validatedAssets.map((a) => ({
          project_id: state.projectId,
          job_id: state.jobId,
          uca_id: a.id,
          tenant_id: a.tenant_id,
          asset_type: a.type,
          category: a.category,
          title: a.title,
          slug: a.slug,
          summary: a.summary,
          body: a.body,
          body_richtext: a.body_richtext,
          status: a.status,
          review_status: a.review_status,
          sort_order: a.sort_order,
          json_payload: a.json_payload,
        })),
      );
      if (error) {
        throw new Error(`Failed to persist UCAs: ${error.message}`);
      }
    }

    await completeJobStep(
      stepId,
      true,
      `SSoT materialized: ${validatedAssets.length} assets, rejected: ${rejectedAssets.length}`,
    );
    return {
      outputs: {
        ...state.outputs,
        universalContentAssets: validatedAssets,
      },
      intermediate: {
        ...state.intermediate,
        rejectedAssets,
      },
      runtime: {
        ...state.runtime,
        currentNode: 'validation_gates',
        completedNodes: [...state.runtime.completedNodes, 'ssot_materialization'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
