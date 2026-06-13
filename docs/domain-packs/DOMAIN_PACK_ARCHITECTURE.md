# Domain Pack Architecture

## Purpose

Domain packs allow the factory to support industries beyond `wedding_sdm` without rewriting the core engine.

## Principle

```yaml
core_engine:
  stable: true
  responsibilities:
    - project/job orchestration
    - upload
    - model calls
    - validation
    - export

domain_pack:
  replaceable: true
  responsibilities:
    - surfaces
    - allowed asset types
    - forbidden claims
    - prompts
    - visual policy
    - QA profile
    - fixtures
```

## Required Domain Pack Fields

```typescript
export type DomainPack = {
  industryType: string;
  displayName: string;
  surfaces: SurfaceDefinition[];
  allowedAssetTypes: string[];
  forbiddenAssetTypes: string[];
  intakeSchema: unknown;
  customerJourney: unknown[];
  claimPolicy: unknown;
  evidencePolicy: unknown;
  visualPolicy: unknown;
  schemaOrgMap: unknown[];
  qaProfile: unknown;
  promptPack: unknown;
  fixtures: unknown;
};
```

## First Migration

1. Extract `wedding_sdm` rules into `packages/domain-packs/wedding_sdm`.
2. Inject `domainPack` into agent node context.
3. Ensure existing golden wedding fixtures pass unchanged.
4. Add consulting domain only after wedding pack is stable.
