# 소스 입력 스펙 (Intake Specification)

> Wedding Surface Asset Factory에 투입되는 **브랜드 팩트시트**와 **사진 셀렉션**의 정형화된 입력 규격.
> 각 항목은 **필수 / 필요충분 / 충분** 3단계로 구분됩니다.

| 등급 | 의미 | 미제공 시 결과 |
|------|------|----------------|
| 🔴 **필수** | 이 항목 없이는 파이프라인이 정상 작동하지 않음 | 노드 실패 또는 전체 산출물 무효 |
| 🟡 **필요충분** | 없어도 돌아가지만, 산출물에 `review_required` 구멍이 다수 발생 | 사후 수작업 보완 필요 |
| 🟢 **충분** | 있으면 산출물 품질이 현저히 향상됨 | 없어도 기본 품질 확보 가능 |

---

## Part 1. 브랜드 팩트시트 (Brand Factsheet)

파일 형식: `.md`, `.yaml`, `.txt`, `.json` 중 택 1
인코딩: UTF-8
권장 형식: YAML (가장 정확한 파싱)

---

### 1.1 기본 정보 (Identity)

| 등급 | 필드명 | 설명 | 예시 |
|------|--------|------|------|
| 🔴 | `brand_name` | 공식 브랜드명 (한글) | `스튜디오 블라썸` |
| 🔴 | `brand_name_en` | 공식 브랜드명 (영문) | `Studio Blossom` |
| 🔴 | `tenant_slug` | URL용 슬러그 (영문 소문자, 하이픈) | `studio-blossom` |
| 🔴 | `primary_category` | 주력 서비스 카테고리 | `웨딩 스냅 촬영` |
| 🟡 | `sub_categories` | 부가 서비스 목록 | `[본식 스냅, 리허설, 셀프웨딩]` |
| 🟡 | `location` | 스튜디오/사무실 소재지 | `서울시 강남구 신사동 123-4` |
| 🟡 | `service_regions` | 출장/서비스 가능 지역 | `[서울, 경기, 제주]` |
| 🟢 | `founding_year` | 설립 연도 | `2018` |
| 🟢 | `founder_name` | 대표자/창업자 이름 | `김수진` |
| 🟢 | `team_size` | 팀 규모 | `대표 포함 5명` |

---

### 1.2 브랜드 정체성 (Brand Identity)

| 등급 | 필드명 | 설명 | 예시 |
|------|--------|------|------|
| 🔴 | `brand_philosophy` | 브랜드 철학/비전 (2~5문장) | `자연광과 진정성 있는 순간을 담습니다...` |
| 🔴 | `signature_style` | 촬영/서비스 시그니처 스타일 | `필름톤, 자연광, 감성 다큐멘터리` |
| 🟡 | `target_audience` | 주요 타겟 고객층 | `20대 후반~30대 중반, 감성 선호 커플` |
| 🟡 | `brand_differentiator` | 경쟁 대비 핵심 차별점 (1~3개) | `대표 포토그래퍼 전 촬영 직접 참여` |
| 🟡 | `brand_keywords` | 브랜드를 대표하는 키워드 (3~7개) | `[자연스러움, 필름감성, 프리미엄, 맞춤형]` |
| 🟢 | `brand_story` | 창업 스토리/브랜드 히스토리 | `2018년 소규모 스튜디오로 시작하여...` |
| 🟢 | `brand_tone_of_voice` | 커뮤니케이션 톤앤매너 | `따뜻하고 전문적, 존댓말 기본` |
| 🟢 | `color_palette` | 브랜드 컬러 (HEX 코드) | `[#F5E6D3, #2C3E50, #D4A574]` |

---

### 1.3 프로그램/패키지 (Programs)

| 등급 | 필드명 | 설명 | 예시 |
|------|--------|------|------|
| 🔴 | `programs` | 제공 프로그램 목록 (최소 1개) | 아래 구조 참조 |
| 🔴 | `programs[].name` | 프로그램명 | `베이직 스냅` |
| 🔴 | `programs[].description` | 프로그램 설명 (2~5문장) | `본식 당일 3시간 촬영...` |
| 🟡 | `programs[].includes` | 포함 항목 리스트 | `[촬영 3시간, 보정본 200장, 원본 전달]` |
| 🟡 | `programs[].duration` | 소요 시간 | `3시간` |
| 🟡 | `programs[].deliverables` | 결과물 상세 | `보정본 200장, 4x6 앨범 1권` |
| 🟢 | `programs[].price_range` | 가격대 (확인 전이면 `review_required`) | `200만원대` 또는 `review_required` |
| 🟢 | `programs[].recommended_for` | 추천 대상 | `알뜰한 본식 기록을 원하는 커플` |

