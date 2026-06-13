import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import {
  sanitizeFileName,
  isForbiddenExtension,
  isAllowedFactsheetType,
  computeSha256,
} from '@/lib/storage/upload';
import { randomUUID } from 'crypto';

/** 20 MB per spec (06_STORAGE_AND_FILE_SPEC.md §8) */
const MAX_FILE_SIZE = 20 * 1024 * 1024;

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
  const fileType = (formData.get('fileType') as string | null) ?? 'other';

  if (!file) {
    return NextResponse.json(
      { ok: false, error: { code: 'NO_FILE', message: 'No file provided' } },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { ok: false, error: { code: 'FILE_TOO_LARGE', message: 'File exceeds 20 MB limit' } },
      { status: 400 },
    );
  }

  if (isForbiddenExtension(file.name)) {
    return NextResponse.json(
      { ok: false, error: { code: 'FORBIDDEN_FILE_TYPE', message: 'File type not allowed' } },
      { status: 400 },
    );
  }

  if (!isAllowedFactsheetType(file.type)) {
    return NextResponse.json(
      {
        ok: false,
        error: { code: 'UNSUPPORTED_MIME', message: `MIME type ${file.type} not supported` },
      },
      { status: 400 },
    );
  }

  const fileId = randomUUID();
  const safeName = sanitizeFileName(file.name);
  // Path convention: {projectId}/factsheets/{fileId}-{safeName}
  // (Org ID scoping deferred until org model is introduced)
  const storagePath = `${projectId}/factsheets/${fileId}-${safeName}`;

  const buffer = await file.arrayBuffer();
  const sha256 = await computeSha256(buffer);

  const { error: uploadError } = await supabase.storage
    .from('source-uploads')
    .upload(storagePath, buffer, { contentType: file.type });

  if (uploadError) {
    return NextResponse.json(
      { ok: false, error: { code: 'UPLOAD_ERROR', message: uploadError.message } },
      { status: 500 },
    );
  }

  const { data: fileRecord, error: dbError } = await supabase
    .from('source_files')
    .insert({
      project_id: projectId,
      file_name: safeName,
      original_name: file.name,
      file_type: fileType,
      mime_type: file.type,
      size_bytes: file.size,
      storage_path: storagePath,
      sha256,
      parse_status: 'pending',
    })
    .select('id, file_name, storage_path, file_type, parse_status')
    .single();

  if (dbError || !fileRecord) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: dbError?.message ?? 'DB insert failed' } },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        sourceFileId: fileRecord.id,
        fileName: fileRecord.file_name,
        storagePath: fileRecord.storage_path,
        fileType: fileRecord.file_type,
        parseStatus: fileRecord.parse_status,
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

  const { data: files, error } = await supabase
    .from('source_files')
    .select('id, file_name, file_type, mime_type, size_bytes, parse_status, created_at')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: { code: 'DB_ERROR', message: error.message } },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, data: { files: files ?? [] } });
}
