import { z } from 'zod';
import type { FactoryJobState, BrandTruthSheet } from '../state/factory-job-state';
import { createJobStep, completeJobStep } from '../services/job-state-store';
import { getModelForTask } from '../services/model-client';
import { supabaseAdmin } from '../services/supabase-admin';

const BrandTruthSheetSchema = z.object({
  tenantSlug: z.string(),
  officialBrandName: z.string().min(1),
  positioning: z.string().optional(),
  coreAudience: z.array(z.string()).optional(),
  doNotMisread: z.array(z.string()).optional(),
  serviceDomains: z.array(z.string()).optional(),
  programs: z
    .array(
      z.object({
        name: z.string(),
        included: z.array(z.string()).optional(),
        excluded: z.array(z.string()).optional(),
      }),
    )
    .optional(),
  pricingBasis: z.string().optional(),
  policies: z.array(z.object({ type: z.string(), summary: z.string() })).optional(),
  verifiedFacts: z.array(z.object({ fact: z.string(), source: z.string() })).optional(),
  assumptions: z.array(z.object({ assumption: z.string(), confidence: z.number() })).optional(),
  reviewRequired: z.array(z.object({ field: z.string(), reason: z.string() })).optional(),
  forbiddenClaims: z.array(z.string()).optional(),
});

export type BrandTruthSheetOutput = z.infer<typeof BrandTruthSheetSchema>;

const SYSTEM_PROMPT = `You are a wedding brand strategist for wedding_sdm industry.
Extract and classify brand truth from the provided factsheet.

CRITICAL SAFETY RULES:
- Never invent customer reviews, awards, certifications, partnerships, or media mentions.
- Never invent exact prices, refund policies, or delivery guarantees.
- Missing or ambiguous data must go into reviewRequired, NOT be fabricated.
- Forbidden claims (e.g. "100% 만족 보장", "업계 최고", "추가금 절대 없음") must be listed in forbiddenClaims.
- Output must be valid JSON matching the BrandTruthSheet schema.

SSoT TYPE RULES for wedding_sdm:
- Use 'program' never 'package'
- Use 'answer' never 'answer_faq'
- Use 'article' never 'guide_article'`;

export async function brandTruthNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'brand_truth');
  try {
    // Load factsheet text from source_files
    const { data: files } = await supabaseAdmin
      .from('source_files')
      .select('id, file_name, file_type, extracted_text')
      .eq('project_id', state.projectId)
      .in('file_type', ['brand_factsheet', 'other'])
      .limit(3);

    const factsheetText =
      files
        ?.map(
          (f) =>
            (f['extracted_text'] as string | null) ??
            `[파일: ${f['file_name'] as string} - 텍스트 추출 대기 중]`,
        )
        .join('\n\n---\n\n') ?? '';

    let brandTruthSheet: BrandTruthSheetOutput;

    if (!files || files.length === 0) {
      // No factsheet — create placeholder with review_required flags
      brandTruthSheet = {
        tenantSlug: state.tenantSlug,
        officialBrandName: state.tenantSlug,
        positioning: '브랜드 팩트시트 입력 후 상세 정보가 생성됩니다.',
        coreAudience: ['예비 신혼부부'],
        doNotMisread: [],
        serviceDomains: ['웨딩 사진 촬영'],
        programs: [],
        pricingBasis: 'review_required',
        policies: [],
        verifiedFacts: [],
        assumptions: [{ assumption: '웨딩 사진 스튜디오입니다.', confidence: 0.9 }],
        reviewRequired: [
          { field: 'officialBrandName', reason: '브랜드 팩트시트가 없어 슬러그를 임시 사용' },
        ],
        forbiddenClaims: [],
      };
    } else {
      const userPrompt = `Extract brand truth for tenant: ${state.tenantSlug}

Factsheet content:
---
${factsheetText.substring(0, 8000)}
---

Return JSON BrandTruthSheet:
{
  "tenantSlug": "${state.tenantSlug}",
  "officialBrandName": string,
  "positioning": string (1 sentence),
  "coreAudience": string[],
  "doNotMisread": string[],
  "serviceDomains": string[],
  "programs": [{"name": string, "included": string[], "excluded": string[]}],
  "pricingBasis": "review_required" or summary string,
  "policies": [{"type": string, "summary": string}],
  "verifiedFacts": [{"fact": string, "source": string}],
  "assumptions": [{"assumption": string, "confidence": 0-1}],
  "reviewRequired": [{"field": string, "reason": string}],
  "forbiddenClaims": string[]
}`;

      const model = getModelForTask('planner');
      // Dynamic import to avoid TS resolution issues at typecheck time
      const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');
      const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ]);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found in brand truth response');

      const rawData: unknown = JSON.parse(jsonMatch[0]);
      // CRITICAL: Always Zod-parse before persisting
      brandTruthSheet = BrandTruthSheetSchema.parse(rawData);
    }

    // exactOptionalPropertyTypes: cast through unknown to reconcile Zod inferred type
    // with the BrandTruthSheet interface (both have the same runtime shape).
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    const validated = brandTruthSheet as unknown as BrandTruthSheet;

    await completeJobStep(
      stepId,
      true,
      `Brand truth extracted for ${validated.officialBrandName}`,
    );
    return {
      intermediate: { ...state.intermediate, brandTruthSheet: validated },
      runtime: {
        ...state.runtime,
        currentNode: 'semantic_strategy',
        completedNodes: [...state.runtime.completedNodes, 'brand_truth'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return {
      runtime: {
        ...state.runtime,
        currentNode: 'brand_truth',
        status: 'failed',
        errorMessage: msg,
      },
    };
  }
}
