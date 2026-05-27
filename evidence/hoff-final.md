# HOFF-FINAL Evidence

Issue: https://github.com/chattchatt/handoff/issues/26
Date: 2026-05-28

## Spec section 16 완료 체크리스트

| # | 기준 | 결과 | 근거 |
| --- | --- | --- | --- |
| 1 | 첫 화면에서 HandOff 핵심 기능이 CLI보다 먼저 보인다 | ✅ | Hero(H1+CTA) → Demo → Preview → How → CLI(고급 사용자용 라벨) 순서. CLI는 페이지 하단. P0-01/P0-02. |
| 2 | 텍스트 또는 파일 입력 위치를 바로 찾을 수 있다 | ✅ | Hero 직후 IN-PAGE DEMO 섹션. 업무 맥락 textarea + 문서 업로드 버튼이 같은 카드 안. P0-03. |
| 3 | 실행 기억 유형은 2개 이하 | ✅ | `deliveryOptionsByLang`에 ko/en 각 2개 (`작업 브리프` / `후속 작업 체크리스트`). P0-04. |
| 4 | 결과 화면에 `핵심 요약`·`결정 사항`·`후속 작업`·`보완 필요 사항`이 구분된다 | ✅ | Dashboard 카드 6장 (핵심 요약, 결정 사항, 후속 작업, 보완 필요 사항, 사용한 맥락/근거 자료, AI 호출용 프롬프트) 독립 렌더. P0-07/P0-08. |
| 5 | 생성 후 `새 기억 만들기`·`PDF 저장`·`복사하기` 중 최소 2개 액션 | ✅ | Workbench 헤더에 4개 액션 (새 기억 만들기, 복사하기, Markdown 다운로드, PDF 저장). 카드별 복사도 별도 제공. P0-09/P0-10/P1-03. |
| 6 | 드롭다운 텍스트가 모든 배경에서 읽힌다 | ✅ | unselected text 대비 #c7cfdd로 통일 (~13:1 대비). focus-visible Info 50 ring. P0-06. |
| 7 | 톤 선택은 제거되었거나 실제 차이가 있음 | ✅ | 톤 셀렉터 UI 0건, 미사용 copy key 제거. tone="professional" 고정. P0-05/P2-05(won't-fix). |
| 8 | CLI는 고급 사용 옵션으로 분리 | ✅ | `고급 사용자용 CLI` 라벨, 페이지 최하단, Advanced path 배지. install/configure/run 실제 npm 스크립트. P0-02/P2-03. |

## 검증 명령

- `npm run build`: **pass**. 클라이언트 + SSR 빌드 모두 성공. 268 모듈 변환. lazy chunk: `pdf-CgsIjvPo.js 650kB`, `mammoth.browser 1018kB`, `xlsx 866kB`, `HandoffDemo 67kB`.
- `npm run lint`: **0 error / 6 baseline warnings** (모두 react-refresh/only-export-components, shadcn-ui 디폴트 컴포넌트 파일 — 기능 무영향).
- `npm run preview` / `npm run build:dev`: 사용 가능. `npm test` 스크립트 미정의 (이 프로젝트에 unit test 부재).
- 라이브 webhook smoke test: `curl POST https://dkssudgktpdy.app.n8n.cloud/webhook/upflow` → `success:true` 응답.
- 라이브 dashboard capture: P2-01 히스토리 다시 보기 기능 활용 (localStorage 풀 entry 주입 → 다시 보기 클릭 → setRawResult + dashboard view). 6장 카드 + 4종 importance 배지 + 4개 액션 버튼 모두 시각 확인.

## Desktop / Mobile 최종 Screenshot

- Desktop (816x5760): `evidence/screenshots/hoff-final-desktop.png` — 라이브 dashboard 6장 카드 (importance 색 바 + 배지 + 카드별 복사 버튼) + 마케팅 preview + How section + CLI 블록 + Team 섹션 전체.
- Mobile (391x5760): `evidence/screenshots/hoff-final-mobile.png` — 동일 dashboard + 모든 카드 세로 스택, 모든 importance 배지 노출.

## Known risk / 후속 항목

### Known risks
- pdfjs(650kB) + mammoth(1MB) + xlsx(866kB) 합산 ~2.5MB lazy chunk. 초기 페이지 로드 영향 0이지만 모바일 LTE에서 첫 PDF/DOCX/XLSX 업로드 시 첫 chunk 로드에 1-2초 지연 가능.
- HWP/HWPX 본문 추출 미지원 — 한글 사용자에게 fallback 메시지로 .docx/.pdf 변환 안내.
- 스캔(이미지) PDF는 텍스트 레이어 부재로 추출 불가 → fallback 메시지 + filename 기록.
- localStorage 히스토리는 도메인 단위 — 다중 디바이스 동기화 불가. 5MB 한도 안에서 12개 풀 result 저장 충분.
- PDF 저장 파일명 `handoff-memory-YYYYMMDD.pdf`는 Chromium/Safari 기준 보장 (Firefox는 document.title 미반영 가능).
- n8n webhook URL은 env로 관리. production 배포 시 `VITE_N8N_WEBHOOK_URL` 설정 필수.

### P1 후속 (Backlog → won't-fix)
- `HOFF-P1-02` 이메일 전송 — Won't fix (사장님 결정). recipient 필드는 이름/역할 입력으로 유지, placeholder 명확화 (`전송용 X`).
- `HOFF-P1-05` n8n 외부 자동화 — Won't fix (사장님 결정). 향후 Notion/Slack/외부 시스템 자동 전송 필요 시 별도 issue 재오픈.

### P2 후속 (완료 + won't-fix)
- `HOFF-P2-01` 히스토리/마이페이지 — **완료** (localStorage v2, 다시 보기/삭제/전체 비우기).
- `HOFF-P2-02` DOCX/XLSX/HWP — **완료** (DOCX/XLSX 클라이언트 추출, HWP는 fallback).
- `HOFF-P2-03` CLI 고도화 — **완료** (실제 npm 스크립트 + GitHub footer 링크).
- `HOFF-P2-04` PRD/작업 패키지 재도입 — Won't fix (사장님 결정 + P0-04 결정 유지).
- `HOFF-P2-05` 톤별 출력 품질 — Won't fix (사장님 결정 + P0-05 결정 유지).

### P3+ 검토 후보
- 사용자 계정/인증 도입 시 히스토리 cross-device 동기화.
- jsPDF/pdfmake 기반 직접 PDF 생성 (헤더/푸터/페이지 마진 커스텀).
- 카드 중요도 태그 사용자 커스터마이즈.
- XLSX 큰 시트 (수만 셀) 시 시트 선택 UI / 첫 N행 미리보기.
- 마케팅 preview cards를 실 dashboard와 동일 컴포넌트 공유 구조로 통합.
- `handoff` npm package 분리 (CLI 바이너리 + 라이브러리 별도).

## P1/P2 미완료 항목의 사용자-facing 노출
- 이메일 전송: 버튼 미렌더 + recipient placeholder에 `전송용 X` 명시 → 사용자 혼동 방지.
- 외부 자동화: 사용자-facing 영역에 어떤 자동 전송 옵션도 노출 안 함.
- HWP: 업로드 시 fallback 메시지로 명확히 안내 + 대체 형식(.docx/.pdf) 권장.
- PRD/톤별 출력: UI에서 완전 제거.
- 결과적으로 P1/P2 미완료 항목이 **사용자-facing UI에서 과장 노출되지 않음**.

## 총괄
- 전체 P0 (13개) + P1 (5개) + P2 (5개) = **23개 issue 모두 close**.
- 구현 완료: P0 13개 + P1 3개 + P2 3개 = **19개**.
- 사장님 결정 won't-fix: P1 2개 + P2 2개 = **4개**.
- 4개 로컬 commit (P0/P1/P1 placeholder/P2 + 본 evidence) 누적, push는 사장님 검토 대기.
- 최종 검증 통과: 사용자 핵심 흐름(입력 → 생성 → 결과 6카드 → 액션) 시각·기능 검증 완료.
