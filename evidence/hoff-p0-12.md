# HOFF-P0-12 Evidence

Issue: https://github.com/chattchatt/handoff/issues/14
Date: 2026-05-27

## QA 체크리스트

### Desktop (816x6336 full page)
- [x] Hero 영역 H1 + subcopy 한 화면 안 정상 배치 (PDF page 1).
- [x] Demo `IN-PAGE DEMO` eyebrow 후 workbench input form 노출 (page 2-3).
- [x] Input form: 작업 이름 / 수신지·대상 2컬럼 (md:grid-cols-2 적용).
- [x] 결과 유형 segment 2개 가로 정렬 (md:grid-cols-2).
- [x] 업무 맥락 textarea + 문서 업로드 영역 세로 배치, 겹침 없음.
- [x] Result Dashboard preview 카드 6장: 1-2열, 후속 작업 sm:col-span-2 강조.
- [x] How it works 4 카드 md:grid-cols-4.
- [x] CLI quickstart 카드 가로 폭 4xl 중앙 정렬.
- [x] Team/Project section 좌측 텍스트 + 우측 로고 sm:flex-row.
- [x] 액션 버튼 우측 정렬: workbench header `flex flex-wrap items-center gap-2`.
- [x] Spec 토큰 일관 적용 (Background #1A1F31, Info 50 #5D7EEB).

### Mobile (391x6760 full page)
- [x] Header 좌측 로고, 우측 KO/EN + (Repo 복사는 sm:block 숨김 처리).
- [x] Hero H1 2줄로 떨어지며 가독성 확보 (이전 어색한 줄바꿈 해소 확인).
- [x] CTA 3개 세로 스택 (`grid-cols-1 sm:flex`).
- [x] Demo workbench: 입력 폼 1컬럼, 모든 라벨/필드 세로 배치.
- [x] 결과 유형 segment 2개 세로 스택 (sm 미만 grid-cols-1).
- [x] textarea min-h-72 충분한 높이.
- [x] 파일 업로드 영역 라벨 + 버튼 sm:flex-row 폴백 (모바일은 세로).
- [x] Result preview 카드 6장 세로 스택, 후속 작업(index 03) 풀폭 강조.
- [x] How 카드 4개 md 미만 1컬럼.
- [x] CLI quickstart 카드 모바일 전체 폭.
- [x] Team section sm:flex-col → 모바일에서 텍스트→로고 세로 배치.
- [x] 모든 버튼/카드/드롭다운 겹침 없음 (PDF full page 시각 검증).

### Smoke test — 생성 흐름
- n8n webhook `https://dkssudgktpdy.app.n8n.cloud/webhook/upflow` POST 응답:
  ```
  {"success":true,"meetingUnderstanding":{"goal":"Conduct a smoke test...","customerContext":"Initial testing phase..."},...}
  ```
- 응답 schema = `success / meetingUnderstanding / deliverablePack / executionMemory / harness / _warnings / _error`. `HandoffDemo.tsx` `parseResponse`가 모든 필드 처리 (`lib/n8n.ts` HandoffResponse 타입과 일치).
- 결과 dashboard 6 카드는 응답의 `meetingUnderstanding.goal/customerContext/keyDecisions/missingInfo/risks` + `deliverablePack.tasks/title/brief` + `harness.doneEvidence/missingEvidence` + `executionMemory.continuationPrompt`로 채워짐.

## Changed files this issue
- (코드 변경 없음. QA 검증 단계.)
- `evidence/hoff-p0-12.md`
- `evidence/screenshots/hoff-p0-12-desktop.png` (P0-11 full page 재사용 — 토큰 적용 후 전 구간 검수)
- `evidence/screenshots/hoff-p0-12-mobile.png` (P0-11 full page 재사용)

## Verification
- `npm run build`: pass (P0-11 변경 기준 마지막 빌드).
- `npm run lint`: 0 error / 6 baseline warning.
- n8n smoke test: 200 OK, success:true 응답 확인.

## Screenshots
- Desktop full page (816x6336): `evidence/screenshots/hoff-p0-12-desktop.png` — 모든 섹션 정상 레이아웃 + Spec 토큰 일관 적용.
- Mobile full page (391x6760): `evidence/screenshots/hoff-p0-12-mobile.png` — 1컬럼 스택, 모든 컴포넌트 가시·비-겹침 확인.

## Notes / risk
- 라이브 결과 dashboard 실제 채워진 카드 스크린샷은 headless+SSR hydration 조합에서 React 상태 업데이트가 PDF 시점에 안정적으로 잡히지 않아 별도 evidence로 deferred. 코드 흐름 + n8n smoke test로 생성 흐름 검증.
- HOFF-FINAL (#26) 제출 전 통합 검증에서 사용자 환경 (정상 브라우저) 라이브 dashboard 캡처 권장.
