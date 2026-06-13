import { describe, it, expect } from 'vitest';
import {
  UniversalContentAssetSchema,
  isForbiddenUcaType,
  parseUcaArray,
  UCA_CATEGORY_MAP,
} from './ssot-uca';
import { randomUUID } from 'crypto';

describe('SSoT UCA Schema', () => {
  const validBaseAsset = {
    id: randomUUID(),
    tenant_id: 'studio-blanc',
    type: 'portfolio',
    category: 'portfolio',
    title: '낭만적인 야외 가든 웨딩 포트폴리오',
    slug: 'romantic-garden-wedding',
    summary: '자연스러운 정원 속에서 두 사람의 소중한 약속을 담은 포트폴리오입니다.',
    status: 'active',
    review_status: 'pending_review',
    sort_order: 1,
    json_payload: {
      seo_title: '야외 가든 웨딩 촬영 | 스튜디오 블랑',
      meta_description: '자연광 속 맑고 투명한 야외 웨딩 포트폴리오',
    },
    body: '본문 텍스트',
    body_richtext: '<p>본문 HTML</p>',
  };

  it('should validate a correct UCA asset', () => {
    const parsed = UniversalContentAssetSchema.safeParse(validBaseAsset);
    expect(parsed.success).toBe(true);
  });

  it('should fail validation when a required field is missing', () => {
    const invalidAsset = { ...validBaseAsset, title: undefined };
    const parsed = UniversalContentAssetSchema.safeParse(invalidAsset);
    expect(parsed.success).toBe(false);
  });

  it('should correctly identify forbidden UCA types', () => {
    expect(isForbiddenUcaType('package')).toBe(true);
    expect(isForbiddenUcaType('answer_faq')).toBe(true);
    expect(isForbiddenUcaType('gallery_photos')).toBe(true);
    expect(isForbiddenUcaType('portfolio')).toBe(false);
    expect(isForbiddenUcaType('answer')).toBe(false);
  });

  it('should map UCA types to GNB categories correctly', () => {
    expect(UCA_CATEGORY_MAP['portfolio']).toBe('portfolio');
    expect(UCA_CATEGORY_MAP['program']).toBe('catalog');
    expect(UCA_CATEGORY_MAP['answer']).toBe('answers');
    expect(UCA_CATEGORY_MAP['about_brand']).toBe('about');
    expect(UCA_CATEGORY_MAP['contact_info']).toBe('contact');
  });

  it('should parse an array of UCAs and filter out forbidden/invalid entries', () => {
    const list = [
      validBaseAsset,
      { ...validBaseAsset, id: randomUUID(), type: 'package' }, // Forbidden
      { ...validBaseAsset, id: randomUUID(), title: '' }, // Invalid
    ];

    const result = parseUcaArray(list);
    expect(result.valid.length).toBe(1);
    expect(result.forbidden.length).toBe(1);
    expect(result.forbidden[0]?.type).toBe('package');
    expect(result.invalid.length).toBe(1);
  });
});
