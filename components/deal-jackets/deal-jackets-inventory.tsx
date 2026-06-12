"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  FolderOpen,
} from "lucide-react";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import CommissionStatusBadge from "@/components/deal-jackets/commission-status-badge";
import WorkflowStatusBadge from "@/components/deal-jackets/workflow-status-badge";
import ViewJacketButton from "@/components/deal-jackets/view-jacket-button";
import DealJacketFilterTabs from "@/components/deal-jackets/deal-jacket-filter-tabs";
import { filterDealJackets, computeDealJacketTabCounts } from "@/lib/deal-jackets/filter-deal-jackets";
import {
  PAYMENT_METHODS,
  formatCurrency,
  formatDisplayDate,
  formatPaymentMethod,
  getVehicleDisplayName,
  type DealJacketListItem,
  type DealJacketTab,
} from "@/lib/deal-jackets/types";

type Props = {
  dealJackets: DealJacketListItem[];
  salesRepFilterOptions: { id: string; label: string }[];
  jacketBasePath?: string;
};

export default function DealJacketsInventory({
  dealJackets,
  salesRepFilterOptions,
  jacketBasePath = "/dashboard/deal-jackets",
}: Props) {
  const [activeTab, setActiveTab] = useState<DealJacketTab>("all");
  const [search, setSearch] = useState("");
  const [salesRepFilter, setSalesRepFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const tabCounts = useMemo(
    () => computeDealJacketTabCounts(dealJackets),
    [dealJackets],
  );

  const filtered = useMemo(
    () =>
      filterDealJackets(dealJackets, {
        tab: activeTab,
        search,
        salesRepId: salesRepFilter,
        paymentMethod: paymentFilter,
      }),
    [dealJackets, activeTab, search, salesRepFilter, paymentFilter],
  );

  const columns: Column<DealJacketListItem>[] = [
    {
      key: "vehicle",
      header: "Vehicle / Stock #",
      sortable: true,
      accessor: (row) => getVehicleDisplayName(row),
      cell: (row) => (
        <div className="flex min-w-[220px] items-center gap-3">
          <div className="relative h-11 w-16 shrink-0 overflow-hidden rounded-md border border-slate-700/80 bg-slate-800">
            {row.imageUrl ? (
              <Image
                src={row.imageUrl}
                alt={getVehicleDisplayName(row)}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600">
                <FolderOpen className="h-4 w-4" />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-[12.5px] font-semibold text-white">
              {getVehicleDisplayName(row)}
            </div>
            <div className="text-[13px] text-slate-500">
              Stock #{row.stockNumber}
            </div>
            <div className="truncate text-[10px] text-slate-600">{row.vin}</div>
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
        <div className="min-w-[140px]">
          <div className="text-[12px] font-medium text-white">
            {row.customerName}
          </div>
          <div className="text-[13px] text-slate-500">{row.customerPhone}</div>
        </div>
      ),
    },
    {
      key: "saleDate",
      header: "Sale Date",
      sortable: true,
      accessor: (row) => row.saleDate,
      cell: (row) => (
        <span className="whitespace-nowrap text-[12px] text-slate-300">
          {formatDisplayDate(row.saleDate)}
        </span>
      ),
    },
    {
      key: "salePrice",
      header: "Sale Price",
      sortable: true,
      accessor: (row) => row.salePrice,
      cell: (row) => (
        <span className="whitespace-nowrap text-[12px] font-medium text-white">
          {formatCurrency(row.salePrice)}
        </span>
      ),
    },
    {
      key: "totalProfit",
      header: "Total Profit",
      sortable: true,
      accessor: (row) => row.totalProfit,
      cell: (row) => (
        <span className="whitespace-nowrap text-[12px] font-semibold text-emerald-400">
          {formatCurrency(row.totalProfit)}
        </span>
      ),
    },
    {
      key: "salesRep",
      header: "Sales Rep",
      sortable: true,
      accessor: (row) => row.salesRepName,
      cellClassName: "hidden md:table-cell",
      headerClassName: "hidden md:table-cell",
      cell: (row) => (
        <span className="text-[12px] text-slate-300">{row.salesRepName}</span>
      ),
    },
    {
      key: "commission",
      header: "Commission",
      sortable: true,
      accessor: (row) => row.commissionAmount,
      cell: (row) => (
        <div className="min-w-[100px]">
          <div className="text-[12px] font-medium text-white">
            {formatCurrency(row.commissionAmount)}
          </div>
          <div className="mt-1">
            <CommissionStatusBadge status={row.commissionStatus} />
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.workflowStatus,
      cellClassName: "hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      cell: (row) => (
        <WorkflowStatusBadge status={row.workflowStatus} size="sm" />
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right pr-4",
      cellClassName: "text-right pr-4",
      cell: (row) => <ViewJacketButton dealId={row.id} basePath={jacketBasePath} />,
    },
  ];

  return (
    <div className="py-3.5 text-slate-200 shadow-none">
      <div className="mb-3.5">
        <DealJacketFilterTabs
          activeTab={activeTab}
          counts={tabCounts}
          onChange={setActiveTab}
        />
      </div>

      <div className="mb-3.5 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <InputGroup theme="dark">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by VIN, Stock #, Vehicle, or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              theme="dark"
            />
          </InputGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between w-full">
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect
              value={salesRepFilter}
              onChange={setSalesRepFilter}
              placeholder="All Sales Reps"
              options={salesRepFilterOptions.map((o) => ({
                value: o.id,
                label: o.label,
              }))}
              className="w-[150px]"
            />

            <FilterSelect
              value={paymentFilter}
              onChange={setPaymentFilter}
              placeholder="All Payment Methods"
              options={[
                { value: "all", label: "All Payment Methods" },
                ...PAYMENT_METHODS.map((m) => ({
                  value: m,
                  label: formatPaymentMethod(m),
                })),
              ]}
              className="w-[170px]"
            />

            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-md border border-slate-800 bg-[#0e1626] px-3 text-[11.5px] text-slate-300"
            >
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              May 1, 2025 ... May 31, 2025
            </button>

            <button
              type="button"
              className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-2.5 text-[11.5px] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <DataTable
          columns={columns}
          data={filtered}
          rowKey="id"
          pageSize={10}
          addPagination
          emptyMessage="No deal jackets match your filters."
          paginationSummaryLabel="deal jackets"
        />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-sm border border-slate-800 bg-[#0a101c]/40 px-6 py-16 text-center">
      <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-slate-800/80">
        <FolderOpen className="h-6 w-6 text-slate-500" />
      </div>
      <p className="text-[13px] font-medium text-white">No deal jackets found</p>
      <p className="mt-1 max-w-sm text-[12px] text-slate-500">
        Sold vehicles will appear here once deals are completed in the system.
      </p>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger theme="dark" className={`h-9 text-[11.5px] ${className ?? ""}`}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent theme="dark">
        <SelectGroup>
          <SelectLabel className="text-[10px] uppercase tracking-wider text-slate-500">
            {placeholder}
          </SelectLabel>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-[11.5px]">
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
