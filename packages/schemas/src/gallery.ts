import { z } from 'zod';

/**
 * Gallery album and taxonomy node schemas.
 * Gallery albums are stored in gallery_albums.json.
 * Taxonomy nodes are stored in album_taxonomy_nodes.json.
 */

export const GalleryAlbumSchema = z.object({
  tenant_id: z.string().min(1),
  album_id: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  service_domain: z.string().optional(),
  cover_photo_id: z.string().optional(),
  representative_photo_id: z.string().optional(),
  sort_order: z.number().int().nonnegative(),
  is_published: z.boolean().default(false),
  status: z.enum(['active', 'draft', 'suspended']).default('draft'),
  review_status: z
    .enum(['approved', 'review_required', 'rejected'])
    .default('review_required'),
  taxonomy_filter_tags: z.array(z.string()).optional(),
  style_tags: z.array(z.string()).optional(),
  mood_tags: z.array(z.string()).optional(),
  vibe_vector_summary: z.record(z.unknown()).optional(),
  photo_count: z.number().int().nonnegative().optional(),
  album_intro: z.string().optional(),
  portfolio_docent: z.string().optional(),
});

export const AlbumTaxonomyNodeSchema = z.object({
  node_id: z.string().min(1),
  album_id: z.string().min(1),
  node_type: z.enum([
    'scene',
    'style',
    'mood',
    'subject',
    'composition',
    'vibe_cluster',
    'service_domain',
  ]),
  label: z.string().min(1),
  label_ko: z.string().optional(),
  value: z.string().min(1),
  description: z.string().optional(),
  photo_count: z.number().int().nonnegative().default(0),
  related_photo_ids: z.array(z.string()).optional(),
  related_album_ids: z.array(z.string()).optional(),
  sort_order: z.number().int().nonnegative(),
});

export type GalleryAlbum = z.infer<typeof GalleryAlbumSchema>;
export type AlbumTaxonomyNode = z.infer<typeof AlbumTaxonomyNodeSchema>;
