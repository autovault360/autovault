"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import {
  filterEarningsByVehicle,
  validateSearchQuery,
} from "@/lib/sales-rep/payroll-earnings/calculations";
import { exportPayrollEarningsCsv } from "@/lib/sales-rep/payroll-earnings/export";
import { getPayrollEarningsMockData } from "@/lib/sales-rep/payroll-earnings/mock-data";
import type {
  IEarningsByVehicle,
  PayrollEarningsFilterState,
  PayrollPeriodMonth,
} from "@/lib/sales-rep/payroll-earnings/types";
import PayrollEarningsDetailDialog from "./payroll-earnings-detail-dialog";
import PayrollEarningsFooterNote from "./payroll-earnings-footer-note";
import PayrollEarningsKpiStrip from "./payroll-earnings-kpi-strip";
import PayrollEarningsPaymentHistory from "./payroll-earnings-payment-history";
import PayrollEarningsSummaryPanel from "./payroll-earnings-summary-panel";
import PayrollEarningsTable from "./payroll-earnings-table";
import PayrollEarningsTableToolbar from "./payroll-earnings-table-toolbar";
import PayrollPeriodPicker from "./payroll-period-picker";

const DEFAULT_FILTERS: PayrollEarningsFilterState = {
  search: "",
  paymentStatus: "all",
  payrollCycle: "all",
};

export default function SalesRepPayrollEarningsContent() {
  const [periodMonth, setPeriodMonth] = useState<PayrollPeriodMonth>("2026-05");
  const [earningsRows, setEarningsRows] = useState<IEarningsByVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] =
    useState<PayrollEarningsFilterState>(DEFAULT_FILTERS);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRow, setSelectedRow] = useState<IEarningsByVehicle | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const periodData = useMemo(
    () => getPayrollEarningsMockData(periodMonth),
    [periodMonth],
  );

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setEarningsRows(periodData.earningsByVehicle);
      setFilters(DEFAULT_FILTERS);
      setSearchError(null);
      setShowFilters(false);
      setLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [periodData.earningsByVehicle]);

  const filteredRows = useMemo(
    () => filterEarningsByVehicle(earningsRows, filters),
    [earningsRows, filters],
  );

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.paymentStatus !== "all" ||
    filters.payrollCycle !== "all";

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setSearchError(validateSearchQuery(value));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchError(null);
  };

  const handleExport = () => {
    const target = hasActiveFilters ? filteredRows : earningsRows;
    if (target.length === 0) {
      toast.error("No records to export.");
      return;
    }
    exportPayrollEarningsCsv(
      target,
      `payroll-earnings-${periodMonth}-${new Date().toISOString().split("T")[0]}.csv`,
    );
    toast.success(`Exported ${target.length} records.`);
  };

  return (
    <div>
      <section className="mb-4 flex flex-wrap items-start justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Payroll & Earnings
          </h1>
          <p className="mt-1 text-[12.5px] text-slate-500">
            Track your earnings, commissions, and payments.
          </p>
        </div>
        <PayrollPeriodPicker
          value={periodMonth}
          displayLabel={periodData.periodLabel}
          onChange={setPeriodMonth}
        />
      </section>

      <div className="mb-4">
        <PayrollEarningsKpiStrip
          summary={periodData.kpiSummary}
          loading={loading}
        />
      </div>

      <CardShell className="mb-4 rounded-lg border-slate-700/80 bg-card p-4 backdrop-blur-sm">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-bold text-white">
              Earnings by Vehicle
            </h2>
            <p className="mt-1 text-[11.5px] text-slate-500">
              Breakdown of your earnings and commissions for each vehicle sold.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              theme="dark"
              size="sm"
              disabled={loading || earningsRows.length === 0}
              onClick={handleExport}
              className="h-8 border-slate-700/80 bg-transparent text-[11px]"
            >
              <Download className="h-3.5 w-3.5" />
              Export
            </Button>
            <Button
              variant="outline"
              theme="dark"
              size="sm"
              onClick={() => setShowFilters((prev) => !prev)}
              className="h-8 border-slate-700/80 bg-transparent text-[11px]"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-4">
            <PayrollEarningsTableToolbar
              filters={filters}
              searchError={searchError}
              showAdvancedFilters={showFilters}
              hasActiveFilters={hasActiveFilters}
              onSearchChange={handleSearchChange}
              onPaymentStatusChange={(paymentStatus) =>
                setFilters((prev) => ({ ...prev, paymentStatus }))
              }
              onPayrollCycleChange={(payrollCycle) =>
                setFilters((prev) => ({ ...prev, payrollCycle }))
              }
              onToggleAdvancedFilters={() => {}}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        <PayrollEarningsTable
          rows={filteredRows}
          loading={loading}
          pageSize={6}
          onRowClick={(row) => {
            setSelectedRow(row);
            setDetailOpen(true);
          }}
        />
      </CardShell>

      <div className="grid gap-4 lg:grid-cols-2">
        <PayrollEarningsSummaryPanel
          breakdown={periodData.breakdown}
          loading={loading}
        />
        <PayrollEarningsPaymentHistory
          entries={periodData.paymentHistory}
          loading={loading}
          onViewAll={() => toast.info("Full payment history coming soon.")}
        />
      </div>

      <PayrollEarningsFooterNote />

      <PayrollEarningsDetailDialog
        row={selectedRow}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
