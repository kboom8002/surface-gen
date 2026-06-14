import { createJobStep, completeJobStep } from '../services/job-state-store';
import type { FactoryJobState } from '../state/factory-job-state';
import {
  FORBIDDEN_PUBLIC_UCA_TYPES,
  UniversalContentAssetSchema,
  type GateResult,
} from '@surface-gen/schemas';

// Required fields per AGENTS.md
const REQUIRED_UCA_FIELDS = [
  'id',
  'tenant_id',
  'type',
  'category',
  'title',
  'slug',
  'summary',
  'status',
  'review_status',
  'sort_order',
  'json_payload',
] as const;

const BODY_DENSITY_MIN: Record<string, number> = {
  about_brand: 900,
  brand_truth: 500,
  portfolio_docent: 1000,
  style_collection: 800,
  program: 1000,
  policy_card: 600,
  answer: 650,
  article: 3000,
  contact_info: 500,
  match_brief: 500,
};

function getBodyDensity(html: string): number {
  return html.replace(/<[^>]+>/g, '').length;
}

function makeGate(
  gateId: string,
  gateName: string,
  passed: boolean,
  severity: GateResult['severity'],
  summary: string,
  failures: GateResult['failures'] = [],
  warnings: GateResult['warnings'] = [],
): GateResult {
  return {
    gateId,
    gateName,
    status: passed ? (warnings.length > 0 ? 'warning' : 'pass') : (severity === 'fatal' || severity === 'blocking' ? 'blocked' : 'fail'),
    severity,
    summary,
    checkedAt: new Date().toISOString(),
    failures,
    warnings,
  };
}

