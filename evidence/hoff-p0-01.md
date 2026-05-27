# HOFF-P0-01 Evidence

Issue: https://github.com/chattchatt/handoff/issues/3
Date: 2026-05-27

## Acceptance vs result
- H1 = `회의록과 문서를 AI가 실행할 수 있는 작업 기억으로` — applied (`HandoffLanding.tsx` line 22, ko `heroTitle`).
- Subcopy — applied (`HandoffLanding.tsx` line 23-24, ko `heroBody`).
- Primary CTA `실행 기억 만들기` — applied (`HandoffLanding.tsx` ko `demoCta`).
- Secondary CTA `예시 보기` — applied this issue (`HandoffLanding.tsx` ko `previewCta`, en `View example`).
- HandOff / E-Hong 표시 — applied via `LogoLockup` in header (line 351) and hero (line 400).
- 로고 이미지 — applied (header + hero LogoLockup, `public/handoff-logo.svg`).
- Hero에 CLI 설치 명령어 우선 노출 X — Hero에는 CLI 없음, CLI는 별도 섹션 (line 519+).
- 이전 Hero 핵심 문구 잔존 검사 — `다음 Agent Run이 이어받을 수 있는 실행 기억`, `CLI 한 줄로 회의록` grep 결과 0건.

## Changed files this issue
- `src/components/HandoffLanding.tsx` (Secondary CTA 텍스트 ko `결과 미리보기` → `예시 보기`, en `Preview output` → `View example`).

## Verification
- `npm run build`: pass (client + SSR Vite build, 0 error).
- `npm run lint`: 0 error, 6 baseline Fast Refresh warning.

## Screenshots
- Desktop 1440x1200: `evidence/screenshots/hoff-p0-01-desktop.png` (Hero에 H1/subcopy/CTA/팀명/로고 한 화면 확인, CLI 비노출).
- Mobile 390x844: `evidence/screenshots/hoff-p0-01-mobile.png` (Hero 상단에 H1/CTA/로고 노출).

## Notes / risk
- 이미 uncommitted 변경에 P0-01 대부분이 사전 적용되어 있었음. 본 작업은 누락된 Secondary CTA 문구만 추가 적용.
- Mobile에서 H1이 좁은 화면 폭으로 줄바꿈 위치가 어색해 보일 수 있음. 정밀한 반응형 처리는 HOFF-P0-12 범위로 deferred.
