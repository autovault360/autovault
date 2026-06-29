"use client";

import { useState } from "react";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import type { DealJacketStatus, DealJacketListItem } from "@/lib/deal-jackets/types";
import { downloadDealJacketsCsv } from "@/lib/deal-jackets/export-deal-jackets";
import { resolvePortalModuleOptions } from "@/lib/portal/module-options";
import type { PortalModuleOptions } from "@/lib/portal/module-options";
import AdminHeader from "@/components/layout/AdminHeader";
import DealJacketDetailHeader from "./deal-jacket-detail-header";
import DealJacketVehicleOverview from "./deal-jacket-vehicle-overview";
import DealJacketFinancialSummary from "./deal-jacket-financial-summary";
import DealJacketDocumentsTable from "./deal-jacket-documents-table";
import DealJacketActivitySection from "./deal-jacket-activity-section";
import {
  DetailCard,
  DetailCardBody,
  DetailCardHead,
} from "./detail-primitives";

type Props = PortalModuleOptions & {
  detail: DealJacketDetail;
};

function formatFooterDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "--";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.06em] text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 truncate text-[12px] font-medium text-slate-200">
        {value || "--"}
      </p>
    </div>
  );
}

export default function DealJacketDetailShell({
  detail,
  readOnly,
  showAdminHeader,
  basePath,
}: Props) {
  const {
    readOnly: isReadOnly,
    showAdminHeader: showHeader,
    basePath: portalBasePath,
  } = resolvePortalModuleOptions({ readOnly, showAdminHeader, basePath });

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
      workflowStatus: detail.workflowStatus,
    };
    downloadDealJacketsCsv([row], `${detail.jacketNumber}.csv`);
  };

  return (
    <div className="relative pb-8">
      {showHeader && <AdminHeader />}

      <DealJacketDetailHeader
        detail={detail}
        portalBasePath={portalBasePath}
        workflowStatus={workflowStatus}
        isReadOnly={isReadOnly}
        onStatusChange={setWorkflowStatus}
        onExport={handleExport}
      />

      <div className="mb-3.5 grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        <DealJacketVehicleOverview detail={detail} />
        <DealJacketFinancialSummary detail={detail} />
      </div>

      <div className="grid grid-cols-1 gap-3.5 xl:grid-cols-2">
        <DetailCard className="bg-card">
          <DetailCardHead title="Customer & Sale Information" />
          <DetailCardBody>
            <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
              <InfoField label="Customer Name" value={detail.customer.name} />
              <InfoField
                label="Payment Method"
                value={detail.sale.paymentMethodLabel}
              />
              <InfoField label="Phone Number" value={detail.customer.phone} />
              <InfoField
                label="Reference / Check #"
                value={detail.sale.rosNumber}
              />
              <InfoField label="Email Address" value={detail.customer.email} />
              <InfoField label="Address" value={detail.customer.address} />
            </div>

            <div className="mt-4 border-t border-slate-800/60 pt-3">
              <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.06em] text-slate-500">
                Notes
              </p>
              <p className="text-[11.5px] leading-relaxed text-slate-400">
                {detail.dealNotes}
              </p>
            </div>
          </DetailCardBody>

          <div className="border-t border-slate-800/60 px-4 py-3">
            <h3 className="mb-2 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
              Deal Activity
            </h3>
            <DealJacketActivitySection activities={detail.workflowActivities} />
          </div>
        </DetailCard>

        <DealJacketDocumentsTable detail={detail} />
      </div>

      <footer className="mt-4 flex flex-col gap-1 border-t border-slate-800/60 pt-3 text-[10.5px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Created on {formatFooterDateTime(detail.createdAt)} by{" "}
          {detail.createdByName}
        </span>
        <span>
          Last updated on {formatFooterDateTime(detail.updatedAt)} by{" "}
          {detail.updatedByName}
        </span>
      </footer>
    </div>
  );
}
