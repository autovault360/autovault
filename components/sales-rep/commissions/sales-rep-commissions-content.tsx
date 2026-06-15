"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { KPICard, type KPICardData } from "@/components/ui/kpi-card";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { formatCurrency, formatDisplayDate } from "@/lib/deal-jackets/types";
import { listSalesRepCommissions } from "@/lib/sales-rep/commissions/server/list-commissions";
import type {
  SalesRepCommissionListItem,
  SalesRepCommissionsData,
  SalesRepCommissionStatus,
} from "@/lib/sales-rep/commissions/types";
import { COMMISSION_STATUS_LABELS } from "@/lib/sales-rep/commissions/types";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import CommissionStatusBadge from "./commission-status-badge";
import {
  KPI_CARD_DEFAULT_PROPS,
  KPI_CARD_SHELL_CLASS,
  kpiGridClass,
} from "@/lib/ui/kpi-grid";
import KpiGridSkeleton from "@/components/ui/kpi-grid-skeleton";

const KPI_COUNT = 5;

const SPARK_POINTS =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  ...(["pending_review", "changes_requested", "resubmitted", "approved", "rejected", "paid"] as SalesRepCommissionStatus[]).map(
    (s) => ({ value: s, label: COMMISSION_STATUS_LABELS[s] }),
  ),
];

export default function SalesRepCommissionsContent() {
  const [data, setData] = useState<SalesRepCommissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    setLoading(true);
    listSalesRepCommissions()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const entries = data?.entries ?? [];
    let result = entries;

    if (statusFilter !== "all") {
      result = result.filter((item) => item.status === statusFilter);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter((item) => {
        const vehicle = `${item.year} ${item.make} ${item.model}`.toLowerCase();
        return (
          vehicle.includes(q) ||
          item.stockNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.jacketNumber.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [data, search, statusFilter]);

  const kpiCards = useMemo((): KPICardData[] => {
    if (!data) return [];
    const s = data.summary;
    return [
      {
        icon: "dollar-sign",
        color: "blue",
        label: "Total Commissions",
        value: formatCurrency(s.totalCommissions),
        unit: `${s.totalVehiclesSold} vehicles sold`,
        link: "",
        sparkColor: "#3b82f6",
        sparkPoints: SPARK_POINTS,
      },
      {
        icon: "dollar-sign",
        color: "green",
        label: "Paid",
        value: formatCurrency(s.paidCommissions),
        unit: "Commissions paid out",
        link: "",
        sparkColor: "#22c55e",
        sparkPoints: SPARK_POINTS,
      },
      {
        icon: "tag",
        color: "amber",
        label: "Pending Approval",
        value: String(s.pendingApproval),
        unit: "Awaiting review",
        link: "",
        sparkColor: "#f59e0b",
        sparkPoints: SPARK_POINTS,
      },
      {
        icon: "percent",
        color: "violet",
        label: "Approved (Unpaid)",
        value: formatCurrency(s.approvedUnpaid),
        unit: "Credited, not yet paid",
        link: "",
        sparkColor: "#a855f7",
        sparkPoints: SPARK_POINTS,
      },
      {
        icon: "circle-alert",
        color: "red",
        label: "Rejected",
        value: String(s.rejectedCount),
        unit: "Deal jackets rejected",
        link: "",
        sparkColor: "#ef4444",
        sparkPoints: SPARK_POINTS,
      },
    ];
  }, [data]);

  const columns: Column<SalesRepCommissionListItem>[] = [
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (row) => `${row.year} ${row.make} ${row.model}`,
      cell: (row) => (
        <div className="min-w-[160px]">
          <div className="text-[12px] font-semibold text-white">
            {row.year} {row.make} {row.model}
            {row.trim ? ` ${row.trim}` : ""}
          </div>
          <div className="text-[10px] text-slate-500">Stock # {row.stockNumber}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      accessor: (row) => row.customerName,
      cell: (row) => (
        <div className="min-w-[120px]">
          <div className="text-[12px] text-white">{row.customerName}</div>
          <div className="text-[10px] text-slate-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "jacketNumber",
      header: "Jacket #",
      sortable: true,
      accessor: (row) => row.jacketNumber,
      cell: (row) => (
        <span className="text-[11px] text-slate-300">{row.jacketNumber}</span>
      ),
    },
    {
      key: "saleDate",
      header: "Sold Date",
      sortable: true,
      accessor: (row) => row.saleDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-[11px] text-slate-300">
          {formatDisplayDate(row.saleDate)}
        </span>
      ),
    },
    {
      key: "soldPrice",
      header: "Sold Price",
      sortable: true,
      accessor: (row) => row.soldPrice,
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-white">
          {formatCurrency(row.soldPrice, 0)}
        </span>
      ),
    },
    {
      key: "grossProfit",
      header: "Gross Profit",
      sortable: true,
      accessor: (row) => row.grossProfit,
      cell: (row) => (
        <span className="tabular-nums text-[12px] text-emerald-400">
          {formatCurrency(row.grossProfit, 0)}
        </span>
      ),
    },
    {
      key: "commissionAmount",
      header: "Commission",
      sortable: true,
      accessor: (row) => row.commissionAmount,
      cell: (row) => (
        <span className="tabular-nums text-[12px] font-semibold text-emerald-400">
          {formatCurrency(row.commissionAmount)}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => <CommissionStatusBadge status={row.status} />,
    },
  ];

  return (
    <div>
      <section className="mb-4 px-0.5">
        <PageHeaderTitle
          title="My Commissions"
          subtitle="Track your commission earnings from approved deal jackets."
          subtitleClassName="text-[12.5px]"
        />
      </section>

      {loading ? (
        <KpiGridSkeleton count={KPI_COUNT} className="mb-4" />
      ) : (
        <div className={kpiGridClass(KPI_COUNT, "mb-4")}>
          {kpiCards.map((kpi) => (
            <KPICard
              key={kpi.label}
              data={kpi}
              {...KPI_CARD_DEFAULT_PROPS}
              className={KPI_CARD_SHELL_CLASS}
            />
          ))}
        </div>
      )}

      <div className="rounded-lg border-slate-700/80 bg-card p-4 backdrop-blur-sm">
        <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
          <InputGroup theme="dark" className="min-w-[240px] max-w-xl flex-1">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by vehicle, stock #, customer, or jacket..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[12px] text-slate-200 placeholder:text-slate-500"
            />
          </InputGroup>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent theme="dark" align="start">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DataTable
          columns={columns}
          data={filtered}
          rowKey="id"
          addPagination
          pageSize={10}
          loading={loading}
          paginationSummaryLabel="commissions"
          emptyMessage="No commission records match your filters. Try adjusting your search."
        />
      </div>
    </div>
  );
}
