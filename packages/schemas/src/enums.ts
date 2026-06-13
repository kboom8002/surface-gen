import { z } from 'zod';

/**
 * Core enums for the wedding_sdm industry type.
 * These are the single source of truth — do not redefine in other packages.
 */

export const IndustryTypeSchema = z.enum(['wedding_sdm']);
export type IndustryType = z.infer<typeof IndustryTypeSchema>;

export const ReviewStatus = z.enum([
  'pending_review',
  'approved',
  'rejected',
  'review_required',
  'draft',
  // SSoT contract also uses 'internal_only'
  'internal_only',
]);
export type ReviewStatus = z.infer<typeof ReviewStatus>;

export const AssetStatus = z.enum([
  'active',
  'draft',
  'internal_only',
  'archived',
  'suspended',
]);
export type AssetStatus = z.infer<typeof AssetStatus>;

export const QaStatus = z.enum([
  'unchecked',
  'pass',
  'warning',
  'fail',
  'blocked',
]);
export type QaStatus = z.infer<typeof QaStatus>;

export const JobStatus = z.enum([
  'queued',
  'running',
  'paused',
  'review_required',
  'completed',
  'failed',
  'cancelled',
]);
export type JobStatus = z.infer<typeof JobStatus>;

export const JobType = z.enum([
  'full_factory',
  'partial_regeneration',
  'qa_only',
  'export_only',
]);
export type JobType = z.infer<typeof JobType>;

export const RightsStatus = z.enum([
  'approved',
  'review_required',
  'restricted',
  'rejected',
  'unknown',
]);
export type RightsStatus = z.infer<typeof RightsStatus>;

export const ImageSource = z.enum([
  'actual_photo',
  'ai_editorial_visual',
  'ai_process_visual',
  'ai_concept_visual',
  'internal_moodboard',
  'placeholder',
]);
export type ImageSource = z.infer<typeof ImageSource>;
