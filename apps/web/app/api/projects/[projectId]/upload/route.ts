import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export const maxDuration = 60; // Set longer max duration for file uploads

export async function POST(
  request: Request,
  props: { params: Promise<{ projectId: string }> }
) {
  try {
    const params = await props.params;
    const { projectId } = params;
    
    // 1. Validate user authentication
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ ok: false, error: { message: '로그인이 필요합니다.' } }, { status: 401 });
    }

    // 2. Extract form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const fileType = formData.get('fileType') as string | null;

    if (!file || !fileType) {
      return NextResponse.json({ ok: false, error: { message: '파일 또는 파일 유형이 누락되었습니다.' } }, { status: 400 });
    }

    // Prepare Admin Supabase Client to bypass RLS for Storage operations
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const bucketName = 'project-assets';

    // Ensure bucket exists
    const { data: buckets } = await adminSupabase.storage.listBuckets();
    if (!buckets?.find(b => b.name === bucketName)) {
      await adminSupabase.storage.createBucket(bucketName, { public: false });
    }

    // 3. Upload file to Supabase Storage
    const timestamp = Date.now();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const storagePath = `${projectId}/${fileType}/${timestamp}_${cleanFileName}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminSupabase.storage
      .from(bucketName)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ ok: false, error: { message: '스토리지 업로드에 실패했습니다.' } }, { status: 500 });
    }

    // 4. Insert record into database
    if (fileType === 'brand_factsheet') {
      const { error: dbError } = await adminSupabase.from('source_files').insert({
        project_id: projectId,
        file_type: 'brand_factsheet',
        file_name: file.name,
        storage_path: storagePath,
        mime_type: file.type,
        size_bytes: file.size,
        created_by: user.id,
      });
      if (dbError) throw dbError;
    } else if (fileType === 'image') {
      const { error: dbError } = await adminSupabase.from('source_images').insert({
        project_id: projectId,
        original_file_name: file.name,
        storage_path: storagePath,
        rights_status: 'unknown',
      });
      if (dbError) throw dbError;
    } else {
      return NextResponse.json({ ok: false, error: { message: '알 수 없는 파일 유형입니다.' } }, { status: 400 });
    }

    return NextResponse.json({ ok: true, message: '업로드 완료' });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json(
      { ok: false, error: { message: error?.message || '서버 오류가 발생했습니다.' } },
      { status: 500 }
    );
  }
}
