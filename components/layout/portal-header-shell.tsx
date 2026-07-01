"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export type PortalHeaderProfile = {
  name: string;
  subtitle?: string;
  initials: string;
  imageUrl?: string;
  onLogout: () => void | Promise<void>;
};

export type PortalHeaderShellProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
  mobileActions?: ReactNode;
  profile: PortalHeaderProfile;
  notificationCount?: number;
  extraRight?: ReactNode;
  className?: string;
};

export function PortalHeaderShell({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  actions,
  mobileActions,
  profile,
  notificationCount: _notificationCount,
  extraRight,
  className,
}: PortalHeaderShellProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [profileOpen]);

  const handleMenuToggle = () => {
    const sidebarBtn = document.querySelector<HTMLButtonElement>(
      '[class*="fixed"][class*="left-3"][class*="top-3"]',
    );
    if (sidebarBtn) sidebarBtn.click();
  };

  return (
    <header
      className={cn(
        "border-b border-slate-800 px-1 pb-3 pt-2",
        "flex flex-wrap items-center gap-3 gap-y-3",
        "lg:grid lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-center lg:gap-5",
        className,
      )}
    >
      {/* Left: menu + search */}
      <div className="flex w-full min-w-0 items-center gap-3 lg:col-start-1 lg:w-auto lg:max-w-[480px] lg:justify-self-start">
        <button
          type="button"
          onClick={handleMenuToggle}
          className="flex shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-[#10151f] text-slate-200 lg:hidden"
          style={{ width: 38, height: 38 }}
          aria-label="Toggle sidebar"
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="relative min-w-0 flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={onSearchChange ? (searchValue ?? "") : undefined}
            onChange={
              onSearchChange
                ? (e) => onSearchChange(e.target.value)
                : undefined
            }
            readOnly={!onSearchChange}
            className="w-full rounded-[10px] border border-slate-700 bg-[#10151f] py-2.5 pl-[38px] pr-3.5 text-[13.5px] text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Center: quick actions */}
      <div className="flex w-full flex-wrap items-center justify-center gap-2 lg:col-start-2 lg:w-auto lg:justify-self-center">
        {actions}
      </div>

      {/* Right: profile */}
      <div
        ref={profileRef}
        className="relative ml-auto flex shrink-0 items-center gap-2.5 border-l border-slate-700 pl-3.5 lg:col-start-3 lg:ml-0 lg:justify-self-end"
      >
        <div
          className="flex cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-500 text-[13px] font-bold text-[#03121c]"
          onClick={() => setProfileOpen((prev) => !prev)}
          style={{ width: 34, height: 34 }}
        >
          {profile.initials}
        </div>
        <div
          className="hidden cursor-pointer sm:block"
          onClick={() => setProfileOpen((prev) => !prev)}
        >
          <div className="text-[13px] font-semibold leading-tight text-slate-200">
            {profile.name}
          </div>
          {profile.subtitle && (
            <div className="text-[11px] text-slate-500">
              {profile.subtitle}
            </div>
          )}
        </div>

        {extraRight}

        {profileOpen && (
          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[200px] overflow-hidden rounded-lg border border-slate-700/90 bg-[#0c1424] py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setProfileOpen(false);
                void profile.onLogout();
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-[13px] text-red-400 transition-colors hover:bg-[#152238]"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
