import { supabaseAdmin } from '../services/supabase-admin.js';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';

export async function photoInventoryNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'photo_inventory');
  try {
    const tenantSlug = state.tenantSlug;
    const albumId = `${tenantSlug}_album_001`;

    const { data: sourceImages } = await supabaseAdmin
      .from('source_images')
      .select('id, file_name, storage_path, rights_status, public_use_allowed')
      .eq('project_id', state.projectId)
      .order('created_at', { ascending: true });

    const images = sourceImages ?? [];

    const photos = images.map((img, idx) => {
      const paddedIdx = String(idx + 1).padStart(3, '0');
      const photoId = `${albumId}_photo_${paddedIdx}`;
      return {
        sourceImageId: img['id'] as string,
        albumId,
        photoId,
        fileName: img['file_name'] as string,
        imagePath: `images/albums/${albumId}/${img['file_name'] as string}`,
        rightsStatus: (img['rights_status'] as string | null) ?? 'unknown',
        publicUseAllowed: (img['public_use_allowed'] as boolean | null) ?? false,
        sortOrder: idx,
      };
    });

    const photoInventory = {
      albumId,
      albumSlug: `${tenantSlug}-wedding-gallery`,
      albumTitle: `${state.intermediate.brandTruthSheet?.officialBrandName ?? tenantSlug} 갤러리`,
      photos,
    };

    await completeJobStep(
      stepId,
      true,
      `Photo inventory: ${photos.length} photos in ${albumId}`,
    );
    return {
      intermediate: { ...state.intermediate, photoInventory },
      runtime: {
        ...state.runtime,
        currentNode: 'photo_taxonomy',
        completedNodes: [...state.runtime.completedNodes, 'photo_inventory'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
