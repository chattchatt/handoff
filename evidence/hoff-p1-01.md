# HOFF-P1-01 Evidence

Issue: https://github.com/chattchatt/handoff/issues/15
Date: 2026-05-28

## Acceptance vs result
- PDF 업로드 후 텍스트 추출 — `extractPdfText` 신규 함수 (`HandoffDemo.tsx` L447-467)가 `pdfjs-dist` v4.10.38을 dynamic import로 lazy load 후 `getDocument({ data: arrayBuffer }).promise → page.getTextContent()`로 모든 페이지 텍스트 추출. `handleFileChange`에서 PDF면 호출, 성공 시 업무 맥락 textarea에 본문 append + `pdfExtracted` notice ("PDF에서 본문 281자를 업무 맥락에 추가했습니다.").
- 백엔드 미연결시 UI 과장 X — 추출은 브라우저 내부에서 동작. n8n 변경 0. `fileHint`도 갱신: "PDF는 브라우저에서 본문 텍스트를 추출해 업무 맥락에 추가하고, .md도 동일하게 본문에 자동 추가됩니다."
- 미지원 PDF (스캔 PDF 등) 오류 메시지 — `extractPdfText`가 throw 또는 빈 텍스트 반환 시 `pdfExtractFailed` notice 표시: "PDF 본문 추출에 실패했습니다. 파일명만 맥락에 추가했습니다. 텍스트 기반이 아닌 스캔 PDF일 수 있습니다." 동시에 fallback으로 `[PDF source selected: name]` 라인을 transcript에 추가하여 컨텍스트는 보존.
- 미지원 형식 파일 — `unsupportedFile` notice 그대로 유지: "지원 형식은 TXT, MD, PDF입니다."

## Changed files this issue
- `package.json` / `package-lock.json` — `pdfjs-dist@^4.10.38` 추가.
- `src/components/HandoffDemo.tsx`:
  - L447-467 `extractPdfText` 신규 함수 (pdfjs lazy load + worker URL Vite `?url` import + 페이지별 텍스트 join).
  - L120-128 ko copy: `pdfExtracted` / `pdfExtractFailed` 추가, `pdfSelected` 제거, `fileHint` 갱신.
  - L222-230 en copy 동일.
  - L825-844 `handleFileChange` PDF 분기 try/catch로 갱신: 추출 성공 시 본문 append + notice, 실패 시 filename 라인 + fail notice.
- `evidence/hoff-p1-01.md`
- `evidence/screenshots/hoff-p1-01-desktop.png` (PDF 업로드 성공 상태, textarea에 본문 + notice)
- `evidence/screenshots/hoff-p1-01-mobile.png`

## Verification
- `npm run build`: pass. 클라이언트 번들에 `pdf-CgsIjvPo.js` 649.95kB chunk 별도 분리 (dynamic import → 초기 로드 영향 없음).
- `npm run lint`: 0 error / 6 baseline warning.
- 실 동작 테스트:
  - 테스트 PDF: `/tmp/handoff-test.pdf` (Chrome로 HTML→PDF 생성, 한글 본문 포함).
  - CDP `DOM.setFileInputFiles`로 업로드 후 4초 대기.
  - textarea 길이 0 → 308자 (`--- handoff-test.pdf ---` 헤더 + 본문).
  - File notice: "선택 파일: handoff-test.pdf. PDF에서 본문 281자를 업무 맥락에 추가했습니다." (281자는 본문만, 헤더 27자 제외).
  - Desktop + mobile 모두 동일 동작.

## Screenshots
- Desktop (816x1056): `evidence/screenshots/hoff-p1-01-desktop.png` — PDF 업로드 후 textarea에 본문 추출 결과 + 파일 업로드 카드에 성공 notice.
- Mobile (391x845): `evidence/screenshots/hoff-p1-01-mobile.png` — 동일 상태 모바일 노출.

## Notes / risk
- PDF 텍스트 추출은 클라이언트에서 동작 (서버 비-의존). 스캔된 이미지 PDF는 텍스트 레이어가 없어 추출이 빈 문자열 반환 → fallback 메시지 노출.
- pdfjs 워커 chunk 649kB이 동적 분리되어 초기 페이지 로드에 영향 없음. PDF 업로드 첫 사용 시점에 load.
- 다른 페이로드(이미지·테이블)는 raw text 추출만 지원. 향후 OCR/구조 추출은 별도 P2 검토.
