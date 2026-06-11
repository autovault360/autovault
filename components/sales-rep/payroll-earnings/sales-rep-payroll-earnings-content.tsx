"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import {
  filterEarningsByVehicle,
  formatSoldDate,
  getVehicleLabel,
  validateSearchQuery,
  VEHICLE_IMAGE_PLACEHOLDER,
} from "@/lib/sales-rep/payroll-earnings/calculations";
import {
  formatCommissionCurrency,
  formatCommissionPrice,
} from "@/lib/sales-rep/commissions/format";
import { exportPayrollEarningsCsv } from "@/lib/sales-rep/payroll-earnings/export";
import { getPayrollEarnings } from "@/lib/sales-rep/commissions/server/get-payroll-earnings";
import type {
  IEarningsByVehicle,
  IPayrollEarningsData,
  PayrollEarningsFilterState,
} from "@/lib/sales-rep/payroll-earnings/types";
import PayrollEarningsDetailDialog from "./payroll-earnings-detail-dialog";
import PayrollEarningsFooterNote from "./payroll-earnings-footer-note";
import PayrollEarningsKpiStrip from "./payroll-earnings-kpi-strip";
import PayrollEarningsPaymentHistory from "./payroll-earnings-payment-history";
import PayrollEarningsSummaryPanel from "./payroll-earnings-summary-panel";
import PayrollEarningsTableToolbar from "./payroll-earnings-table-toolbar";
import PayrollPaymentStatusBadge from "./payroll-payment-status-badge";

const DEFAULT_FILTERS: PayrollEarningsFilterState = {
  search: "",
  paymentStatus: "all",
  payrollCycle: "all",
};

export default function SalesRepPayrollEarningsContent() {
  const [periodData, setPeriodData] = useState<IPayrollEarningsData | null>(null);
  const [earningsRows, setEarningsRows] = useState<IEarningsByVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] =
    useState<PayrollEarningsFilterState>(DEFAULT_FILTERS);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRow, setSelectedRow] = useState<IEarningsByVehicle | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPayrollEarnings();
      setPeriodData(data);
      setEarningsRows(data.earningsByVehicle);
      setFilters(DEFAULT_FILTERS);
      setSearchError(null);
      setShowFilters(false);
    } catch {
      toast.error("Failed to load earnings data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredRows = useMemo(
    () => filterEarningsByVehicle(earningsRows, filters),
    [earningsRows, filters],
  );

  const hasActiveFilters =
    filters.search.trim() !== "" ||
    filters.paymentStatus !== "all" ||
    filters.payrollCycle !== "all";

  const columns: Column<IEarningsByVehicle>[] = useMemo(
    () => [
      {
        key: "vehicle",
        header: "Vehicle",
        sortable: true,
        accessor: (row) => getVehicleLabel(row),
        cell: (row) => (
          <div className="flex min-w-[190px] items-center gap-3">
            <img
              src={row.vehicleImageUrl || VEHICLE_IMAGE_PLACEHOLDER}
              alt={getVehicleLabel(row)}
              className="h-10 w-[60px] shrink-0 rounded object-cover"
              loading="lazy"
            />
            <div className="min-w-0">
              <div className="truncate text-[12px] font-semibold text-white">
                {getVehicleLabel(row)}
              </div>
              <div className="truncate text-[10px] text-slate-500">
                Stock # {row.stockNumber}
              </div>
            </div>
          </div>
        ),
      },
      {
        key: "customer",
        header: "Customer",
        sortable: true,
        accessor: (row) => row.customerName,
        cell: (row) => (
          <div className="min-w-[130px]">
            <div className="text-[12px] font-medium text-white">
              {row.customerName}
            </div>
            <div className="text-[10px] text-slate-500">
              {row.customerPhone}
            </div>
          </div>
        ),
      },
      {
        key: "soldDate",
        header: "Sold Date",
        sortable: true,
        accessor: (row) => row.soldDate,
        cell: (row) => (
          <span className="whitespace-nowrap text-[12px] text-slate-300">
            {formatSoldDate(row.soldDate)}
          </span>
        ),
      },
      {
        key: "soldPrice",
        header: "Sold Price",
        sortable: true,
        accessor: (row) => row.soldPrice,
        cell: (row) => (
          <span className="text-[12px] font-medium tabular-nums text-white">
            {formatCommissionPrice(row.soldPrice)}
          </span>
        ),
      },
      {
        key: "grossProfit",
        header: "Gross Profit",
        sortable: true,
        accessor: (row) => row.grossProfit,
        cell: (row) => (
          <span className="text-[12px] font-semibold tabular-nums text-emerald-400">
            {formatCommissionPrice(row.grossProfit)}
          </span>
        ),
      },
      {
        key: "commissionRate",
        header: "Commission Rate",
        sortable: true,
        accessor: (row) => row.commissionRate,
        cell: (row) => (
          <span className="text-[12px] tabular-nums text-slate-300">
            {row.commissionRate}%
          </span>
        ),
      },
      {
        key: "commissionEarned",
        header: "Commission Earned",
        sortable: true,
        accessor: (row) => row.commissionEarned,
        cell: (row) => (
          <span className="text-[12px] font-semibold tabular-nums text-emerald-400">
            {formatCommissionCurrency(row.commissionEarned)}
          </span>
        ),
      },
      {
        key: "paymentStatus",
        header: "Payment Status",
        sortable: true,
        accessor: (row) => row.paymentStatus,
        cell: (row) => (
          <PayrollPaymentStatusBadge status={row.paymentStatus} />
        ),
      },
    ],
    [],
  );

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
      `payroll-earnings-${new Date().toISOString().split("T")[0]}.csv`,
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
      </section>

      <div className="mb-4">
        <PayrollEarningsKpiStrip
          summary={
            periodData?.kpiSummary ?? {
              totalEarnings: 0,
              totalCommissions: 0,
              vehiclesSold: 0,
              avgCommissionPerVehicle: 0,
              nextPayDate: "",
              daysUntilPay: 0,
              totalEarningsTrend: "",
              totalCommissionsTrend: "",
              vehiclesSoldTrend: "",
              avgCommissionTrend: "",
            }
          }
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

        <DataTable
          columns={columns}
          data={filteredRows}
          rowKey="id"
          addPagination
          pageSize={6}
          loading={loading}
          paginationSummaryLabel="vehicles"
          emptyMessage="No earnings records match your filters."
          onRowClick={(row) => {
            setSelectedRow(row);
            setDetailOpen(true);
          }}
        />
      </CardShell>

      <div className="grid gap-4 lg:grid-cols-2">
        <PayrollEarningsSummaryPanel
          breakdown={
            periodData?.breakdown ?? {
              totalCommissions: 0,
              otherBonuses: 0,
              adjustments: 0,
              chargebacks: 0,
              netPay: 0,
            }
          }
          loading={loading}
        />
        <PayrollEarningsPaymentHistory
          entries={periodData?.paymentHistory ?? []}
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
