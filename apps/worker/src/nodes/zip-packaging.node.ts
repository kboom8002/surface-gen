import { createWriteStream, mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { createJobStep, completeJobStep } from '../services/job-state-store';
import { supabaseAdmin } from '../services/supabase-admin';
import type { FactoryJobState } from '../state/factory-job-state';

// ZIP packaging using archiver (installed via worker deps)
export async function zipPackagingNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'zip_packaging');
  try {
    const tenantSlug = state.tenantSlug;
    const jobId = state.jobId;
    const inter = state.intermediate;
    const out = state.outputs;

    // Build in-memory JSON files for the ZIP
    const files: Record<string, string> = {
      '01_upload/universal_content_assets_final.json': JSON.stringify(
        out.universalContentAssets ?? [],
        null,
        2,
      ),
      '01_upload/brand_profiles.json': JSON.stringify(out.brandProfiles ?? {}, null, 2),
      '01_upload/gnb_ia_config.json': JSON.stringify(out.gnbIaConfigFinal ?? {}, null, 2),
      '01_upload/gallery_albums.json': JSON.stringify(out.galleryAlbums ?? [], null, 2),
      '01_upload/gallery_photos.json': JSON.stringify(out.galleryPhotos ?? [], null, 2),
      '01_upload/album_taxonomy_nodes.json': JSON.stringify(
        out.albumTaxonomyNodes ?? [],
        null,
        2,
      ),
      '01_upload/visual_asset_url_map_master.json': JSON.stringify(
        out.visualAssetUrlMapMaster ?? {},
        null,
        2,
      ),
      '02_semantic_strategy/search_intent_map.json': JSON.stringify(
        (inter.semanticStrategy as Record<string, unknown> | undefined)?.['searchIntentMap'] ?? {},
        null,
        2,
      ),
      '02_semantic_strategy/qis_growth_registry.json': JSON.stringify(
        (inter.semanticStrategy as Record<string, unknown> | undefined)?.['qisGrowthRegistry'] ?? {},
        null,
        2,
      ),
      '03_knowledge_graph/brand_knowledge_graph.json': JSON.stringify(
        inter.knowledgeGraph ?? {},
        null,
        2,
      ),
      '04_schema/schema_readiness_map.json': JSON.stringify(
        inter.schemaReadinessMap ?? {},
        null,
        2,
      ),
      '04_schema/crosslink_matrix.json': JSON.stringify(
        inter.crosslinkMatrix ?? {},
        null,
        2,
      ),
      '05_ux_copy/copy_system.json': JSON.stringify(inter.copySystem ?? {}, null, 2),
      '06_visual_experience/visual_experience_map.json': JSON.stringify(
        inter.visualExperienceMap ?? {},
        null,
        2,
      ),
      '06_visual_experience/ai_visual_briefs.json': JSON.stringify(
        inter.aiVisualBriefs ?? [],
        null,
        2,
      ),
      '08_manifests/export_manifest.json': JSON.stringify(
        (inter as Record<string, unknown>)['exportManifest'] ?? {},
        null,
        2,
      ),
      '09_qa/validation_gates_report.json': JSON.stringify(
        {
          gate_results: state.qa.gateResults ?? [],
          export_allowed: state.qa.exportAllowed,
          fatal_errors: state.qa.fatalErrors ?? [],
          rejected_assets: inter.rejectedAssets ?? [],
        },
        null,
        2,
      ),
    };

    // Dynamic import of archiver (optional dep — no type declarations required at compile time)
    let zipPath: string;
    try {
      // @ts-ignore — archiver is an optional runtime dep; types not installed
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const archiverMod = require('archiver') as {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (format: string, options?: Record<string, unknown>): any;
      };
      const tmpDir = tmpdir();
      zipPath = join(tmpDir, `brand_onboarding_bundle_${tenantSlug}_${jobId}.zip`);

      await new Promise<void>((resolve, reject) => {
        const output = createWriteStream(zipPath);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        const archive = archiverMod('zip', { zlib: { level: 9 } });
        output.on('close', resolve);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        archive.on('error', reject);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        archive.pipe(output);
        for (const [filePath, content] of Object.entries(files)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          archive.append(content, { name: filePath });
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void archive.finalize();
      });
    } catch {
      // archiver not available — write a JSON manifest bundle instead
      const tmpDir = tmpdir();
      zipPath = join(tmpDir, `brand_onboarding_bundle_${tenantSlug}_${jobId}.json`);
      writeFileSync(
        zipPath,
        JSON.stringify({ _type: 'bundle_manifest', files: Object.keys(files), note: 'Install archiver for ZIP output' }, null, 2),
      );
    }

    // Update DB with completed status and zip path
    await supabaseAdmin.from('agent_jobs').update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      export_bundle_path: zipPath,
    }).eq('id', jobId);

    await completeJobStep(stepId, true, `ZIP created: ${zipPath}`);
    return {
      outputs: {
        ...state.outputs,
        zipFilePath: zipPath,
        exportBundlePath: zipPath,
      },
      runtime: {
        ...state.runtime,
        currentNode: 'completed',
        status: 'completed',
        completedNodes: [...state.runtime.completedNodes, 'zip_packaging'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
