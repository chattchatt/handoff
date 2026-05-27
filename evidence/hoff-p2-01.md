# HOFF-P2-01 Evidence

Issue: https://github.com/chattchatt/handoff/issues/20
Date: 2026-05-28

## 저장 방식 결정
- **저장소**: 브라우저 `localStorage`, 키 `handoff.executionHistory.v2`. 백엔드/서버 의존 없이 사용자 디바이스 단위로 저장.
- **이유**: MVP 단계에서 사용자 계정/인증 시스템 미도입. 다중 디바이스 동기화는 P3 이상 검토. localStorage는 ~5MB 한도 안에서 12개 풀 result 저장 충분.
- **한도**: 최대 12개. 초과 시 가장 오래된 entry부터 잘라냄 (FIFO via `slice(0, 12)`).
- **스키마**: `HistoryItem = { id, title, createdAt, inputType, deliveryLabel, summary, response, meetingTitle, recipient, transcript }`. 기존 v1은 메타데이터만, v2부터 풀 result + 입력 폼 상태 포함하여 재조회 가능.

## Acceptance vs result
- 재조회 가능 — `handleOpenHistory(item)` (`HandoffDemo.tsx` L1018-1029): `setRawResult(item.response)` + 입력 폼 state 복원 + `setActiveView("dashboard")`. 클릭하면 result dashboard로 즉시 전환.
- 저장된 항목 관리 — `handleDeleteHistory(id)` (개별 삭제) + `handleClearHistory()` (전체 비우기).
- UI — 히스토리 카드에 `다시 보기` (Info 50 강조) + `삭제` (hover Danger 50) 두 버튼. 전체 entry가 2개 이상일 때 상단에 `전체 비우기` 버튼.
- 샘플 memory ID/링크 — `id: "hist-1716860000000"` (timestamp 기반 string). 같은 브라우저 세션에서 localStorage 키로 영구 식별. 페이지 새로고침 후에도 `readHistory()`로 복원 (`HandoffDemo.tsx` L851 useEffect).

## Changed files this issue
- `src/components/HandoffDemo.tsx`:
  - L14-25 `HistoryItem` 타입 확장 (`response`, `meetingTitle`, `recipient`, `transcript` optional 추가) + `HISTORY_KEY` v1→v2.
  - L527 `saveHistory` 한도 8→12.
  - L893-906 `runHandoff` 성공 시 history entry에 풀 response + 입력 상태 함께 저장.
  - L1011-1037 `handleOpenHistory` / `handleDeleteHistory` / `handleClearHistory` 신규.
  - L1199-1259 `historyView` 카드에 `다시 보기` / `삭제` / `전체 비우기` 버튼 + 비활성 처리 (response 없는 legacy entry는 다시 보기 disabled).
  - copy keys: ko/en `historyReopen`, `historyDelete`, `historyClearAll`, `historySummary`에 "최대 12개" 안내 추가.
- `evidence/hoff-p2-01.md`
- `evidence/screenshots/hoff-p2-01-desktop.png`
- `evidence/screenshots/hoff-p2-01-mobile.png`

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 실 동작 테스트:
  - CDP로 localStorage `handoff.executionHistory.v2` 키에 샘플 entry 1개 주입.
  - Page reload → `readHistory()` useEffect로 자동 로드.
  - 히스토리 nav 클릭 → `historyView` 렌더.
  - 카드에 entry 1개 노출: 제목, summary, Meeting/작업 브리프 배지, ISO 날짜 (한국 시간 포맷), 다시 보기 + 삭제 버튼.
- v1 → v2 마이그레이션: v1 키는 그대로 두고 신규 키 v2를 사용. v1에 저장된 사용자는 v2가 비어있어 신규 entry 생성 시점부터 history 누적. 코드 회귀 없음.

## Screenshots
- Desktop (816x1344): `evidence/screenshots/hoff-p2-01-desktop.png` — Workbench 히스토리 view에 sample entry 1개 + 다시 보기/삭제 버튼.
- Mobile (391x1544): `evidence/screenshots/hoff-p2-01-mobile.png` — 동일 화면 모바일 스택.

## Notes / risk
- localStorage는 도메인 단위. 같은 도메인에서만 history 공유. cross-device 동기화는 별도 백엔드 도입 시점에 검토.
- `response` 객체가 크면 localStorage 5MB 한도에 영향. n8n 응답이 평균 5-10KB 수준이라 12개 = 약 60-120KB로 한도 내.
- 다시 보기 클릭 시 `setRawResult(item.response)` → useMemo가 `normalizeResponse(rawResult)`를 재실행하여 result 재구성. 이미 정규화된 객체이지만 idempotent하므로 안전.
