import { Annotation, StateGraph } from '@langchain/langgraph';
import type { FactoryJobState } from '../state/factory-job-state.js';
import { inputAuditNode } from '../nodes/input-audit.node.js';
import { brandTruthNode } from '../nodes/brand-truth.node.js';
import { semanticStrategyNode } from '../nodes/semantic-strategy.node.js';
import { knowledgeGraphNode } from '../nodes/knowledge-graph.node.js';
import { gnbIaNode } from '../nodes/gnb-ia.node.js';
import { photoInventoryNode } from '../nodes/photo-inventory.node.js';
import { photoTaxonomyNode } from '../nodes/photo-taxonomy.node.js';
import { photoDocentNode } from '../nodes/photo-docent.node.js';
import { visualExperienceNode } from '../nodes/visual-experience.node.js';
import { portfolioGenerationNode } from '../nodes/portfolio-generation.node.js';
import { catalogGenerationNode } from '../nodes/catalog-generation.node.js';
import { answerGenerationNode } from '../nodes/answer-generation.node.js';
import { articleGenerationNode } from '../nodes/article-generation.node.js';
import { aboutContactGenerationNode } from '../nodes/about-contact-generation.node.js';
import { copySystemNode } from '../nodes/copy-system.node.js';
import { aiVisualOsNode } from '../nodes/ai-visual-os.node.js';
import { crosslinkSchemaNode } from '../nodes/crosslink-schema.node.js';
import { ssotMaterializationNode } from '../nodes/ssot-materialization.node.js';
import { validationGatesNode } from '../nodes/validation-gates.node.js';
import { jsonExportNode } from '../nodes/json-export.node.js';
import { zipPackagingNode } from '../nodes/zip-packaging.node.js';

type NodeFn = (state: FactoryJobState) => Promise<Partial<FactoryJobState>>;

/** Placeholder for nodes not yet implemented */
function placeholderNode(name: string): NodeFn {
  return async (state: FactoryJobState): Promise<Partial<FactoryJobState>> => {
    console.log(`[${name}] placeholder — job ${state.jobId}`);
    return {
      runtime: {
        ...state.runtime,
        currentNode: name,
        completedNodes: [...state.runtime.completedNodes, name],
      },
    };
  };
}

const FactoryStateAnnotation = Annotation.Root({
  jobId: Annotation<string>({ reducer: (_a, b) => b }),
  projectId: Annotation<string>({ reducer: (_a, b) => b }),
  tenantId: Annotation<string>({ reducer: (_a, b) => b }),
  tenantSlug: Annotation<string>({ reducer: (_a, b) => b }),
  industryType: Annotation<'wedding_sdm'>({ reducer: (_a, b) => b }),
  schemaVersion: Annotation<'factory-state-v1'>({ reducer: (_a, b) => b }),
  inputs: Annotation<FactoryJobState['inputs']>({ reducer: (_a, b) => b }),
  intermediate: Annotation<FactoryJobState['intermediate']>({
    reducer: (a, b) => ({ ...a, ...b }),
  }),
  outputs: Annotation<FactoryJobState['outputs']>({
    reducer: (a, b) => ({ ...a, ...b }),
  }),
  review: Annotation<FactoryJobState['review']>({ reducer: (_a, b) => b }),
  qa: Annotation<FactoryJobState['qa']>({ reducer: (_a, b) => b }),
  runtime: Annotation<FactoryJobState['runtime']>({ reducer: (_a, b) => b }),
});

export function buildWeddingSurfaceFactoryGraph() {
  const builder = new StateGraph(FactoryStateAnnotation)
    // Phase 1: Intake & Strategy (Tasks 009-014)
    .addNode('intake_audit', inputAuditNode)
    .addNode('brand_truth', brandTruthNode)
    .addNode('semantic_strategy', semanticStrategyNode)
    .addNode('knowledge_graph', knowledgeGraphNode)
    .addNode('gnb_ia', gnbIaNode)
    // Phase 2: Visual Inventory (Tasks 015-018)
    .addNode('photo_inventory', photoInventoryNode)
    .addNode('photo_taxonomy', photoTaxonomyNode)
    .addNode('photo_docent', photoDocentNode)
    .addNode('visual_experience', visualExperienceNode)
    // Phase 3: Content Generation (Tasks 019-025)
    .addNode('portfolio_generation', portfolioGenerationNode)
    .addNode('catalog_generation', catalogGenerationNode)
    .addNode('answer_generation', answerGenerationNode)
    .addNode('article_generation', articleGenerationNode)
    .addNode('about_contact_generation', aboutContactGenerationNode)
    .addNode('copy_system', copySystemNode)
    .addNode('ai_visual_os', aiVisualOsNode)
    // Phase 4: Assembly (Tasks 026-027)
    .addNode('crosslink_schema', crosslinkSchemaNode)
    .addNode('ssot_materialization', ssotMaterializationNode)
    // Phase 5: QA & Export (Tasks 028-031)
    .addNode('validation_gates', validationGatesNode)
    .addNode('json_export', jsonExportNode)
    .addNode('zip_packaging', zipPackagingNode);

  builder
    .addEdge('__start__', 'intake_audit')
    .addEdge('intake_audit', 'brand_truth')
    // brand_truth fans out in parallel
    .addEdge('brand_truth', 'semantic_strategy')
    .addEdge('brand_truth', 'knowledge_graph')
    .addEdge('brand_truth', 'gnb_ia')
    .addEdge('brand_truth', 'photo_inventory')
    .addEdge('brand_truth', 'about_contact_generation')
    // Visual inventory chain
    .addEdge('photo_inventory', 'photo_taxonomy')
    .addEdge('photo_taxonomy', 'photo_docent')
    .addEdge('photo_docent', 'visual_experience')
    .addEdge('visual_experience', 'ai_visual_os')
    // GNB drives content generation
    .addEdge('gnb_ia', 'portfolio_generation')
    .addEdge('gnb_ia', 'catalog_generation')
    .addEdge('gnb_ia', 'copy_system')
    // Semantic strategy drives answers → articles
    .addEdge('semantic_strategy', 'answer_generation')
    .addEdge('answer_generation', 'article_generation')
    // Convergence at crosslink_schema
    .addEdge('portfolio_generation', 'crosslink_schema')
    .addEdge('catalog_generation', 'crosslink_schema')
    .addEdge('article_generation', 'crosslink_schema')
    .addEdge('about_contact_generation', 'crosslink_schema')
    .addEdge('copy_system', 'crosslink_schema')
    .addEdge('ai_visual_os', 'crosslink_schema')
    // Assembly & export chain
    .addEdge('crosslink_schema', 'ssot_materialization')
    .addEdge('ssot_materialization', 'validation_gates')
    .addEdge('validation_gates', 'json_export')
    .addEdge('json_export', 'zip_packaging')
    .addEdge('zip_packaging', '__end__');

  return builder.compile();
}
