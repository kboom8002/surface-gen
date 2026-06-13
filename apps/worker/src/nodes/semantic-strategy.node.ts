import { z } from 'zod';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import { getModelForTask } from '../services/model-client.js';
import { supabaseAdmin } from '../services/supabase-admin.js';

const SemanticStrategyOutputSchema = z.object({
  searchIntentMap: z.object({
    tenantSlug: z.string(),
    industryType: z.literal('wedding_sdm'),
    intents: z.array(z.object({
      intentId: z.string(),
      intentLabel: z.string(),
      query_ko: z.string(),
      query_variations_ko: z.array(z.string()),
      customer_need: z.string(),
      recommended_uca_types: z.array(z.string()),
      priority: z.enum(['high', 'medium', 'low']),
    })),
  }),
  qisGrowthRegistry: z.object({
    questions: z.array(z.object({
      qis_id: z.string(),
      question_ko: z.string(),
      question_type: z.string(),
      answer_uca_type: z.string(),
      search_volume_estimate: z.enum(['high', 'medium', 'low']),
      priority: z.enum(['p1', 'p2', 'p3']),
    })),
  }),
  entityKeywordMap: z.object({
    brand_entity: z.string(),
    primary_keywords_ko: z.array(z.string()),
    secondary_keywords_ko: z.array(z.string()),
    long_tail_keywords_ko: z.array(z.string()),
    negative_keywords_ko: z.array(z.string()),
  }),
  localGeoIntentMap: z.object({
    primaryCity: z.string(),
    primaryDistrict: z.string().optional(),
    nearbyKeywords_ko: z.array(z.string()),
    venueKeywords_ko: z.array(z.string()),
  }),
  aeoSchema: z.object({
    faqQuestions: z.array(z.string()),
    howToSteps: z.array(z.string()),
    review_required_fields: z.array(z.string()),
  }),
});

const SYSTEM_PROMPT = `You are a Korean wedding industry SEO/AEO/GEO strategist for the AIHompy platform.
Generate a comprehensive semantic search strategy for a wedding studio brand.

RULES:
- All user-facing text (queries, questions, keywords) must be in Korean.
- Field names (intentId, qis_id, etc.) stay in English.
- Base the strategy on the ACTUAL brand truth provided — not generic wedding studio templates.
- If location info is not in brand truth, use "review_required" as primaryCity.
- Generate realistic Korean search queries that actual brides/grooms would type.
- Output valid JSON only.`;

export async function semanticStrategyNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'semantic_strategy');
  try {
    const bt = state.intermediate?.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? state.tenantSlug;
    const positioning = bt?.positioning ?? '';
    const serviceDomains = bt?.serviceDomains?.join(', ') ?? '';
    const coreAudience = bt?.coreAudience?.join(', ') ?? '';
    const programs = bt?.programs?.map(p => p.name).join(', ') ?? '';

    const userPrompt = `Brand: ${brandName}
TenantSlug: ${state.tenantSlug}
Positioning: ${positioning}
ServiceDomains: ${serviceDomains}
CoreAudience: ${coreAudience}
Programs: ${programs}

Generate semantic search strategy JSON:
{
  "searchIntentMap": {
    "tenantSlug": "${state.tenantSlug}",
    "industryType": "wedding_sdm",
    "intents": [
      {
        "intentId": "intent_01",
        "intentLabel": "스튜디오 찾기",
        "query_ko": "웨딩 스튜디오 추천",
        "query_variations_ko": ["웨딩 촬영 스튜디오", "결혼 사진 스튜디오"],
        "customer_need": "고객이 결혼 사진 스튜디오를 탐색하고 있음",
        "recommended_uca_types": ["about_brand", "portfolio"],
        "priority": "high"
      }
    ]
  },
  "qisGrowthRegistry": {
    "questions": [
      {
        "qis_id": "qis_01",
        "question_ko": "웨딩 촬영은 언제 예약해야 하나요?",
        "question_type": "timing",
        "answer_uca_type": "answer",
        "search_volume_estimate": "high",
        "priority": "p1"
      }
    ]
  },
  "entityKeywordMap": {
    "brand_entity": "${brandName}",
    "primary_keywords_ko": ["웨딩 스튜디오", "웨딩 촬영"],
    "secondary_keywords_ko": ["결혼 사진", "본식 스냅"],
    "long_tail_keywords_ko": ["자연스러운 웨딩 사진 스튜디오"],
    "negative_keywords_ko": ["DIY 웨딩", "포토부스"]
  },
  "localGeoIntentMap": {
    "primaryCity": "review_required",
    "nearbyKeywords_ko": [],
    "venueKeywords_ko": []
  },
  "aeoSchema": {
    "faqQuestions": ["웨딩 촬영 비용은 얼마인가요?"],
    "howToSteps": ["스튜디오 상담 신청하기"],
    "review_required_fields": ["exact_pricing", "location"]
  }
}

Generate 5-8 intents, 8-12 QIS questions, comprehensive keyword maps. Be brand-specific.`;

    const model = getModelForTask('planner');
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
    if (!jsonMatch) throw new Error('No JSON found in semantic strategy response');

    const rawData: unknown = JSON.parse(jsonMatch[0]);
    const strategy = SemanticStrategyOutputSchema.parse(rawData);

    await completeJobStep(
      stepId,
      true,
      `Semantic strategy generated: ${strategy.searchIntentMap.intents.length} intents, ${strategy.qisGrowthRegistry.questions.length} QIS questions`,
    );

    return {
      intermediate: {
        ...state.intermediate,
        semanticStrategy: strategy as unknown as Record<string, unknown>,
      },
      runtime: {
        ...state.runtime,
        currentNode: 'knowledge_graph',
        completedNodes: [...state.runtime.completedNodes, 'semantic_strategy'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return {
      runtime: {
        ...state.runtime,
        currentNode: 'semantic_strategy',
        status: 'failed',
        errorMessage: msg,
      },
    };
  }
}
