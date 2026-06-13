# Growth Loop Specification

## 1. Purpose

The Growth Loop turns the generated website package into an ongoing optimization system.

It uses:

- Search Console observations
- AI visibility checks
- consultation questions
- QA failures
- new photos
- policy changes
- conversion data

to update the SSoT assets, semantic strategy, knowledge graph, and exported package.

## 2. Canonical Files

Files are written under `07_growth/`:

```text
growth_experiment_backlog.json
content_refresh_calendar.json
ai_visibility_observation_plan.json
search_console_observation_plan.json
conversion_experiment_plan.json
```

## 3. Growth Experiment Backlog

```ts
export type GrowthExperimentBacklog = {
  version: string;
  project_id: string;
  tenant_slug: string;
  experiments: GrowthExperiment[];
};

export type GrowthExperiment = {
  experiment_id: string;
  hypothesis: string;
  target_page: string;
  target_asset_ids: string[];
  change_type:
    | 'seo_title'
    | 'meta_description'
    | 'answer_first_sentence'
    | 'body_richtext_expansion'
    | 'internal_link'
    | 'cta_copy'
    | 'form_field'
    | 'hero_image'
    | 'album_cover'
    | 'schema_patch'
    | 'knowledge_graph_patch';
  before_state?: string;
  proposed_change: string;
  expected_metric: Array<'impressions' | 'clicks' | 'scroll_depth' | 'consultation_click' | 'form_start' | 'form_submit' | 'ai_answer_visibility'>;
  priority_score: number;
  risk_level: 'low' | 'medium' | 'high';
  start_date?: string;
  review_date?: string;
  status: 'backlog' | 'planned' | 'running' | 'completed' | 'rejected';
};
```

## 4. Content Refresh Calendar

```ts
export type ContentRefreshCalendar = {
  version: string;
  project_id: string;
  tenant_slug: string;
  records: ContentRefreshRecord[];
};

export type ContentRefreshRecord = {
  asset_id: string;
  asset_type: string;
  refresh_frequency: 'weekly' | 'monthly' | 'quarterly' | 'when_policy_changes' | 'when_new_photos_added';
  triggers: string[];
  owner_role: 'operator' | 'client' | 'reviewer' | 'admin';
  next_review_at?: string;
  last_reviewed_at?: string;
};
```

Recommended refresh frequency:

```yaml
refresh_frequency:
  brand_truth: quarterly
  program: monthly_or_when_price_changes
  policy_card: immediate_when_policy_changes
  answer: monthly
  article: quarterly
  gallery_photos: monthly_or_when_new_photos_added
  portfolio_docent: monthly
  contact_info: when_changed
```

## 5. AI Visibility Observation Plan

```ts
export type AiVisibilityObservationPlan = {
  version: string;
  project_id: string;
  tenant_slug: string;
  monthly_questions: AiVisibilityQuestion[];
  observation_targets: Array<'ChatGPT' | 'Google_AI_features' | 'Gemini' | 'Perplexity_optional' | 'Naver_search_optional'>;
  scoring: {
    identity_clarity: string;
    proof_visibility: string;
    fit_clarity: string;
    policy_safety: string;
    action_clarity: string;
    hallucination_count: string;
  };
  patch_actions: string[];
};

export type AiVisibilityQuestion = {
  question_id: string;
  question: string;
  desired_answer_points: string[];
  related_asset_ids: string[];
  risk_if_wrong: string;
};
```

## 6. Search Console Observation Plan

```ts
export type SearchConsoleObservationPlan = {
  version: string;
  project_id: string;
  tenant_slug: string;
  tracked_pages: SearchObservationPage[];
  tracked_query_groups: SearchQueryGroup[];
  review_cycle: 'monthly';
};

export type SearchObservationPage = {
  page_path: string;
  page_type: string;
  related_asset_ids: string[];
  metrics: Array<'impressions' | 'clicks' | 'ctr' | 'average_position'>;
  patch_rules: string[];
};

export type SearchQueryGroup = {
  group_id: string;
  label: string;
  query_patterns: string[];
  target_asset_ids: string[];
};
```

## 7. Conversion Experiment Plan

```ts
export type ConversionExperimentPlan = {
  version: string;
  project_id: string;
  tenant_slug: string;
  experiments: ConversionExperiment[];
};

export type ConversionExperiment = {
  experiment_id: string;
  target_surface: 'portfolio' | 'catalog' | 'gallery' | 'answers' | 'about' | 'contact';
  target_asset_ids: string[];
  hypothesis: string;
  cta_variant_a: string;
  cta_variant_b?: string;
  form_change?: string;
  expected_signal: 'consultation_click' | 'form_start' | 'form_submit' | 'saved_reference_photo';
  status: 'backlog' | 'planned' | 'running' | 'completed';
};
```

## 8. 90-Day Loop

```yaml
90_day_loop:
  days_0_30:
    focus: indexing, trust, core conversion
    actions:
      - publish core GNB
      - publish minimum answer set
      - validate required 8 JSON
      - validate schema readiness
      - inspect QA reports

  days_31_60:
    focus: question expansion and image search context
    actions:
      - expand answers
      - publish article set
      - refine photo alt/caption
      - improve internal links
      - update QIS registry

  days_61_90:
    focus: conversion and AI visibility
    actions:
      - observe AI answers
      - patch distorted brand summaries
      - test CTA and form microcopy
      - refresh low-performing pages
      - update knowledge graph edges
```

## 9. Validation Gate

The Growth Operability Gate passes when:

- Growth backlog exists.
- Content refresh calendar exists.
- AI visibility observation plan exists.
- Search Console observation plan exists.
- Conversion experiment plan exists.
- Every plan references real target assets or marks missing assets as to-be-created.
