# HOFF-P0-03 Evidence

Issue: https://github.com/chattchatt/handoff/issues/5
Date: 2026-05-27

## Acceptance vs result
- `업무 맥락 입력` textarea — 적용 (`HandoffDemo.tsx` L1125-1130, label `t.workContext` = "업무 맥락").
- 파일 업로드 UI + `.txt`, `.pdf` 우선 안내 — 파일 업로드 라벨 + hidden file input (`HandoffDemo.tsx` L1132-1149, `accept=".txt,.md,.pdf,text/plain,application/pdf"`). 안내 문구는 본 작업에서 갱신: ko `.txt, .pdf 파일을 우선 지원합니다. .md도 본문에 자동 추가되고, PDF는 선택 상태와 파일명을 실행 맥락에 반영합니다.` / en `.txt and .pdf are the supported priority formats. ...`
- `수신자` 입력 (이름/역할 유지) — `HandoffDemo.tsx` L1090-1097 label `t.recipient` = "수신자/대상". 이메일 전송 미구현이므로 자유 텍스트 입력 그대로 유지.
- 안내 문구 `회의록, PDF, 문서 내용을 넣으면 HandOff가 AI 작업용 실행 기억으로 정리합니다.` — 본 작업에서 inputSummary 갱신 (`HandoffDemo.tsx` L113 ko, en L217). 카드 헤더 영역 `summary={t.inputSummary}`로 input 폼 상단에 노출.
- 미지원 형식 오류 표시 — `unsupportedFile` 메시지 코드 존재 (L129 ko, L234 en) 및 `handleFileChange`에서 분기 (L801~).

## Changed files this issue
- `src/components/HandoffDemo.tsx`
  - ko `inputSummary` 교체 (L113).
  - ko `fileHint` 교체 (L125-126).
  - en `inputSummary` 교체 (L217-218).
  - en `fileHint` 교체 (L229-230).
- `evidence/hoff-p0-03.md`
- `evidence/screenshots/hoff-p0-03-desktop.png`
- `evidence/screenshots/hoff-p0-03-mobile.png`

## Before / after wording
- ko inputSummary: `회의에 한정하지 말고 고객 메모, Slack 논의, 이슈 설명, 작업 요청을 그대로 붙여넣으세요.` → `회의록, PDF, 문서 내용을 넣으면 HandOff가 AI 작업용 실행 기억으로 정리합니다.`
- ko fileHint: `TXT/MD는 본문에 자동 추가됩니다. PDF는 선택 상태와 파일명을 실행 맥락에 반영합니다.` → `.txt, .pdf 파일을 우선 지원합니다. .md도 본문에 자동 추가되고, PDF는 선택 상태와 파일명을 실행 맥락에 반영합니다.`
- en inputSummary: `Paste customer notes, Slack threads, ...` → `Paste meeting notes, PDFs, or documents and HandOff turns them into execution memory for AI work.`
- en fileHint: `TXT/MD are appended ...` → `.txt and .pdf are the supported priority formats. .md is appended ...`

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning (P0-03 작업 중 잠시 prettier 1 error 발생 후 1줄 합치기로 해소).

## Screenshots
- Desktop (816x2112): `evidence/screenshots/hoff-p0-03-desktop.png` — Demo 입력 폼 상단 + spec 안내 문구 + 모든 입력 필드 + 파일 업로드 hint + 실행 기억 만들기 버튼 노출.
- Mobile (391x2535): `evidence/screenshots/hoff-p0-03-mobile.png` — 동일 컴포넌트 노출, 세로 스택, 겹침 없음.

## Notes / risk
- PDF 본문 추출은 미구현 (browser MVP), 백엔드/n8n 연동 대상. 안내는 `pdfSelected` 메시지로 처리됨.
- Email 전송도 미구현으로 recipient는 이름/역할 입력 유지. HOFF-P1-02에서 다룸.
