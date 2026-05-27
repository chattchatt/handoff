# HOFF-P0-02 Evidence

Issue: https://github.com/chattchatt/handoff/issues/4
Date: 2026-05-27

## Acceptance vs result
- DOM/component 순서 — `src/components/HandoffLanding.tsx` 기준 섹션 순서 기록:
  - L394 Hero `<section>` (anchorless)
  - L443 Demo `<section id="demo">`
  - L458 Preview/Result Dashboard `<section id="preview">`
  - L494 How it works `<section id="how">`
  - L519 CLI section, 내부 `id="cli"` (eyebrow `고급 사용자용 CLI` = ko `quickstart` line 33)
  - L526 Team/Project section
- Desktop screenshot에서 Demo가 CLI보다 위 — `evidence/screenshots/hoff-p0-02-desktop.png` 풀페이지에서 시각적으로 확인됨 (Hero → Demo → Preview → How → HANDOFF CLI → HandOff by E-Hong).
- Mobile screenshot에서 Demo가 CLI보다 위 — `evidence/screenshots/hoff-p0-02-mobile.png` 풀페이지에서 동일 순서 확인.
- CLI 섹션 라벨 — ko `고급 사용자용 CLI`, en `Advanced CLI`, CLI 블록 내부 `Advanced path` 배지 함께 노출 (`HandoffLanding.tsx` line 33, 82, 40, 89).

## Changed files this issue
- (코드 변경 없음. 페이지 순서·CLI 라벨 모두 이전 uncommitted 변경에서 이미 정렬 완료. evidence 캡처만 추가.)
- `evidence/screenshots/hoff-p0-02-desktop.png` 풀페이지 캡처 (816x6336, Chrome `--print-to-pdf` Letter 6장 concat).
- `evidence/screenshots/hoff-p0-02-mobile.png` 풀페이지 캡처 (391x6760, Chrome CDP `Page.printToPDF` 4.06×8.79in 8장 concat).
- `evidence/hoff-p0-02.md`.

## Verification
- DOM 순서: `grep -n 'id="demo"\|id="preview"\|id="how"\|id="cli"' src/components/HandoffLanding.tsx` 결과 demo(443)→preview(458)→how(494)→cli(264 in CliQuickstart inner div, 호출은 L523).
- Build/lint은 이전 P0-01 통과 후 코드 무변경이므로 동일 상태 (build pass, lint 0 error / 6 baseline warning).

## Screenshots
- Desktop: `evidence/screenshots/hoff-p0-02-desktop.png` (Hero → Demo → Preview → How → CLI → Team 전 구간 노출).
- Mobile: `evidence/screenshots/hoff-p0-02-mobile.png` (동일 순서).

## Notes / risk
- 페이지가 길어 PDF→PNG 합성 방식 사용. 향후 issue는 짧은 viewport screenshot으로 충분할 가능성 있음.
- 모바일 H1 줄바꿈 어색 잔존 (HOFF-P0-12 deferred).
