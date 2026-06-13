import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { PhotoTaxonomySchema } from '@surface-gen/schemas';

export async function photoTaxonomyNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'photo_taxonomy');
  try {
    const inv = state.intermediate.photoInventory as
      | { photos: Array<{ photoId: string }> }
      | undefined;
    const photos = inv?.photos ?? [];

    if (photos.length === 0) {
      await completeJobStep(stepId, true, 'No photos to classify');
      return {
        intermediate: { ...state.intermediate, photoTaxonomy: { taxonomies: [] } },
        runtime: {
          ...state.runtime,
          currentNode: 'photo_docent',
          completedNodes: [...state.runtime.completedNodes, 'photo_taxonomy'],
        },
      };
    }

    // MVP: assign default taxonomy (vision analysis deferred to handoff import)
    // CRITICAL: Never infer exact location, season, dress brand, or fabric
    const defaultTaxonomy = PhotoTaxonomySchema.parse({
      scene: 'indoor_studio',
      subject_tags: ['couple', 'dress'],
      mood_tags: ['romantic', 'elegant'],
      style_tags: ['classic', 'modern'],
      composition_tags: ['full_body', 'posed'],
      vibe_vector: {
        bright_to_moody: 2,
        natural_to_editorial: 3,
        relaxed_to_formal: 4,
        minimal_to_luxury: 3,
        intimate_to_grand: 2,
        documentary_to_directed: 4,
      },
      confidence: 0.5,
      uncertainty_note: '기본 분류 적용 — 비전 분석 핸드오프 대기 중',
    });

    const taxonomies = photos.map((p) => ({
      photoId: p.photoId,
      taxonomy: defaultTaxonomy,
      analysisSource: 'default_placeholder',
    }));

    await completeJobStep(stepId, true, `Taxonomy assigned: ${taxonomies.length} photos`);
    return {
      intermediate: { ...state.intermediate, photoTaxonomy: { taxonomies } },
      runtime: {
        ...state.runtime,
        currentNode: 'photo_docent',
        completedNodes: [...state.runtime.completedNodes, 'photo_taxonomy'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
