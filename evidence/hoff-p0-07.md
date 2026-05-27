# HOFF-P0-07 Evidence

Issue: https://github.com/chattchatt/handoff/issues/9
Date: 2026-05-27

## Acceptance vs result

### Before / after 매핑
| Spec rename | UI 적용 위치 | Before | After |
| --- | --- | --- | --- |
| 누락 정보 → 보완 필요 사항 | `HandoffDemo.tsx` `t.missingContext` (L148) / `HandoffLanding.tsx` previewCards (L124) | 누락 정보 | 보완 필요 사항 |
| 다음 실행 → 후속 작업 | `HandoffDemo.tsx` `t.nextRun`/`t.executionRequests` (L139, L145) / previewCards (L123) | 다음 실행 | 후속 작업 |
| 실행 요청 → 제거 또는 AI 호출용 프롬프트 | `HandoffDemo.tsx` `t.nextExecution`/`t.implementationPrompt` (L147, L152) / previewCards (L127-130) | 실행 요청 | AI 호출용 프롬프트 |
| 증거 기록 → 근거 자료/원문 근거 | `HandoffDemo.tsx` `t.evidenceLedger` (L146), nav `근거 자료` (L62) / previewCards `사용한 맥락/근거 자료` (L125) | 증거 기록 | 근거 자료 / 원문 근거 |
| 결과물 전체 = 실행 기억 | `HandoffDemo.tsx` `t.create` `실행 기억 만들기`, nav `실행 기억`, history `최근 실행 기억` 등 다수 | 유지 | 실행 기억 |
| (보강) 누락된 증거 → 보완 필요 근거 | `HandoffDemo.tsx` `t.missingEvidence` (L157) | 누락된 증거 | 보완 필요 근거 |

### 잔존 모호 용어 검사
- `grep -rn "다음 실행\|누락된 증거\|누락 정보\|증거 기록\|실행 요청" src/` 결과 0건 (사용자-facing 영역).
- `"Generated Execution Request"`은 백엔드 fallback 타이틀 (`HandoffDemo.tsx` L362) 용도. n8n 응답이 없을 때 내부 메타 라벨로만 사용되어 UI 카드 라벨로 노출되지 않음 → out of scope.

## Changed files this issue
- `src/components/HandoffDemo.tsx` (`missingEvidence: "누락된 증거"` → `"보완 필요 근거"`, L157).
- `evidence/hoff-p0-07.md`
- `evidence/screenshots/hoff-p0-07-desktop.png`
- `evidence/screenshots/hoff-p0-07-mobile.png`

## Verification
- `npm run build`: pass.
- `npm run lint`: 0 error / 6 baseline warning.
- 시각 확인: Result Dashboard 마케팅 카드(`HandoffLanding.tsx` previewCards 렌더)에 새 라벨 6종(`핵심 요약`, `결정 사항`, `후속 작업`, `보완 필요 사항`, `사용한 맥락/근거 자료`, `AI 호출용 프롬프트`) 모두 노출.

## Screenshots
- Desktop (816x1056): `evidence/screenshots/hoff-p0-07-desktop.png` — Result Dashboard preview 카드 6장에 새 용어 명시.
- Mobile (391x845): `evidence/screenshots/hoff-p0-07-mobile.png` — 동일 카드 모바일 스택, 동일 용어 노출.

## Notes / risk
- 실 결과 카드(`WorkbenchCard` 렌더)는 n8n submit 이후에만 표시되므로 정적 PDF에서 캡처 불가. 그러나 라벨 정의는 `t.*` 카피 키로 통일되어 있으며, 라벨 매핑이 코드/marketing card에 동일하게 적용됨.
- 영문 카피 `nextRun: "Next run"`은 영문 컨벤션상 자연스러워 유지. Spec rename은 한글 기준 항목이며 영문은 `Follow-up Tasks`/`Missing Context`/`Context / Evidence`/`AI Prompt`로 이미 정렬됨.
