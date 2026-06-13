# Deterministic Validator Spec

## 1. Purpose

Deterministic validators are TypeScript functions that check generated outputs without relying on an LLM.

They are the first line of defense against invalid JSON, broken relations, forbidden types, missing fields, and packaging errors.

---

## 2. Package Location

```text
packages/validators/src/
```

Recommended files:

```text
index.ts
encoding.validator.ts
content-density.validator.ts
ssot-type.validator.ts
uca-dedup.validator.ts
gnb-ia.validator.ts
seo-aeo.validator.ts
knowledge-graph.validator.ts
schema-readiness.validator.ts
answer-extractability.validator.ts
visual-experience.validator.ts
ux-copy.validator.ts
growth-operability.validator.ts
zip-manifest.validator.ts
```

---

## 3. Core Rules

```yaml
rules:
  - validators must be pure or mostly pure functions
  - validators must not call LLM APIs
  - validators must return structured failure objects
  - validators must not mutate input data
  - validators must be unit-tested with fixtures
  - validators must distinguish fatal, blocking, warning, and info
```

---

## 4. Common Helper Functions

```ts
export function countKoreanChars(value: string): number;
export function isNonEmptyString(value: unknown): value is string;
export function hasForbiddenUcaType(type: string): boolean;
export function resolveRelationIds(context: ValidatorContext): RelationResolutionResult;
export function resolveImagePaths(context: ValidatorContext): ImagePathResolutionResult;
export function makeFailure(input: FailureInput): GateFailure;
```

---

## 5. Content Density Validator

```yaml
input:
  - UniversalContentAsset[]
checks:
  - body exists for detailed public asset
  - body_richtext exists
  - body_richtext length meets minimum
  - body_richtext differs from summary
output:
  - GateResult
```

---

## 6. SSoT Type Validator

```yaml
input:
  - UniversalContentAsset[]
checks:
  - type in allowedWeddingSdmTypes
  - type not in forbiddenPublicTypes
  - category matches typeCategoryMap
output:
  - GateResult
```

---

## 7. Relation Validator

```yaml
input:
  - UniversalContentAsset[]
  - galleryAlbums
  - galleryPhotos
  - visualAssets
checks:
  - related_program_ids resolve
  - related_policy_ids resolve
  - related_answer_ids resolve
  - related_article_ids resolve
  - related_photo_ids resolve against gallery_photos.json
  - visual_asset_ids resolve against visual_asset_url_map_master.json
```

---

## 8. ZIP Manifest Validator

```yaml
input:
  - zip file listing
  - manifest
checks:
  - required 8 JSON files exist in 01_upload
  - SHA256 values match
  - no competing universal_content_assets file exists outside 01_upload
  - images referenced by JSON exist or are valid remote URLs
```

---

## 9. Unit Test Expectations

Every validator must include:

```yaml
tests:
  - pass fixture
  - fail fixture
  - edge case fixture
  - clear failure code assertion
```
