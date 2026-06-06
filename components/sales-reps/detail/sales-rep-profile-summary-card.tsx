"use client";

import { Mail, Phone, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  formatProfileDate,
  type SalesRepProfileSummary,
} from "@/lib/sales-reps/profile-types";
import { getSalesRepInitials } from "@/lib/sales-reps/types";
import SalesRepActiveBadge from "./sales-rep-active-badge";

type Props = {
  summary: SalesRepProfileSummary;
};

const EMPLOYMENT_FIELDS: {
  label: string;
  key: keyof Pick<
    SalesRepProfileSummary,
    "hireDate" | "commissionPlan" | "managerName" | "lifetimeVehiclesSold"
  >;
  format?: (summary: SalesRepProfileSummary) => string;
}[] = [
  {
    label: "Hire Date",
    key: "hireDate",
    format: (s) => formatProfileDate(s.hireDate),
  },
  {
    label: "Commission Plan",
    key: "commissionPlan",
  },
  {
    label: "Manager",
    key: "managerName",
  },
  {
    label: "Total Vehicles Sold (Lifetime)",
    key: "lifetimeVehiclesSold",
    format: (s) => String(s.lifetimeVehiclesSold),
  },
];

function ProfileDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-0 py-1.5">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span className="text-right text-[12px] font-semibold text-white tabular-nums">
        {value}
      </span>
    </div>
  );
}

export default function SalesRepProfileSummaryCard({ summary }: Props) {
  return (
    <Card className="gap-0 rounded-lg border border-slate-800/90 bg-transparent py-0 shadow-none ring-0">
      <CardContent className="p-4 lg:p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
          {/* Avatar + identity */}
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <Avatar className="h-[88px] w-[88px] border-2 border-slate-600/70 ring-1 ring-slate-700/50">
                {summary.imageUrl ? (
                  <AvatarImage
                    src={summary.imageUrl}
                    alt={summary.fullName}
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-slate-800 text-2xl font-semibold text-white">
                  {getSalesRepInitials(summary.fullName)}
                </AvatarFallback>
              </Avatar>
              {summary.isActive && (
                <SalesRepActiveBadge className="px-2.5 py-0.5 text-[10px]" />
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-[20px] font-bold leading-tight text-white">
                {summary.fullName}
              </h1>
              <p className="mt-0.5 text-[12.5px] text-slate-400">
                {summary.title}
              </p>
              <div className="mt-2.5 space-y-1.5">
                {summary.phone && (
                  <p className="flex items-center gap-2 text-[12.5px] text-white">
                    <Phone className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                    {summary.phone}
                  </p>
                )}
                {summary.email && (
                  <p className="flex items-center gap-2 text-[12.5px] text-white">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-blue-400" />
                    {summary.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Employment details */}
          <div className="min-w-[220px] border-t border-slate-800/80 pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0 xl:min-w-[260px]">
            {EMPLOYMENT_FIELDS.map((field) => {
              const value = field.format
                ? field.format(summary)
                : String(summary[field.key]);
              return (
                <ProfileDetailRow
                  key={field.key}
                  label={field.label}
                  value={value}
                />
              );
            })}
          </div>

          {/* Add Deal */}
          <div className="flex shrink-0 justify-center lg:justify-end">
            <Button
              type="button"
              size="lg"
              className="h-9 gap-1.5 px-5 text-[12px] font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Deal
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
