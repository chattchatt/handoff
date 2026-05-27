# HOFF-P0-05 Evidence

Issue: https://github.com/chattchatt/handoff/issues/7
Date: 2026-05-27

## Acceptance vs result
- 톤 선택 UI 보이지 않음 — `grep "t\.tone\|간결하게\|일반\|전문적으로\|Casual\|Neutral\|Professional" src/components/HandoffDemo.tsx` 결과 0건. 톤 셀렉터 렌더 코드 없음. 스크린샷의 입력 영역에 톤 선택 컴포넌트 미노출.
- 상태값이 생성 흐름 깨지 않음 — `tone` 값은 `HandoffDemo.tsx` L714(또는 변경 후)에서 상수 `"professional"`로 고정, payload L762에서 `tone: payload?.tone ?? tone`으로 백엔드에 정상 전달. build/lint 통과로 컴파일·정적 검사 정상.

## Changed files this issue
- `src/components/HandoffDemo.tsx`
  - ko/en copy에서 dead key `tone: "톤"` / `tone: "Tone"` 제거 (이전 L121, L225).
- `evidence/hoff-p0-05.md`
- `evidence/screenshots/hoff-p0-05-desktop.png` (PDF page 3 재사용, 입력 영역 확대).
- `evidence/screenshots/hoff-p0-05-mobile.png` (PDF page 3 재사용).

## Before / after wording
- 톤 셀렉터 라벨/옵션 노출 없음 (이전 변경에서 이미 제거됨). 본 작업에서는 미사용 copy key `tone` 제거.

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 시각 확인: 데스크탑·모바일 screenshot의 `결과 유형` 아래에 톤 선택 컴포넌트 없음.

## Notes / risk
- `tone = "professional"`을 상수로 유지하여 백엔드가 톤 필드를 기대해도 흐름 정상.
- 사용자가 톤을 바꾸려면 향후 issue로 재도입 검토 (현재 P1/P2 백로그 외 별도 없음).