```yaml
# 프로그램 구조 예시
programs:
  - name: "베이직 스냅"
    description: "본식 당일 핵심 순간을 3시간 동안 집중 촬영합니다."
    includes:
      - 촬영 3시간
      - 보정본 200장
      - 원본 USB 전달
    duration: "3시간"
    deliverables: "보정본 200장 + 원본 전체"
    price_range: "review_required"
    recommended_for: "핵심 순간 위주의 기록을 원하는 커플"
```

---

### 1.4 프로세스/정책 (Process & Policy)

| 등급 | 필드명 | 설명 | 예시 |
|------|--------|------|------|
| 🟡 | `booking_process` | 예약 프로세스 단계 | `상담 → 미팅 → 계약 → 촬영 → 납품` |
| 🟡 | `delivery_timeline` | 납품 기간 | `촬영 후 4~6주` |
| 🟡 | `consultation_method` | 상담 방식 | `카카오톡 상담 후 대면 미팅` |
| 🟢 | `cancellation_policy` | 취소/환불 정책 (확인 전이면 `review_required`) | `review_required` |
| 🟢 | `revision_policy` | 보정 수정 정책 | `1회 무료 리터치 수정 포함` |

---

### 1.5 연락처/온라인 (Contact & Web Presence)

| 등급 | 필드명 | 설명 | 예시 |
|------|--------|------|------|
| 🔴 | `contact.phone` | 대표 전화번호 | `02-1234-5678` |
| 🟡 | `contact.email` | 이메일 | `hello@studioblossom.kr` |
| 🟡 | `contact.website` | 공식 웹사이트 | `https://studioblossom.kr` |
| 🟡 | `contact.instagram` | 인스타그램 계정 | `@studio_blossom` |
| 🟢 | `contact.kakao_channel` | 카카오톡 채널 | `스튜디오블라썸` |
| 🟢 | `contact.youtube` | 유튜브 채널 | `https://youtube.com/@studioblossom` |
| 🟢 | `contact.blog` | 블로그 | `https://blog.naver.com/studioblossom` |
| 🟢 | `operating_hours` | 영업 시간 | `월~금 10:00-19:00` |
| 🟢 | `address_detail` | 상세 주소 (층, 호수) | `3층 301호` |

---

### 1.6 검증 가능한 사실 (Verifiable Facts)

> ⚠️ **AGENTS.md 비발명(Non-Negotiable) 원칙 적용 영역**
> 아래 항목들은 **사실이 아니면 절대 기재하지 마세요.**
> 기재하지 않으면 LLM이 자동으로 `review_required` 처리합니다.
> **거짓 기재는 허위 콘텐츠 생성으로 직결됩니다.**

| 등급 | 필드명 | 설명 | 예시 |
|------|--------|------|------|
| 🟢 | `awards` | 수상 경력 (없으면 `[]`) | `[2023 웨딩앨범어워드 금상]` |
| 🟢 | `certifications` | 자격/인증 (없으면 `[]`) | `[]` |
| 🟢 | `media_mentions` | 미디어 소개 (없으면 `[]`) | `[더웨딩 매거진 2024년 3월호]` |
| 🟢 | `partnerships` | 공식 파트너십 | `[더채플앳청담 공식 협력사]` |
| 🟢 | `years_of_experience` | 경력 연수 | `7년` |
| 🟢 | `total_projects` | 누적 촬영 건수 | `약 1,200건` |
| 🟢 | `customer_reviews_summary` | 고객 리뷰 요약 (직접 인용 금지) | `review_required` |

---

### 1.7 전체 팩트시트 YAML 템플릿

