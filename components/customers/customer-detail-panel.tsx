"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { CustomerDetail, CustomerListItem } from "@/lib/customers/types";
import {
  formatCurrency,
  formatCustomerSource,
  formatDisplayDate,
  formatLocation,
  getCustomerInitials,
} from "@/lib/customers/types";
import CustomerStatusBadge from "./customer-status-badge";
import OverviewTab from "./tabs/overview-tab";
import DealsTab from "./tabs/deals-tab";
import CommunicationsTab from "./tabs/communications-tab";
import NotesTab from "./tabs/notes-tab";
import DocumentsTab from "./tabs/documents-tab";

type TabId = "overview" | "deals" | "communications" | "notes" | "documents";

export default function CustomerDetailPanel({
  customerId,
  listItem,
  onClose,
  onEdit,
  refreshKey = 0,
  initialTab = "overview",
  onListRefresh,
}: {
  customerId: string;
  listItem: CustomerListItem;
  onClose: () => void;
  onEdit: (detail: CustomerDetail) => void;
  refreshKey?: number;
  initialTab?: TabId;
  onListRefresh?: () => void;
}) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      if (res.ok) {
        setDetail(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, [customerId]);

  useEffect(() => {
    fetchDetail();
    setActiveTab(initialTab);
  }, [fetchDetail, refreshKey, initialTab]);

  const display = detail ?? null;
  const headerName = display?.name ?? listItem.name;
  const headerStatus = display?.status ?? listItem.status;
  const headerPhone = display?.phone ?? listItem.phone;
  const headerEmail = display?.email ?? listItem.email;
  const headerImage = display?.imageUrl ?? listItem.imageUrl;

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "deals", label: "Deals", count: display?.totalDealsCount ?? 0 },
    {
      id: "communications",
      label: "Communications",
      count: display?.communications?.length ?? 0,
    },
    { id: "notes", label: "Notes", count: display?.notes?.length ?? 0 },
    { id: "documents", label: "Documents", count: display?.documents?.length ?? 0 },
  ];

  return (
    <aside
      className={cn(
        "flex w-[430px] shrink-0 flex-col",
        "border border-slate-800/60 p-4 text-slate-200",
        "rounded-xl overflow-hidden shadow-2xl",
        "sticky top-4 z-30",
        "h-[calc(100vh-2rem)]",
        "max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-50 max-lg:w-full max-lg:max-w-[430px] max-lg:rounded-none",
      )}
    >
      {loading && !display ? (
        <CustomerDetailPanelSkeleton />
      ) : display ? (
        <>
          <div className="relative shrink-0 pb-4 pt-1">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close panel"
              className="absolute -top-1 -right-1 rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 border border-emerald-500/30">
                {headerImage && (
                  <AvatarImage
                    src={headerImage}
                    alt={headerName}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="bg-slate-800 text-lg font-medium text-white">
                  {getCustomerInitials(headerName)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 pr-12">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {headerName}
                  </h3>
                  <CustomerStatusBadge status={headerStatus} />
                </div>

                <div className="mt-1 space-y-0.5 text-xs text-slate-400">
                  {headerPhone && <p>{headerPhone}</p>}
                  {headerEmail && <p className="text-[#3b82f6]">{headerEmail}</p>}
                  {display && (
                    <p>
                      {formatLocation(display.city, display.state, display.zip) || "..."}
                    </p>
                  )}
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  Customer Since: {formatDisplayDate(display.customerSince)}
                  {display.source && ` ... Source: ${formatCustomerSource(display.source)}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onEdit(display)}
                className="absolute right-0 top-8 rounded border border-slate-700/60 bg-slate-800/50 px-2.5 py-1 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                Edit
              </button>
            </div>
          </div>

          <div className="my-2 grid shrink-0 grid-cols-3 gap-2 border-y border-slate-800/80 py-4">
            <MiniStat
              label="Lifetime Value"
              value={formatCurrency(display.lifetimeValue)}
              sub={`${display.vehicleCount} Vehicle${display.vehicleCount === 1 ? "" : "s"}`}
            />
            <MiniStat
              label="Deals"
              value={display.status === "active_deal" ? "Active" : "None"}
              sub={`${display.totalDealsCount} Total`}
            />
            <MiniStat
              label="Last Activity"
              value={formatDisplayDate(display.lastActivityDate)}
              sub={display.lastActivityLabel}
            />
          </div>

          <div className="mt-2 flex shrink-0 gap-1 overflow-x-auto border-b border-slate-800/60 text-xs font-medium">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative shrink-0 border-b-2 px-1 pb-2 text-xs transition",
                    isActive
                      ? "border-blue-500 font-semibold text-blue-400"
                      : "border-transparent text-slate-400 hover:text-slate-200",
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 text-[10px] font-normal text-slate-500">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {loading && (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-600 border-t-slate-400" />
                Loading customer data...
              </div>
            </div>
          )}

          {!loading && (
            <div className="min-h-0 flex-1 overflow-y-auto pt-4">
              {activeTab === "overview" && (
                <OverviewTab
                  customer={display}
                  onViewDeals={() => setActiveTab("deals")}
                  onViewActivity={() => setActiveTab("communications")}
                />
              )}
              {activeTab === "deals" && <DealsTab customer={display} />}
              {activeTab === "communications" && (
                <CommunicationsTab
                  customer={display}
                  onRefresh={fetchDetail}
                  onListRefresh={onListRefresh}
                />
              )}
              {activeTab === "notes" && (
                <NotesTab
                  customer={display}
                  onRefresh={fetchDetail}
                  onListRefresh={onListRefresh}
                />
              )}
              {activeTab === "documents" && <DocumentsTab customer={display} />}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
          Could not load customer details.
        </div>
      )}
    </aside>
  );
}

function CustomerDetailPanelSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-1 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 shrink-0 rounded-full bg-slate-800" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-5 w-40 rounded bg-slate-800" />
          <div className="h-3 w-32 rounded bg-slate-800/70" />
          <div className="h-3 w-48 rounded bg-slate-800/70" />
          <div className="h-3 w-36 rounded bg-slate-800/50" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 border-y border-slate-800/80 py-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border border-slate-800/80 bg-[#0b121f]/40 p-3">
            <div className="h-3 w-16 rounded bg-slate-800" />
            <div className="h-5 w-20 rounded bg-slate-800" />
            <div className="h-3 w-12 rounded bg-slate-800/60" />
          </div>
        ))}
      </div>

      <div className="flex gap-3 border-b border-slate-800/60 pb-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 w-16 rounded bg-slate-800" />
        ))}
      </div>

      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <div className="h-8 w-8 rounded bg-slate-800" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-3/4 rounded bg-slate-800" />
              <div className="h-3 w-1/2 rounded bg-slate-800/60" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-slate-800/80 bg-[#0b121f]/40 p-3">
      <div>
        <div className="flex items-center gap-1 text-[10px] font-medium text-slate-500">
          <span className="inline-block h-1 w-1 rounded-full bg-slate-600" />
          {label}
        </div>
        <div className="mt-1.5 text-sm font-bold tracking-tight text-white">
          {value}
        </div>
      </div>
      <div className="mt-1 truncate text-[11px] text-slate-400">{sub}</div>
    </div>
  );
}
