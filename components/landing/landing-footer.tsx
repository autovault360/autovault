import Link from "next/link";
import LandingThemeLogo from "@/components/landing/landing-theme-logo";
import { LandingSocialLinks } from "@/components/landing/landing-social-links";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Us", href: "#contact" },
];

export default function LandingFooter({ serifClassName }: { serifClassName: string }) {
  return (
    <footer id="contact" className="border-t border-[var(--lp-border)] bg-[var(--lp-bg-subtle)] transition-colors duration-300">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:justify-between lg:px-8 lg:py-10">
        <LandingThemeLogo variant="footer" />

        <div className="flex flex-col items-center gap-3 text-center lg:items-start">
          <p className={`text-[13px] text-[var(--lp-fg-muted)] ${serifClassName}`}>
            &copy; 2026 AutoVault. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] font-medium text-[var(--lp-fg-link)] transition-colors hover:text-[var(--lp-fg-link-hover)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <LandingSocialLinks />
      </div>
    </footer>
  );
}
