# Brand Knowledge Graph Specification

## 1. Purpose

The Brand Knowledge Graph represents the wedding brand as a structured entity network. It connects brand identity, services, programs, visuals, styles, audiences, problems, proof, policies, answers, articles, and CTAs.

The graph is used for:

- internal linking
- SEO entity consistency
- AEO answer grounding
- GEO brand understanding
- claim validation
- content gap detection
- growth patch planning

## 2. Canonical Files

Files are written under `03_knowledge_graph/`:

```text
brand_knowledge_graph.json
entity_registry.json
entity_relation_edges.json
semantic_surface_map.json
```

The Claim-Proof-Boundary graph is specified separately in `CLAIM_PROOF_BOUNDARY_GRAPH_SPEC.md`.

## 3. Node Types

```ts
export type KnowledgeGraphNodeType =
  | 'Brand'
  | 'Service'
  | 'Program'
  | 'Policy'
  | 'VisualAsset'
  | 'Portfolio'
  | 'GalleryAlbum'
  | 'GalleryPhoto'
  | 'Style'
  | 'Mood'
  | 'Scene'
  | 'Audience'
  | 'Problem'
  | 'Proof'
  | 'Answer'
  | 'Article'
  | 'CTA'
  | 'Location'
  | 'Person'
  | 'WebPresence';
```

## 4. Node Schema

```ts
export type KnowledgeGraphNode = {
  node_id: string;
  node_type: KnowledgeGraphNodeType;
  label: string;
  canonical_name?: string;
  description?: string;
  source_basis: string[];
  confidence: number;
  review_status: 'approved' | 'review_required' | 'internal_only';
  related_uca_ids: string[];
  related_photo_ids: string[];
  payload: Record<string, unknown>;
};
```

## 5. Edge Types

```ts
export type KnowledgeGraphRelation =
  | 'offers'
  | 'includes'
  | 'recommended_for'
  | 'not_recommended_for'
  | 'has_problem'
  | 'resolves'
  | 'reduces_risk'
  | 'demonstrates'
  | 'supports'
  | 'expands'
  | 'follows'
  | 'belongs_to'
  | 'has_style'
  | 'has_mood'
  | 'located_in'
  | 'mentions'
  | 'requires_review';
```

## 6. Edge Schema

```ts
export type KnowledgeGraphEdge = {
  edge_id: string;
  from_node_id: string;
  relation: KnowledgeGraphRelation;
  to_node_id: string;
  confidence: number;
  evidence_ids: string[];
  source_basis: string[];
  review_status: 'approved' | 'review_required';
  payload: Record<string, unknown>;
};
```

## 7. Brand Knowledge Graph File

```ts
export type BrandKnowledgeGraph = {
  version: string;
  project_id: string;
  tenant_slug: string;
  generated_at: string;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  graph_summary: {
    node_count: number;
    edge_count: number;
    orphan_node_count: number;
    review_required_count: number;
  };
};
```

## 8. Required MVP Nodes

MVP must include:

```yaml
required_mvp_nodes:
  - one Brand node
  - at least one Service node
  - at least one Program node
  - at least one Policy node
  - at least one Portfolio or PortfolioDocent node
  - at least one Answer node
  - one Contact/CTA node
```

v1 should include:

```yaml
required_v1_nodes:
  - Brand
  - Service
  - Program
  - Policy
  - VisualAsset
  - GalleryAlbum
  - GalleryPhoto
  - Style
  - Mood
  - Scene
  - Audience
  - Problem
  - Proof
  - Answer
  - Article
  - CTA
  - Location
```

## 9. Required Relations

```yaml
required_relations:
  - Brand offers Program
  - Program includes Service
  - Program recommended_for Audience
  - Audience has_problem Problem
  - Answer resolves Problem
  - Policy reduces_risk Problem
  - Portfolio demonstrates Style
  - GalleryPhoto belongs_to GalleryAlbum
  - GalleryPhoto supports Portfolio
  - Article expands Answer
  - CTA follows Answer
```

## 10. Confidence Policy

```yaml
confidence_policy:
  1.0: client-provided verified fact
  0.9: verified public evidence
  0.8: visible image evidence or direct source text
  0.6: reasonable inference requiring review
  0.4: weak inference, internal only
```

Rules:

- Public copy may use only approved or bounded claims.
- Confidence below 0.7 must not become public claim text without review.
- Location, award, certification, review, and exact policy claims require explicit proof.

## 11. Semantic Surface Map

`semantic_surface_map.json` connects graph nodes to website surfaces.

```ts
export type SemanticSurfaceMap = {
  version: string;
  project_id: string;
  tenant_slug: string;
  surfaces: SemanticSurfaceRecord[];
};

export type SemanticSurfaceRecord = {
  surface_id: string;
  gnb_key: 'portfolio' | 'catalog' | 'gallery' | 'answers' | 'about' | 'contact';
  page_template: string;
  primary_node_ids: string[];
  supporting_node_ids: string[];
  primary_uca_ids: string[];
  supporting_uca_ids: string[];
  primary_photo_ids: string[];
  target_intent_ids: string[];
  target_question_ids: string[];
};
```

## 12. Validation Rules

The Knowledge Graph Integrity Gate passes when:

- exactly one primary Brand node exists
- all public UCA assets have at least one graph mapping
- no critical node is orphaned
- every claim-like relation has evidence or review_required
- every Program has Service and Policy links
- every Answer has Problem or Question links
- every PortfolioDocent has VisualAsset or GalleryPhoto links
- forbidden UCA types are not used as graph asset references
