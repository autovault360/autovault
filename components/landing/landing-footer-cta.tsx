"use client";

import { useState, useTransition } from "react";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { joinWaitlistFooter } from "@/lib/waitlist/server/join-waitlist";

export default function LandingFooterCta({ serifClassName }: { serifClassName: string }) {
  const [isPending, startTransition] = useTransition();
  const [emailError, setEmailError] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setEmailError(null);
    startTransition(async () => {
      const result = await joinWaitlistFooter({
        email: String(formData.get("email") ?? ""),
        source: "footer_form",
        website: String(formData.get("website") ?? ""),
      });

      if (!result.success) {
        if (result.fieldErrors?.email?.[0]) {
          setEmailError(result.fieldErrors.email[0]);
        }
        toast.error(result.error);
        return;
      }

      toast.success(result.message);
    });
  }

  return (
    <section className="bg-[var(--lp-bg)] px-4 py-10 transition-colors duration-300 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl">
        <div className="pointer-events-none absolute top-1/2 right-1/4 hidden h-72 w-72 -translate-y-1/2 rounded-full bg-[var(--lp-glow)] blur-[100px] lg:block" />
        <div className="relative overflow-hidden rounded-[16px] border border-[var(--lp-border-card)] bg-[var(--lp-bg-elevated)] px-6 py-8 shadow-[var(--lp-shadow-card)] sm:px-8 sm:py-10 lg:px-10">
          <div className="grid items-center gap-8 lg:grid-cols-[auto_1fr_auto] lg:gap-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-[var(--lp-fg-on-dark)]">
              <Mail className="h-7 w-7" />
            </div>

            <div>
              <h2 className={`text-[28px] font-semibold leading-tight text-[var(--lp-fg-on-dark)] sm:text-[32px] ${serifClassName}`}>
                Be the First to Know
              </h2>
              <p className={`mt-2 max-w-[520px] text-[14px] leading-relaxed text-[var(--lp-fg-on-dark-muted)] sm:text-[15px] ${serifClassName}`}>
                Join the waitlist today and get exclusive updates, early access, and launch bonuses.
              </p>
            </div>

            <div className="w-full lg:max-w-[420px]">
              <form action={handleSubmit} className="space-y-3">
                <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    name="email"
                    type="email"
                    placeholder="Your email address"
                    className={[
                      "h-10 py-3 flex-1 rounded-[10px] border bg-[var(--lp-bg-inset)] px-4 text-[14px] text-[var(--lp-fg-on-dark)] outline-none placeholder:text-[var(--lp-fg-on-dark-subtle)] focus:border-[var(--lp-bg-accent)] focus:ring-1 focus:ring-[var(--lp-bg-accent)]/30",
                      emailError ? "border-red-400" : "border-[var(--lp-bg-accent)]/40",
                    ].join(" ")}
                  />
                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex h-[48px] shrink-0 items-center justify-center gap-2 rounded-full bg-[var(--lp-bg-accent)] px-6 text-[14px] font-medium text-[var(--lp-fg-on-dark)] transition-colors hover:bg-[var(--lp-bg-accent-hover)] disabled:opacity-70"
                  >
                    {isPending ? "Joining..." : "Join the Waitlist"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
                {emailError ? (
                  <p className={`text-[12px] text-red-300 ${serifClassName}`}>{emailError}</p>
                ) : null}
              </form>
              <p className={`mt-3 flex items-center gap-2 text-[12px] text-[var(--lp-fg-on-dark-subtle)] ${serifClassName}`}>
                <Lock className="h-3.5 w-3.5" />
                We respect your privacy. No spam, ever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
