"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, Car, Camera, Check, Plus, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import AddExpenseDropdown from "@/components/layout/add-expense-dropdown";

export default function AdminHeader({
  onAddCustomer,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search VIN, Stock #, Customer, Deal, or Tag...",
}: {
  onAddCustomer?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}) {
  const router = useRouter();
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

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="mb-3.5 flex justify-between items-center gap-3 border-b border-slate-800 pb-3.5 xl:gap-4">
      <div className="relative max-w-100 w-full">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder={searchPlaceholder}
          {...(onSearchChange
            ? {
                value: searchValue ?? "",
                onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                  onSearchChange(e.target.value),
              }
            : {})}
          className="h-10 border-slate-800 bg-[#0e1626] pl-9 text-[12.5px] text-slate-200 placeholder:text-slate-500 max-w-300  w-full"
        />
      </div>

      <div className="hidden xl:flex xl:flex-col xl:items-center xl:gap-1.5">
        <div className="text-[9.5px] tracking-[0.15em] text-slate-500">QUICK ACTIONS</div>
        <div className="flex gap-2">
          <QA icon={Car} label="Add a Vehicle" ring="bg-blue-500/20 text-blue-400" />
          <AddExpenseDropdown />
          <QA icon={Camera} label="Scan VIN" ring="bg-emerald-500/20 text-emerald-400" />
          <QA icon={Check} label="Mark Vehicle Sold" ring="bg-emerald-500/20 text-emerald-400" />
          <QA icon={Plus} label="Add Customer" ring="bg-purple-500/20 text-purple-400" onClick={onAddCustomer} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-1.5 text-slate-400">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1.5 -top-1 h-4 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] text-white">12</Badge>
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
              <div className="text-[13px] font-semibold text-white">John Dealer</div>
              <div className="text-[10.5px] text-slate-500">Main Admin</div>
            </div>
            <Avatar className="h-9 w-9 ring-2 ring-slate-700">
              <AvatarImage src="https://i.pravatar.cc/64?img=12" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </button>

          {profileOpen && (
            <div
              role="menu"
              className="absolute right-0 top-[calc(100%+8px)] z-50 w-[200px] overflow-hidden rounded-lg border border-slate-700/90 bg-[#0c1424] py-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
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

function QA({ icon: Icon, label, ring, onClick }: { icon: React.ComponentType<{ className?: string }>; label: string; ring: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-slate-800 bg-[#0e1626] px-2.5 py-1.5 text-[11.5px] text-slate-300 transition hover:border-slate-700"
    >
      <span className={cn("grid h-5 w-5 place-items-center rounded-md", ring)}><Icon className="h-3 w-3" /></span>
      {label}
    </button>
  );
}
