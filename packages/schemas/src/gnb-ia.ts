import { z } from 'zod';

/**
 * GNB (Global Navigation Bar) / IA (Information Architecture) configuration schemas.
 * The GNB must contain the 6 standard section keys for wedding_sdm.
 */

export const GNB_STANDARD_KEYS = [
  'portfolio',
  'catalog',
  'gallery',
  'answers',
  'about',
  'contact',
] as const;

export type GnbKey = (typeof GNB_STANDARD_KEYS)[number];

// Define interface first to avoid circular type issues
export interface GnbNode {
  key: string;
  label: string;
  href: string;
  template: string;
  ssot_types: string[];
  is_enabled: boolean;
  page_intent?: string | undefined;
  customer_question?: string | undefined;
  primary_cta?: string | undefined;
  sort_order: number;
  children?: GnbNode[] | undefined;
}

// Use z.ZodType<GnbNode> with a z.lazy to handle the recursive children field
export const GnbNodeSchema: z.ZodType<GnbNode> = z.lazy(() =>
  z.object({
    key: z.string().min(1),
    label: z.string().min(1),
    href: z.string().min(1),
    template: z.string().min(1),
    ssot_types: z.array(z.string()),
    is_enabled: z.boolean(),
    page_intent: z.string().optional(),
    customer_question: z.string().optional(),
    primary_cta: z.string().optional(),
    sort_order: z.number().int().nonnegative(),
    children: z.array(GnbNodeSchema).optional(),
  }),
);

export const MobileNavItemSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  href: z.string().min(1),
});

export const GnbIaConfigSchema = z.object({
  tenant_slug: z.string().min(1),
  industry_type: z.literal('wedding_sdm'),
  version: z.string().min(1),
  nodes: z.array(GnbNodeSchema).max(7),
  mobile_bottom_nav: z.array(MobileNavItemSchema).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export type GnbIaConfig = z.infer<typeof GnbIaConfigSchema>;
export type MobileNavItem = z.infer<typeof MobileNavItemSchema>;

/**
 * Validates that a GNB config contains all required standard keys.
 * Returns missing keys (empty array = all present).
 */
export function validateGnbStandardKeys(config: GnbIaConfig): GnbKey[] {
  const nodeKeys = new Set(config.nodes.map((n) => n.key));
  return GNB_STANDARD_KEYS.filter((k) => !nodeKeys.has(k));
}
