import { createWriteStream, mkdirSync } from 'fs';
import { join } from 'path';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import { supabaseAdmin } from '../services/supabase-admin.js';
import type { FactoryJobState } from '../state/factory-job-state.js';

export async function jsonExportNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'json_export');
  try {
    const tenantSlug = state.tenantSlug;
    const jobId = state.jobId;
    const inter = state.intermediate;
    const out = state.outputs;

    // Build the canonical output bundle structure (01_upload folder)
    const bundle = {
      universal_content_assets_final: out.universalContentAssets ?? [],
      brand_profiles: {
        tenant_slug: tenantSlug,
        brand_name: inter.brandTruthSheet?.officialBrandName ?? tenantSlug,
        industry_type: 'wedding_sdm',
        positioning: inter.brandTruthSheet?.positioning,
        programs: inter.brandTruthSheet?.programs ?? [],
        verified_facts: inter.brandTruthSheet?.verifiedFacts ?? [],
        review_required: inter.brandTruthSheet?.reviewRequired ?? [],
        forbidden_claims: inter.brandTruthSheet?.forbiddenClaims ?? [],
      },
      gnb_ia_config: inter.gnbIaConfig ?? {},
      gallery_albums: inter.photoInventory
        ? {
            albumId: (inter.photoInventory as Record<string, unknown>)['albumId'],
            albumSlug: (inter.photoInventory as Record<string, unknown>)['albumSlug'],
            albumTitle: (inter.photoInventory as Record<string, unknown>)['albumTitle'],
            photoCount: (
              (inter.photoInventory as Record<string, unknown>)['photos'] as unknown[]
            ).length,
          }
        : {},
      gallery_photos: inter.photoInventory
        ? (inter.photoInventory as Record<string, unknown>)['photos']
        : [],
      album_taxonomy_nodes: inter.photoTaxonomy
        ? (inter.photoTaxonomy as Record<string, unknown>)['taxonomies']
        : [],
      visual_asset_url_map_master: {
        actual_photos: inter.visualExperienceMap ?? {},
        ai_visual_briefs: inter.aiVisualBriefs ?? [],
        // ai_visual_briefs.canRepresentActualWork is always false
      },
    };

    // Semantic strategy outputs (02_semantic_strategy)
    const semanticOutput = {
      search_intent_map: (inter.semanticStrategy as Record<string, unknown> | undefined)?.['searchIntentMap'] ?? {},
      qis_growth_registry: (inter.semanticStrategy as Record<string, unknown> | undefined)?.['qisGrowthRegistry'] ?? {},
      entity_keyword_map: (inter.semanticStrategy as Record<string, unknown> | undefined)?.['entityKeywordMap'] ?? {},
    };

    // Knowledge graph (03_knowledge_graph)
    const kgOutput = inter.knowledgeGraph ?? {};

    // Schema readiness (04_schema)
    const schemaOutput = {
      schema_readiness_map: inter.schemaReadinessMap ?? {},
    };

    // UX copy (05_ux_copy)
    const copyOutput = inter.copySystem ?? {};

    // Visual experience (06_visual_experience)
    const visualOutput = {
      visual_experience_map: inter.visualExperienceMap ?? {},
      ai_visual_briefs: inter.aiVisualBriefs ?? [],
      crosslink_matrix: inter.crosslinkMatrix ?? {},
    };

    // QA reports (09_qa)
    const qaOutput = {
      validation_gates: state.qa.gateResults ?? [],
      export_allowed: state.qa.exportAllowed,
      fatal_errors: state.qa.fatalErrors ?? [],
      rejected_assets: inter.rejectedAssets ?? [],
    };

    // Persist the bundle as JSON to generated_assets or a dedicated export record
    const exportManifest = {
      job_id: jobId,
      tenant_slug: tenantSlug,
      export_timestamp: new Date().toISOString(),
      asset_count: (out.universalContentAssets ?? []).length,
      export_allowed: state.qa.exportAllowed,
      bundle_sections: [
        '01_upload',
        '02_semantic_strategy',
        '03_knowledge_graph',
        '04_schema',
        '05_ux_copy',
        '06_visual_experience',
        '09_qa',
      ],
    };

    // Save export record to DB
    await supabaseAdmin.from('export_bundles').insert({
      project_id: state.projectId,
      job_id: jobId,
      tenant_slug: tenantSlug,
      bundle_manifest: exportManifest,
      upload_bundle: bundle,
      semantic_strategy: semanticOutput,
      knowledge_graph: kgOutput,
      schema_map: schemaOutput,
      ux_copy: copyOutput,
      visual_experience: visualOutput,
      qa_report: qaOutput,
      status: state.qa.exportAllowed ? 'ready_for_zip' : 'blocked_by_qa',
    });

    await completeJobStep(stepId, true, `JSON export complete: ${exportManifest.asset_count} assets`);
    return {
      outputs: {
        ...state.outputs,
        brandProfiles: bundle.brand_profiles,
        gnbIaConfigFinal: bundle.gnb_ia_config,
        galleryAlbums: [bundle.gallery_albums],
        galleryPhotos: bundle.gallery_photos as unknown[],
        albumTaxonomyNodes: bundle.album_taxonomy_nodes as unknown[],
        visualAssetUrlMapMaster: bundle.visual_asset_url_map_master,
      },
      intermediate: {
        ...state.intermediate,
        exportManifest,
      } as typeof state.intermediate,
      runtime: {
        ...state.runtime,
        currentNode: 'zip_packaging',
        completedNodes: [...state.runtime.completedNodes, 'json_export'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
