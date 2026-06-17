import Link from "next/link";

export const landingSocialLinks = [
  {
    label: "Facebook",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M14 8.2V6.8c0-.8.4-1.3 1.3-1.3H17V2.2h-2.8c-3.1 0-5.2 2-5.2 5.2v.8H6v4h3v9.6h4V12.2h3.2l.5-4H13Z" />
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "#",
    icon: (
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 fill-none stroke-current"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.3" cy="6.7" r="1" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M5.3 8.5H9v10.2H5.3V8.5ZM7.15 4a2.15 2.15 0 1 1 0 4.3A2.15 2.15 0 0 1 7.15 4ZM11 8.5h3.5v1.4h.1c.5-.9 1.7-1.8 3.5-1.8 3.7 0 4.4 2.4 4.4 5.5v5.1h-3.7v-4.5c0-1.1 0-2.6-1.6-2.6s-1.9 1.2-1.9 2.5v4.6H11V8.5Z" />
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#",
    icon: (
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        <path d="M21.8 7.2a3 3 0 0 0-2.1-2.1C17.8 4.6 12 4.6 12 4.6s-5.8 0-7.7.5a3 3 0 0 0-2.1 2.1C1.7 9.1 1.7 12 1.7 12s0 2.9.5 4.8a3 3 0 0 0 2.1 2.1c1.9.5 7.7.5 7.7.5s5.8 0 7.7-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-4.8.5-4.8s0-2.9-.5-4.8ZM10.3 15.5V8.5l5.8 3.5-5.8 3.5Z" />
      </svg>
    ),
  },
];

export function LandingSocialLinks({ className }: { className?: string }) {
  return (
    <div className={className ?? "flex items-center gap-3"}>
      {landingSocialLinks.map((social) => (
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
  );
}
