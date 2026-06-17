import Link from "next/link";
import { ArrowRight, Home, MapPinOff } from "lucide-react";

type LandingNotFoundContentProps = {
  serifClassName: string;
};

export default function LandingNotFoundContent({ serifClassName }: LandingNotFoundContentProps) {
  return (
    <section className="relative flex min-h-[calc(100vh-200px)] items-center bg-[var(--lp-bg)] px-4 py-16 transition-colors duration-300 sm:px-6 sm:py-20 lg:px-8">
      <div className="relative mx-auto w-full max-w-3xl">
        <div className="pointer-events-none absolute top-1/2 left-1/2 hidden h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--lp-glow)] blur-[100px] lg:block" />

        <div className="relative overflow-hidden rounded-[16px] border border-[var(--lp-border-card)] bg-[var(--lp-bg-card)] px-6 py-12 text-center shadow-[var(--lp-shadow-card)] sm:px-10 sm:py-16">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[var(--lp-border-icon)] bg-[var(--lp-bg-icon)] text-[var(--lp-fg-heading)]">
            <MapPinOff className="h-7 w-7" strokeWidth={1.75} />
          </div>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lp-fg-accent)] sm:text-[12px]">
            Error 404
          </p>

          <p
            className={`mt-3 text-[64px] font-semibold leading-none tracking-[-0.04em] text-[var(--lp-fg-accent)] sm:text-[80px] ${serifClassName}`}
            aria-hidden="true"
          >
            404
          </p>

          <h1
            className={`mt-4 text-[32px] leading-[1.08] tracking-[-0.02em] text-[var(--lp-fg-heading)] sm:text-[40px] ${serifClassName}`}
          >
            Page Not Found
          </h1>

          <p className={`mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[var(--lp-fg-muted)] sm:text-[16px] ${serifClassName}`}>
            The page you&apos;re looking for doesn&apos;t exist, may have been moved, or is
            temporarily unavailable.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[var(--lp-bg-elevated)] px-6 text-[14px] font-medium text-[var(--lp-fg-on-dark)] transition-colors hover:bg-[var(--lp-bg-elevated-hover)] sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
            <Link
              href="/login"
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--lp-border-card)] bg-[var(--lp-bg)] px-6 text-[14px] font-medium text-[var(--lp-fg-heading)] transition-colors hover:border-[var(--lp-fg-accent)] hover:text-[var(--lp-fg-accent)] sm:w-auto"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