```yaml
# ═══════════════════════════════════════════════════════
# 브랜드 팩트시트 (Brand Factsheet)
# Wedding Surface Asset Factory 입력용
# ═══════════════════════════════════════════════════════

# ── 🔴 필수: 기본 정보 ──────────────────────────────────
brand_name: ""
brand_name_en: ""
tenant_slug: ""
primary_category: ""

# ── 🔴 필수: 브랜드 정체성 ──────────────────────────────
brand_philosophy: ""
signature_style: ""

# ── 🔴 필수: 프로그램 (최소 1개) ────────────────────────
programs:
  - name: ""
    description: ""
    includes: []
    duration: ""
    deliverables: ""
    price_range: "review_required"
    recommended_for: ""

# ── 🔴 필수: 연락처 ────────────────────────────────────
contact:
  phone: ""

# ── 🟡 필요충분: 브랜드 확장 ────────────────────────────
sub_categories: []
location: ""
service_regions: []
target_audience: ""
brand_differentiator: ""
brand_keywords: []
booking_process: ""
delivery_timeline: ""
consultation_method: ""

# ── 🟡 필요충분: 온라인 프레즌스 ────────────────────────
  email: ""
  website: ""
  instagram: ""

# ── 🟢 충분: 브랜드 스토리 ──────────────────────────────
founding_year:
founder_name: ""
team_size: ""
brand_story: ""
brand_tone_of_voice: ""
color_palette: []

# ── 🟢 충분: 정책 ──────────────────────────────────────
operating_hours: ""
cancellation_policy: "review_required"
revision_policy: ""

# ── 🟢 충분: 검증 가능한 사실 (없으면 빈 배열) ─────────
awards: []
certifications: []
media_mentions: []
partnerships: []
years_of_experience:
total_projects:
customer_reviews_summary: "review_required"
```

---

## Part 2. 사진 셀렉션 (Photo Selection)

파일 형식: `.jpg`, `.jpeg`, `.png`, `.webp`
최소 해상도: 긴 변 기준 1200px 이상 권장
총 장수: 최소 20장, 최대 100장

---

### 2.1 사진 카테고리별 요구 사항

#### 🔴 필수 카테고리 (이것 없이는 파이프라인 산출물 불완전)

| 카테고리 | 최소 장수 | 설명 | 파이프라인 용도 |
|----------|-----------|------|-----------------|
| **시그니처/대표 컷** | 3장 | 브랜드를 가장 잘 대표하는 베스트 컷 | 히어로 이미지, 커버, OG 이미지 후보 |
| **본식 스냅 (실내)** | 5장 | 실제 본식 촬영 결과물 (실내 예식장) | 포트폴리오, 갤러리, 스타일 분석 |
| **본식 스냅 (야외/자연광)** | 5장 | 야외 또는 자연광 촬영 결과물 | 스타일 다양성 증명, 톤 분석 |

> **필수 카테고리 합계: 최소 13장**

#### 🟡 필요충분 카테고리 (없으면 해당 서비스 라인의 산출물이 빈약해짐)

| 카테고리 | 권장 장수 | 설명 | 파이프라인 용도 |
|----------|-----------|------|-----------------|
| **리허설/셀프웨딩** | 5~10장 | 별도 서비스 라인 결과물 | 서비스별 포트폴리오 분리 |
| **준비 과정 (Getting Ready)** | 3~5장 | 메이크업, 드레스 착장, 대기실 | 프로세스 시각화, 스토리텔링 |
| **커플 포트레이트** | 3~5장 | 두 사람이 함께 등장하는 포즈 컷 | 감성 톤 분석, 인물 구도 분류 |
| **가족/하객 순간** | 2~3장 | 축하, 세리머니, 감동 장면 | 다큐멘터리 스타일 증명 |

> **필요충분 카테고리 합계: 13~23장**

#### 🟢 충분 카테고리 (있으면 갤러리 다양성과 SEO 효과가 크게 향상됨)

| 카테고리 | 권장 장수 | 설명 | 파이프라인 용도 |
|----------|-----------|------|-----------------|
| **디테일 컷** | 3~5장 | 부케, 링, 드레스 디테일, 소품 | 갤러리 카테고리 확장, 섬세함 어필 |
| **공간/베뉴 컷** | 2~3장 | 예식장, 스튜디오, 촬영지 전경 | 장소 맥락, 환경 분류 |
| **흑백/특수 보정** | 2~3장 | 흑백, 필름 에뮬레이션 등 특수 톤 | 보정 스타일 다양성 증명 |
| **비하인드/작업 장면** | 1~2장 | 촬영 현장, 장비, 포토그래퍼 모습 | about_brand 시각 자료, 신뢰도 |

> **충분 카테고리 합계: 8~13장**

---

### 2.2 사진 품질 기준

