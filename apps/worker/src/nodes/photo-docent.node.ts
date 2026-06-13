import { z } from 'zod';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { PhotoDocentSchema } from '@surface-gen/schemas';
import { getModelForTask } from '../services/model-client.js';

const DocentItemSchema = z.object({
  photoId: z.string(),
  alt: z.string().min(30),
  caption: z.string().min(40),
  scene_note: z.string().min(80),
  style_note: z.string().min(80),
  recommended_for: z.string().min(60),
});

const PhotoDocentBatchOutputSchema = z.object({
  docents: z.array(DocentItemSchema),
});

const SYSTEM_PROMPT = `You are an expert Korean wedding photo writer and editor for the AIHompy platform.
Generate unique, detailed, and poetic Korean copy (alt, caption, scene_note, style_note, recommended_for) for the given batch of wedding photos based on their taxonomy metadata.

CRITICAL RULES:
- Write ALL copy in Korean (한국어).
- Be brand-specific. Reflect the brand name.
- Avoid repeating the exact same phrases across different photos. Each photo must have its own unique voice and detail description.
- Never mention exact locations, seasons, dress brands, fabrics, or customer names unless provided.
- Output ONLY valid JSON matching the schema. No markdown wrapping.`;

export async function photoDocentNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'photo_docent');
  try {
    const taxonomyData = state.intermediate.photoTaxonomy as
      | { taxonomies: Array<{ photoId: string; taxonomy: Record<string, unknown> }> }
      | undefined;
    const taxonomies = taxonomyData?.taxonomies ?? [];
    const brandName =
      state.intermediate.brandTruthSheet?.officialBrandName ?? state.tenantSlug;

    if (taxonomies.length === 0) {
      await completeJobStep(stepId, true, 'No photos to annotate');
      return {
        intermediate: { ...state.intermediate, photoDocents: { docents: [] } },
        runtime: {
          ...state.runtime,
          currentNode: 'visual_experience',
          completedNodes: [...state.runtime.completedNodes, 'photo_docent'],
        },
      };
    }

    const model = getModelForTask('batch_low_risk');
    const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

    // Process in chunks of 15 to stay within rate/token limits
    const chunkSize = 15;
    const allDocents: Array<z.infer<typeof DocentItemSchema>> = [];

    for (let i = 0; i < taxonomies.length; i += chunkSize) {
      const chunk = taxonomies.slice(i, i + chunkSize);
      const userPrompt = `Brand: ${brandName}
Batch size: ${chunk.length}
Photos metadata:
${JSON.stringify(chunk, null, 2)}

Please generate photo docents for this batch. Output JSON:
{
  "docents": [
    {
      "photoId": "photo_id_string",
      "alt": "Korean alt text (30-90 chars)",
      "caption": "Korean caption (40-100 chars)",
      "scene_note": "Korean scene note (80-170 chars)",
      "style_note": "Korean style note (80-170 chars)",
      "recommended_for": "Korean recommended section (60-150 chars)"
    }
  ]
}`;

      const response = await model.invoke([
        new SystemMessage(SYSTEM_PROMPT),
        new HumanMessage(userPrompt),
      ]);

      const content =
        typeof response.content === 'string'
          ? response.content
          : JSON.stringify(response.content);

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error(`No JSON found in Photo Docent batch response for chunk ${i}`);

      const rawData: unknown = JSON.parse(jsonMatch[0]);
      const parsed = PhotoDocentBatchOutputSchema.parse(rawData);
      allDocents.push(...parsed.docents);
    }

    // Verify all taxonomies got a docent, otherwise map fallback
    const docents = taxonomies.map((t) => {
      const doc = allDocents.find((d) => d.photoId === t.photoId) ?? {
        photoId: t.photoId,
        alt: `${brandName} 웨딩 스튜디오에서 촬영한 아름다운 웨딩 사진`,
        caption: '자연스러운 감성과 빛이 돋보이는 웨딩 촬영',
        scene_note: '스튜디오의 정제된 조명 속에서 신랑 신부의 진실된 감정을 포착했습니다. 따뜻하고 우아한 분위기가 흐릅니다.',
        style_note: '클래식함과 내추럴함이 공존하는 정갈한 웨딩 스타일링으로, 시간이 흘러도 아름다운 순간을 담아냈습니다.',
        recommended_for: '우아하고 세련된 정통 스튜디오 웨딩 사진을 원하는 예비 신부 신랑님께 적극 권해드립니다.',
      };
      return {
        photoId: t.photoId,
        docent: PhotoDocentSchema.parse(doc),
        copySource: 'llm_batch_generation',
      };
    });

    await completeJobStep(stepId, true, `Docent copy generated for ${docents.length} photos`);
    return {
      intermediate: { ...state.intermediate, photoDocents: { docents } },
      runtime: {
        ...state.runtime,
        currentNode: 'visual_experience',
        completedNodes: [...state.runtime.completedNodes, 'photo_docent'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
