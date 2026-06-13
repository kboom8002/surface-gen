import { z } from 'zod';

/**
 * Source file schema — brand factsheets, policies, evidence docs uploaded by the user.
 * Stored in Supabase Storage, metadata in public.source_files table.
 */

export const SourceFileSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  fileName: z.string().min(1),
  originalName: z.string().min(1),
  fileType: z.enum([
    'brand_factsheet',
    'package_policy',
    'evidence',
    'reference',
    'other',
  ]),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  storagePath: z.string().min(1),
  sha256: z.string().optional(),
  parseStatus: z
    .enum(['pending', 'parsed', 'failed', 'skipped'])
    .default('pending'),
  extractedText: z.string().optional(),
  extractedJson: z.record(z.unknown()).optional(),
  createdAt: z.string().datetime().optional(),
});

export type SourceFile = z.infer<typeof SourceFileSchema>;
