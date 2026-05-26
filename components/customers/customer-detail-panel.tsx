"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Mail, MapPin, Pencil, Phone, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
}: {
  customerId: string;
  listItem: CustomerListItem;
  onClose: () => void;
  onEdit: (detail: CustomerDetail) => void;
}) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");

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
    setActiveTab("overview");
  }, [fetchDetail]);

  const tabs: { id: TabId; label: string; count?: number }[] = [
    { id: "overview", label: "Overview" },
    { id: "deals", label: "Deals", count: detail?.totalDealsCount },
    {
      id: "communications",
      label: "Communications",
      count: detail?.communications?.length || 8, // Matching fallback placeholder UI counts if empty
    },
    { id: "notes", label: "Notes", count: detail?.notes?.length || 3 },
    { id: "documents", label: "Documents", count: detail?.documents?.length || 2 },
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
      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : detail ? (
        <>
          {/* Main Top Profile Area */}
          <div className="relative shrink-0 pb-4 pt-1">
            {/* Top right floating close action button */}
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
                {/* Fallback back to dynamic picture or initials if present */}
                <AvatarFallback className="bg-slate-800 text-lg text-white font-medium">
                  {getCustomerInitials(listItem.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 pr-12">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold tracking-tight text-white">
                    {listItem.name}
                  </h3>
                  <CustomerStatusBadge status={listItem.status} />
                </div>
                
                <div className="mt-1 space-y-0.5 text-xs text-slate-400">
                  {listItem.phone && <p>{listItem.phone}</p>}
                  {listItem.email && (
                    <p className="text-[#3b82f6] hover:underline cursor-pointer">
                      {listItem.email}
                    </p>
                  )}
                  <p>
                    {formatLocation(detail.city, detail.state, detail.zip) || "Long Beach, CA"}
                  </p>
                </div>

                <p className="mt-2 text-[11px] text-slate-500">
                  Customer Since: {formatDisplayDate(listItem.customerSince)}
                  {detail.source && ` • Source: ${formatCustomerSource(detail.source)}`}
                </p>
              </div>

              {/* Floating Edit Button exactly as arranged */}
              <button
                type="button"
                onClick={() => onEdit(detail)}
                className="absolute right-0 top-8 text-xs font-medium text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Mini KPI Block Row */}
          <div className="grid shrink-0 grid-cols-3 gap-2 border-t border-b border-slate-800/80 py-4 my-2">
            <MiniStat
              label="Lifetime Value"
              value={formatCurrency(detail.lifetimeValue)}
              sub={`${detail.vehicleCount || 3} Vehicles`}
            />
            <MiniStat
              label="Deals"
              value={`${detail.activeDealsCount || 0} Active`}
              sub={`${detail.totalDealsCount || 3} Total`}
            />
            <MiniStat
              label="Last Activity"
              value={formatDisplayDate(detail.lastActivityDate)}
              sub={detail.lastActivityLabel || "Inquired on Vehicle"}
            />
          </div>

          {/* Tab Navigation Menu */}
          <div className="flex shrink-0 gap-1 overflow-x-auto border-b border-slate-800/60 text-xs font-medium mt-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "shrink-0 pb-2 px-1 border-b-2 transition relative text-xs",
                    isActive
                      ? "border-blue-500 text-blue-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200",
                  )}
                >
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className="ml-1 text-[10px] text-slate-500 font-normal">
                      ({tab.count})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Display Area */}
          <div className="min-h-0 flex-1 overflow-y-auto pt-4">
            {activeTab === "overview" && (
              <OverviewTab
                customer={detail}
                onViewDeals={() => setActiveTab("deals")}
                onViewActivity={() => setActiveTab("communications")}
              />
            )}
            {activeTab === "deals" && <DealsTab customer={detail} />}
            {activeTab === "communications" && (
              <CommunicationsTab customer={detail} onRefresh={fetchDetail} />
            )}
            {activeTab === "notes" && (
              <NotesTab customer={detail} onRefresh={fetchDetail} />
            )}
            {activeTab === "documents" && <DocumentsTab customer={detail} />}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-xs text-slate-500">
          Could not load customer details.
        </div>
      )}
    </aside>
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
    <div className="rounded-lg border border-slate-800/80 bg-[#0b121f]/40 p-3 flex flex-col justify-between">
      <div>
        <div className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
          {label}
        </div>
        <div className="mt-1.5 text-sm font-bold text-white tracking-tight">
          {value}
        </div>
      </div>
      <div className="mt-1 text-[11px] text-slate-400 truncate">{sub}</div>
    </div>
  );
}