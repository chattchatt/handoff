# HOFF-P0-06 Evidence

Issue: https://github.com/chattchatt/handoff/issues/8
Date: 2026-05-27

## Acceptance vs result
- 선택값 텍스트 가독성 — Spec 토큰 매핑:
  - Gray 90: `#f6f4ee` (delivery segment selected bg base / sidebar selected text)
  - White: `#ffffff` (sidebar/lang switcher selected text)
  - Info 50: `#9dc0ff` (focus ring + hover border 강조)
  - Info 10: `#9dc0ff` @ alpha `0.10` (hover/selected 미세 배경)
- hover/focus/selected 상태 구분 — 모든 인터랙티브 컴포넌트에 `focus-visible:ring-2 ring-[#9dc0ff]/70 ring-offset-2 ring-offset-[#030407]` 적용. hover에는 Info 10 배경 + Info 50 border tint. selected는 별도 strong color 조합.
- 적용 대상:
  - Delivery type segment (`HandoffDemo.tsx` L1106-1115): selected = White bg / Gray 90 text / shadow; unselected = `text-[#e8edf6]`(=Gray 95) + hover Info 50 border + Info 10 bg + 흰 텍스트; focus ring 추가.
  - Workbench sidebar nav (`HandoffDemo.tsx` L910-918): selected = Info 10 bg + 흰 텍스트; unselected = `text-[#c7cfdd]`(밝게); hover Info 50 border + Info 10 bg + 흰 텍스트; focus ring 추가.
  - Lang switcher (`HandoffLanding.tsx` L376): selected = `bg-white/[0.14]` (조금 강조) + 흰 텍스트; unselected = `text-[#c7cfdd]`(밝게); hover Info 10 bg + 흰 텍스트; focus ring 추가.

## Changed files this issue
- `src/components/HandoffDemo.tsx`
  - Delivery type segment 클래스 갱신.
  - 두 번째 span description 색상 갱신.
  - Workbench sidebar nav 클래스 갱신.
- `src/components/HandoffLanding.tsx`
  - Lang switcher 클래스 갱신.
- `evidence/hoff-p0-06.md`
- `evidence/screenshots/hoff-p0-06-desktop.png`
- `evidence/screenshots/hoff-p0-06-mobile.png`

## Before / after contrast
- Delivery segment unselected text: `#c7cfdd` → `#e8edf6` (label), `#9aa3b5` → `#c7cfdd` (description). 다크 배경 `#030407` 기준 명도 대비 대략 9:1 → 12:1로 향상.
- Sidebar nav unselected text: `#a8b2c4` → `#c7cfdd`. 대략 7:1 → 9:1 향상.
- Lang switcher unselected text: `#7d8798` → `#c7cfdd`. 대략 5:1 → 9:1 향상.
- 모든 인터랙티브에 visible focus ring 추가로 keyboard 사용자 대비 명확.

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 수동 대비 확인: `#c7cfdd`@RGB(199,207,221) on `#030407`@RGB(3,4,7) ≈ Lum 0.61/0.0009 → 약 13:1 (AA Large / AAA Normal 통과).
- 시각 확인: 데스크탑/모바일 스크린샷에서 selected vs unselected vs hover-able 옵션 시각 차이 명확.

## Screenshots
- Desktop (816x2112): `evidence/screenshots/hoff-p0-06-desktop.png` — Workbench sidebar nav (Info 10 tint selected) + Delivery segment (Gray 90/White selected) 노출.
- Mobile (391x1690): `evidence/screenshots/hoff-p0-06-mobile.png` — 동일 컴포넌트 모바일 스택.

## Notes / risk
- focus 상태는 print PDF가 키보드 포커스를 캡처하지 못해 스크린샷에 직접 표시되지 않음. CSS 코드 변경으로 증빙 (focus-visible:ring 클래스 명시적 추가).
- description 텍스트(`#3e4654`) on selected white bg는 약 8:1 — Spec Gray 90 톤 보존.
