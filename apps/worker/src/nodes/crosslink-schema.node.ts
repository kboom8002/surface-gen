import { createJobStep, completeJobStep } from '../services/job-state-store';
import type { FactoryJobState } from '../state/factory-job-state';

export async function crosslinkSchemaNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'crosslink_schema');
  try {
    const tenantSlug = state.tenantSlug;
    const portfolioAssets = (state.intermediate.portfolioAssets as Array<{ id: string }>) ?? [];
    const catalogAssets = (state.intermediate.catalogAssets as Array<{ id: string }>) ?? [];
    const answerAssets = (state.intermediate.answerAssets as Array<{ id: string }>) ?? [];
    const articleAssets = (state.intermediate.articleAssets as Array<{ id: string }>) ?? [];
    const aboutContactAssets =
      (state.intermediate.aboutContactAssets as Array<{ id: string }>) ?? [];

    const crosslinkMatrix = {
      tenantSlug,
      crosslinks: [
        ...portfolioAssets.slice(0, 3).map((a) => ({
          fromId: a.id,
          toIds: catalogAssets.slice(0, 2).map((c) => c.id),
          linkType: 'see_programs',
        })),
        ...answerAssets.map((a) => ({
          fromId: a.id,
          toIds: portfolioAssets.slice(0, 1).map((p) => p.id),
          linkType: 'see_portfolio',
        })),
        ...articleAssets.map((a) => ({
          fromId: a.id,
          toIds: portfolioAssets.slice(0, 2).map((p) => p.id),
          linkType: 'related_portfolio',
        })),
      ],
    };

    const schemaReadinessMap = {
      tenantSlug,
      schemas: [
        {
          pageKey: 'portfolio',
          targetSchemaType: 'ImageGallery',
          assignedAssetIds: portfolioAssets.map((a) => a.id),
          readinessScore: 0.7,
          missingFields: ['image_url'],
        },
        {
          pageKey: 'catalog',
          targetSchemaType: 'Product',
          assignedAssetIds: catalogAssets.map((a) => a.id),
          readinessScore: 0.5,
          missingFields: ['price', 'offers'],
        },
        {
          pageKey: 'answers',
          targetSchemaType: 'FAQPage',
          assignedAssetIds: [...answerAssets.map((a) => a.id), ...articleAssets.map((a) => a.id)],
          readinessScore: 0.8,
          missingFields: [],
        },
        {
          pageKey: 'about',
          targetSchemaType: 'LocalBusiness',
          assignedAssetIds: aboutContactAssets.map((a) => a.id),
          readinessScore: 0.5,
          missingFields: ['telephone', 'address', 'openingHours'],
        },
      ],
    };

    await completeJobStep(
      stepId,
      true,
      `Crosslinks: ${crosslinkMatrix.crosslinks.length}, Schema: ${schemaReadinessMap.schemas.length} pages`,
    );
    return {
      intermediate: {
        ...state.intermediate,
        crosslinkMatrix,
        schemaReadinessMap,
      },
      runtime: {
        ...state.runtime,
        currentNode: 'ssot_materialization',
        completedNodes: [...state.runtime.completedNodes, 'crosslink_schema'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
