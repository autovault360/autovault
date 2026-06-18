"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Building2, Lock, Mail, Phone, User } from "lucide-react";
import { toast } from "sonner";
import { joinWaitlist } from "@/lib/waitlist/server/join-waitlist";
import { heroWaitlistSchema, type HeroWaitlistValues } from "@/lib/waitlist/actions/schemas";
import { formatPhoneNumber } from "@/lib/vehicles/actions/utils";
import { useEffect, useRef } from "react";

export default function LandingWaitlistForm({ serifClassName }: { serifClassName: string }) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors, isSubmitting },
    reset,
    setFocus
  } = useForm<HeroWaitlistValues>({
    resolver: zodResolver(heroWaitlistSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dealershipName: "",
      source: "hero_form",
    },
  });

  useEffect(() => {
    if (window.location.hash === "#waitlist") {
      setFocus("fullName");
    }
  }, [setFocus]);

  async function onSubmit(data: HeroWaitlistValues) {
    const result = await joinWaitlist(data);

    if (!result.success) {
      if (result.fieldErrors) {
        for (const [key, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(key as keyof HeroWaitlistValues, { message: messages[0] });
          }
        }
      }
      toast.error(result.error);
      return;
    }

    toast.success(result.message);
    reset();
  }

  return (
    <div
      id="waitlist"
      className="rounded-[16px] border border-[var(--lp-border)] bg-[var(--lp-bg-card)] p-6 shadow-[var(--lp-shadow-card)] backdrop-blur-sm transition-colors duration-300 sm:p-8 lg:p-9"
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--lp-fg-accent)]">
        Founding Dealer Early Access
      </p>
      <h2
        className={[
          "mt-3 text-[26px] leading-[1.15] tracking-[-0.02em] text-[var(--lp-fg-heading)] sm:text-[30px]",
          serifClassName,
        ].join(" ")}
      >
        Be Among the First Dealers to Shape AutoVault.
      </h2>
      <p className="mt-4 text-[14px] leading-relaxed text-[var(--lp-fg-muted)] sm:text-[15px]">
        Only a limited number of dealerships will be invited into the first release.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-3.5" noValidate>
        <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

        <WaitlistField label="Full Name" icon={User} placeholder="Full Name" error={errors.fullName?.message} {...register("fullName")} />
        <WaitlistField label="Email Address" icon={Mail} placeholder="Email Address" type="email" error={errors.email?.message} {...register("email")} />
        <Controller
          name="phone"
          control={control}
          render={({ field, fieldState }) => (
            <WaitlistField
              label="Phone Number"
              icon={Phone}
              placeholder="(555) 123-4567"
              type="tel"
              name={field.name}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(formatPhoneNumber(e.target.value))}
              onBlur={field.onBlur}
              error={fieldState.error?.message}
            />
          )}
        />
        <WaitlistField label="Dealership Name" icon={Building2} placeholder="Dealership Name" error={errors.dealershipName?.message} {...register("dealershipName")} />

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-[var(--lp-bg-elevated)] text-[15px] font-medium text-[var(--lp-fg-on-dark)] transition-colors hover:bg-[var(--lp-bg-elevated-hover)] disabled:opacity-70"
        >
          {isSubmitting ? "Joining..." : "Join the Waitlist"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <p className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[var(--lp-fg-subtle)]">
        <Lock className="h-3.5 w-3.5" />
        We respect your privacy. No spam, ever.
      </p>
    </div>
  );
}

function WaitlistField({
  label,
  icon: Icon,
  placeholder,
  type = "text",
  error,
  ...props
}: {
  label: string;
  icon: typeof User;
  placeholder: string;
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={props.name} className="sr-only">
        {label}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[var(--lp-fg-icon)]" />
        <input
          id={props.name}
          type={type}
          placeholder={placeholder}
          className={[
            "h-[48px] w-full rounded-[10px] border bg-[var(--lp-bg-input)] pl-11 pr-4 text-[14px] text-[var(--lp-fg-input)] outline-none transition-colors placeholder:text-[var(--lp-fg-placeholder)] focus:border-[var(--lp-fg-accent)] focus:ring-1 focus:ring-[var(--lp-fg-accent)]/20",
            error ? "border-red-400" : "border-[var(--lp-border-subtle)]",
          ].join(" ")}
          {...props}
        />
      </div>
      {error ? <p className="mt-1 text-[12px] text-red-500">{error}</p> : null}
    </div>
  );
}
