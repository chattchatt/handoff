import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

export function goToWorkbench() {
  window.history.pushState({}, "", "/app");
  window.dispatchEvent(new Event("popstate"));
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* Scroll-reveal wrapper */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-[var(--d-border)] bg-[var(--d-bg-2)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--d-muted)] backdrop-blur-xl">
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--d-muted)]">
      {children}
    </p>
  );
}

export function PrimaryButton({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-lg border border-[#5D7EEB]/40 bg-[#5D7EEB] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_36px_rgba(93,126,235,0.35),inset_0_1px_0_rgba(255,255,255,0.18)] transition hover:-translate-y-0.5 hover:bg-[#6f8cf0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31]"
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  onClick,
  withPlay = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  withPlay?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-[var(--d-fg)] backdrop-blur-xl transition hover:border-[#5D7EEB]/40 hover:bg-[#5D7EEB]/[0.12] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5D7EEB]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1A1F31]"
    >
      {children}
      {withPlay && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#5D7EEB] text-white">
          <Play className="h-2.5 w-2.5 fill-current" />
        </span>
      )}
    </button>
  );
}

/**
 * Glass device frame, matched to the /app workbench surfaces.
 * Drop a video later by passing `src` (mp4) + optional `poster`.
 */
export function VideoFrame({
  tilt = "right",
  variant = 0,
  src,
  poster,
  label,
}: {
  tilt?: "left" | "right" | "none";
  variant?: number;
  src?: string;
  poster?: string;
  label?: string;
}) {
  const rotateY = tilt === "right" ? "-9deg" : tilt === "left" ? "9deg" : "0deg";

  return (
    <div className="glass-panel relative overflow-hidden rounded-2xl p-6 sm:p-10">
      <div
        className="overflow-hidden rounded-xl border border-white/[0.14] bg-[#0b0f1c] shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
        style={{ transform: `perspective(1700px) rotateY(${rotateY}) rotateX(3deg)` }}
      >
        {/* browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-white/[0.1] bg-white/[0.04] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 hidden truncate rounded-md bg-white/[0.06] px-3 py-1 text-[10px] text-[var(--d-muted)] sm:block">
            HandOff
          </span>
        </div>

        {src ? (
          <video
            className="aspect-[16/10] w-full object-cover"
            src={src}
            poster={poster}
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 bg-[radial-gradient(circle_at_30%_20%,rgba(93,126,235,0.12),transparent_55%)] text-[var(--d-muted)]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06]">
              <Play className="h-5 w-5 fill-current text-[#8fb3ff]" />
            </span>
            <span className="text-xs font-semibold tracking-wide">
              {label ?? "영상이 들어갈 자리"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
