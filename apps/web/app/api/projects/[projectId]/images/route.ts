import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { sanitizeFileName, isAllowedImageType, computeSha256 } from '@/lib/storage/upload';
import { randomUUID } from 'crypto';

/** 25 MB per spec (06_STORAGE_AND_FILE_SPEC.md §8) */
const MAX_IMAGE_SIZE = 25 * 1024 * 1024;

interface RouteContext {
  params: Promise<{ projectId: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  const { projectId } = await params;
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

  // Verify project exists and user has access (RLS enforces ownership)
  const { data: project } = await supabase
    .from('projects')
    .select('id')
    .eq('id', projectId)
    .single();
  if (!project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_FORM', message: 'Invalid form data' } },
      { status: 400 },
    );
  }

  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json(
      { ok: false, error: { code: 'NO_FILE', message: 'No file provided' } },
      { status: 400 },
    );
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return NextResponse.json(
      { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'Image exceeds 25 MB limit' } },
      { status: 400 },
    );
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'UNSUPPORTED_IMAGE_TYPE',
          message: 'Only jpeg, png, and webp are allowed',
        },
      },
      { status: 400 },
    );
  }

  const imageId = randomUUID();
  const safeName = sanitizeFileName(file.name);
  // Path convention: {projectId}/original/{imageId}-{safeName}
  const storagePath = `${projectId}/original/${imageId}-${safeName}`;

  const buffer = await file.arrayBuffer();
  const sha256 = await computeSha256(buffer);

  const { error: uploadError } = await supabase.storage
    .from('source-images')
    .upload(storagePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPLOAD_ERROR', message: uploadError.message } },
      { status: 500 },
    );
  }

  const { data: imageRecord, error: dbError } = await supabase
    .from('source_images')
    .insert({
      project_id: projectId,
      file_name: safeName,
      original_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: storagePath,
      sha256,
      // Rights defaults — all require explicit human review before public use
      rights_status: 'unknown',
      consent_status: 'unknown',
      public_use_allowed: false,
      contains_face: null,
      contains_logo: null,
      contains_customer_name: null,
    })
    .select('id, file_name, storage_path, rights_status, public_use_allowed')
    .single();

  if (dbError || !imageRecord) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: dbError?.message ?? 'DB insert failed' } },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        imageId: imageRecord.id,
        fileName: imageRecord.file_name,
        storagePath: imageRecord.storage_path,
        rightsStatus: imageRecord.rights_status,
        publicUseAllowed: imageRecord.public_use_allowed,
      },
    },
    { status: 201 },
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { projectId } = await params;
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

  const { data: images, error } = await supabase
    .from('source_images')
    .select(
      'id, file_name, mime_type, size_bytes, rights_status, consent_status, public_use_allowed, contains_face, contains_logo, contains_customer_name, created_at',
    )
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data: { images: images ?? [] } });
}
