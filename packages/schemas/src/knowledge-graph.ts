import { z } from 'zod';

/**
 * Brand knowledge graph schemas.
 * The graph captures entity relationships extracted from brand documents and image analysis.
 * Node types align with the database knowledge_graph_nodes table.
 */

export const KG_NODE_TYPES = [
  'Brand',
  'Service',
  'Program',
  'Policy',
  'VisualAsset',
  'Portfolio',
  'GalleryAlbum',
  'GalleryPhoto',
  'Style',
  'Mood',
  'Scene',
  'Audience',
  'Problem',
  'Proof',
  'Answer',
  'Article',
  'CTA',
  'Location',
  'Person',
  'WebPresence',
] as const;

export const KG_EDGE_TYPES = [
  'offers',
  'includes',
  'recommended_for',
  'resolves',
  'demonstrates',
  'related_to',
  'answers',
  'links_to',
  'authored_by',
  'located_at',
  'belongs_to',
  'evidence_for',
  'contradicts',
  'depends_on',
  'cross_links',
  'mentions',
  'targets',
] as const;

export const KnowledgeGraphNodeSchema = z.object({
  nodeId: z.string().min(1),
  nodeType: z.enum(KG_NODE_TYPES),
  label: z.string().min(1),
  properties: z.record(z.unknown()),
  confidence: z.number().min(0).max(1),
  sourceBasis: z.array(z.string()).optional(),
});

export const KnowledgeGraphEdgeSchema = z.object({
  edgeId: z.string().min(1),
  fromNodeId: z.string().min(1),
  toNodeId: z.string().min(1),
  edgeType: z.enum(KG_EDGE_TYPES),
  weight: z.number().min(0).max(1).optional(),
  confidence: z.number().min(0).max(1).optional(),
  evidenceIds: z.array(z.string()).optional(),
  properties: z.record(z.unknown()).optional(),
});

export const BrandKnowledgeGraphSchema = z.object({
  tenantSlug: z.string().min(1),
  version: z.string().min(1),
  nodes: z.array(KnowledgeGraphNodeSchema),
  edges: z.array(KnowledgeGraphEdgeSchema),
  graphSummary: z.string().optional(),
});

export type KnowledgeGraphNode = z.infer<typeof KnowledgeGraphNodeSchema>;
export type KnowledgeGraphEdge = z.infer<typeof KnowledgeGraphEdgeSchema>;
export type BrandKnowledgeGraph = z.infer<typeof BrandKnowledgeGraphSchema>;
