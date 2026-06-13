import { randomUUID } from 'crypto';
import { createJobStep, completeJobStep } from '../services/job-state-store.js';
import type { FactoryJobState } from '../state/factory-job-state.js';

// AI visuals: can_represent_actual_work ALWAYS false
// NEVER use AI visuals as portfolio proof
export async function aiVisualOsNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'ai_visual_os');
  try {
    const tenantSlug = state.tenantSlug;
    const brandName =
      state.intermediate.brandTruthSheet?.officialBrandName ?? tenantSlug;

    const aiVisualBriefs = [
      {
        visualAssetId: randomUUID(),
        promptId: `prompt_${tenantSlug}_process_001`,
        briefType: 'ai_process_visual',
        // can_represent_actual_work ALWAYS false — never used as portfolio
        canRepresentActualWork: false as const,
        intendedUse: 'service_process_visual',
        allowedPages: ['catalog', 'answers', 'about'],
        prohibitedPages: ['portfolio', 'gallery'], // NEVER portfolio
        disclosureText: 'AI 생성 이미지입니다. 실제 촬영 결과물이 아닙니다.',
        prompt: `${brandName} 웨딩 스튜디오 촬영 과정을 부드럽고 전문적으로 표현한 일러스트레이션. 상담, 촬영, 편집 과정을 아이콘이나 미니멀 그래픽으로 표현. 실제 인물이나 특정 장소 없이 추상적으로만 표현.`,
        negativePrompt: '실제 웨딩 사진, 특정 인물, 특정 장소명, 가격 정보',
        qaStatus: 'unchecked',
        rightsStatus: 'review_required',
        approvedForPublic: false,
      },
      {
        visualAssetId: randomUUID(),
        promptId: `prompt_${tenantSlug}_catalog_001`,
        briefType: 'ai_concept_visual',
        canRepresentActualWork: false as const, // ALWAYS false
        intendedUse: 'package_concept_visual',
        allowedPages: ['catalog'],
        prohibitedPages: ['portfolio', 'gallery'], // NEVER portfolio
        disclosureText: 'AI 생성 이미지입니다. 실제 촬영 결과물이 아닙니다.',
        prompt: `웨딩 패키지 개념을 표현하는 우아한 편집 디자인. 꽃, 링, 리본 등 웨딩 요소를 활용한 미니멀리스트 컨셉 아트. 특정 인물이나 장소 없이 개념적으로만 표현.`,
        negativePrompt: '실제 인물 사진, 특정 신랑신부, 가격 정보, 경쟁사 이름',
        qaStatus: 'unchecked',
        rightsStatus: 'review_required',
        approvedForPublic: false,
      },
    ];

    await completeJobStep(
      stepId,
      true,
      `AI visual briefs: ${aiVisualBriefs.length} (all can_represent_actual_work=false)`,
    );
    return {
      intermediate: { ...state.intermediate, aiVisualBriefs },
      runtime: {
        ...state.runtime,
        currentNode: 'crosslink_schema',
        completedNodes: [...state.runtime.completedNodes, 'ai_visual_os'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
