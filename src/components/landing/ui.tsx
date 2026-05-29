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
    <span className="inline-flex items-center rounded-full bg-[var(--d-surface)] px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[var(--d-muted)]">
      {children}
    </span>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--d-muted)]">{children}</p>
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
      className="inline-flex items-center justify-center rounded-full bg-[var(--d-primary)] px-7 py-3.5 text-sm font-bold text-[var(--d-primary-fg)] shadow-[0_10px_30px_rgba(44,33,24,0.22)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(44,33,24,0.28)]"
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
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--d-surface)] px-7 py-3.5 text-sm font-bold text-[var(--d-fg)] transition hover:bg-[var(--d-surface-2)]"
    >
      {children}
      {withPlay && (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--d-primary)] text-[var(--d-primary-fg)]">
          <Play className="h-2.5 w-2.5 fill-current" />
        </span>
      )}
    </button>
  );
}

const GRADIENTS = [
  "linear-gradient(125deg,#2f6bff 0%,#6a3df0 38%,#ff7a4d 72%,#ffd166 100%)",
  "linear-gradient(125deg,#ff7a4d 0%,#f0526a 40%,#7b3ff2 78%,#2f6bff 100%)",
  "linear-gradient(125deg,#22c1c3 0%,#3a7bff 45%,#7b3ff2 80%,#ff7a4d 100%)",
  "linear-gradient(125deg,#ffd166 0%,#ff7a4d 38%,#f0526a 70%,#7b3ff2 100%)",
];

/**
 * Tilted device frame on a colorful gradient backdrop.
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
  const gradient = GRADIENTS[variant % GRADIENTS.length];

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-6 sm:p-10"
      style={{ background: gradient }}
    >
      <div
        className="overflow-hidden rounded-xl bg-white shadow-[0_30px_80px_rgba(20,16,12,0.35)] ring-1 ring-black/10"
        style={{ transform: `perspective(1700px) rotateY(${rotateY}) rotateX(3deg)` }}
      >
        {/* browser chrome */}
        <div className="flex items-center gap-1.5 border-b border-black/[0.06] bg-[#f3f1ee] px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 hidden truncate rounded-md bg-white px-3 py-1 text-[10px] text-[#9a948c] sm:block">
            daval.cloud
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
          <div className="flex aspect-[16/10] w-full flex-col items-center justify-center gap-3 bg-[linear-gradient(180deg,#fbfaf8,#f1ede6)] text-[#b3aca0]">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
              <Play className="h-5 w-5 fill-[#8b8378] text-[#8b8378]" />
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
