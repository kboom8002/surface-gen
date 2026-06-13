# Claim-Proof-Boundary Graph Specification

## 1. Purpose

The Claim-Proof-Boundary Graph prevents unsupported marketing claims from entering public content.

It connects:

- what the brand wants to say
- what evidence supports it
- what limitations must be disclosed
- where the claim may appear
- whether human review is required

## 2. Canonical File

```text
03_knowledge_graph/claim_proof_boundary_graph.json
```

## 3. Claim Types

```ts
export type ClaimType =
  | 'identity'
  | 'style'
  | 'service'
  | 'commercial'
  | 'policy'
  | 'trust'
  | 'comparison'
  | 'local'
  | 'visual'
  | 'outcome';
```

## 4. Claim Status

```ts
export type ClaimStatus =
  | 'allowed'
  | 'limited'
  | 'hold'
  | 'prohibited';
```

## 5. Claim Schema

```ts
export type ClaimRecord = {
  claim_id: string;
  claim_text: string;
  normalized_claim: string;
  claim_type: ClaimType;
  proof_ids: string[];
  boundary_ids: string[];
  allowed_surfaces: Array<'home' | 'portfolio' | 'catalog' | 'gallery' | 'answers' | 'about' | 'contact' | 'article'>;
  prohibited_surfaces: string[];
  status: ClaimStatus;
  review_status: 'approved' | 'review_required' | 'rejected';
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  source_basis: string[];
};
```

## 6. Proof Schema

```ts
export type ProofRecord = {
  proof_id: string;
  proof_type:
    | 'brand_factsheet'
    | 'actual_photo'
    | 'customer_review'
    | 'award'
    | 'certification'
    | 'partnership'
    | 'media_mention'
    | 'policy_document'
    | 'staff_profile'
    | 'web_presence';
  title: string;
  description?: string;
  source_url?: string;
  source_file_id?: string;
  related_photo_ids: string[];
  verified: boolean;
  public_use_allowed: boolean;
  review_status: 'approved' | 'review_required' | 'rejected';
};
```

## 7. Boundary Schema

```ts
export type BoundaryRecord = {
  boundary_id: string;
  boundary_text: string;
  applies_to_claim_ids: string[];
  required_copy?: string;
  required_policy_card_ids: string[];
  severity: 'low' | 'medium' | 'high';
};
```

## 8. Full Graph Schema

```ts
export type ClaimProofBoundaryGraph = {
  version: string;
  project_id: string;
  tenant_slug: string;
  generated_at: string;
  claims: ClaimRecord[];
  proofs: ProofRecord[];
  boundaries: BoundaryRecord[];
  blocked_claims: ClaimRecord[];
  summary: {
    allowed_count: number;
    limited_count: number;
    hold_count: number;
    prohibited_count: number;
    review_required_count: number;
  };
};
```

## 9. Forbidden Claims

The system must block or mark as prohibited:

```yaml
forbidden_claim_patterns:
  - "100% 만족 보장"
  - "절대 후회 없음"
  - "업계 최고"
  - "대한민국 1등"
  - "추가금 절대 없음"
  - "무조건 최저가"
  - "무조건 환불 가능"
  - "원하는 날짜 100% 보장"
  - "샘플과 100% 동일"
  - "피부 트러블 없음"
  - "절대 지워지지 않는 메이크업"
  - "모든 고객이 만족"
```

## 10. Limited Claims

Limited claims may be used only with boundary copy.

Examples:

```yaml
limited_claim_examples:
  price:
    claim: "합리적인 구성의 패키지"
    boundary: "최종 견적은 일정, 선택 구성, 외부 제휴 조건에 따라 달라질 수 있습니다."

  style:
    claim: "자연광 무드에 강점이 있습니다"
    boundary: "실제 결과는 촬영 공간, 시간대, 날씨, 조명 조건에 따라 달라집니다."

  schedule:
    claim: "빠른 상담이 가능합니다"
    boundary: "상담 가능 시간은 예약 상황에 따라 달라질 수 있습니다."
```

## 11. Generation Rules

- Every public trust claim must reference at least one proof or boundary.
- Reviews must never be invented.
- Awards and certifications require verified proof.
- Exact pricing and refund claims require policy source.
- Visual outcome claims must not guarantee identical results.
- Unsupported claims can be stored only as `hold` or `review_required`.

## 12. Gate Rules

The Claim-Proof-Boundary Gate passes when:

- All public claims are `allowed` or `limited`.
- Limited claims have required boundary copy.
- High-risk claims have human review or are excluded.
- Prohibited claims are not present in public body_richtext.
- All evidence references resolve.
