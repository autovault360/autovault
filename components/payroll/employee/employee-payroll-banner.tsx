"use client";

import { Mail, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { EmployeePayrollProfile } from "@/lib/payroll/types";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function EmployeePayrollBanner({
  profile,
}: {
  profile: EmployeePayrollProfile;
}) {
  return (
    <div className="mb-3.5 rounded-sm border border-slate-800/80 bg-[#070c14]/60 p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-slate-700">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} />
            <AvatarFallback className="bg-slate-800 text-lg font-semibold">
              {getInitials(profile.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-white">{profile.name}</h1>
              <span className="rounded bg-blue-500/15 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-wide text-blue-400">
                {profile.empCode}
              </span>
            </div>
            <p className="mt-0.5 text-[12px] text-slate-400">{profile.role}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px]">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Phone className="h-3.5 w-3.5 text-slate-500" />
            <span className="font-mono tabular-nums">{profile.phone}</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Mail className="h-3.5 w-3.5 text-slate-500" />
            {profile.email}
          </span>
          <span className="text-slate-500">
            Hire Date:{" "}
            <span className="font-mono text-slate-300">{profile.hireDate}</span>
          </span>
          <span className="text-slate-500">
            Pay Frequency:{" "}
            <span className="text-slate-300">{profile.payFrequency}</span>
          </span>
          <span
            className={cn(
              "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase",
              profile.isActive
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-slate-500/15 text-slate-400",
            )}
          >
            {profile.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>
    </div>
  );
}
