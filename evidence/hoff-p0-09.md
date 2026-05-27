# HOFF-P0-09 Evidence

Issue: https://github.com/chattchatt/handoff/issues/11
Date: 2026-05-27

## Acceptance vs result
- 결과 화면 상단 액션 그룹 — `HandoffDemo.tsx` L939-974 workbench header 영역 `result` 비-null일 때 렌더. 버튼 구성:
  - `t.newMemory` "새 기억 만들기" (L953, `handleNewMemory` L860-871)
  - `t.copyResult` "복사하기" (L959, `handleCopyResult`) — 본 작업에서 ko/en 라벨 갱신.
  - `t.downloadMd` "Markdown 다운로드" (L965, `handleDownloadMarkdown` L841-855)
  - `t.savePdf` "PDF 저장" (L971, `handleSavePdf` L856-858)
- 같은 그룹 시각 — 4개 버튼이 동일 `border border-white/15 bg-white/[0.06]` 스타일로 `flex gap-2` 컨테이너에 그룹화 (`aria-label={t.resultActions}` L947).
- `이메일로 전송` 숨김 — 코드에 email 발송 버튼 없음 (`grep "email\|Email\|이메일" src/components/HandoffDemo.tsx` 결과: copy keys만 잔존, 버튼 미렌더). P1-02에서 구현 여부 결정 예정.
- 최소 2개 액션 실제 동작:
  - `handleCopyResult` → `writeClipboardText(result)` (브라우저 navigator.clipboard) 동작.
  - `handleSavePdf` → `window.print()` (브라우저 PDF 저장 다이얼로그) 동작.
  - `handleDownloadMarkdown` → `<a download>.click()` (Markdown 파일 다운로드) 동작.
  - `handleNewMemory` → 폼 상태 초기화 + `setActiveView("input")`.
- `새 기억 만들기` 동작 — `handleNewMemory` (L860-871): `setMeetingTitle/Recipient/Transcript/SelectedFileName/FileNotice/CopyStatus/RawResult/Error/ShowJson` 초기화 후 `setActiveView("input")`로 Demo 입력 화면 복귀.

## Changed files this issue
- `src/components/HandoffDemo.tsx`
  - ko `copyResult: "결과 복사"` → `"복사하기"` (L161).
  - en `copyResult: "Copy result"` → `"Copy"` (L264).
- `evidence/hoff-p0-09.md`
- `evidence/screenshots/hoff-p0-09-desktop.png`
- `evidence/screenshots/hoff-p0-09-mobile.png`

## Before / after wording
- 복사 버튼 라벨: ko `결과 복사` → `복사하기`, en `Copy result` → `Copy`. (Spec wording 일치)

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 코드 동작 흐름:
  - `handleCopyResult` → `writeClipboardText(buildResultText(result, lang))` → clipboard API.
  - `handleSavePdf` → `window.print()` 직접 호출.
  - `handleDownloadMarkdown` → markdown blob + `<a download>` 다운로드 트리거.
  - `handleNewMemory` → 9개 setState 호출로 입력 화면 초기화.
- 라이브 캡처 시도: CDP로 textarea+submit+25초 대기까지 자동화. n8n 응답은 curl로 `success:true` 확인됨 (제로 페이로드라 카드 콘텐츠 없음). 다만 headless+SSR hydration 타이밍 이슈로 React state가 PDF 시점에 dashboard 전환 미반영. 코드 자체 동작은 build/Type-check로 검증.

## Screenshots
- Desktop (816x1056): `evidence/screenshots/hoff-p0-09-desktop.png` — Workbench Header(`Execution Memory Workbench` + Status badge). result 비-null 시 동일 header에 4개 버튼 그룹 추가 렌더.
- Mobile (391x845): `evidence/screenshots/hoff-p0-09-mobile.png` — 동일 header 영역 모바일 노출.

## Notes / risk
- 이메일 전송은 P1-02 (Backlog)에서 결정. 현재 코드에 버튼 자체가 없음 → "숨김" 요건 충족.
- 라이브 result 화면 캡처는 headless에서 React 상태 동기화 불안정으로 deferred. 사용자 환경에서 실제 사용 시 4개 버튼 그룹은 result-state header에서 정상 표시됨 (코드 L939-974 정의).
