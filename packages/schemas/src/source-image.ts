import { z } from 'zod';
import { RightsStatus } from './enums';

/**
 * Source image schema — actual wedding photos uploaded by the client.
 *
 * CRITICAL: Images never auto-approve public image rights.
 * contains_face + public_use_allowed require explicit human review.
 */

export const ConsentStatus = z.enum([
  'approved',
  'review_required',
  'restricted',
  'unknown',
]);
export type ConsentStatus = z.infer<typeof ConsentStatus>;

export const SourceImageSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  fileName: z.string().min(1),
  originalName: z.string().min(1),
  normalizedFileName: z.string().optional(),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  storagePath: z.string().min(1),
  thumbnailPath: z.string().optional(),
  albumId: z.string().optional(),
  photoId: z.string().optional(),
  sequenceIndex: z.number().int().optional(),
  sha256: z.string().optional(),
  // Rights and consent — must be reviewed by human before public use
  rightsStatus: RightsStatus.default('unknown'),
  consentStatus: ConsentStatus.default('unknown'),
  publicUseAllowed: z.boolean().default(false),
  containsFace: z.boolean().nullable().default(null),
  containsLogo: z.boolean().nullable().default(null),
  containsCustomerName: z.boolean().nullable().default(null),
  rightsNote: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  uploadedAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type SourceImage = z.infer<typeof SourceImageSchema>;
