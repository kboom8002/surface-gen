import { z } from 'zod';
import { AssetStatus, ReviewStatus, QaStatus } from './enums';

/**
 * SSoT Universal Content Asset (UCA) schema for wedding_sdm.
 *
 * Allowed types: 27 public UCA types.
 * Forbidden types: blocked at the schema level via FORBIDDEN_PUBLIC_UCA_TYPES guard.
 *
 * Per AGENTS.md — do not add forbidden types to ALLOWED_WEDDING_UCA_TYPES.
 */

export const ALLOWED_WEDDING_UCA_TYPES = [
  'about_brand',
  'brand_truth',
  'evidence',
  'portfolio',
  'gallery',
  'portfolio_docent',
  'style_collection',
  'program',
  'product',
  'compare',
  'policy_card',
  'process_step',
  'answer',
  'article',
  'checklist',
  'style_guide',
  'contact_info',
  'match_brief',
  'cta_block',
  'review',
  'case_study',
  'person',
  'creator',
  'brand_story',
  'vendor_partner',
  'web_presence',
  'comparison',
] as const;

/**
 * Forbidden public UCA types.
 * These must never appear in universal_content_assets_final.json.
 * Mapping rules (AGENTS.md):
 *   gallery_photos -> gallery_photos.json only
 *   answer_faq     -> answer
 *   package        -> program
 *   guide_article  -> article
 *   image_asset    -> visual_asset_url_map_master.json
 *   page_config    -> gnb_ia_config.json or design_config.json
 */
export const FORBIDDEN_PUBLIC_UCA_TYPES = [
  'gallery_photos',
  'answer_faq',
  'package',
  'guide_article',
  'image_asset',
  'page_config',
] as const;

/**
 * Minimum body_richtext character counts (Korean characters) per UCA type.
 * Enforced by packages/validators — not solely by this Zod schema.
 */
export const MIN_BODY_RICHTEXT_DENSITY: Record<string, number> = {
  about_brand: 900,
  brand_truth: 500,
  portfolio_docent: 1000,
  style_collection: 800,
  program: 1000,
  policy_card: 600,
  answer: 650,
  article: 3000,
  contact_info: 500,
  match_brief: 500,
};

export const WeddingUcaTypeSchema = z.enum(ALLOWED_WEDDING_UCA_TYPES);
export type WeddingUcaType = z.infer<typeof WeddingUcaTypeSchema>;

/**
 * Type guard — returns true when the given string is a FORBIDDEN public UCA type.
 * Use before persisting any AI output to prevent accidental forbidden-type saves.
 */
export function isForbiddenUcaType(type: string): boolean {
  return (FORBIDDEN_PUBLIC_UCA_TYPES as readonly string[]).includes(type);
}

/**
 * Category map: type -> canonical GNB category key.
 * Used when building gnb_ia_config.json and validating category alignment.
 */
export const UCA_CATEGORY_MAP: Record<
  (typeof ALLOWED_WEDDING_UCA_TYPES)[number],
  string
> = {
  about_brand: 'about',
  brand_truth: 'about',
  evidence: 'about',
  person: 'about',
  brand_story: 'about',
  creator: 'about',
  web_presence: 'about',
  vendor_partner: 'about',
  review: 'about',
  portfolio: 'portfolio',
  portfolio_docent: 'portfolio',
  style_collection: 'portfolio',
  case_study: 'portfolio',
  gallery: 'gallery',
  program: 'catalog',
  product: 'catalog',
  compare: 'catalog',
  policy_card: 'catalog',
  process_step: 'catalog',
  comparison: 'catalog',
  answer: 'answers',
  article: 'answers',
  checklist: 'answers',
  style_guide: 'answers',
  contact_info: 'contact',
  match_brief: 'contact',
  cta_block: 'contact',
};

/**
 * Universal Content Asset schema.
 * All 11 required common fields are non-optional (per AGENTS.md required_uca_fields).
 * Detail fields (body, body_richtext, seo_title, meta_description) are optional here
 * but enforced by the 12-gate validator.
 */
export const UniversalContentAssetSchema = z.object({
  // Required common fields
  id: z.string().uuid(),
  tenant_id: z.string().min(1),
  type: WeddingUcaTypeSchema,
  category: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9_-]+$/, {
    message: 'slug must be lowercase alphanumeric with hyphens/underscores',
  }),
  summary: z.string().min(1),
  status: AssetStatus,
  review_status: ReviewStatus,
  sort_order: z.number().int().nonnegative(),
  json_payload: z.record(z.unknown()),

  // Detail fields (required for active public assets — enforced by validator)
  body: z.string().optional(),
  body_richtext: z.string().optional(),

  // Additional optional fields
  pinned: z.boolean().optional().default(false),
  relations: z.record(z.array(z.string())).optional(),
  translations: z.record(z.unknown()).optional(),
  qa_status: QaStatus.optional(),
  created_source: z
    .enum([
      'ai_generated',
      'client_provided',
      'human_edited',
      'system_generated',
    ])
    .optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
});

export type UniversalContentAsset = z.infer<typeof UniversalContentAssetSchema>;

/**
 * Parses an array of raw UCA records, filtering out forbidden types and
 * returning only valid entries. Invalid entries are collected separately.
 */
export function parseUcaArray(raw: unknown[]): {
  valid: UniversalContentAsset[];
  invalid: Array<{ index: number; error: z.ZodError }>;
  forbidden: Array<{ index: number; type: string }>;
} {
  const valid: UniversalContentAsset[] = [];
  const invalid: Array<{ index: number; error: z.ZodError }> = [];
  const forbidden: Array<{ index: number; type: string }> = [];

  raw.forEach((item, index) => {
    if (
      typeof item === 'object' &&
      item !== null &&
      'type' in item &&
      typeof (item as Record<string, unknown>)['type'] === 'string' &&
      isForbiddenUcaType((item as Record<string, unknown>)['type'] as string)
    ) {
      forbidden.push({
        index,
        type: (item as Record<string, unknown>)['type'] as string,
      });
      return;
    }

    const result = UniversalContentAssetSchema.safeParse(item);
    if (result.success) {
      valid.push(result.data);
    } else {
      invalid.push({ index, error: result.error });
    }
  });

  return { valid, invalid, forbidden };
}
