"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  SlidersHorizontal,
  Calendar,
  FolderOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
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
import CommissionStatusBadge from "@/components/deal-jackets/commission-status-badge";
import SoldStatusBadge from "@/components/deal-jackets/sold-status-badge";
import ViewJacketButton from "@/components/deal-jackets/view-jacket-button";
import DealJacketFilterTabs from "@/components/deal-jackets/deal-jacket-filter-tabs";
import { filterDealJackets } from "@/lib/deal-jackets/filter-deal-jackets";
import { computeDealJacketTabCounts } from "@/lib/deal-jackets/mock-data";
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
};

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-[#0a101c]/40 " +
  "[&_table]:min-w-[1280px] [&_table]:w-full [&_table]:text-[11.5px] " +
  "[&_thead]:bg-[#0c1424] [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-3 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-3 [&_td]:py-4 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]:bg-[#0a101c]/30";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function DealJacketsInventory({
  dealJackets,
  salesRepFilterOptions,
}: Props) {
  const [activeTab, setActiveTab] = useState<DealJacketTab>("all");
  const [search, setSearch] = useState("");
  const [salesRepFilter, setSalesRepFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);

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
            <div className="text-[10.5px] text-slate-500">
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
          <div className="text-[10.5px] text-slate-500">{row.customerPhone}</div>
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
      accessor: (row) => row.soldStatus,
      cellClassName: "hidden sm:table-cell",
      headerClassName: "hidden sm:table-cell",
      cell: () => <SoldStatusBadge />,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right pr-4",
      cellClassName: "text-right pr-4",
      cell: (row) => <ViewJacketButton dealId={row.id} />,
    },
  ];

  return (
    <Card className="overflow-hidden rounded-sm border border-slate-700 bg-transparent shadow-none">
      <div className="space-y-3.5 p-3.5">
        <DealJacketFilterTabs
          activeTab={activeTab}
          counts={tabCounts}
          onChange={setActiveTab}
        />

        <div className="flex flex-wrap items-center gap-2.5">
          <InputGroup theme="dark" className="min-w-[240px] flex-1 sm:max-w-xl">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by VIN, Stock #, Vehicle, or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[12px] text-slate-200 placeholder:text-slate-500"
            />
          </InputGroup>

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
            May 1, 2025 – May 31, 2025
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

      <div className={`px-3.5 pb-3.5 ${TABLE_WRAPPER_CLASS}`}>
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <DataTable
              columns={columns}
              data={filtered}
              rowKey="id"
              pageSize={pageSize}
              addPagination
              emptyMessage="No deal jackets match your filters."
              paginationSummaryLabel="deal jackets"
            />
            <div className="mt-2 flex justify-end border-t border-slate-800/80 px-1 pt-3">
              <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                <span>Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                >
                  <SelectTrigger
                    theme="dark"
                    className="h-8 w-[72px] text-[11px]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent theme="dark">
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem
                        key={size}
                        value={String(size)}
                        className="text-[11px]"
                      >
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
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
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-[11.5px]">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
