# HOFF-P0-00 Surface Baseline

Issue: https://github.com/chattchatt/handoff/issues/25
Date: 2026-05-27
Scope: 구현 표면 발견 및 기준선 캡처 only.

## Selected Project Item
- Task ID: HOFF-P0-00
- Title: 구현 표면 발견 및 기준선 캡처
- Priority/status source: GitHub Project 2 minimal P0 Ready/Todo index
- Dependencies: none (selected before downstream HOFF-P0-01..12 work)

## Code Location List
- Landing route: `src/routes/index.tsx` imports and renders `HandoffLanding`.
- Route shell/meta/style attachment: `src/routes/__root.tsx`.
- Landing page / section order / hero / logo / CLI block: `src/components/HandoffLanding.tsx`.
- Hero visual scene: `src/components/HeroMemoryScene.tsx`.
- Demo form, generation controls, result dashboard, action buttons: `src/components/HandoffDemo.tsx`.
- n8n / demo response adapter: `src/lib/n8n.ts`.
- Style system / Tailwind entry: `src/styles.css`.
- Static brand asset: `public/handoff-logo.svg`.
- PDF save surface: `src/components/HandoffDemo.tsx` (`handleSavePdf`, `window.print()`).
- Email/copy style output surface: `src/components/HandoffDemo.tsx` delivery option/result text builders.

## Run Command
- Local dev server: `npm run dev -- --host 127.0.0.1`
- Observed URL: `http://127.0.0.1:8080/`
- Success log: `VITE v7.3.3 ready in 1006 ms`

## Baseline Screenshots
- Desktop: `evidence/screenshots/hoff-p0-00-desktop.png` (1440x1200)
- Mobile: `evidence/screenshots/hoff-p0-00-mobile.png` (390x844)

## Verification Commands Available
- `npm run build`
- `npm run lint`
- `npm run build:dev`
- `npm run preview`

## Changed Files For This Issue
- `evidence/hoff-p0-00-surface-baseline.md`
- `evidence/screenshots/hoff-p0-00-desktop.png`
- `evidence/screenshots/hoff-p0-00-mobile.png`

## Deferred Scope
- No downstream P0 implementation was included.
- HOFF-P0-01 should be the next implementation issue after this baseline.

## Verification Results
- `npm run build`: pass. Client and SSR builds completed with Vite 7.3.3.
- `npm run lint`: pass with 0 errors and 6 existing Fast Refresh warnings in `src/components/ui/*`.
