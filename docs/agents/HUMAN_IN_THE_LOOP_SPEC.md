# Human-in-the-Loop Spec

## 1. Purpose

This document defines when the system must pause for human review and how review decisions affect generated outputs.

The product must fail safely. It must not publish unsupported facts, unclear policies, unapproved AI visuals, or rights-unclear customer images.

---

## 2. Review Item Types

```yaml
review_item_types:
  claim:
    description: A public claim needs proof or boundary review.
  policy:
    description: Pricing, refund, cancellation, delivery, or rights policy is ambiguous.
  price:
    description: Exact price or price range requires confirmation.
  review:
    description: Customer review authenticity or permission is unclear.
  evidence:
    description: Award, certification, partnership, or media mention lacks source.
  image_rights:
    description: Image public-use status is unknown or restricted.
  ai_visual_public_use:
    description: AI visual is planned for public website use.
  final_approval:
    description: Final package needs operator approval before production export.
```

---

## 3. Severity Levels

```yaml
severity:
  low:
    effect: non-blocking warning
  medium:
    effect: review recommended
  high:
    effect: blocks public-ready export for target asset
  critical:
    effect: blocks entire production export
```

---

## 4. Blocking Conditions

```yaml
blocking_conditions:
  unsupported_public_claim:
    severity: high
    action: approve, rewrite, mark draft, or remove
  unclear_refund_policy:
    severity: high
    action: confirm or mark policy_card review_required
  exact_price_without_source:
    severity: high
    action: confirm price or change to consultation_based
  unverified_review:
    severity: critical
    action: provide source, approve, or remove from public export
  public_image_rights_unknown:
    severity: critical
    action: confirm rights or exclude from public surfaces
  ai_visual_as_portfolio:
    severity: critical
    action: remap or remove
  final_production_export:
    severity: critical
    action: approve final package
```

---

## 5. Review Status Effects

```yaml
review_status_effects:
  approved:
    public_export: allowed
  review_required:
    public_export: blocked if severity high or critical
    draft_export: allowed with warning
  rejected:
    public_export: blocked
    action: remove or rewrite
  internal_only:
    public_export: blocked
    internal_export: allowed
```

---

## 6. Human Review Item Schema

```ts
export type HumanReviewItem = {
  id: string;
  projectId: string;
  jobId?: string;
  itemType: ReviewItemType;
  targetType: "asset" | "photo" | "claim" | "policy" | "visual" | "package";
  targetId: string;
  severity: "low" | "medium" | "high" | "critical";
  reason: string;
  evidenceRequired?: string[];
  suggestedAction?: string;
  status: "open" | "approved" | "rejected" | "resolved" | "deferred";
  resolutionNote?: string;
  createdAt: string;
  resolvedAt?: string;
};
```

---

## 7. UI Requirements

The review UI must show:

```yaml
review_ui:
  required_fields:
    - item type
    - target ID
    - severity
    - reason
    - generated content excerpt
    - source basis if available
    - suggested action
    - approval controls
  actions:
    - approve
    - reject
    - edit and approve
    - mark internal only
    - defer
```

---

## 8. Export Policy

```yaml
export_policy:
  draft_export:
    allowed_with:
      - open low/medium review items
      - clear warnings in manifest
  production_export:
    blocked_by:
      - open high review items
      - open critical review items
      - unapproved final approval gate
```

---

## 9. Audit Trail

Every review decision must be persisted.

```yaml
audit_trail:
  must_record:
    - reviewer user id
    - decision
    - timestamp
    - target id
    - before value when edited
    - after value when edited
    - resolution note
```
