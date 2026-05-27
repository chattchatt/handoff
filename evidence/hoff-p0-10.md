# HOFF-P0-10 Evidence

Issue: https://github.com/chattchatt/handoff/issues/12
Date: 2026-05-27

## Acceptance vs result
- PDF 파일 생성 + Spec filename — `handleSavePdf` (`HandoffDemo.tsx` L856-867) 본 작업에서 갱신:
  1. `new Date()`로 YYYYMMDD 계산.
  2. `document.title = \`handoff-memory-${yyyymmdd}\`` 적용.
  3. `afterprint` 이벤트로 원래 title 복원 (once).
  4. `window.print()` 호출 → 브라우저 PDF 저장 다이얼로그 기본 파일명이 document.title 기반 → `handoff-memory-YYYYMMDD.pdf`.
- PDF 내용에 핵심 섹션 — `window.print()`는 현재 페이지를 그대로 PDF로 출력. result 상태일 때 dashboard 카드(`핵심 요약`, `결정 사항`, `후속 작업`, `보완 필요 사항`, `사용한 맥락/근거 자료`, `AI 호출용 프롬프트`)가 노출되어 있으므로 PDF에 그대로 포함됨.
- 다운로드 액션 자리 — workbench header에 `PDF 저장`, `Markdown 다운로드` 버튼 동시 노출 (`HandoffDemo.tsx` L961-972). 빈 버튼 아님 — 각각 실제 함수 바인딩.
- 보조: Markdown 다운로드 — `handleDownloadMarkdown` (L841-854)이 `buildResultText`로 다음 섹션 헤더 생성: `## Summary`, `## Decisions`, `## Follow-up Tasks`, `## Missing Context`, `## Context / Evidence`, `## AI Prompt`. 파일명은 `${meetingTitle || handoff-execution-memory}.md`.

## Changed files this issue
- `src/components/HandoffDemo.tsx`
  - `handleSavePdf` 갱신: 인쇄 전 document.title을 `handoff-memory-YYYYMMDD`로 설정 후 print, `afterprint` 이벤트에서 복원 (L856-867).
- `evidence/hoff-p0-10.md`
- `evidence/screenshots/hoff-p0-10-desktop.png` (P0-09 재사용, header 버튼 자리)
- `evidence/screenshots/hoff-p0-10-mobile.png` (P0-09 재사용)

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 함수 흐름 정적 검증:
  - 클릭 → date format → title swap → print dialog → afterprint → title 복원.
  - `buildResultText`는 `## Summary / Decisions / Follow-up Tasks / Missing Context / Context / Evidence / AI Prompt` 헤더 6종 포함 (L412-442). Markdown 다운로드 시 동일 컨텐츠 적용.
- 실제 PDF 파일 생성 테스트: 브라우저 print 다이얼로그는 사용자 클릭 후 표시되므로 headless에서 자동 테스트 어려움. 다만 동일 메커니즘(`document.title` → browser save default filename)은 Chrome/Edge/Safari 표준 동작.

## Notes / risk
- Window.print()는 브라우저 종속 — Firefox는 document.title을 PDF 파일명에 반영하지 않을 수 있음. Spec 파일명은 Chromium/Safari에서 보장.
- 향후 jsPDF/pdfmake 기반 직접 PDF 생성으로 전환 시 헤더/푸터/페이지 마진 커스텀 가능 (P1+ 검토).
- buildResultText 섹션 헤더는 영문. 한글 헤더 필요 시 추후 i18n 적용 가능 — 본 작업 범위 외.
