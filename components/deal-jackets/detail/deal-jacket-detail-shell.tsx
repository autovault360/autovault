"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Printer,
  Pencil,
} from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import SoldStatusBadge from "@/components/deal-jackets/sold-status-badge";
import WorkflowStatusBadge from "@/components/deal-jackets/workflow-status-badge";
import ReviewActionsBar from "@/components/deal-jackets/review-actions-bar";
import { downloadDealJacketsCsv } from "@/lib/deal-jackets/export-deal-jackets";
import { formatCurrency, formatDisplayDate } from "@/lib/deal-jackets/types";
import type {
  DealJacketDetail,
  DealJacketDetailTab,
} from "@/lib/deal-jackets/detail-types";
import type { DealJacketStatus, DealJacketListItem } from "@/lib/deal-jackets/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DealJacketMetricCards from "./deal-jacket-metric-cards";
import OverviewTab from "./tabs/overview-tab";
import DocumentsTab from "./tabs/documents-tab";
import ExpensesTab from "./tabs/expenses-tab";
import ReceiptsTab from "./tabs/receipts-tab";
import HistoryTab from "./tabs/history-tab";
import NotesTab from "./tabs/notes-tab";
import type { PortalModuleOptions } from "@/lib/portal/module-options";
import { resolvePortalModuleOptions } from "@/lib/portal/module-options";

const TABS: {
  id: DealJacketDetailTab;
  label: string;
  countKey?: keyof DealJacketDetail["tabCounts"];
}[] = [
  { id: "overview", label: "Overview" },
  { id: "documents", label: "Documents", countKey: "documents" },
  { id: "expenses", label: "Expenses", countKey: "expenses" },
  { id: "receipts", label: "Receipts", countKey: "receipts" },
  { id: "history", label: "History", countKey: "history" },
  { id: "notes", label: "Notes", countKey: "notes" },
];

type Props = PortalModuleOptions & {
  detail: DealJacketDetail;
};

