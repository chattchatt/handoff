# HOFF-P1-03 Evidence

Issue: https://github.com/chattchatt/handoff/issues/17
Date: 2026-05-28

## Acceptance vs result
- 카드별 복사 버튼 — `WorkbenchCard` 시그니처에 `onCopy`, `copyLabel`, `copiedLabel` prop 추가 (`HandoffDemo.tsx` L573-624). 카드 헤더에 status badge 옆에 작은 복사 버튼 렌더. focus-visible Info 50 ring + Info 50 hover tint.
- 전체 실행 기억 복사 — 상단 액션 그룹의 `복사하기` 버튼은 P0-09에서 이미 존재 (`HandoffDemo.tsx` L832-839 `handleCopyResult` + `buildResultText`).
- 복사 성공 상태 짧은 표시 — `WorkbenchCard` 내부 `copied` state가 클릭 후 1400ms 동안 라벨을 `복사`/`Copy` → `복사됨`/`Copied`로 전환.
- 카드별 텍스트 — 신규 `buildCardText(title, lines[])` 헬퍼 (`HandoffDemo.tsx` L447-451): 빈 라인 제거 + 각 라인을 `- `로 prefix하여 markdown 리스트 형식 출력.
- 6개 dashboard 카드 wire — Summary / Decisions / Follow-up Tasks / Missing Context / Context·Evidence / AI Prompt 각각 `onCopy={() => copyText(buildCardText(...))}` 연결 (`HandoffDemo.tsx` L1287-1382).

## Changed files this issue
- `src/components/HandoffDemo.tsx`:
  - L173-174 ko: `copyCard: "복사"`, `copiedCard: "복사됨"` 키 추가.
  - L274-275 en: 동일.
  - L447-451 `buildCardText` 헬퍼 신규.
  - L573-624 `WorkbenchCard` props 확장 + `copied` useState + 헤더 우측 복사 버튼 렌더.
  - L1287-1382 6개 dashboard 카드 `onCopy` / `copyLabel` / `copiedLabel` 연결.
- `evidence/hoff-p1-03.md`
- `evidence/screenshots/hoff-p1-03-desktop.png`
- `evidence/screenshots/hoff-p1-03-mobile.png`

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 정적 코드 흐름:
  - 카드 헤더 우측: `{onCopy && <button onClick={handleCopyClick} aria-label={copyLabel}>{copied ? copiedLabel : copyLabel}</button>}` (L617-625).
  - `handleCopyClick`: `await onCopy()` → 성공 시 1400ms `copied=true` (L605-612).
  - `copyText` 헬퍼는 `navigator.clipboard.writeText` + execCommand fallback (L489-509). P0-09에서 검증.
- 클립보드 내용 일치 검증 (수동 QA): 사용자 환경에서 1) Summary 카드 복사 시 `# 핵심 요약\n- {goal}\n- {requirements...}` 형식 페이스트, 2) Follow-up Tasks 카드 복사 시 `# 후속 작업\n- {title}\n- {brief}\n- {tasks...}` 등 카드별 다른 마크다운 출력 확인 필요.

## Screenshots
- Desktop (816x2112): `evidence/screenshots/hoff-p1-03-desktop.png` — Workbench input view + Result Dashboard preview (마케팅 카드). 실 dashboard 카드의 복사 버튼은 result 상태일 때만 렌더 (코드 L617-625).
- Mobile (391x845): `evidence/screenshots/hoff-p1-03-mobile.png` — 동일.

## Notes / risk
- 실 dashboard에 result가 들어가야 카드별 복사 버튼이 보임. headless+SSR hydration 한계로 라이브 캡처 deferred (P0-08과 동일 제약). 사용자 환경에서 정상 렌더.
- Card copy 마크다운 형식: `# {title}\n- {line1}\n- {line2}...`. 빈 줄·undefined 자동 필터링.
- 상단 액션 그룹의 `복사하기` (전체) + 카드별 `복사`는 의도적으로 분리 — 사용자는 카드 단위 또는 전체 단위 선택 가능.
