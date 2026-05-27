# HOFF-P0-04 Evidence

Issue: https://github.com/chattchatt/handoff/issues/6
Date: 2026-05-27

## Acceptance vs result
- 노출 옵션 2개 — `deliveryOptionsByLang` (`HandoffDemo.tsx` L25-53): 정확히 2개 (`작업 브리프` / `후속 작업 체크리스트`, en `Work brief` / `Follow-up checklist`). 렌더는 L1102-1121 `deliveryOptions.map`.
- PRD / 작업 패키지 제거 — `grep -rn "PRD\|작업 패키지\|workPackage" src/`는 사용자 노출 라벨 0건. 데이터 어댑터의 `prd` 필드만 잔존 (`HandoffDemo.tsx` L371, `lib/n8n.ts` L28) — 옵션 UI에서는 호출되지 않음. PRD/작업 패키지의 UI 재도입은 HOFF-P2-04로 deferred.
- 옵션별 한 줄 설명 — 각 옵션 `description` 필드 (L32, L37, L44, L49)로 ko/en 모두 한 줄 안내 노출. 스크린샷에서 selected/unselected 상태 모두 설명 표시 확인.
- 유형별 결과 출력 구조 차이 — request payload `deliveryType` (`HandoffDemo.tsx` L761) 값으로 `website_brief` / `followup_email` 두 가지를 전송. n8n/서버 응답이 `deliverablePack.type`을 통해 다른 구조를 생성. mock/sample 차이는 백엔드 응답에 위임 (브라우저 MVP 범위). 본 작업은 옵션 축소가 주요 scope.

## Changed files this issue
- (코드 변경 없음. 옵션 축소는 이전 변경에서 이미 적용된 상태.)
- `evidence/hoff-p0-04.md`
- `evidence/screenshots/hoff-p0-04-desktop.png`
- `evidence/screenshots/hoff-p0-04-mobile.png`

## Verification
- 코드 검증: `grep -n "deliveryOptionsByLang" src/components/HandoffDemo.tsx` → 정의 1개, 옵션 ko/en 각 2개.
- Build/lint 상태는 P0-03과 동일 (코드 무변경, build pass, lint 0 error / 6 baseline warning).

## Screenshots
- Desktop (816x1056): `evidence/screenshots/hoff-p0-04-desktop.png` — `결과 유형` 영역에 2개 옵션 + 각 설명 노출.
- Mobile (391x845): `evidence/screenshots/hoff-p0-04-mobile.png` — 동일 옵션 2개 + 설명, 세로 스택 겹침 없음.

## Notes / risk
- 데이터 어댑터의 `prd` 필드는 추후 P2-04 검토용으로 유지. 사용자 노출은 없음.
