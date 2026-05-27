# HOFF-P1-04 Evidence

Issue: https://github.com/chattchatt/handoff/issues/18
Date: 2026-05-28

## Acceptance vs result
- 4종 중요도 태그 — `Importance` 타입과 4개 옵션 (`confirmed`, `action`, `review`, `prompt`) 도입. ko 라벨 / en 라벨:
  - `확정` / `Confirmed` — Info 50 `#5D7EEB` border + Info 10 bg + white text
  - `진행 필요` / `Action needed` — White-on-dark badge (Spec Gray 90 변형) + Info 10 left bar
  - `추가 확인` / `Needs review` — Danger 50 `#EE684E` border + Danger tint bg + light text
  - `AI 전달용` / `For AI` — Info 30 `#7D98EE` border + Info 30 tint bg + white text
- 좌측 컬러 바 + 굵은 제목 + 배지 — WorkbenchCard에 `absolute inset-y-0 left-0 w-[3px]` 세로 바 (Info 50/Info 10/Danger 50/Info 30 색). 카드 제목 `text-lg font-bold`로 강화. 우측 상단에 importance 배지.
- 카드별 매핑:
  - Summary → `confirmed` (확정)
  - Decisions → `confirmed` (확정)
  - Follow-up Tasks → `action` (진행 필요) + highlight 유지
  - Missing Context → `review` (추가 확인)
  - Context / Evidence → `confirmed` (확정)
  - AI Prompt → `prompt` (AI 전달용)
- 마케팅 preview 카드도 동일 패턴 적용 (`HandoffLanding.tsx` `PREVIEW_IMPORTANCE_STYLE` + previewCards에 `importance`·`tag` 필드 추가) — 라이브 dashboard와 디자인 정합성 유지 + headless 캡처 가능.

## Changed files this issue
- `src/components/HandoffDemo.tsx`:
  - L175-179 ko: `importanceConfirmed` / `importanceAction` / `importanceReview` / `importancePrompt` 키.
  - L278-282 en: 동일.
  - L573-624 `Importance` 타입 + `IMPORTANCE_STYLE` lookup (bar/badge 클래스).
  - L632-645 `WorkbenchCard` props에 `importance` / `importanceLabel` 추가.
  - L661-672 카드 헤더에 색 바 + 배지 렌더.
  - L1335-1474 6개 dashboard 카드에 importance/importanceLabel prop wire.
- `src/components/HandoffLanding.tsx`:
  - L119-220 `CardImportance` 타입 + `PreviewCard` 구조 확장. 6개 카드에 `importance`/`tag` 추가 (ko/en).
  - L222-238 `PREVIEW_IMPORTANCE_STYLE` 정의.
  - L485-510 카드 렌더링에 색 바 + 배지 적용.
- `evidence/hoff-p1-04.md`
- `evidence/screenshots/hoff-p1-04-desktop.png`
- `evidence/screenshots/hoff-p1-04-mobile.png`

## Spec 색상 매핑
- `확정` → Info 50 (`#5D7EEB`)
- `진행 필요` → White / Info 10 (`#BAC8F4`, lavender bar)
- `추가 확인` → Danger 50 (`#EE684E`)
- `AI 전달용` → Info 30 (`#7D98EE`)

모두 P0-11에서 등록한 `--hoff-*` Spec 토큰과 일치.

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 시각 확인: 마케팅 preview 카드 6장에 4종 태그 모두 노출 (확정 / 진행 필요 / 추가 확인 / AI 전달용). 좌측 컬러 바 + badge + 굵은 제목 모두 확인.

## Screenshots
- Desktop (816x1056): `evidence/screenshots/hoff-p1-04-desktop.png` — 마케팅 Result Dashboard preview 6장 카드에 4종 태그 모두 노출.
- Mobile (391x845): `evidence/screenshots/hoff-p1-04-mobile.png` — 동일 카드 모바일 스택 노출.

## Notes / risk
- 실 dashboard에 result가 채워질 때만 색 바 + 배지가 워크벤치 영역에서 시각 확인 가능. 마케팅 preview에서는 항상 노출 (headless 캡처 가능).
- Danger 50 색상이 좌측 바에 직접 적용되어 의도적 시각 경고 신호. Missing Context 카드에 적용.
