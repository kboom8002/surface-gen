import { z } from 'zod';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { getModelForTask } from '../services/model-client.js';

const CopySystemSchema = z.object({
  brandVoice: z.object({
    tone: z.string(),
    formality: z.string(),
    keywords: z.array(z.string()),
    avoid: z.array(z.string()),
  }),
  pageVoiceRules: z.record(z.object({
    tone: z.string(),
    cta: z.string(),
    emotionTrigger: z.string(),
    headline: z.string(),
  })),
  ctaStrategyMap: z.object({
    low_intent: z.string(),
    mid_intent: z.string(),
    high_intent: z.string(),
    booking: z.string(),
  }),
  microcopyLibrary: z.object({
    formPlaceholders: z.record(z.string()),
    errorMessages: z.record(z.string()),
    emptyStates: z.record(z.string()),
    successMessages: z.record(z.string()),
  }),
  seoMeta: z.object({
    titleTemplate: z.string(),
    descriptionTemplate: z.string(),
  }),
});

const SYSTEM_PROMPT = `You are a professional UX Copywriter specializing in the Korean wedding industry.
Generate a cohesive UX copy and microcopy system for a wedding studio brand based on the brand truth provided.

CRITICAL RULES:
- Write ALL user-facing guidelines, keywords, headlines, placeholders, CTAs, empty states, and success messages in Korean (한국어).
- Ensure the tone matches the brand's positioning.
- Avoid aggressive sale keywords like "100% 보장", "최고", "최대" in the avoid list.
- Slugs/keys must stay in English.
- Output ONLY valid JSON matching the schema. No markdown wrapping.`;

export async function copySystemNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'copy_system');
  try {
    const tenantSlug = state.tenantSlug;
    const bt = state.intermediate.brandTruthSheet;
    const brandName = bt?.officialBrandName ?? tenantSlug;
    const positioning = bt?.positioning ?? '';

    const userPrompt = `Brand Name: ${brandName}
Tenant Slug: ${tenantSlug}
Brand Positioning: ${positioning}

Please generate the Copy System JSON matching the schema.
Structure:
{
  "brandVoice": {
    "tone": "warm_professional",
    "formality": "semi_formal",
    "keywords": ["...", "..."],
    "avoid": ["...", "..."]
  },
  "pageVoiceRules": {
    "portfolio": { "tone": "...", "cta": "...", "emotionTrigger": "...", "headline": "..." },
    "catalog": { "tone": "...", "cta": "...", "emotionTrigger": "...", "headline": "..." },
    "answers": { "tone": "...", "cta": "...", "emotionTrigger": "...", "headline": "..." },
    "about": { "tone": "...", "cta": "...", "emotionTrigger": "...", "headline": "..." },
    "contact": { "tone": "...", "cta": "...", "emotionTrigger": "...", "headline": "..." }
  },
  "ctaStrategyMap": {
    "low_intent": "...",
    "mid_intent": "...",
    "high_intent": "...",
    "booking": "..."
  },
  "microcopyLibrary": {
    "formPlaceholders": {
      "name": "...",
      "date": "...",
      "phone": "...",
      "message": "..."
    },
    "errorMessages": {
      "required": "...",
      "invalidEmail": "...",
      "invalidPhone": "...",
      "submitFailed": "..."
    },
    "emptyStates": {
      "noPhotos": "...",
      "loading": "...",
      "noResults": "..."
    },
    "successMessages": {
      "submitted": "..."
    }
  },
  "seoMeta": {
    "titleTemplate": "{pageTitle} | {brandName}",
    "descriptionTemplate": "{description} {brandName}에서 확인하세요."
  }
}`;

    const model = getModelForTask('batch_low_risk');
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
    if (!jsonMatch) throw new Error('No JSON found in Copy System response');

    const rawData: unknown = JSON.parse(jsonMatch[0]);
    const copySystem = {
      tenantSlug,
      ...CopySystemSchema.parse(rawData),
    };

    await completeJobStep(stepId, true, 'Copy system generated');
    return {
      intermediate: { ...state.intermediate, copySystem },
      runtime: {
        ...state.runtime,
        currentNode: 'crosslink_schema',
        completedNodes: [...state.runtime.completedNodes, 'copy_system'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
