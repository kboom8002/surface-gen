import { z } from 'zod';
import { RightsStatus, ReviewStatus } from './enums';

/**
 * 5D+1 Photo Taxonomy schemas for wedding_sdm.
 * Dimensions: scene, subject, mood, style, composition + vibe_vector (6th).
 */

export const SCENE_VALUES = [
  'indoor_studio',
  'outdoor_garden',
  'ceremony_hall',
  'reception_hall',
  'rooftop',
  'cafe',
  'urban_street',
  'nature_forest',
  'beach_ocean',
  'mountain',
  'historic_building',
  'modern_architecture',
  'hotel_lobby',
  'chapel',
  'park',
  'vineyard',
  'other',
] as const;

export const SUBJECT_TAGS = [
  'bride',
  'groom',
  'couple',
  'dress',
  'bouquet',
  'ring',
  'cake',
  'decoration',
  'family',
  'guests',
  'venue_detail',
  'table_setting',
  'ceremony',
  'reception',
  'portrait',
  'candid',
] as const;

export const MOOD_TAGS = [
  'romantic',
  'elegant',
  'natural',
  'dramatic',
  'joyful',
  'intimate',
  'ethereal',
  'timeless',
  'modern',
  'whimsical',
  'luxurious',
  'rustic',
  'editorial',
] as const;

export const STYLE_TAGS = [
  'classic',
  'modern',
  'editorial',
  'vintage',
  'bohemian',
  'minimalist',
  'glamorous',
  'rustic',
  'garden',
  'beach',
  'urban',
  'luxury',
  'documentary',
] as const;

export const COMPOSITION_TAGS = [
  'close_up',
  'full_body',
  'wide_angle',
  'overhead',
  'silhouette',
  'detail_shot',
  'environmental',
  'candid_moment',
  'posed',
  'group_shot',
  'symmetrical',
  'leading_lines',
  'bokeh',
  'golden_hour',
] as const;

/**
 * 6th dimension: vibe vector.
 * Each axis is scored 1-5 (low→high of the right-hand label).
 */
export const VibeVectorSchema = z.object({
  bright_to_moody: z.number().min(1).max(5),
  natural_to_editorial: z.number().min(1).max(5),
  relaxed_to_formal: z.number().min(1).max(5),
  minimal_to_luxury: z.number().min(1).max(5),
  intimate_to_grand: z.number().min(1).max(5),
  documentary_to_directed: z.number().min(1).max(5),
});

export const PhotoTaxonomySchema = z.object({
  scene: z.enum(SCENE_VALUES),
  subject_tags: z.array(z.enum(SUBJECT_TAGS)).min(1),
  mood_tags: z.array(z.enum(MOOD_TAGS)).min(1),
  style_tags: z.array(z.enum(STYLE_TAGS)).min(1),
  composition_tags: z.array(z.enum(COMPOSITION_TAGS)),
  vibe_vector: VibeVectorSchema,
  confidence: z.number().min(0).max(1),
  uncertainty_note: z.string().optional(),
});

export const PhotoDocentSchema = z.object({
  alt: z.string().min(1),
  caption: z.string().min(1),
  scene_note: z.string().min(1),
  style_note: z.string().min(1),
  recommended_for: z.string().min(1),
});

export const PhotoVisualFactsSchema = z.object({
  visible_subject: z.string().min(1),
  visible_space: z.string().optional(),
  indoor_outdoor: z.enum(['indoor', 'outdoor', 'both', 'unknown']),
  lighting_condition: z.string().optional(),
  main_pose_or_action: z.string().optional(),
  visible_objects: z.array(z.string()).optional(),
});

export const PhotoQaSchema = z.object({
  confidence: z.number().min(0).max(1),
  review_status: ReviewStatus,
  forbidden_claims_checked: z.boolean(),
  human_review_required: z.boolean(),
  uncertainty_note: z.string().optional(),
});

/**
 * Full gallery photo record — stored in gallery_photos.json (not as a public UCA).
 * Per AGENTS.md: gallery_photos is a forbidden public UCA type.
 */
export const GalleryPhotoRecordSchema = z.object({
  tenant_id: z.string().min(1),
  album_id: z.string().min(1),
  photo_id: z.string().min(1),
  file_name: z.string().min(1),
  image_path: z.string().min(1),
  thumbnail_path: z.string().optional(),
  original_file_name: z.string().optional(),
  rights_status: RightsStatus,
  public_use_allowed: z.boolean(),
  contains_face: z.boolean().nullable(),
  contains_logo: z.boolean().nullable(),
  contains_customer_name: z.boolean().nullable(),
  usage_role: z.string().optional(),
  sort_order: z.number().int().nonnegative(),
  visual_facts: PhotoVisualFactsSchema.optional(),
  taxonomy: PhotoTaxonomySchema.optional(),
  copy: PhotoDocentSchema.optional(),
  qa: PhotoQaSchema.optional(),
});

export type VibeVector = z.infer<typeof VibeVectorSchema>;
export type PhotoTaxonomy = z.infer<typeof PhotoTaxonomySchema>;
export type PhotoDocent = z.infer<typeof PhotoDocentSchema>;
export type PhotoVisualFacts = z.infer<typeof PhotoVisualFactsSchema>;
export type PhotoQa = z.infer<typeof PhotoQaSchema>;
export type GalleryPhotoRecord = z.infer<typeof GalleryPhotoRecordSchema>;
