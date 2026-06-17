import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import Image from "next/image";
import Footer from "@/components/layout/footer";
import Link from "next/link";

export type LoginFeatureItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export type LoginHeroContent = {
  headline: ReactNode;
  description: string;
  features: LoginFeatureItem[];
};

function LoginPanelDivider() {
  return (
    <div className="absolute inset-y-0 left-[50%] hidden lg:block w-[120px] -translate-x-1/2 pointer-events-none z-20 object-cover">
      <svg
        className="h-full w-full"
        viewBox="0 0 120 1000"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="login-vertical-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="15%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d="M 10 0 L 110 500 L 10 1000"
          stroke="url(#login-vertical-fade)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function LoginHeroPanel({ headline, description, features }: LoginHeroContent) {
  return (
    <div
      className="relative h-full hidden w-[60%] lg:flex flex-col p-4 z-10"
      style={{ minHeight: "calc(100vh - 50px)" }}
    >
      <div
        className="absolute inset-0 -z-20 h-full w-full"
        style={{
          clipPath: "polygon(0% 0%, 91.6% 0%, 100% 50%, 86.6% 100%, 0% 100%)",
        }}
      >
        <Image
          src="/login_left_bg.jpeg"
          alt="AutoVault Hero Background"
          fill
          sizes="100vw"
          priority
          className="object-cover object-center w-full min-h-screen"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#050708]/10 to-[#050708]/80" />
      </div>

      <Link href="/" className="flex items-center">
        <Image
          src="/logo.webp"
          alt="AutoVault Logo"
          loading="eager"
          width={220}
          height={45}
          className="p-2 object-cover"
          style={{ width: "auto", height: "auto" }}
        />
      </Link>

      <div className="flex flex-col justify-between gap-12 flex-1">
        <div className="flex items-center">
          <div className="w-1/2" />
          <div className="w-1/2 max-w-xl space-y-6">
            <h1 className="text-2xl font-extrabold tracking-tight text-white xl:text-4xl uppercase leading-[1.1]">
              {headline}
            </h1>
            <p className="text-[13px] leading-relaxed text-zinc-300 max-w-xs pr-10 font-normal">
              {description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pr-12 pt-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="space-y-3 text-center max-w-xs p-2">
                <div className="text-primary flex items-center justify-center">
                  <Icon className="h-10 w-10" strokeWidth={1.5} />
                </div>
                <h4 className="text-sm text-center font-bold tracking-wide text-zinc-200">
                  {feature.title}
                </h4>
                <p className="text-[11px] leading-relaxed text-muted">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function LoginFormPanel({ children }: { children: ReactNode }) {
  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-[#020403] relative z-10">
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-[#3ea436]/5 rounded-full blur-[100px] pointer-events-none hidden lg:block" />
      {children}
    </div>
  );
}

export function LoginFormCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-[450px] rounded-xl border border-zinc-900/80 bg-[#0c0e10]/60 p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] backdrop-blur-[4px] sm:p-10 relative">
      <div className="flex lg:hidden justify-center mb-8">
        <Image
          src="/logo.webp"
          alt="AutoVault Logo"
          loading="eager"
          width={150}
          height={40}
          className="object-contain"
          style={{ width: "auto", height: "auto" }}
        />
      </div>

      <div className="space-y-1.5 text-center">
        <h2 className="text-[25px] font-medium tracking-tight text-white font-sans">{title}</h2>
        <p className="text-[13px] text-zinc-500 font-normal tracking-wide">{subtitle}</p>
      </div>

      {children}
    </div>
  );
}

export function LoginPageShell({
  hero,
  children,
}: {
  hero: LoginHeroContent;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-[#020403] font-sans text-zinc-300 antialiased selection:bg-primary/30 selection:text-white overflow-x-hidden">
      <div
        className="relative mx-auto w-full flex items-center gap-6"
        style={{ minHeight: "calc(100vh - 140px)" }}
      >
        <LoginHeroPanel {...hero} />
        <LoginPanelDivider />
        <LoginFormPanel>{children}</LoginFormPanel>
      </div>
      <Footer />
    </div>
  );
}
