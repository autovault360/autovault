"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MoreHorizontal, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { CardShell } from "@/components/dashboard/card-shell";
import {
  formatPayrollCurrency,
  type PayrollStatus,
  type PayrollSummaryRow,
} from "@/lib/payroll/types";
import PayrollPaymentTypeBadge from "./payroll-payment-type-badge";
import PayrollStatusBadge from "./payroll-status-badge";
import { cn } from "@/lib/utils";

type StatusTab = "all" | PayrollStatus;

type Props = {
  rows: PayrollSummaryRow[];
  loading?: boolean;
};

const TABLE_WRAPPER_CLASS =
  "[&>div]:overflow-hidden [&>div]:rounded-sm [&>div]:border [&>div]:border-slate-700/80 [&>div]:bg-[#0a101c]/40 " +
  "[&_table]:min-w-[1100px] [&_table]:w-full [&_table]:text-[11px] " +
  "[&_thead]:bg-[#0c1424] [&_thead_tr]:border-b [&_thead_tr]:border-slate-800 " +
  "[&_th]:px-2.5 [&_th]:py-2.5 [&_th]:text-[9.5px] [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-[0.08em] [&_th]:text-slate-500 " +
  "[&_td]:px-2.5 [&_td]:py-3 [&_td]:align-middle " +
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-slate-800/50 [&_tbody_tr]:transition-colors [&_tbody_tr:last-child]:border-0 " +
  "[&_tbody_tr:hover]:bg-slate-800/25 " +
  "[&>div>div:last-child]:border-t [&>div>div:last-child]:border-slate-800 [&>div>div:last-child]:bg-[#0a101c]/30";

