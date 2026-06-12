"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Bell, ChevronDown, LogOut, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  notificationCount = 0,
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

  const actionStrip = actions ? (
    <>
      <div className="hidden shrink-0 items-start justify-center gap-0.5 lg:flex">
        {actions}
      </div>
      {mobileActions ? (
        <div className="flex shrink-0 items-start justify-center gap-0.5 overflow-x-auto lg:hidden">
          {mobileActions}
        </div>
      ) : null}
    </>
  ) : null;

  return (
    <header
      className={cn(
        "mb-3.5 flex flex-col gap-3 border-b border-slate-800 pb-3.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-stretch overflow-hidden rounded-lg border border-slate-800 bg-[#0e1626] max-w-100 w-full">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
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
            className="h-10 w-full bg-transparent pl-10 pr-3 text-[12.5px] text-slate-200 outline-none placeholder:text-slate-500"
          />
        </div>
      </div>

      {actionStrip}

      <div className="flex shrink-0 items-center justify-end gap-3">
        {extraRight}

        <button
          type="button"
          className="relative p-1.5 text-slate-400 transition hover:text-slate-200"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <Badge className="absolute -right-1.5 -top-1 h-4 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] text-white">
              {notificationCount > 99 ? "99+" : notificationCount}
            </Badge>
          )}
        </button>

        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className="flex items-center gap-2"
          >
            <div className="hidden text-right sm:block">
              <div className="text-[13px] font-semibold text-white">
                {profile.name}
              </div>
              {profile.subtitle ? (
                <div className="text-[12px] text-slate-500">{profile.subtitle}</div>
              ) : null}
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-slate-700">
              {profile.imageUrl ? (
                <AvatarImage src={profile.imageUrl} alt={profile.name} />
              ) : null}
              <AvatarFallback className="bg-blue-600 text-xs text-white">
                {profile.initials}
              </AvatarFallback>
            </Avatar>
            <ChevronDown
              className={cn(
                "hidden h-4 w-4 text-slate-500 transition sm:block",
                profileOpen && "rotate-180",
              )}
            />
          </button>

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
      </div>
    </header>
  );
}
