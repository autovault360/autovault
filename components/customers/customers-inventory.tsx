"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Pencil,
  Loader2,
  MoreHorizontal,
  MessageSquare,
  User,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import type {
  CustomerDetail,
  CustomerListItem,
  SalesRepOption,
} from "@/lib/customers/types";
import {
  CUSTOMER_SOURCES,
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
  formatCurrency,
  formatCustomerSource,
  formatCustomerStatus,
  formatCustomerType,
  formatDisplayDate,
  getCustomerInitials,
} from "@/lib/customers/types";
import CustomerStatusBadge from "./customer-status-badge";

type Props = {
  customers: CustomerListItem[];
  salesReps: SalesRepOption[];
  selectedId: string | null;
  onSelect: (row: CustomerListItem) => void;
  onEdit: (detail: CustomerDetail) => void;
  onAddNote?: (row: CustomerListItem) => void;
  onRequestAdd?: () => void;
  loading?: boolean;
};

export default function CustomersInventory({
  customers,
  salesReps,
  selectedId,
  onSelect,
  onEdit,
  onAddNote,
  onRequestAdd,
  loading = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [repFilter, setRepFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      onRequestAdd?.();
    }
  }, [searchParams, onRequestAdd]);

  useEffect(() => {
    if (!activePopover) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePopover]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return customers.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (repFilter !== "all" && c.salesRepId !== repFilter) return false;
      if (typeFilter !== "all" && c.type !== typeFilter) return false;
      if (sourceFilter !== "all" && c.source !== sourceFilter) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [customers, search, statusFilter, repFilter, typeFilter, sourceFilter]);

  const columns: Column<CustomerListItem>[] = [
    {
      key: "name",
      header: "Customer",
      sortable: true,
      accessor: (row) => row.name,
      cell: (row) => (
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 ring-1 ring-slate-700">
            {row.imageUrl && (
              <AvatarImage src={row.imageUrl} alt={row.name} className="object-cover" />
            )}
            <AvatarFallback className="bg-blue-500/15 text-[10px] text-blue-400">
              {getCustomerInitials(row.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="text-[12px] font-medium text-white">{row.name}</div>
            <div className="text-[13px] text-slate-500">
              Customer since {formatDisplayDate(row.customerSince)}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact Info",
      cell: (row) => (
        <div className="text-[11px]">
          <div className="text-slate-300">{row.phone || "..."}</div>
          <div className="text-slate-500">{row.email || "..."}</div>
        </div>
      ),
    },
    {
      key: "salesRep",
      header: "Sales Rep",
      sortable: true,
      accessor: (row) => row.salesRepName,
      cell: (row) => (
        <span className="text-[11.5px] text-slate-300">{row.salesRepName}</span>
      ),
    },
    {
      key: "lastActivity",
      header: "Last Activity",
      sortable: true,
      accessor: (row) => row.lastActivityDate,
      cell: (row) => (
        <div className="text-[11px]">
          <div className="text-slate-300">
            {formatDisplayDate(row.lastActivityDate)}
          </div>
          <div className="text-slate-500">{row.lastActivityLabel}</div>
        </div>
      ),
    },
    {
      key: "lifetimeValue",
      header: "Lifetime Value",
      sortable: true,
      accessor: (row) => row.lifetimeValue,
      cell: (row) => (
        <div className="text-[11px]">
          <div className="font-medium text-white">
            {formatCurrency(row.lifetimeValue)}
          </div>
          <div className="text-slate-500">{row.vehicleCount} Vehicles</div>
        </div>
      ),
    },
    {
      key: "deals",
      header: "Deals",
      sortable: true,
      accessor: (row) => row.dealsCount,
      cell: (row) => (
        <span className="text-[12px] font-medium text-blue-400">
          {row.dealsCount}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => <CustomerStatusBadge status={row.status} />,
    },
    {
      key: "actions",
      header: "",
      cell: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              NProgress.start();
              setEditLoadingId(row.id);
              fetch(`/api/customers/${row.id}`)
                .then((r) => {
                  if (!r.ok) throw new Error("Failed to load customer");
                  return r.json();
                })
                .then((d) => onEdit(d))
                .catch(() => toast.error("Could not load customer for editing"))
                .finally(() => {
                  setEditLoadingId(null);
                  NProgress.done();
                });
            }}
            className="grid h-8 w-8 place-items-center rounded-md border border-blue-500/50 bg-[#0a1220] text-blue-400 transition-colors hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
            aria-label="Edit customer"
            disabled={editLoadingId === row.id}
          >
            {editLoadingId === row.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActivePopover(activePopover === row.id ? null : row.id);
              }}
              className="grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-[#0a1220] text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {activePopover === row.id && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full z-20 mt-1 w-40 rounded-md border border-slate-700 bg-[#0e1626] py-1 shadow-xl"
              >
                <ActionItem
                  icon={User}
                  label="View Profile"
                  onClick={() => {
                    setActivePopover(null);
                    NProgress.start();
                    router.push(`/dashboard/customers/${row.id}`);
                  }}
                />
                <ActionItem
                  icon={MessageSquare}
                  label="Add Note"
                  onClick={() => {
                    setActivePopover(null);
                    onAddNote?.(row);
                  }}
                />
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <InputGroup theme="dark" className="max-w-sm">
          <InputGroupAddon>
            <Search className="h-3.5 w-3.5 text-slate-500" />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-[12px] text-slate-200 placeholder:text-slate-500"
          />
        </InputGroup>
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All Status"
          options={[
            { value: "all", label: "All Status" },
            ...CUSTOMER_STATUSES.map((s) => ({
              value: s,
              label: formatCustomerStatus(s),
            })),
          ]}
        />
        <FilterSelect
          value={repFilter}
          onChange={setRepFilter}
          placeholder="All Sales Reps"
          options={[
            { value: "all", label: "All Sales Reps" },
            ...salesReps.map((r) => ({ value: r.id, label: r.fullName })),
          ]}
        />
        <FilterSelect
          value={typeFilter}
          onChange={setTypeFilter}
          placeholder="All Customer Types"
          options={[
            { value: "all", label: "All Customer Types" },
            ...CUSTOMER_TYPES.map((t) => ({
              value: t,
              label: formatCustomerType(t),
            })),
          ]}
        />
        <FilterSelect
          value={sourceFilter}
          onChange={setSourceFilter}
          placeholder="All Sources"
          options={[
            { value: "all", label: "All Sources" },
            ...CUSTOMER_SOURCES.map((s) => ({
              value: s,
              label: formatCustomerSource(s),
            })),
          ]}
        />
        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-md border border-slate-700 px-2.5 text-[11.5px] text-slate-400 hover:border-slate-600"
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          More Filters
        </button>
      </div>

      <div className="py-3.5">
        <DataTable
          columns={columns}
          data={filtered}
          rowKey="id"
          pageSize={10}
          addPagination
          emptyMessage="No customers found."
          onRowClick={onSelect}
          activeRowKey={selectedId}
          paginationSummaryLabel="customers"
          loading={loading}
        />
      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  placeholder,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger theme="dark" className="h-9 w-[140px] text-[11.5px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent theme="dark">
        <SelectGroup>
          <SelectLabel>{placeholder}</SelectLabel>
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

function ActionItem({
  icon: Icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[11.5px] text-slate-300 hover:bg-slate-800 disabled:opacity-40"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
