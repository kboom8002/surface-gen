import { createJobStep, completeJobStep } from '../services/job-state-store';
import type { FactoryJobState } from '../state/factory-job-state';
import { BrandKnowledgeGraphSchema } from '@surface-gen/schemas';
import { getModelForTask } from '../services/model-client';

const SYSTEM_PROMPT = `You are an AI Knowledge Graph Architect specializing in semantic modeling for brands (wedding_sdm industry).
Build a brand knowledge graph based on the brand truth sheet provided.

CRITICAL RULES:
- Write ALL node labels and property values in Korean (한국어).
- The tenantSlug must be set correctly.
- Allowed Node Types (nodeType) must be exactly one of: 'Brand', 'Service', 'Program', 'Policy', 'VisualAsset', 'Portfolio', 'GalleryAlbum', 'GalleryPhoto', 'Style', 'Mood', 'Scene', 'Audience', 'Problem', 'Proof', 'Answer', 'Article', 'CTA', 'Location', 'Person', 'WebPresence'.
- Allowed Edge Types (edgeType) must be exactly one of: 'offers', 'includes', 'recommended_for', 'resolves', 'demonstrates', 'related_to', 'answers', 'links_to', 'authored_by', 'located_at', 'belongs_to', 'evidence_for', 'contradicts', 'depends_on', 'cross_links', 'mentions', 'targets'.
- The graph must connect the main Brand to its Services, Programs, Audiences, and Styles/Moods.
- Confidence must be: 1.0 for verified facts, 0.8 for assumptions/claims, and <0.7 for review-required elements.
- Output ONLY valid JSON matching the BrandKnowledgeGraph schema. No markdown wrapping.`;

export async function knowledgeGraphNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'knowledge_graph');
  try {
    const brandName =
      state.intermediate.brandTruthSheet?.officialBrandName ?? state.tenantSlug;
    const tenantSlug = state.tenantSlug;
    const bt = state.intermediate.brandTruthSheet;

    const userPrompt = `Brand: ${brandName}
TenantSlug: ${tenantSlug}
Brand Truth Sheet:
${JSON.stringify(bt, null, 2)}

Please generate the BrandKnowledgeGraph JSON matching the BrandKnowledgeGraphSchema.
Structure:
{
  "tenantSlug": "${tenantSlug}",
  "version": "1.0.0",
  "nodes": [
    {
      "nodeId": "brand_${tenantSlug}",
      "nodeType": "Brand",
      "label": "${brandName}",
      "properties": { "tenantSlug": "${tenantSlug}", "industryType": "wedding_sdm" },
      "confidence": 1.0
    },
    ... (other nodes like Service, Program, Style, Mood, Audience, Proof, Answer, Location)
  ],
  "edges": [
    {
      "edgeId": "edge_brand_offers_service",
      "fromNodeId": "brand_${tenantSlug}",
      "toNodeId": "service_node_id",
      "edgeType": "offers",
      "weight": 1.0
    },
    ... (other edges connecting nodes)
  ],
  "graphSummary": "Korean summary of the knowledge graph"
}`;

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
    if (!jsonMatch) throw new Error('No JSON found in Knowledge Graph response');

    const rawGraph: unknown = JSON.parse(jsonMatch[0]);
    const knowledgeGraph = BrandKnowledgeGraphSchema.parse(rawGraph);

    await completeJobStep(
      stepId,
      true,
      `KG built: ${knowledgeGraph.nodes.length} nodes, ${knowledgeGraph.edges.length} edges`,
    );
    return {
      intermediate: { ...state.intermediate, knowledgeGraph },
      runtime: {
        ...state.runtime,
        currentNode: 'gnb_ia',
        completedNodes: [...state.runtime.completedNodes, 'knowledge_graph'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
