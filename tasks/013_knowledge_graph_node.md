# Task 013: Knowledge Graph Node

## Goal
Implement brand knowledge graph and claim-proof-boundary graph generation.

## Context Docs
Read these before coding:
- AGENTS.md
- README.md
- docs/19_ACCEPTANCE_CRITERIA.md
- docs/domain/BRAND_KNOWLEDGE_GRAPH_SPEC.md
- docs/domain/CLAIM_PROOF_BOUNDARY_GRAPH_SPEC.md

## Files In Scope
You may edit:

```text
apps/worker/src/nodes/knowledge-graph.node.ts
packages/schemas/src/knowledge-graph.ts
packages/prompts/src/knowledge-graph.prompt.ts
packages/validators/src/knowledge-graph.validator.ts
tests/unit/knowledge-graph.test.ts
```

## Do Not Edit

```text
apps/web/*
supabase/migrations/*
```

## Requirements
- Generate nodes and edges for Brand, Service, Program, VisualAsset, Style, Audience, Problem, Proof, Policy, Answer, CTA.
- Generate claim-proof-boundary graph.
- Confidence below threshold must not become public claim.

## Acceptance Criteria
- Graph has Brand node.
- Every claim has proof or boundary.
- Unsupported claims are flagged.

## Verification Commands

```bash
pnpm typecheck
pnpm test -- knowledge-graph
```

## Report Back
After finishing, report:

- changed files
- commands run
- test results
- any known limitations
- remaining risks

## AI Pair-Coding Notes
- Follow `AGENTS.md` strictly.
- Do not introduce product requirements that are not in the referenced docs.
- Keep changes small and scoped.
- If a required file does not exist yet, create only the files listed in scope.
- If implementation requires changing a file outside scope, stop and report the reason.
