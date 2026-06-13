import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface RouteContext {
  params: Promise<{ projectId: string }>;
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

  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error || !project) {
    return NextResponse.json(
      { ok: false, error: { code: 'NOT_FOUND', message: 'Project not found' } },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, data: { project } });
}