| 등급 | 기준 | 설명 |
|------|------|------|
| 🔴 필수 | **실제 촬영 결과물일 것** | AI 생성 이미지, 스톡 포토 절대 불가. `can_represent_actual_work: true` 요건 |
| 🔴 필수 | **최종 보정본일 것** | RAW/미보정본은 스타일 분석 정확도 저하 |
| 🔴 필수 | **워터마크 최소화** | 대형 워터마크는 비전 분석을 방해함 |
| 🟡 필요충분 | **다양한 조명 조건 포함** | 자연광/인공광/혼합광 최소 2종 |
| 🟡 필요충분 | **다양한 구도 포함** | 전신/반신/클로즈업/와이드 최소 3종 |
| 🟢 충분 | **EXIF 데이터 유지** | 카메라, 렌즈, 촬영일 등 메타데이터 활용 가능 |
| 🟢 충분 | **긴 변 2000px 이상** | 고해상도일수록 디테일 분석 정밀도 향상 |

---

### 2.3 사진 권리 관련 주의사항

> ⚠️ **AGENTS.md Visual Truth 원칙 적용**

| 항목 | 규칙 |
|------|------|
| 고객 얼굴 노출 | 모든 사진은 초기 `rights_status: unknown` 처리. 공개 표면 게시 전 **반드시 인간 리뷰 필요** |
| 촬영 동의 | 포트폴리오 사용 동의를 받은 사진만 업로드 권장 |
| 타사 촬영물 | 다른 포토그래퍼의 촬영물 절대 불가 |
| AI 생성 이미지 | 업로드 금지. AI 비주얼은 별도 핸드오프 워크플로우 사용 |

---

### 2.4 파일명 규칙 (권장, 선택사항)

파일명에 카테고리 힌트를 포함하면 자동 분류 정확도가 향상됩니다.

```
형식: {카테고리}_{순번}.{확장자}

예시:
  signature_01.jpg
  signature_02.jpg
  ceremony_indoor_01.jpg
  ceremony_indoor_02.jpg
  outdoor_01.jpg
  getting_ready_01.jpg
  couple_portrait_01.jpg
  detail_bouquet_01.jpg
  behind_scene_01.jpg
```

사용 가능한 카테고리 접두어:

| 접두어 | 카테고리 |
|--------|----------|
| `signature` | 시그니처/대표 컷 |
| `ceremony_indoor` | 본식 실내 |
| `ceremony_outdoor` | 본식 야외 |
| `outdoor` | 야외/자연광 |
| `rehearsal` | 리허설 |
| `self_wedding` | 셀프웨딩 |
| `getting_ready` | 준비 과정 |
| `couple_portrait` | 커플 포트레이트 |
| `family` | 가족/하객 |
| `detail` | 디테일 컷 |
| `venue` | 공간/베뉴 |
| `bw` | 흑백/특수 |
| `behind` | 비하인드 |

---

## Part 3. 입력 조합별 예상 산출물 품질

| 입력 수준 | 팩트시트 | 사진 | 예상 결과 |
|-----------|----------|------|-----------|
| **최소 (🔴만)** | 필수 8개 필드 | 13~15장 | 기본 포트폴리오 + 다수 `review_required`. 사후 보완 30분+ |
| **표준 (🔴+🟡)** | 필수+필요충분 20개 필드 | 25~35장 | 완성도 높은 번들. `review_required` 5개 미만 |
| **프리미엄 (🔴+🟡+🟢)** | 전체 35개+ 필드 | 40~60장 | 거의 즉시 게시 가능 수준. 최소 검토만 필요 |

---

## Part 4. 체크리스트

### 팩트시트 제출 전 확인

- [ ] `brand_name`, `brand_name_en`, `tenant_slug` 기입 완료
- [ ] `brand_philosophy`, `signature_style` 2문장 이상 작성
- [ ] 프로그램 최소 1개 (`name` + `description` 필수)
- [ ] 대표 전화번호 기입
- [ ] 확인 안 된 사실은 `review_required` 또는 빈 값으로 처리
- [ ] 거짓 수상/인증/리뷰 기재 여부 재확인 → **절대 금지**

### 사진 제출 전 확인

- [ ] 총 20장 이상 준비
- [ ] 시그니처 컷 3장 이상 포함
- [ ] 실내/야외 각 5장 이상 포함
- [ ] 모든 사진이 실제 본인 촬영 결과물인지 확인
- [ ] AI 생성 이미지 혼입 여부 확인 → **절대 금지**
- [ ] 고객 초상권 동의 상태 확인 (미확인 시 파이프라인이 자동으로 비공개 처리)

---

> **이 문서는 파이프라인 v1.0 기준입니다.**
> 노드 추가/변경 시 입력 스펙도 함께 업데이트해야 합니다.
