import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  officialBrandName: z.string().min(1, '브랜드명은 필수입니다.'),
  tenantSlug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, '슬러그는 영소문자, 숫자, 하이픈만 사용 가능합니다.'),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { ok: false, error: { code: 'UNAUTHORIZED', message: '로그인이 필요합니다.' } },
        { status: 401 },
      );
    }

    const body = (await request.json()) as unknown;
    const parsed = CreateProjectSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.errors[0]?.message ?? 'Validation failed',
            details: parsed.error.errors,
          },
        },
        { status: 400 },
      );
    }

    const { officialBrandName, tenantSlug } = parsed.data;

    const { data: existing } = await supabase
      .from('projects')
      .select('id')
      .eq('tenant_slug', tenantSlug)
      .maybeSingle();
    if (existing) {
      return NextResponse.json(
        { ok: false, error: { code: 'SLUG_TAKEN', message: '이미 사용 중인 슬러그입니다.' } },
        { status: 409 },
      );
    }

    // 1. Get user's organization
    let { data: member } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    // 2. Bootstrap organization if missing (manual signup scenario)
    if (!member) {
      const { createClient: createAdminClient } = await import('@supabase/supabase-js');
      const adminSupabase = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Ensure profile exists
      await adminSupabase.from('profiles').upsert({ id: user.id, email: user.email }, { onConflict: 'id' });

      // Create personal organization
      const orgSlug = `org-${user.id.substring(0, 8)}`;
      const { data: newOrg, error: orgError } = await adminSupabase
        .from('organizations')
        .insert({ name: 'Personal Workspace', slug: orgSlug, created_by: user.id })
        .select('id')
        .single();

      if (orgError || !newOrg) {
        return NextResponse.json({ ok: false, error: { code: 'ORG_ERROR', message: `조직 생성 실패: ${orgError?.message}` } }, { status: 500 });
      }

      // Add user as owner
      const { error: memberError } = await adminSupabase
        .from('organization_members')
        .insert({ organization_id: newOrg.id, user_id: user.id, role: 'owner' });
        
      if (memberError) {
        return NextResponse.json({ ok: false, error: { code: 'ORG_MEMBER_ERROR', message: `조직 멤버 추가 실패: ${memberError?.message}` } }, { status: 500 });
      }

      member = { organization_id: newOrg.id };
    }

    // 3. Insert project with organization_id
    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        organization_id: member.organization_id,
        official_brand_name: officialBrandName,
        tenant_slug: tenantSlug,
        industry_type: 'wedding_sdm',
        status: 'draft',
        created_by: user.id,
      })
      .select('id, tenant_slug, official_brand_name, industry_type, status')
      .single();

    if (error || !project) {
      return NextResponse.json(
        { ok: false, error: { code: 'DB_ERROR', message: error?.message ?? 'Unknown error' } },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          projectId: project.id,
          tenantSlug: project.tenant_slug,
          officialBrandName: project.official_brand_name,
          industryType: project.industry_type,
          status: project.status,
        },
      },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
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

    const { data: projects, error } = await supabase
      .from('projects')
      .select('id, official_brand_name, tenant_slug, industry_type, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { ok: false, error: { code: 'DB_ERROR', message: error.message } },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, data: { projects: projects ?? [] } });
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } },
      { status: 500 },
    );
  }
}
