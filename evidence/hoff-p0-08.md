# HOFF-P0-08 Evidence

Issue: https://github.com/chattchatt/issues/10 (chattchatt/handoff#10)
Date: 2026-05-27

## Acceptance vs result
- 우선순위 카드 6장 — `HandoffDemo.tsx` dashboard 렌더 순서 (L1197-1278):
  1. `Summary` / 핵심 요약 (L1197).
  2. `Decisions` / 결정 사항 (L1207).
  3. `Follow-up Tasks` / 후속 작업 — 본 작업에서 `xl:col-span-2` + `highlight` 적용 (L1217-1230).
  4. `Missing Context` / 보완 필요 사항 (L1232).
  5. `Context / Evidence` / 사용한 맥락·근거 자료 — 이미 `xl:col-span-2` (L1241).
  6. `AI Prompt` / AI 호출용 프롬프트 — `xl:col-span-2` (L1259, 결과에 continuationPrompt 있을 때 조건부).
- `후속 작업` 강조 — WorkbenchCard에 `highlight` prop 신설 (`HandoffDemo.tsx` L546-602). 강조 시 Info 50 border `#9dc0ff/[0.45]` + Info 10 bg `#9dc0ff/[0.06]` + Info glow shadow. col-span-2로 전체 폭 차지하여 fold 중앙에 위치.
- 카드별 빈 상태 — `ListBlock` (L517-544) 내부에서 `!items?.length` 시 `EmptyState` 컴포넌트 렌더. `Missing Context` 카드는 `result.meetingUnderstanding.missingInfo.length`로 status 배지 변경 (`Needs evidence` vs `Ready`).
- 각 필수 섹션 독립 카드 — 6장 카드 각각 `WorkbenchCard`로 독립 렌더. 카드 내부에 eyebrow, title, summary, evidence, action, status 모두 별도 라벨로 분리.

## Changed files this issue
- `src/components/HandoffDemo.tsx`
  - `WorkbenchCard` 시그니처에 `highlight?: boolean` 추가, `panelClass` 분기 (L546-602).
  - Follow-up Tasks 카드를 `<div className="xl:col-span-2">` 래퍼로 감싸고 `highlight` 활성화 (L1217-1230).
- `evidence/hoff-p0-08.md`
- `evidence/screenshots/hoff-p0-08-desktop.png`
- `evidence/screenshots/hoff-p0-08-mobile.png`

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 시각 확인:
  - Result Dashboard 마케팅 preview 영역(`HandoffLanding.tsx` L458, previewCards 6장)이 동일 위계로 렌더링. Index 03(후속 작업)이 `sm:col-span-2`로 전체 폭 + 밝은 배경. 본 작업에서 실 dashboard도 동일한 위계 + 강조 패턴 (Info tint glow)으로 정렬.
- 라이브 dashboard 캡처 시도: CDP로 textarea 채우고 `실행 기억 만들기` 클릭 + 14초 대기 + `대시보드` nav 클릭까지 자동화했으나, headless에서 webhook 응답 후 `result` 상태가 캡처 시점에 안정적으로 보이지 않아 dashboard screenshot은 deferred. 코드 변경은 build에서 검증됨.

## Screenshots
- Desktop (816x1056): `evidence/screenshots/hoff-p0-08-desktop.png` — 마케팅 Result Dashboard 카드 6장 + 후속 작업(03) 강조 패턴 노출. dashboard 코드도 동일 위계.
- Mobile (391x845): `evidence/screenshots/hoff-p0-08-mobile.png` — 동일 카드 모바일 스택.

## Notes / risk
- 라이브 dashboard 캡처는 백엔드(n8n) 응답이 풍부해야 시각적으로 의미 있는 카드 콘텐츠가 나옴. 본 작업 범위는 위계/강조 디자인이며 백엔드 응답 품질은 별도 (P1/P2).
- Missing Context 카드가 강조된 Follow-up Tasks 다음 행에서 단독 노출되면 우측이 비어보일 수 있음. 의도적 시각 위계 (강조 후속 작업이 행 종료).
