/**
 * Knowledge graph prompt builder.
 *
 * Generates the BrandKnowledgeGraph and optionally the ClaimProofBoundaryGraph
 * from the brand truth sheet and semantic strategy.
 *
 * Node types align with KG_NODE_TYPES in packages/schemas/src/knowledge-graph.ts.
 */

export type KnowledgeGraphPromptResult = {
  system: string;
  user: string;
  promptVersion: string;
};

export type KnowledgeGraphPromptVars = {
  tenantSlug: string;
  brandName: string;
  brandTruthJson: string;
};

/**
 * Build the knowledge graph generation prompt.
 */
export function buildKnowledgeGraphPrompt(
  vars: KnowledgeGraphPromptVars,
): KnowledgeGraphPromptResult {
  return {
    promptVersion: 'knowledge-graph.v1.0.0',
    system: `You are a knowledge graph architect for the wedding_sdm industry.
Build a brand knowledge graph from the provided brand truth sheet.

RULES:
- Only create nodes based on facts in the brand truth sheet.
- Node confidence must reflect source reliability (0.0 = no basis, 1.0 = explicit in factsheet).
- Every node must include a sourceBasis array listing where it came from.
- Nodes with confidence < 0.6 should NOT be used for public claims.
- Allowed node types: Brand, Service, Program, Policy, VisualAsset, Portfolio, GalleryAlbum,
  GalleryPhoto, Style, Mood, Scene, Audience, Problem, Proof, Answer, Article, CTA, Location, Person, WebPresence
- Allowed edge types: offers, includes, recommended_for, resolves, demonstrates, related_to,
  answers, links_to, authored_by, located_at, belongs_to, evidence_for, contradicts, depends_on,
  cross_links, mentions, targets
- Output must be valid JSON matching the BrandKnowledgeGraph schema`,
    user: `Build a knowledge graph for:
Brand: ${vars.brandName}
Tenant: ${vars.tenantSlug}

Brand truth:
---
${vars.brandTruthJson.substring(0, 6000)}
---

Return JSON:
{
  "tenantSlug": "${vars.tenantSlug}",
  "version": "1.0.0",
  "nodes": [
    {
      "nodeId": "<unique string>",
      "nodeType": "<NodeType>",
      "label": "<string>",
      "properties": {},
      "confidence": <0.0-1.0>,
      "sourceBasis": ["<factsheet section or field>"]
    }
  ],
  "edges": [
    {
      "edgeId": "<unique string>",
      "fromNodeId": "<nodeId>",
      "toNodeId": "<nodeId>",
      "edgeType": "<EdgeType>",
      "weight": <0.0-1.0>
    }
  ],
  "graphSummary": "<1-2 sentence summary>"
}

Include at minimum: 1 Brand node, 1+ Service nodes, 1+ Audience nodes.
Do NOT create Review, Award, or Certification nodes unless explicitly in the factsheet.`,
  };
}
