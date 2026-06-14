import { createJobStep, completeJobStep } from '../services/job-state-store';
import type { FactoryJobState } from '../state/factory-job-state';

export async function visualExperienceNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'visual_experience');
  try {
    const inv = state.intermediate.photoInventory as
      | {
          albumId: string;
          photos: Array<{
            photoId: string;
            rightsStatus: string;
            publicUseAllowed: boolean;
          }>;
        }
      | undefined;
    const photos = inv?.photos ?? [];

    // Only approved/rights-cleared photos can be hero or cover
    // NEVER use unknown-rights photos for hero
    const approvedPhotos = photos.filter(
      (p) => p.publicUseAllowed || p.rightsStatus === 'approved',
    );

    const heroPhoto = approvedPhotos[0] ?? null;
    const coverPhotos = approvedPhotos.slice(0, 3);

    const visualExperienceMap = {
      tenantSlug: state.tenantSlug,
      heroPhoto: heroPhoto
        ? {
            photoId: heroPhoto.photoId,
            role: 'home_hero',
            isAiVisual: false,
            canRepresentActualWork: true,
          }
        : null,
      pageVisualSequence: {
        home: coverPhotos.map((p, i) => ({
          photoId: p.photoId,
          role: i === 0 ? 'hero' : 'supporting',
          isAiVisual: false,
          canRepresentActualWork: true,
        })),
        portfolio: photos.slice(0, 20).map((p) => ({
          photoId: p.photoId,
          role: 'portfolio_proof',
          isAiVisual: false,
          canRepresentActualWork: true,
        })),
        gallery: photos.map((p) => ({
          photoId: p.photoId,
          role: 'gallery_item',
          isAiVisual: false,
          canRepresentActualWork: true,
        })),
        about: approvedPhotos.slice(0, 3).map((p) => ({
          photoId: p.photoId,
          role: 'brand_illustration',
          isAiVisual: false,
          canRepresentActualWork: true,
        })),
      },
      // AI visual slots — separate from actual photos
      // canRepresentActualWork ALWAYS false for AI visuals
      aiVisualSlots: [
        {
          slotId: 'catalog_concept',
          allowedPages: ['catalog'],
          prohibitedPages: ['portfolio', 'gallery'],
          canRepresentActualWork: false,
          intendedUse: 'package_concept_visual',
        },
        {
          slotId: 'process_illustration',
          allowedPages: ['answers', 'about'],
          prohibitedPages: ['portfolio', 'gallery'],
          canRepresentActualWork: false,
          intendedUse: 'service_process_visual',
        },
      ],
    };

    await completeJobStep(
      stepId,
      true,
      `Visual map: hero=${heroPhoto?.photoId ?? 'none'}, approved=${approvedPhotos.length}/${photos.length}`,
    );
    return {
      intermediate: { ...state.intermediate, visualExperienceMap },
      runtime: {
        ...state.runtime,
        currentNode: 'ai_visual_os',
        completedNodes: [...state.runtime.completedNodes, 'visual_experience'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
