import { Calendar, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";

const items = [
  { icon: null, useLogo: true, text: "Built by Dealers. Backed by Experience." },
  { icon: Users, useLogo: false, text: "Join the Founding Dealers Program. Early Access Limited." },
  { icon: Calendar, useLogo: false, text: "Launching 2026. Early Access Opening Soon." },
  { icon: ShieldCheck, useLogo: false, text: "Secure. Your Data is Safe." },
];

export default function LandingTrustBar({ serifClassName }: { serifClassName: string }) {
  return (
    <section className="mx-auto my-6 max-w-7xl rounded-2xl bg-[var(--lp-bg-elevated)] transition-colors duration-300">
      <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.text} className="flex items-center gap-4 px-6 py-6 sm:px-5 lg:px-6 lg:py-7">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center text-[var(--lp-gold)]">
                {item.useLogo ? (
                  <Image src="/logo_short.webp" alt="AutoVault" width={32} height={32} />
                ) : Icon ? (
                  <Icon className="h-7 w-7" strokeWidth={1.75} />
                ) : null}
              </div>
              <p className={`text-[14px] font-medium leading-snug text-[var(--lp-fg-on-dark)] sm:text-[15px] ${serifClassName}`}>
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