const TABS: { key: StatusTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "paid", label: "Paid" },
  { key: "overdue", label: "Overdue" },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function PayrollSummaryTable({ rows, loading = false }: Props) {
  const [activeTab, setActiveTab] = useState<StatusTab>("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen && !activePopover) return;
    const handleClick = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setFilterOpen(false);
      }
      const target = e.target as HTMLElement;
      if (!target.closest("[data-payroll-action]")) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [filterOpen, activePopover]);

  const roles = useMemo(
    () => [...new Set(rows.map((r) => r.role))].sort(),
    [rows],
  );

  const filtered = useMemo(() => {
    return rows.filter((row) => {
      if (activeTab !== "all" && row.status !== activeTab) return false;
      if (roleFilter !== "all" && row.role !== roleFilter) return false;
      if (paymentFilter !== "all" && row.paymentType !== paymentFilter) return false;
      return true;
    });
  }, [rows, activeTab, roleFilter, paymentFilter]);

  const columns: Column<PayrollSummaryRow>[] = useMemo(
    () => [
      {
        key: "employee",
        header: "Employee / Sales Rep",
        cell: (row) => (
          <div className="flex items-center gap-2 min-w-[160px]">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={row.avatarUrl} alt={row.employeeName} />
              <AvatarFallback className="text-[9px] bg-slate-800">
                {getInitials(row.employeeName)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate text-[11px] font-semibold text-white">
                {row.employeeName}
              </div>
              <div className="text-[9.5px] text-slate-500">{row.employeeId}</div>
            </div>
          </div>
        ),
      },
      {
        key: "role",
        header: "Role",
        cell: (row) => (
          <span className="text-[11px] text-slate-300">{row.role}</span>
        ),
      },
      {
        key: "paymentType",
        header: "Payment Type",
        cell: (row) => <PayrollPaymentTypeBadge type={row.paymentType} />,
      },
      {
        key: "payPeriod",
        header: "Pay Period",
        cell: (row) => (
          <span className="text-[10.5px] text-slate-400 whitespace-nowrap">
            {row.payPeriod}
          </span>
        ),
      },
      {
        key: "payDate",
        header: "Pay Date",
        cell: (row) => (
          <span className="text-[10.5px] text-slate-400">{row.payDate}</span>
        ),
      },
      {
        key: "basePay",
        header: "Base Pay",
        cellClassName: "font-mono tabular-nums",
        cell: (row) => (
          <span className="text-[11px] text-slate-300">
            {formatPayrollCurrency(row.basePay)}
          </span>
        ),
      },
      {
        key: "commission",
        header: "Commission",
        cellClassName: "font-mono tabular-nums",
        cell: (row) => (
          <span className="text-[11px] text-emerald-400">
            {formatPayrollCurrency(row.commission)}
          </span>
        ),
      },
      {
        key: "bonus",
        header: "Bonus",
        cellClassName: "font-mono tabular-nums",
        cell: (row) => (
          <span className="text-[11px] text-purple-400">
            {row.bonus > 0 ? formatPayrollCurrency(row.bonus) : "—"}
          </span>
        ),
      },
      {
        key: "deductions",
        header: "Deductions",
        cellClassName: "font-mono tabular-nums",
        cell: (row) => (
          <span className="text-[11px] text-red-400">
            -{formatPayrollCurrency(row.deductions)}
          </span>
        ),
      },
      {
        key: "totalPaid",
        header: "Total Paid",
        cellClassName: "font-mono tabular-nums",
        cell: (row) => (
          <span className="text-[11px] font-semibold text-white">
            {formatPayrollCurrency(row.totalPaid)}
          </span>
        ),
      },
      {
        key: "status",
        header: "Status",
        cell: (row) => <PayrollStatusBadge status={row.status} />,
      },
      {
        key: "actions",
        header: "",
        cell: (row) => (
          <div className="relative" data-payroll-action>
            <button
              type="button"
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-800 bg-slate-900/60 text-slate-400 transition hover:border-slate-600 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                setActivePopover(activePopover === row.id ? null : row.id);
              }}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {activePopover === row.id && (
              <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-slate-700 bg-[#0e1626] py-1 shadow-lg">
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-[11px] text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setActivePopover(null);
                    toast.success(`Viewing payroll for ${row.employeeName}`);
                  }}
                >
                  View Details
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-[11px] text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setActivePopover(null);
                    toast.success(`${row.employeeName} marked as paid`);
                  }}
                >
                  Mark Paid
                </button>
                <button
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-[11px] text-slate-300 hover:bg-slate-800"
                  onClick={() => {
                    setActivePopover(null);
                    toast.success("Payroll record exported");
                  }}
                >
                  Export Row
                </button>
              </div>
            )}
          </div>
        ),
      },
    ],
    [activePopover],
  );

  return (
    <CardShell className="mb-3.5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
          PAYROLL SUMMARY
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-slate-800 bg-[#0e1626] p-0.5">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "rounded px-2.5 py-1 text-[10.5px] font-medium transition",
                  activeTab === tab.key
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-slate-200",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => setFilterOpen((v) => !v)}
              className="flex h-8 items-center gap-1.5 rounded-md border border-slate-800 bg-[#0e1626] px-2.5 text-[11px] text-slate-300 transition hover:border-slate-600"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              Filter
            </button>
            {filterOpen && (
              <div className="absolute right-0 top-full z-20 mt-1 w-52 rounded-md border border-slate-700 bg-[#0e1626] p-3 shadow-lg">
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Role
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="mb-3 h-8 border-slate-800 bg-slate-900 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-[#0e1626] text-[11px]">
                    <SelectItem value="all">All Roles</SelectItem>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Payment Type
                </div>
                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="h-8 border-slate-800 bg-slate-900 text-[11px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-slate-800 bg-[#0e1626] text-[11px]">
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                    <SelectItem value="check">Check</SelectItem>
                    <SelectItem value="paper_check">Paper Check</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={TABLE_WRAPPER_CLASS}>
        <DataTable
          columns={columns}
          data={filtered}
          rowKey="id"
          pageSize={9}
          addPagination
          paginationSummaryLabel="entries"
          loading={loading}
          emptyMessage="No payroll records match your filters."
        />
      </div>
    </CardShell>
  );
}
