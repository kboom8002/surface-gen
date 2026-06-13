import { z } from 'zod';

/**
 * Brand Factsheet schema — the primary structured input document.
 * Parsed from uploaded PDF/DOCX/text files by the input-audit node.
 *
 * CRITICAL: Never invent missing facts. Mark missing fields as review_required.
 */

export const BrandContactSchema = z.object({
  studio_name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website_url: z.string().url().optional(),
  instagram_url: z.string().url().optional(),
  kakao_channel: z.string().optional(),
  address: z.string().optional(),
  operating_hours: z.string().optional(),
  consultation_method: z.array(z.string()).optional(),
});

export const BrandProgramSchema = z.object({
  program_id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  price_range_note: z.string().optional(),
  duration: z.string().optional(),
  includes_summary: z.string().optional(),
  is_featured: z.boolean().optional(),
});

export const BrandStyleSchema = z.object({
  primary_styles: z.array(z.string()),
  signature_looks: z.array(z.string()).optional(),
  shooting_environments: z.array(z.string()).optional(),
  color_palette_notes: z.string().optional(),
  editing_style_notes: z.string().optional(),
});

export const BrandFactsheetSchema = z.object({
  // Core identity
  tenant_slug: z.string().min(1),
  official_brand_name: z.string().min(1),
  tagline: z.string().optional(),
  established_year: z.number().int().optional(),
  brand_story_summary: z.string().optional(),
  photographer_names: z.array(z.string()).optional(),

  // Contact
  contact: BrandContactSchema.optional(),

  // Services
  programs: z.array(BrandProgramSchema).optional(),

  // Style
  style: BrandStyleSchema.optional(),

  // Policy notes (not exact terms — mark exact terms review_required)
  cancellation_policy_note: z.string().optional(),
  reservation_deposit_note: z.string().optional(),
  delivery_timeline_note: z.string().optional(),

  // Service areas
  primary_service_areas: z.array(z.string()).optional(),
  travel_available: z.boolean().optional(),

  // Metadata
  source_file_names: z.array(z.string()).optional(),
  extraction_confidence: z.number().min(0).max(1).optional(),
  review_required_fields: z.array(z.string()).optional(),
  extraction_notes: z.string().optional(),
});

export type BrandFactsheet = z.infer<typeof BrandFactsheetSchema>;
export type BrandContact = z.infer<typeof BrandContactSchema>;
export type BrandProgram = z.infer<typeof BrandProgramSchema>;
export type BrandStyle = z.infer<typeof BrandStyleSchema>;