export default function DealJacketDetailShell({
  detail,
  readOnly,
  showAdminHeader,
  basePath,
}: Props) {
  const { readOnly: isReadOnly, showAdminHeader: showHeader, basePath: portalBasePath } =
    resolvePortalModuleOptions({ readOnly, showAdminHeader, basePath });
  const [activeTab, setActiveTab] = useState<DealJacketDetailTab>("overview");
  const [workflowStatus, setWorkflowStatus] = useState<DealJacketStatus>(
    detail.workflowStatus,
  );

  const handleExport = () => {
    const row: DealJacketListItem = {
      id: detail.id,
      vehicleId: detail.vehicleId,
      year: detail.vehicle.year,
      make: detail.vehicle.make,
      model: detail.vehicle.model,
      stockNumber: detail.vehicle.stockNumber,
      vin: detail.vehicle.vin,
      imageUrl: detail.vehicle.imageUrl,
      customerName: detail.customer.name,
      customerPhone: detail.customer.phone,
      saleDate: detail.sale.dateSold,
      salePrice: detail.sale.soldPrice,
      totalProfit: detail.financial.netProfit,
      salesRepId: detail.salesRep.id,
      salesRepName: detail.salesRep.name,
      commissionAmount: detail.salesRep.commissionAmount,
      commissionStatus: detail.salesRep.commissionStatus,
      paymentMethod: detail.sale.paymentMethod,
      soldStatus: "sold",
      workflowStatus: detail.workflowStatus,
    };
    downloadDealJacketsCsv([row], `${detail.jacketNumber}.csv`);
  };

  return (
    <div className="relative pb-8">
      {showHeader && <AdminHeader />}

      <Link
        href={`${portalBasePath}/deal-jackets`}
        className="mb-3 inline-flex items-center gap-1.5 text-[12px] text-[var(--text-secondary)] transition hover:text-[var(--text-primary)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Deal Jackets
      </Link>

      <section className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-[22px] font-bold tracking-tight text-[var(--text-primary)]">
            Deal Jacket #{detail.jacketNumber}
          </h1>
          <SoldStatusBadge />
          <WorkflowStatusBadge status={workflowStatus} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => window.print()}
            className="h-9 gap-1.5 border-slate-700 bg-transparent px-4 text-[12px] font-medium text-slate-300 hover:bg-slate-800/50"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Jacket
          </Button>
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={handleExport}
            className="h-9 gap-1.5 border-slate-700 bg-transparent px-4 text-[12px] font-medium text-slate-300 hover:bg-slate-800/50"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          {!isReadOnly && (
            <div className="inline-flex overflow-hidden rounded-md">
              <Button
                type="button"
                size="lg"
                className="h-9 gap-1.5 rounded-r-none px-4 text-[12px] font-semibold"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
              <Button
                type="button"
                size="lg"
                className="h-9 w-9 rounded-l-none border-l border-primary-foreground/20 px-0"
                aria-label="Edit options"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </section>

      <ReviewActionsBar
        dealJacketId={detail.id}
        workflowStatus={workflowStatus}
        isManager={!isReadOnly}
        onStatusChange={setWorkflowStatus}
      />

      <Card className="mb-4 gap-0 rounded-lg border border-slate-800/90 bg-transparent py-0 shadow-none ring-0">
        <CardContent className="p-4">
          {/* lg:items-center forces vertical centering across the vehicle image, text info, and metric cards */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
            {/* Left side wrapper combining Image and Vehicle Data */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-5 min-w-0 flex-1">
              {/* Vehicle Image Container */}
              <div className="relative h-[90px] w-full shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] sm:h-[88px] sm:w-[140px]">
                {detail.vehicle.imageUrl ? (
                  <Image
                    src={detail.vehicle.imageUrl}
                    alt={detail.vehicle.displayName}
                    fill
                    className="object-cover"
                    sizes="140px"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[11px] text-slate-600">
                    No image
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="min-w-0 flex-1">
                {/* Header Row: Title and Link inline */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-wide">
                    {detail.vehicle.displayName}
                  </h2>
                  {!isReadOnly && (
                    <Link
                      href={`/dashboard/vehicles/${detail.vehicleId}`}
                      className="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors ml-1"
                    >
                      View Vehicle
                    </Link>
                  )}
                </div>

                {/* Metadata Grid: Snug spacing matching image layout */}
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[13px]">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-slate-400 shrink-0">Stock #</span>
                    <span className="text-slate-200 font-medium truncate">
                      {detail.vehicle.stockNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-slate-400 shrink-0">VIN:</span>
                    <span className="text-slate-200 font-mono truncate">
                      {detail.vehicle.vin}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-slate-400 shrink-0">Sold Date:</span>
                    <span className="text-slate-200 font-medium truncate">
                      {formatDisplayDate(detail.sale.dateSold)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-slate-400 shrink-0">Sold Price:</span>
                    <span className="text-slate-200 font-medium truncate">
                      {formatCurrency(detail.sale.soldPrice)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-slate-400 shrink-0">Customer:</span>
                    <span className="text-slate-200 font-medium truncate">
                      {detail.customer.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-slate-400 shrink-0">Sales Rep:</span>
                    <span className="text-slate-200 font-medium truncate">
                      {detail.salesRep.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Metrics Cards */}
            <div className="w-full shrink-0 lg:w-auto lg:max-w-none">
              <DealJacketMetricCards detail={detail} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* <Card className="mb-4 gap-0 rounded-lg border border-slate-800/90 bg-[var(--bg-secondary)] py-0 shadow-none ring-0">
        <CardContent className="p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-5">
            <div className="relative h-[100px] w-full shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] sm:h-[88px] sm:w-[160px]">
              {detail.vehicle.imageUrl ? (
                <Image
                  src={detail.vehicle.imageUrl}
                  alt={detail.vehicle.displayName}
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center text-[11px] text-slate-600">
                  No image
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <h2 className="text-[16px] font-bold text-[var(--text-primary)]">
                  {detail.vehicle.displayName}
                </h2>
                <Link
                  href={`/dashboard/vehicles/${detail.vehicleId}`}
                  className="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)]"
                >
                  View Vehicle
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2.5">
                <MetaField label="Stock #" value={detail.vehicle.stockNumber} />
                <MetaField label="VIN" value={detail.vehicle.vin} mono />
                <MetaField
                  label="Sold Date"
                  value={formatDisplayDate(detail.sale.dateSold)}
                />
                <MetaField
                  label="Sold Price"
                  value={formatCurrency(detail.sale.soldPrice)}
                />
                <MetaField label="Customer" value={detail.customer.name} />
                <MetaField label="Sales Rep" value={detail.salesRep.name} />
              </div>
            </div>

            <div className="w-full shrink-0 lg:max-w-[min(100%,440px)] lg:flex-1">
              <DealJacketMetricCards detail={detail} />
            </div>
          </div>
        </CardContent>
      </Card> */}

      <div className="mb-4 flex gap-0 overflow-x-auto border-b border-[var(--border-subtle)]">
        {TABS.map((tab) => {
          const count =
            tab.countKey != null ? detail.tabCounts[tab.countKey] : undefined;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative shrink-0 px-4 py-3 text-[12px] font-medium transition-colors",
                isActive
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)] hover:text-slate-300",
              )}
            >
              {tab.label}
              {count != null && (
                <span className="ml-1 text-[var(--text-muted)]">({count})</span>
              )}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </div>

      {activeTab === "overview" && (
        <OverviewTab
          detail={detail}
          onViewAllDocuments={() => setActiveTab("documents")}
        />
      )}
      {activeTab === "documents" && <DocumentsTab detail={detail} />}
      {activeTab === "expenses" && <ExpensesTab detail={detail} />}
      {activeTab === "receipts" && <ReceiptsTab detail={detail} />}
      {activeTab === "history" && <HistoryTab detail={detail} />}
      {activeTab === "notes" && <NotesTab detail={detail} />}
    </div>
  );
}

function MetaField({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] text-[var(--text-muted)]">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-[11.5px] font-semibold text-[var(--text-primary)]",
          mono && "font-mono text-[10px] font-medium tracking-tight",
        )}
      >
        {value}
      </div>
    </div>
  );
}
