import Image from "next/image";
import { Clock3, Cloud, ShieldCheck, TrendingUp } from "lucide-react";
import LandingWaitlistForm from "@/components/landing/landing-waitlist-form";
import landingCar from "@/assets/Landing_bg.jpeg";

const benefits = [
  { icon: TrendingUp, title: "Increase Profit", subtitle: "On every deal" },
  { icon: Clock3, title: "Save Time", subtitle: "Automate daily tasks" },
  { icon: ShieldCheck, title: "Stay Compliant", subtitle: "Organized & secure" },
  { icon: Cloud, title: "Access Anywhere", subtitle: "Cloud-based platform" },
];

type LandingHeroProps = {
  serifClassName: string;
};

export default function LandingHero({ serifClassName }: LandingHeroProps) {
  return (
    <section className="relative mx-auto max-w-7xl overflow-hidden bg-[var(--lp-bg)] pb-0 pt-10 transition-colors duration-300 sm:pt-12 lg:pt-14">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 xl:gap-12">
          <div className="relative z-[1]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--lp-fg-accent)] sm:text-[12px]">
              The All-In-One Dealership Management Platform
            </p>
            <h1
              className={[
                "mt-4 max-w-[640px] text-[34px] leading-[1.08] tracking-[-0.02em] text-[var(--lp-fg-heading)] sm:text-[42px] lg:text-[48px] xl:text-[52px]",
                serifClassName,
              ].join(" ")}
            >
              Stop Losing Profit to Spreadsheets and Disconnected Systems.
            </h1>
            <p className="mt-5 max-w-[560px] text-[16px] leading-relaxed text-[var(--lp-fg-muted)] sm:text-[17px] lg:text-[18px]">
              Manage inventory, sales reps, commissions, payments, taxes, and profit, all in one
              platform built for dealerships.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {benefits.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex flex-col items-start gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--lp-border-icon)] bg-[var(--lp-bg-icon)] text-[var(--lp-fg-heading)]">
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-[var(--lp-fg)] sm:text-[14px]">
                        {item.title}
                      </div>
                      <div className="mt-0.5 text-[11px] text-[var(--lp-fg-subtle)] sm:text-[12px]">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* <div>
              <Image
                src="/Landing_bg.webp"
                alt="Luxury dealership vehicle"
                loading="eager"
                priority
                width={1000}
                height={600}
                className="h-auto w-full object-contain object-left-bottom"
              />
            </div> */}
          </div>
          <div className="relative z-[2] lg:pt-2">
            <LandingWaitlistForm serifClassName={serifClassName} />
          </div>
        </div>
      </div>
    </section>
  );
}
