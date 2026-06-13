# Release Checklist

## 1. Purpose

This checklist must be completed before tagging a release candidate.

---

## 2. Product Checklist

```yaml
product:
  - project creation works
  - upload flow works
  - image rights metadata works
  - agent job runs
  - job progress is visible
  - QA Center renders gate results
  - Export Center generates package
```

---

## 3. Output Checklist

```yaml
outputs:
  - universal_content_assets_final.json exists
  - brand_profiles.json exists
  - design_config.json exists
  - gnb_ia_config.json exists
  - gallery_albums.json exists
  - gallery_photos.json exists
  - album_taxonomy_nodes.json exists
  - visual_asset_url_map_master.json exists
  - final_package_manifest.json exists
  - sha256_manifest.json exists
```

---

## 4. Validation Checklist

```yaml
validation:
  - UTF-8 Gate passes
  - Content Density Gate passes
  - SSoT Type Gate passes
  - UCA Dedup Gate passes
  - GNB/IA Sync Gate passes
  - SEO/AEO Readiness Gate passes
  - v1: all 12 gates pass or acceptable warnings only
```

---

## 5. Security Checklist

```yaml
security:
  - RLS policies enabled
  - users cannot access other users' projects
  - service role key not exposed to browser
  - storage paths authorized
  - ZIP downloads authorized
  - .env.example exists without secrets
```

---

## 6. AI Safety Checklist

```yaml
ai_safety:
  - unsupported claims marked review_required
  - fake reviews not generated
  - exact price/policy facts not invented
  - AI visuals cannot represent actual work
  - public AI visuals have disclosure
  - raw LLM output not persisted as approved data
```

---

## 7. Test Checklist

```yaml
tests:
  - pnpm typecheck passes
  - pnpm lint passes
  - unit tests pass
  - golden fixture tests pass
  - MVP E2E happy path passes
  - export preflight test passes
```

---

## 8. Release Decision

```yaml
release_decision:
  allowed_if:
    - no fatal validation failures
    - no unresolved critical human review items
    - no security blocker
    - required outputs generated
  blocked_if:
    - invalid JSON
    - forbidden UCA type in public output
    - public image rights unknown
    - AI visual used as actual portfolio
    - service role exposed
```
