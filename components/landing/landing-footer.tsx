import Link from "next/link";
import LandingThemeLogo from "@/components/landing/landing-theme-logo";

const footerLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "#" },
  { label: "Contact Us", href: "#contact" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M13.5 8.5V6.7c0-.8.6-1 1-.1h1.6V3.2H14.3C11.4 3.2 10 5 10 7.1v1.4H8.2V12H10v8.8h3.5V12h2.4l.4-2.5H13.5Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="1.8" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M6.5 9.5H9v9H6.5v-9ZM7.75 5.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM11 9.5h2.3v1.2h.1c.3-.6 1.1-1.3 2.3-1.3 2.5 0 3 1.6 3 3.7V18.5H16.1v-4.8c0-1.1 0-2.6-1.6-2.6s-1.8 1.2-1.8 2.5v4.9H11v-9Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M10 9.5v5l4.5-2.5L10 9.5Zm8.8-3.2c-.4-1.5-1.6-2.7-3.1-3.1C13.7 2.7 12 2.7 12 2.7s-1.7 0-3.7.5c-1.5.4-2.7 1.6-3.1 3.1-.5 2-.5 6.2-.5 6.2s0 4.2.5 6.2c.4 1.5 1.6 2.7 3.1 3.1 2 .5 3.7.5 3.7.5s1.7 0 3.7-.5c1.5-.4 2.7-1.6 3.1-3.1.5-2 .5-6.2.5-6.2s0-4.2-.5-6.2Z" />
      </svg>
    ),
  },
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

        <div className="flex items-center gap-3">
          {socialLinks.map((social) => (
            <Link
              key={social.label}
              href={social.href}
              aria-label={social.label}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--lp-border-social)] bg-[var(--lp-bg-card)] text-[var(--lp-fg-heading)] transition-colors hover:border-[var(--lp-fg-accent)] hover:bg-[var(--lp-bg-elevated)] hover:text-[var(--lp-fg-on-dark)]"
            >
              {social.icon}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
