"use client";

import { Bell, Search, Car, Camera, Upload, Check, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function AdminHeader({
  onAddCustomer,
}: {
  onAddCustomer?: () => void;
}) {
  return (
    <header className="mb-3.5 flex justify-between items-center gap-3 border-b border-slate-800 pb-3.5 xl:gap-4">
      <div className="relative max-w-100 w-full">
        <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
        <Input
          placeholder="Search VIN, Stock #, Customer, Deal, or Tag…"
          className="h-10 border-slate-800 bg-[#0e1626] pl-9 text-[12.5px] text-slate-200 placeholder:text-slate-500 max-w-300  w-full"
        />
      </div>

      <div className="hidden xl:flex xl:flex-col xl:items-center xl:gap-1.5">
        <div className="text-[9.5px] tracking-[0.15em] text-slate-500">QUICK ACTIONS</div>
        <div className="flex gap-2">
          <QA icon={Car} label="Add a Vehicle" ring="bg-blue-500/20 text-blue-400" />
          <QA icon={Camera} label="Scan VIN" ring="bg-emerald-500/20 text-emerald-400" />
          <QA icon={Upload} label="Upload Expense" ring="bg-red-500/20 text-red-400" />
          <QA icon={Check} label="Mark Vehicle Sold" ring="bg-emerald-500/20 text-emerald-400" />
          <QA icon={Plus} label="Add Customer" ring="bg-purple-500/20 text-purple-400" onClick={onAddCustomer} />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-1.5 text-slate-400">
          <Bell className="h-5 w-5" />
          <Badge className="absolute -right-1.5 -top-1 h-4 min-w-[18px] rounded-full bg-red-500 px-1 text-[10px] text-white">12</Badge>
        </button>
        <div className="hidden text-right sm:block">
          <div className="text-[13px] font-semibold text-white">John Dealer</div>
          <div className="text-[10.5px] text-slate-500">Main Admin</div>
        </div>
        <Avatar className="h-9 w-9 ring-2 ring-slate-700">
          <AvatarImage src="https://i.pravatar.cc/64?img=12" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
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
