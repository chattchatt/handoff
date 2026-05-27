# HOFF-P2-02 Evidence

Issue: https://github.com/chattchatt/handoff/issues/21
Date: 2026-05-28

## 형식별 지원 표

| 형식 | 지원 여부 | 추출 방식 | 라이브러리 | 비고 |
| --- | --- | --- | --- | --- |
| `.txt` | ✅ 본문 추출 | `File.text()` | 브라우저 native | 즉시 처리 |
| `.md` | ✅ 본문 추출 | `File.text()` | 브라우저 native | 마크다운도 plain text로 append |
| `.pdf` | ✅ 본문 추출 (스캔 PDF 제외) | `pdfjs-dist` 페이지별 `getTextContent` | `pdfjs-dist@^4.10.38` (lazy chunk 649kB) | 스캔 PDF는 빈 텍스트 → fallback 메시지 |
| `.docx` | ✅ 본문 추출 (P2-02 신규) | `mammoth.extractRawText` | `mammoth@^1.12.0` (lazy chunk 1.0MB) | 단락 그대로 줄바꿈 보존 |
| `.xlsx` / `.xls` | ✅ 셀 추출 (P2-02 신규) | `xlsx.utils.sheet_to_csv` 시트별 | `xlsx@^0.18.5` (lazy chunk 866kB) | 시트별 `## SheetName` 헤더 + CSV 본문 |
| `.hwp` / `.hwpx` | ⚠️ 파일명만 기록 | 추출 라이브러리 부재 | — | 사용자에게 `.docx` 또는 `.pdf` 변환 안내 |
| 그 외 | ❌ 거부 | — | — | `t.unsupportedFile` 메시지 노출 |

## Acceptance vs result
- 형식별 지원 여부 표 — 위 표 + 코드 분기 (`HandoffDemo.tsx` L953-1006 `handleFileChange`).
- 샘플 파일 처리 테스트:
  - DOCX: `/tmp/handoff-test.docx` (python-docx로 한글 본문 생성). CDP `setFileInputFiles` → textarea 0→129자, notice `DOCX에서 본문 101자를 업무 맥락에 추가했습니다.`. 키워드 `DOCX` 본문 검증 통과.
  - XLSX: `/tmp/handoff-test.xlsx` (node xlsx로 생성, 3행 한글 데이터). textarea 0→133자, notice `Excel 시트 105자를 CSV 형식으로 업무 맥락에 추가했습니다.`. 키워드 `OAuth` 셀 값 통과.
  - PDF: P1-01에서 검증 완료, regression 없음.
  - HWP: 의도적 미지원. fallback 메시지 + 파일명 기록만 동작.
- MVP 이후 적용 — DOCX/XLSX는 본 작업에서 클라이언트 추출 적용. HWP는 라이브러리 부재로 P3 이상 검토.

## Changed files this issue
- `package.json` / `package-lock.json` — `mammoth@^1.12.0`, `xlsx@^0.18.5` 추가.
- `src/components/HandoffDemo.tsx`:
  - L506-527 `extractDocxText` / `extractXlsxText` 신규 (mammoth/xlsx dynamic import).
  - L953-1006 `handleFileChange` 확장 (extension 분기 + extractor lookup + HWP 별도 처리).
  - L1424 `input accept` 확장 (`.docx`, `.xlsx`, `.xls`, `.hwp`, `.hwpx` + MIME types).
  - copy keys: ko/en `docxExtracted` / `docxExtractFailed` / `xlsxExtracted` / `xlsxExtractFailed` / `hwpUnsupported` / `unsupportedFile` / `fileHint` 갱신.
- `evidence/hoff-p2-02.md`
- `evidence/screenshots/hoff-p2-02-desktop.png` (DOCX 업로드 성공 상태)
- `evidence/screenshots/hoff-p2-02-mobile.png` (XLSX 업로드 성공 상태)

## Verification
- `npm run build`: pass. 클라이언트 번들에 `mammoth.browser` 1.0MB + `xlsx` 866kB 별도 lazy chunk. 초기 페이지 로드 영향 없음.
- `npm run lint`: 0 error / 6 baseline warning.
- 실 동작 (CDP setFileInputFiles + textarea 길이/키워드 검증):
  - DOCX 8회 polling 모두 `len=129, hasKeyword=true, noticeMatch=101자`.
  - XLSX 8회 polling 모두 `len=133, hasKeyword=true, noticeMatch=105자`.

## Screenshots
- Desktop (816x1056): `evidence/screenshots/hoff-p2-02-desktop.png` — DOCX 업로드 후 textarea에 본문 + notice (`DOCX에서 본문 101자...`).
- Mobile (391x845): `evidence/screenshots/hoff-p2-02-mobile.png` — XLSX 업로드 후 textarea에 `## Decisions` CSV + notice (`Excel 시트 105자를 CSV 형식으로...`).

## Notes / risk
- HWP 라이브러리: `hwp.js` 등이 존재하나 한글 HWP 5.x 바이너리 포맷 호환성 빈약. HWPX(XML 기반)는 추출 가능성 있으나 라이브러리 미성숙. 현재는 사용자에게 `.docx`/`.pdf` 변환 권장.
- XLSX 큰 시트 (수만 셀)는 textarea에 그대로 dump 시 사용자 가독성 떨어짐. 향후 시트 선택 UI / 첫 N행 미리보기 도입 검토.
- mammoth/xlsx chunk 도합 ~1.9MB가 lazy load. 모바일 LTE 첫 사용 시 약간의 지연 가능 — initial paint에는 영향 없음.
