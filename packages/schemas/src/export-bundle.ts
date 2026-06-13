import { z } from 'zod';

/**
 * Export bundle schemas — for the final onboarding ZIP package.
 * The canonical package structure:
 *   brand_onboarding_bundle/
 *   ├── 01_upload/
 *   ├── 02_semantic_strategy/
 *   ├── 03_knowledge_graph/
 *   ├── 04_schema/
 *   ├── 05_ux_copy/
 *   ├── 06_visual_experience/
 *   ├── 07_growth/
 *   ├── 08_manifests/
 *   ├── 09_qa/
 *   └── images/
 */

export const EXPORT_FOLDER_GROUPS = [
  'upload',
  'semantic_strategy',
  'knowledge_graph',
  'schema',
  'ux_copy',
  'visual_experience',
  'growth',
  'manifest',
  'qa',
] as const;

export type ExportFolderGroup = (typeof EXPORT_FOLDER_GROUPS)[number];

/**
 * Required core files in 01_upload/.
 * Validation gate fails if any of these are missing.
 */
export const REQUIRED_UPLOAD_FILES = [
  'universal_content_assets_final.json',
  'brand_profiles.json',
  'design_config.json',
  'gnb_ia_config.json',
  'gallery_albums.json',
  'gallery_photos.json',
  'album_taxonomy_nodes.json',
  'visual_asset_url_map_master.json',
] as const;

export const ExportFileSchema = z.object({
  fileName: z.string().min(1),
  folder: z.string().min(1),
  sha256: z.string().min(1),
  sizeBytes: z.number().int().nonnegative(),
  generatedAt: z.string().datetime(),
});

export const FinalPackageManifestSchema = z.object({
  bundleVersion: z.string().min(1),
  tenantSlug: z.string().min(1),
  industryType: z.literal('wedding_sdm'),
  generatedAt: z.string().datetime(),
  jobId: z.string().uuid().optional(),
  projectId: z.string().uuid(),
  exportStatus: z.enum([
    'onboarding_ready',
    'conditional_onboarding_ready',
    'blocked',
  ]),
  requiredFiles: z.array(ExportFileSchema),
  advancedFiles: z.array(ExportFileSchema).optional(),
  imageCount: z.number().int().nonnegative(),
  ucaCount: z.number().int().nonnegative(),
  qaStatus: z.enum(['pass', 'warning', 'fail', 'blocked']),
});

export const Sha256ManifestSchema = z.object({
  generatedAt: z.string().datetime(),
  files: z.record(z.string()),
});

export type ExportFile = z.infer<typeof ExportFileSchema>;
export type FinalPackageManifest = z.infer<typeof FinalPackageManifestSchema>;
export type Sha256Manifest = z.infer<typeof Sha256ManifestSchema>;
