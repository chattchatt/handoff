## Goal

Rebuild the public landing page so it matches the daval.cloud reference (warm cream / espresso editorial look) and the 5 attached screenshots. The alternating "device mockup" blocks in the PROCESS section become **video slots** that you'll fill later — I'll wire in styled placeholders now.

The existing workbench app (`/app`) and demo logic stay untouched — this is a marketing/landing redesign only.

## Design system (new tokens in `src/styles.css`)

Switch the landing from the current dark navy theme to a warm light theme:

```text
background  cream        ~ #F6F1E8
surface     soft beige   ~ #EFE8DB  (pill badges, secondary buttons)
foreground  espresso     ~ #2C231C  (headings/body)
muted       warm gray    ~ #8E867B  (sub-copy, eyebrows)
faded       light gray   ~ #C7C1B6  (de-emphasized 2nd clause in headings)
primary     dark espresso~ #36291F  (primary buttons, cream text)
```

- Typography: heavy display weight for Korean headings, with a serif accent for Latin words (e.g. "AI", "REQUEST"). Pair a bold Korean-friendly sans (Pretendard) for body + a display serif for the Latin/eyebrow accents.
- Shapes: large rounded corners (rounded-2xl/3xl), full-pill badges, generous whitespace, subtle shadows. No glassmorphism.

## Page structure (top to bottom)

1. **Header** — logo left; nav (Process / Services / Pricing / FAQ); language toggle (KO/EN already exists); primary "무료로 시작하기" button.
2. **Hero** — star-rating eyebrow + "AI 자동화 전문 대행"; large two-line headline ("반복 업무는 AI에게, 성장은 당신에게."); sub-copy; two CTAs (dark "무료로 시작하기", light "서비스 알아보기 ▶"); large showcase image/video below.
3. **PROCESS** — "PROCESS" pill, headline with faded 2nd clause ("아이디어에서 결과까지, 네 번의 터치."), sub-copy. Then **4 alternating feature rows**, each = label (01·REQUEST … 04·DELIVER) + headline + copy on one side and a tilted, rounded **video slot** on the other (colorful gradient frame). Content from reference:
   - 01 REQUEST — 엑셀 한 장과 한 문단이면 충분합니다
   - 02 COLLABORATE — 대화로 요구사항을 다듬습니다
   - 03 APPROVE — 승인하는 순간 크레딧이 차감됩니다
   - 04 DELIVER — 결과는 파일이 아니라 대시보드에
4. **Services** — "Services" eyebrow + headline; 4 items (Workflow Analysis, Custom Build, Credit-Based Operations, Continuous Optimization) with numbered tabs + screenshot/video panel.
5. **3-step timeline** — "진행 방식" pill, headline ("간단한 3단계로 자동화를 시작하세요."), sub-copy, two CTAs on the left; vertical numbered timeline 01/02/03 with title + time badge (5분 / 24시간 / 자동화) + description on the right.
6. **Why us / comparison** — "build it yourself" vs "leave it to daval.cloud" two-column comparison with chips.
7. **FAQ** — accordion (6 Q&A).
8. **Pricing** — Starter / Growth (Most Popular) / Scale / Enterprise cards.
9. **Final CTA** — "반복 업무를 AI에게 넘기세요" + signup button.
10. **Footer**.

## Video slots

Every device-mockup area (hero showcase, the 4 PROCESS rows, Services panel) becomes a reusable `VideoFrame` component: tilted/rounded container on a gradient backdrop that accepts a `src` (mp4) with an image poster fallback. Until you provide videos, it shows a styled placeholder so layout is final. When you send the videos, I drop them into `public/` and pass the paths.

## Copy / i18n

Keep the existing KO/EN toggle. I'll populate both languages from the reference (Korean from your screenshots, English from the live site).

## Technical notes

- Rework `src/components/HandoffLanding.tsx` into the new section components (Hero, ProcessRows, Services, Timeline, Comparison, FAQ, Pricing, FinalCTA, Footer) under `src/components/landing/`.
- Add the warm theme tokens to `src/styles.css`; keep them scoped so the dark workbench at `/app` is unaffected.
- Update `head()` meta (title/description/og) to the new positioning.
- No backend/auth changes.

## Open question

I'll proceed assuming **Korean is the default** language (matching your screenshots) and English mirrors the live site. Tell me if you'd rather default to English.
