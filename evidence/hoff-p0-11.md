# HOFF-P0-11 Evidence

Issue: https://github.com/chattchatt/handoff/issues/13
Date: 2026-05-27

## Acceptance vs result

### Spec 토큰 매핑
| Spec | Hex | 적용 위치 |
| --- | --- | --- |
| Background | #1A1F31 | 페이지 main bg, header overlay, hero gradient stop, demo workbench bg (3개 파일 일괄 치환) |
| Gray 90 | #2C3131 | `--hoff-gray-90` CSS 변수 정의 (`styles.css`). 시각 적용은 선택 카드 dark surface 후속 P1+ 도입 시 활용 가능 |
| Info 50 | #5D7EEB | focus ring, 강조 카드 border/bg base, hover border/tint (lang switcher / delivery segment / workbench sidebar / Follow-up Tasks highlight) |
| Info 30 | #7D98EE | `--hoff-info-30` CSS 변수 정의 |
| Info 10 | #BAC8F4 | `--hoff-info-10` CSS 변수 정의 |
| Danger 50 | #EE684E | `--hoff-danger-50` CSS 변수 정의 (실제 에러 상태에 추후 적용 대상) |
| White | #FFFFFF | selected nav text, primary CTA 텍스트, 강조 라벨 다수 |

### Primary CTA — 화면당 1개 검증
- Hero 영역: `실행 기억 만들기` 1개 = filled white primary, 나머지 `예시 보기`/`Workbench`/`GitHub 열기`는 secondary/ghost/링크.
- Workbench (`/app` 진입 시): `실행 기억 만들기` submit 버튼 1개 = filled white. 다른 영역 헤더 액션은 outline ghost 스타일.
- Result Header 액션 그룹 4개는 모두 outline ghost (transparent bg + 얇은 border) — primary 아님.

### 일관성 검증 — grep
- `grep -rn "#030407\|#9dc0ff" src/components/` 결과: 0건 (모두 Spec 토큰 #1A1F31 / #5D7EEB로 치환됨).
- `grep -rn "#1A1F31\|#5D7EEB" src/components/` 결과: 16건 분포 — Hero, Demo, Workbench, CLI quickstart 등 일관 적용.

## Changed files this issue
- `src/styles.css`
  - `:root`에 Spec 토큰 7종 CSS 변수 추가 (`--hoff-bg`, `--hoff-gray-90`, `--hoff-info-50`, `--hoff-info-30`, `--hoff-info-10`, `--hoff-danger-50`, `--hoff-white`).
- `src/components/HandoffLanding.tsx`
  - `bg-[#030407]` → `bg-[#1A1F31]`, header overlay/gradient stop 동일 치환.
  - focus ring/hover Info 색상 `#9dc0ff` → `#5D7EEB` 일괄.
- `src/components/HandoffDemo.tsx`
  - 메인 main bg + radial-gradient stops `#030407` → `#1A1F31`.
  - Workbench sidebar nav / delivery segment / Follow-up Tasks highlight Info ring/tint `#9dc0ff` → `#5D7EEB`.
  - 강조 shadow `rgba(157,192,255,...)` → `rgba(93,126,235,...)` (Info 50 RGB).
- `src/components/HeroMemoryScene.tsx`
  - Canvas fillStyle `#030407` → `#1A1F31`.
- `evidence/hoff-p0-11.md`
- `evidence/screenshots/hoff-p0-11-desktop.png` (full page concat 816x6336)
- `evidence/screenshots/hoff-p0-11-mobile.png` (full page concat 391x6760)

## Before / after
- 페이지 배경: `#030407` (near-black) → `#1A1F31` (Spec navy). Hero starscape는 그대로 위에 합성됨.
- focus ring·hover Info tint: `#9dc0ff` (라벤더 블루) → `#5D7EEB` (Spec Info 50 더 채도 높은 인디고).

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- Spec 토큰 grep 검증 (위).

## Screenshots
- Desktop full page (816x6336): `evidence/screenshots/hoff-p0-11-desktop.png` — Hero / Demo / Result Preview / How / CLI / Team 전 구간 동일 배경 + Info 50 강조 색상 일관 적용.
- Mobile full page (391x6760): `evidence/screenshots/hoff-p0-11-mobile.png` — 동일 토큰 적용 노출.

## Notes / risk
- Spec Gray 90 (#2C3131)는 카드/패널 surface 색으로 직접 적용하지 않음 — 현재 디자인이 glass panel (translucent white over bg)로 동작하며 변경 시 광범위한 UI 영향. P0 범위는 토큰 등록 + 핵심 Info/Background 적용으로 제한.
- Spec Danger 50도 CSS 변수만 등록. 향후 에러 상태 UI 적용 시 즉시 사용 가능.
- Hero MemoryScene 캔버스는 GPU 비활성 환경에서는 정적 별 배경으로만 렌더되지만 색 토큰은 적용됨.