export async function validationGatesNode(
  state: FactoryJobState,
): Promise<Partial<FactoryJobState>> {
  const stepId = await createJobStep(state.jobId, 'validation_gates');
  try {
    const assets = (state.outputs.universalContentAssets ?? []) as Array<Record<string, unknown>>;
    const gateResults: GateResult[] = [];
    let exportAllowed = true;

    // Gate 1: No forbidden UCA types
    const forbiddenFound = assets.filter((a) =>
      FORBIDDEN_PUBLIC_UCA_TYPES.includes(a['type'] as never),
    );
    gateResults.push(
      makeGate(
        'gate_01_no_forbidden_types',
        'No Forbidden UCA Types',
        forbiddenFound.length === 0,
        'fatal',
        forbiddenFound.length === 0
          ? `All ${assets.length} UCA types are allowed`
          : `${forbiddenFound.length} forbidden type(s) found`,
        forbiddenFound.map((a) => ({
          code: 'FORBIDDEN_UCA_TYPE',
          message: `Type '${a['type'] as string}' is forbidden in public UCAs`,
          assetId: a['id'] as string,
          fieldPath: 'type',
          recommendedAction: `Change type to an allowed equivalent`,
        })),
      ),
    );
    if (forbiddenFound.length > 0) exportAllowed = false;

    // Gate 2: Required fields present
    const missingRequiredFields = assets.filter((a) =>
      REQUIRED_UCA_FIELDS.some((f) => a[f] === undefined || a[f] === null || a[f] === ''),
    );
    gateResults.push(
      makeGate(
        'gate_02_required_fields',
        'Required UCA Fields Present',
        missingRequiredFields.length === 0,
        'fatal',
        `${assets.length - missingRequiredFields.length}/${assets.length} assets have all required fields`,
        missingRequiredFields.map((a) => ({
          code: 'MISSING_REQUIRED_FIELD',
          message: `Asset missing required field(s)`,
          assetId: a['id'] as string,
          recommendedAction: 'Populate all required UCA fields',
        })),
      ),
    );
    if (missingRequiredFields.length > 0) exportAllowed = false;

    // Gate 3: body + body_richtext present
    const missingBody = assets.filter(
      (a) => !a['body'] || !a['body_richtext'],
    );
    gateResults.push(
      makeGate(
        'gate_03_detail_fields',
        'Detail Fields Present (body, body_richtext)',
        missingBody.length === 0,
        'blocking',
        `${assets.length - missingBody.length}/${assets.length} assets have body fields`,
        missingBody.map((a) => ({
          code: 'MISSING_BODY',
          message: 'Missing body or body_richtext',
          assetId: a['id'] as string,
          recommendedAction: 'Add body and body_richtext content',
        })),
      ),
    );

    // Gate 4: Body richtext density
    const densityFailed = assets.filter((a) => {
      const type = a['type'] as string;
      const min = BODY_DENSITY_MIN[type];
      if (!min) return false;
      const body = (a['body_richtext'] as string | undefined) ?? '';
      return getBodyDensity(body) < min;
    });
    gateResults.push(
      makeGate(
        'gate_04_body_density',
        'Body Richtext Density',
        densityFailed.length === 0,
        'blocking',
        densityFailed.length === 0
          ? 'All assets meet minimum Korean character density'
          : `${densityFailed.length} asset(s) below minimum density`,
        densityFailed.map((a) => ({
          code: 'INSUFFICIENT_BODY_DENSITY',
          message: `${a['type'] as string}: ${getBodyDensity((a['body_richtext'] as string) ?? '')} chars < ${BODY_DENSITY_MIN[a['type'] as string] ?? 0} minimum`,
          assetId: a['id'] as string,
          recommendedAction: 'Expand body_richtext to meet minimum density',
        })),
      ),
    );

    // Gate 5: AI visual truth
    const badAiVisuals = (
      (state.intermediate.aiVisualBriefs as Array<Record<string, unknown>> | undefined) ?? []
    ).filter((v) => v['canRepresentActualWork'] === true);
    gateResults.push(
      makeGate(
        'gate_05_ai_visual_truth',
        'AI Visual Truth (canRepresentActualWork=false)',
        badAiVisuals.length === 0,
        'fatal',
        badAiVisuals.length === 0
          ? 'All AI visuals correctly marked canRepresentActualWork=false'
          : `${badAiVisuals.length} AI visual(s) incorrectly claim actual work`,
        badAiVisuals.map((v) => ({
          code: 'AI_VISUAL_TRUTH_VIOLATION',
          message: 'AI visual must never claim to represent actual work',
          assetId: v['visualAssetId'] as string,
          recommendedAction: 'Set canRepresentActualWork=false',
        })),
      ),
    );
    if (badAiVisuals.length > 0) exportAllowed = false;

    // Gate 6: Unique IDs
    const ids = assets.map((a) => a['id'] as string);
    const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
    gateResults.push(
      makeGate(
        'gate_06_unique_ids',
        'Unique UCA IDs',
        dupes.length === 0,
        'fatal',
        dupes.length === 0 ? 'All IDs are unique' : `Duplicate IDs: ${dupes.join(', ')}`,
        dupes.map((id) => ({
          code: 'DUPLICATE_ID',
          message: `Duplicate ID: ${id}`,
          assetId: id,
          recommendedAction: 'Use randomUUID() to ensure unique IDs',
        })),
      ),
    );
    if (dupes.length > 0) exportAllowed = false;

    // Gate 7: Zod schema compliance
    const zodFailed = assets.filter((a) => !UniversalContentAssetSchema.safeParse(a).success);
    gateResults.push(
      makeGate(
        'gate_07_zod_schema',
        'Zod Schema Compliance',
        zodFailed.length === 0,
        'fatal',
        `${assets.length - zodFailed.length}/${assets.length} pass Zod validation`,
        zodFailed.map((a) => ({
          code: 'ZOD_SCHEMA_FAIL',
          message: 'Asset failed Zod schema validation',
          assetId: a['id'] as string,
          recommendedAction: 'Fix data to match UniversalContentAssetSchema',
        })),
      ),
    );
    if (zodFailed.length > 0) exportAllowed = false;

    // Gate 8: Pricing review_required
    const programsNeedingReview = assets.filter(
      (a) =>
        a['type'] === 'program' &&
        a['review_status'] !== 'review_required',
    );
    gateResults.push(
      makeGate(
        'gate_08_pricing_review',
        'Pricing Marked review_required',
        programsNeedingReview.length === 0,
        'blocking',
        programsNeedingReview.length === 0
          ? 'All programs marked review_required'
          : `${programsNeedingReview.length} program(s) missing review flag`,
        [],
        programsNeedingReview.map((a) => ({
          code: 'PRICING_NEEDS_REVIEW',
          message: 'Program pricing must be review_required before publishing',
          assetId: a['id'] as string,
        })),
      ),
    );

    // Gate 9: Contact info review_required
    const contactNeedingReview = assets.filter(
      (a) => a['type'] === 'contact_info' && a['review_status'] !== 'review_required',
    );
    gateResults.push(
      makeGate(
        'gate_09_contact_review',
        'Contact Info Marked review_required',
        contactNeedingReview.length === 0,
        'warning',
        contactNeedingReview.length === 0
          ? 'All contact_info UCAs marked review_required'
          : `${contactNeedingReview.length} contact_info without review flag`,
        [],
        contactNeedingReview.map((a) => ({
          code: 'CONTACT_NEEDS_REVIEW',
          message: 'Contact details need human review before publishing',
          assetId: a['id'] as string,
        })),
      ),
    );

    // Gate 10: Non-empty slugs
    const nullSlugs = assets.filter((a) => !a['slug'] || (a['slug'] as string).trim() === '');
    gateResults.push(
      makeGate(
        'gate_10_slugs',
        'Non-Empty Slugs',
        nullSlugs.length === 0,
        'blocking',
        nullSlugs.length === 0 ? 'All assets have slugs' : `${nullSlugs.length} missing slug`,
        nullSlugs.map((a) => ({
          code: 'MISSING_SLUG',
          message: 'Asset has empty slug',
          assetId: a['id'] as string,
          recommendedAction: 'Provide a URL-safe slug',
        })),
      ),
    );

    // Gate 11: GNB/IA config
    const hasGnb = !!state.intermediate.gnbIaConfig;
    gateResults.push(
      makeGate(
        'gate_11_gnb_ia',
        'GNB/IA Config Present',
        hasGnb,
        'blocking',
        hasGnb ? 'GNB/IA config generated' : 'GNB/IA config missing — cannot build navigation',
      ),
    );

    // Gate 12: Knowledge graph
    const hasKg = !!state.intermediate.knowledgeGraph;
    gateResults.push(
      makeGate(
        'gate_12_knowledge_graph',
        'Knowledge Graph Present',
        hasKg,
        'warning',
        hasKg ? 'Knowledge graph generated' : 'Knowledge graph missing',
      ),
    );

    const passedCount = gateResults.filter((g) => g.status === 'pass' || g.status === 'warning').length;
    const criticalFailed = gateResults.filter(
      (g) => (g.status === 'blocked' || g.status === 'fail') && (g.severity === 'fatal' || g.severity === 'blocking'),
    );
    if (criticalFailed.length > 0) exportAllowed = false;

    await completeJobStep(
      stepId,
      exportAllowed,
      `Gates: ${passedCount}/${gateResults.length} passed. Export: ${exportAllowed}`,
    );

    return {
      qa: {
        gateResults,
        fatalErrors: criticalFailed.map((g) => `${g.gateId}: ${g.summary}`),
        repairAttempts: 0,
        maxRepairAttempts: 3,
        exportAllowed,
      },
      runtime: {
        ...state.runtime,
        currentNode: 'json_export',
        status: exportAllowed ? 'running' : 'review_required',
        completedNodes: [...state.runtime.completedNodes, 'validation_gates'],
      },
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await completeJobStep(stepId, false, undefined, msg);
    return { runtime: { ...state.runtime, status: 'failed', errorMessage: msg } };
  }
}
