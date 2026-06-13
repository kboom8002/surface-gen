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

    const { data: project, error } = await supabase
      .from('projects')
      .insert({
        official_brand_name: officialBrandName,
        tenant_slug: tenantSlug,
        industry_type: 'wedding_sdm',
        status: 'draft',
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
