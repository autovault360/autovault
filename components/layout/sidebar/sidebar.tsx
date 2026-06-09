"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Headphones, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarItem, SidebarProps } from "./types";

function isItemActive(pathname: string, item: SidebarItem): boolean {
  if (!item.href) return false;
  if (item.exact) return pathname === item.href;
  if (item.href === "/") return pathname === "/";
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavItem({
  item,
  pathname,
  isActive,
  onNavigate,
  depth = 0,
  close,
}: {
  item: SidebarItem;
  pathname: string;
  isActive?: (item: SidebarItem) => boolean;
  onNavigate?: (item: SidebarItem) => void;
  depth?: number;
  close: () => void;
}) {
  const [subOpen, setSubOpen] = useState(
    () => !!item.subItems?.some((s) => isItemActive(pathname, s)),
  );
  const hasSubItems = !!item.subItems?.length;
  const active = isActive ? isActive(item) : isItemActive(pathname, item);
  const hasHref = !!item.href;
  const handleClick = () => {
    if (hasSubItems) {
      setSubOpen((v) => !v);
      return;
    }
    if (item.onClick) {
      item.onClick();
      close();
      return;
    }
    if (onNavigate && !hasHref) {
      onNavigate(item);
      close();
      return;
    }
    close();
  };

  const className = cn(
    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-slate-300 transition hover:bg-slate-800/60",
    active && "border border-slate-700 bg-slate-800/80 font-semibold text-white",
    item.comingSoon && "cursor-default opacity-70",
    depth > 0 && "ml-3 pl-2 text-[12px]",
  );

  const content = (
    <>
      {item.icon && (
        <item.icon className={cn("h-4 w-4 shrink-0", item.color ?? "text-slate-400")} />
      )}
      <span className="truncate flex-1 text-left">{item.label}</span>
      {item.comingSoon && !hasSubItems && (
        <span className="shrink-0 text-[9px] text-slate-500">Soon</span>
      )}
      {item.badge != null && (
        <span
          className={cn(
            "ml-auto shrink-0 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white",
            item.badgeColor === "amber"
              ? "bg-amber-500"
              : item.badgeColor === "red"
                ? "bg-red-500"
                : "bg-blue-500",
          )}
        >
          {item.badge}
        </span>
      )}
      {hasSubItems && (
        <>{subOpen ? <ChevronDown className="h-3.5 w-3.5 shrink-0 text-slate-500" /> : <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-500" />}</>
      )}
    </>
  );

  const renderItem = () => {
    if (item.comingSoon && !hasSubItems) {
      return (
        <div key={item.label} className={className}>
          {content}
        </div>
      );
    }
    if (hasSubItems) {
      return (
        <button key={item.label} type="button" onClick={handleClick} className={className}>
          {content}
        </button>
      );
    }
    if (item.href) {
      return (
        <Link key={item.label} href={item.href} onClick={handleClick} className={className}>
          {content}
        </Link>
      );
    }
    return (
      <button key={item.label} type="button" onClick={handleClick} className={className}>
        {content}
      </button>
    );
  };

  return (
    <div>
      {renderItem()}
      {hasSubItems && subOpen && (
        <div className="space-y-0.5 pt-0.5">
          {item.subItems!.map((sub) => (
            <NavItem
              key={sub.label}
              item={sub}
              pathname={pathname}
              isActive={isActive}
              onNavigate={onNavigate}
              depth={depth + 1}
              close={close}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppSidebar({
  groups,
  logoLabel,
  logoWidth = 180,
  logoHeight = 36,
  profile,
  isActive,
  onNavigate,
  renderItem,
}: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const sidebar = (
    <aside className="flex h-full w-64 flex-col gap-3.5 overflow-y-auto border-r border-slate-800 bg-[#0b1322] p-3">
      <div className="flex items-center">
        <Image
          src="/logo.webp"
          alt="AutoVault Logo"
          width={logoWidth}
          height={logoHeight}
          className="object-contain"
          style={{ width: "auto", height: "auto" }}
        />
      </div>

      {logoLabel && (
        <div className="px-1.5 text-[9px] font-semibold tracking-[0.14em] text-slate-500">
          {logoLabel}
        </div>
      )}

      {profile}

      <nav className="flex flex-col gap-0.5">
        {groups.map((group, gi) => (
          <div key={gi}>
            {group.label && (
              <div className="px-1.5 pb-1 pt-3 text-[10px] font-semibold tracking-[0.12em] text-slate-500">
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              if (renderItem) {
                return renderItem(item, () => (
                  <NavItem
                    key={item.label}
                    item={item}
                    pathname={pathname}
                    isActive={isActive}
                    onNavigate={onNavigate}
                    close={close}
                  />
                ));
              }
              return (
                <NavItem
                  key={item.label}
                  item={item}
                  pathname={pathname}
                  isActive={isActive}
                  onNavigate={onNavigate}
                  close={close}
                />
              );
            })}
          </div>
        ))}
      </nav>

      <div className="mt-auto flex items-center gap-2.5 rounded-xl border border-slate-700 bg-slate-900/60 p-2.5">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-800">
          <Headphones className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="flex-1">
          <div className="text-[12.5px] font-semibold text-white">Need Help?</div>
          <div className="text-[13px] text-slate-500">Contact Support</div>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
      </div>
    </aside>
  );

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed left-3 top-3 z-30 rounded-lg border border-slate-800 bg-slate-900 p-2 text-slate-400 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={close} />
          <div className="absolute left-0 top-0 h-full shadow-2xl">{sidebar}</div>
        </div>
      )}

      <div className="sticky top-0 hidden h-screen shrink-0 self-start lg:block">{sidebar}</div>
    </>
  );
}
