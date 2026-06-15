"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Menu } from "lucide-react";
import Image from "next/image";
import LandingThemeToggle from "@/components/landing/landing-theme-toggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navLinks = [
  { label: "Features", hasDropdown: true, href: "#features" },
  { label: "Solutions", hasDropdown: true, href: "#solutions" },
  { label: "Pricing", href: "#pricing" },
  { label: "About Us", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export default function LandingHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--lp-border)] bg-[var(--lp-bg-header)] backdrop-blur-md transition-colors duration-300">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <Image src="/Logo_2.jpeg" className="rounded-full" alt="AutoVault" width={68} height={68} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="flex items-center gap-1 text-[15px] font-medium text-[var(--lp-fg-nav)] transition-colors hover:text-[var(--lp-fg-nav-hover)]"
            >
              {link.label}
              {link.hasDropdown ? (
                <ChevronDown className="h-4 w-4 text-[var(--lp-fg-chevron)]" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LandingThemeToggle />

          <Link
            href="#waitlist"
            className="hidden sm:inline-flex h-11 items-center gap-2 rounded-full bg-[var(--lp-bg-elevated)] px-5 text-[14px] font-medium text-[var(--lp-fg-on-dark)] transition-colors hover:bg-[var(--lp-bg-elevated-hover)] sm:px-6"
          >
            Request Early Access
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--lp-border-toggle)] text-[var(--lp-fg-nav)] lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] border-[var(--lp-border)] bg-[var(--lp-bg-card)] p-0"
            >
              <SheetHeader className="border-b border-[var(--lp-border)] px-5 py-4">
                <SheetTitle className="text-left">
                  <Image src="/Logo_2.jpeg" className="rounded-full" alt="AutoVault" width={68} height={68} />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col px-5 py-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[var(--lp-fg-muted)]">Theme</span>
                  <LandingThemeToggle />
                </div>
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between border-b border-[var(--lp-border)] py-4 text-[16px] font-medium text-[var(--lp-fg-nav)]"
                  >
                    {link.label}
                    {link.hasDropdown ? (
                      <ChevronDown className="h-4 w-4 text-[var(--lp-fg-chevron)]" />
                    ) : null}
                  </Link>
                ))}
                <Link
                  href="#waitlist"
                  onClick={() => setOpen(false)}
                  className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--lp-bg-elevated)] px-5 text-[15px] font-medium text-[var(--lp-fg-on-dark)]"
                >
                  Request Early Access
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
