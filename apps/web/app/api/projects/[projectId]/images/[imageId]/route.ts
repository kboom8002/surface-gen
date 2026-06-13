import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * PATCH /api/projects/:projectId/images/:imageId
 *
 * Updates rights and consent metadata for a single source image.
 * public_use_allowed must only be set to true after explicit human review.
 * Unknown rights must remain review_required until resolved.
 */

const UpdateRightsSchema = z.object({
  rightsStatus: z
    .enum(['approved', 'review_required', 'restricted', 'rejected', 'unknown'])
    .optional(),
  consentStatus: z
    .enum(['approved', 'review_required', 'restricted', 'unknown'])
    .optional(),
  publicUseAllowed: z.boolean().optional(),
  containsFace: z.boolean().nullable().optional(),
  containsLogo: z.boolean().nullable().optional(),
  containsCustomerName: z.boolean().nullable().optional(),
  rightsNote: z.string().max(2000).optional(),
});

interface RouteContext {
  params: Promise<{ projectId: string; imageId: string }>;
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { projectId, imageId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
      { status: 401 },
    );
  }

  const body = (await request.json()) as unknown;
  const parsed = UpdateRightsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid rights data',
          details: parsed.error.errors,
        },
      },
      { status: 400 },
    );
  }

  // Build update object only from provided fields
  const updates: Record<string, unknown> = {};
  if (parsed.data.rightsStatus !== undefined) updates['rights_status'] = parsed.data.rightsStatus;
  if (parsed.data.consentStatus !== undefined)
    updates['consent_status'] = parsed.data.consentStatus;
  if (parsed.data.publicUseAllowed !== undefined)
    updates['public_use_allowed'] = parsed.data.publicUseAllowed;
  if (parsed.data.containsFace !== undefined) updates['contains_face'] = parsed.data.containsFace;
  if (parsed.data.containsLogo !== undefined) updates['contains_logo'] = parsed.data.containsLogo;
  if (parsed.data.containsCustomerName !== undefined)
    updates['contains_customer_name'] = parsed.data.containsCustomerName;
  if (parsed.data.rightsNote !== undefined) updates['rights_note'] = parsed.data.rightsNote;

  // project_id filter ensures cross-project access is blocked (in addition to RLS)
  const { data: image, error } = await supabase
    .from('source_images')
    .update(updates)
    .eq('id', imageId)
    .eq('project_id', projectId)
    .select('id, rights_status, consent_status, public_use_allowed')
    .single();

  if (error || !image) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'UPDATE_FAILED', message: error?.message ?? 'Update failed' },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data: image });
}
