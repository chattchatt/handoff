import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Star, Plus, Minus, Check, X, Github, LogOut } from "lucide-react";
import { copy, type Lang } from "@/components/landing/content";
import handoffLogo from "@/assets/handoff-logo.png";
import { useAuth } from "@/lib/use-auth";
import {
  Reveal,
  Pill,
  Eyebrow,
  PrimaryButton,
  SecondaryButton,
  VideoFrame,
  goToWorkbench,
  scrollToId,
} from "@/components/landing/ui";

function getInitialLang(): Lang {
  if (typeof window === "undefined") return "ko";
  return new URLSearchParams(window.location.search).get("lang") === "en" ? "en" : "ko";
}

export function HandoffLanding() {
  const [lang, setLang] = useState<Lang>(getInitialLang);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const t = copy[lang];
  const auth = useAuth();

  function handleStart() {
    // Require GitHub login before entering the workbench.
    if (!auth.configured || auth.loggedIn) {
      goToWorkbench();
    } else {
      void auth.login();
    }
  }

  function StartButton({ children }: { children?: ReactNode }) {
    return (
      <PrimaryButton onClick={handleStart}>
        {!auth.configured || auth.loggedIn ? (
          children ?? t.cta.start
        ) : (
          <>
            <Github className="mr-2 h-4 w-4" />
            {t.cta.github}
          </>
        )}
      </PrimaryButton>
    );
  }

  function changeLang(next: Lang) {
    setLang(next);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="handoff-landing min-h-screen overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[var(--d-border)] bg-[#1a1f31]/80 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <Link
            to="/"
            className="flex items-center gap-2 text-lg font-bold tracking-tight text-[var(--d-fg)]"
          >
            <img src={handoffLogo} alt="HandOff logo" className="h-8 w-8 object-contain" />
            Hand<span className="text-[var(--d-muted)]">Off</span>
          </Link>

          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <div className="flex rounded-full bg-[var(--d-surface)] p-1">
              {(["ko", "en"] as const).map((item) => (
                <button
                  key={item}
                  className={`h-7 rounded-full px-3 text-xs font-bold transition ${
                    lang === item
                      ? "bg-[var(--d-primary)] text-[var(--d-primary-fg)]"
                      : "text-[var(--d-muted)] hover:text-[var(--d-fg)]"
                  }`}
                  onClick={() => changeLang(item)}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>
            {auth.configured && auth.loggedIn ? (
              <div className="hidden items-center gap-2 sm:flex">
                {auth.user?.avatarUrl && (
                  <img
                    src={auth.user.avatarUrl}
                    alt={auth.user.login}
                    className="h-8 w-8 rounded-full border border-[var(--d-border)]"
                  />
                )}
                <StartButton />
                <button
                  type="button"
                  onClick={() => void auth.logout()}
                  aria-label="Logout"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--d-surface)] text-[var(--d-muted)] transition hover:text-[var(--d-fg)]"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:block">
                <StartButton />
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:pt-28">
        <Reveal className="mb-6 flex items-center justify-center gap-3">
          <span className="flex gap-0.5 text-[var(--d-fg)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </span>
          <span className="text-sm font-semibold text-[var(--d-muted)]">{t.hero.eyebrow}</span>
        </Reveal>
        <Reveal delay={0.05}>
          <h1 className="whitespace-pre-line text-4xl font-semibold leading-[1.12] tracking-tight text-[var(--d-fg)] sm:text-6xl">
            {t.hero.titleA}
            <span className="font-serif-accent">{t.hero.titleAccent}</span>
            {t.hero.titleB}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-[var(--d-muted)]">
            {t.hero.body}
          </p>
        </Reveal>
        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <StartButton />
            <SecondaryButton withPlay onClick={() => scrollToId("process")}>
              {t.cta.explore}
            </SecondaryButton>
          </div>
        </Reveal>
        <Reveal delay={0.2} className="mt-14">
          <VideoFrame tilt="none" variant={0} src="/videos/main.mp4" />
        </Reveal>
      </section>

      {/* Process */}
      <section id="process" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20">
        <Reveal className="mx-auto max-w-2xl text-center">
          <div className="flex justify-center">
            <Pill>{t.process.pill}</Pill>
          </div>
          <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">

            {t.process.titleA} <span className="text-[var(--d-faded)]">{t.process.titleFaded}</span>
          </h2>
          <p className="mt-4 text-base text-[var(--d-muted)]">{t.process.body}</p>
        </Reveal>

        <div className="mt-16 space-y-20">
          {t.process.rows.map((row, i) => {
            const flip = i % 2 === 1;
            return (
              <div
                key={row.index}
                className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14"
              >
                <Reveal className={flip ? "lg:order-2" : ""}>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--d-muted)]">
                    {row.index} · {row.label}
                  </p>
                  <h3 className="mt-4 text-2xl font-semibold leading-snug tracking-tight sm:text-3xl">
                    {row.title}
                  </h3>

                  <p className="mt-4 max-w-md text-base leading-7 text-[var(--d-muted)]">
                    {row.body}
                  </p>
                </Reveal>
                <Reveal delay={0.1} className={flip ? "lg:order-1" : ""}>
                  <VideoFrame
                    tilt={flip ? "left" : "right"}
                    variant={i}
                    src={row.video}
                    label={lang === "ko" ? "영상이 들어갈 자리" : "Video goes here"}
                  />
                </Reveal>
              </div>
            );
          })}
        </div>
      </section>

      {/* Services */}
      <section id="services" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t.services.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t.services.title}
            </h2>
            <p className="mt-4 text-base text-[var(--d-muted)]">{t.services.body}</p>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {t.services.items.map((s, i) => (
              <Reveal key={s.index} delay={i * 0.05}>
                <div className="glass-panel h-full rounded-2xl p-7">
                  <span className="text-sm font-bold text-[var(--d-faded)]">{s.index}</span>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight">{s.name}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--d-muted)]">{s.body}</p>
                </div>
              </Reveal>
            ))}

          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <Reveal>
            <div className="inline-block">
              <Pill>{t.timeline.pill}</Pill>
            </div>
            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t.timeline.titleA}
              <span className="text-[var(--d-faded)]">{t.timeline.titleFaded}</span>
              {t.timeline.titleB}
            </h2>

            <p className="mt-4 max-w-md text-base leading-7 text-[var(--d-muted)]">
              {t.timeline.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StartButton />
              <SecondaryButton withPlay onClick={() => scrollToId("pricing")}>
                {t.cta.pricing}
              </SecondaryButton>
            </div>
          </Reveal>
          <div className="relative">
            <span className="absolute left-7 top-7 bottom-7 w-px bg-[var(--d-border-strong)]" />
            <div className="space-y-8">
              {t.timeline.steps.map((step, i) => (
                <Reveal key={step.index} delay={i * 0.08}>
                  <div className="flex gap-5">
                    <span className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--d-border-strong)] bg-white/[0.06] text-base font-semibold text-[var(--d-fg)] backdrop-blur-xl">
                      {step.index}
                    </span>
                    <div className="pt-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
                        <span className="rounded-md bg-white/[0.06] px-3 py-1 text-xs font-semibold text-[var(--d-muted)]">
                          {step.duration}
                        </span>
                      </div>

                      <p className="mt-2 max-w-md text-sm leading-6 text-[var(--d-muted)]">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="max-w-2xl">
            <Eyebrow>{t.comparison.eyebrow}</Eyebrow>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
              {t.comparison.title}
            </h2>
            <p className="mt-4 text-base text-[var(--d-muted)]">{t.comparison.body}</p>
          </Reveal>
          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            <Reveal>
              <div className="glass-panel h-full rounded-2xl p-8">
                <h3 className="text-xl font-semibold tracking-tight text-[var(--d-muted)]">
                  {t.comparison.leftTitle}
                </h3>
                <div className="mt-5 flex flex-wrap gap-2">
                  {t.comparison.leftChips.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 text-xs font-semibold text-[var(--d-muted)]"
                    >
                      <X className="h-3 w-3" /> {c}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-6 text-[var(--d-muted)]">{t.comparison.leftBody}</p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded-2xl border border-[#5D7EEB]/40 bg-[#5D7EEB] p-8 text-white shadow-[0_18px_70px_rgba(93,126,235,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]">
                <h3 className="text-xl font-semibold tracking-tight">{t.comparison.rightTitle}</h3>

                <div className="mt-5 flex flex-wrap gap-2">
                  {t.comparison.rightChips.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-xs font-semibold"
                    >
                      <Check className="h-3 w-3" /> {c}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-6 text-white/80">
                  {t.comparison.rightBody}
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-5 py-20">
        <Reveal className="text-center">
          <div className="flex justify-center">
            <Pill>{t.faq.eyebrow}</Pill>
          </div>
          <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{t.faq.title}</h2>
          <p className="mt-4 text-base text-[var(--d-muted)]">{t.faq.body}</p>
        </Reveal>
        <div className="mt-10 space-y-3">
          {t.faq.items.map((item, i) => {
            const open = openFaq === i;
            return (
              <Reveal key={item.q} delay={i * 0.03}>
                <div className="glass-panel overflow-hidden rounded-2xl">
                  <button
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    onClick={() => setOpenFaq(open ? null : i)}
                  >
                    <span className="text-base font-bold tracking-tight">{item.q}</span>
                    {open ? (
                      <Minus className="h-5 w-5 shrink-0 text-[var(--d-muted)]" />
                    ) : (
                      <Plus className="h-5 w-5 shrink-0 text-[var(--d-muted)]" />
                    )}
                  </button>
                  {open && (
                    <p className="px-6 pb-6 text-sm leading-6 text-[var(--d-muted)]">{item.a}</p>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="scroll-mt-24 py-20">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="text-center">
            <div className="flex justify-center">
              <Pill>{t.pricing.eyebrow}</Pill>
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
              {t.pricing.title}
            </h2>
            <p className="mt-4 text-base text-[var(--d-muted)]">{t.pricing.body}</p>
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {t.pricing.plans.map((plan, i) => (
              <Reveal key={plan.name} delay={i * 0.05}>
                <div
                  className={`flex h-full flex-col rounded-2xl p-7 ${
                    plan.popular
                      ? "border border-[#5D7EEB]/40 bg-[#5D7EEB] text-white shadow-[0_18px_70px_rgba(93,126,235,0.35),inset_0_1px_0_rgba(255,255,255,0.2)]"
                      : "glass-panel"
                  }`}
                >
                  {plan.popular && (
                    <span className="mb-3 inline-block w-fit rounded-md bg-white/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-lg font-semibold tracking-tight">{plan.name}</h3>
                  <p
                    className={`mt-1 text-sm ${
                      plan.popular ? "text-white/75" : "text-[var(--d-muted)]"
                    }`}
                  >
                    {plan.tagline}
                  </p>
                  {plan.price && (
                    <p className="mt-6 text-3xl font-semibold tracking-tight">{plan.price}</p>
                  )}
                  {plan.credits && (
                    <p
                      className={`mt-1 text-xs font-semibold ${
                        plan.popular ? "text-white/70" : "text-[var(--d-muted)]"
                      }`}
                    >
                      {plan.credits} · {plan.perCredit}
                    </p>
                  )}
                  <div className="mt-auto pt-7">
                    <button
                      onClick={handleStart}
                      className={`w-full rounded-lg px-5 py-3 text-sm font-semibold transition ${
                        plan.popular
                          ? "bg-white text-[#5D7EEB] hover:opacity-90"
                          : "border border-[#5D7EEB]/40 bg-[#5D7EEB] text-white hover:-translate-y-0.5"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>

              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center">
        <Reveal>
          <Eyebrow>{t.finalCta.eyebrow}</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {t.finalCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-[var(--d-muted)]">{t.finalCta.body}</p>
          <div className="mt-9 flex justify-center">
            <StartButton />
          </div>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--d-border)] bg-white/[0.02] backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-5 py-14 text-center">
          <p className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <img src={handoffLogo} alt="HandOff logo" className="h-8 w-8 object-contain" />
            Hand<span className="text-[var(--d-muted)]">Off</span>
          </p>

          <p className="max-w-xs text-sm leading-6 text-[var(--d-muted)]">{t.footer.tagline}</p>
        </div>
        <div className="border-t border-[var(--d-border)] px-5 py-6 text-center text-xs text-[var(--d-muted)]">
          {t.footer.rights}
        </div>
      </footer>
    </div>
  );
}

export default HandoffLanding;
