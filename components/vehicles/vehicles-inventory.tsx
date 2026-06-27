"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import Link from "next/link";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Download,
  Pencil,
  MoreHorizontal,
  X,
  Eye,
  Loader2,
  Copy,
  Shuffle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDate,
  formatMileage,
  getDaysColor,
  getStatusStyle,
  getVehicleName,
  type Vehicle,
  type VehicleStatus,
} from "@/lib/vehicles/types";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import { Button } from "../ui/button";
import EditVehicleModal from "@/components/vehicles/detail/edit-vehicle-modal";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import EntityActionModal from "@/components/shared/entity-action-modal";
import { updateVehicleStatus } from "@/lib/vehicles/server/update-vehicle-status";

type VehiclesInventoryProps = {
  vehicles: Vehicle[];
  defaultEditId?: string;
};

export default function VehiclesInventory({ vehicles, defaultEditId }: VehiclesInventoryProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("all");
  const [model, setModel] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDetail | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [statusVehicleId, setStatusVehicleId] = useState<string | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (defaultEditId) setEditingId(defaultEditId);
  }, [defaultEditId]);

  useEffect(() => {
    if (!editingId) {
      setEditingVehicle(null);
      return;
    }
    NProgress.start();
    setEditLoading(true);
    fetch(`/api/vehicles/${editingId}`)
      .then((r) => r.json())
      .then((data) => {
        setEditingVehicle(data);
        setEditLoading(false);
        NProgress.done();
      })
      .catch(() => {
        setEditLoading(false);
        NProgress.done();
      });
  }, [editingId]);

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

  const makes = useMemo(
    () => [...new Set(vehicles.map((v) => v.make).filter(Boolean))].sort(),
    [vehicles],
  );

  const models = useMemo(() => {
    const source =
      make === "all" ? vehicles : vehicles.filter((v) => v.make === make);
    return [...new Set(source.map((v) => v.model).filter(Boolean))].sort();
  }, [vehicles, make]);

  const locations = useMemo(
    () => [...new Set(vehicles.map((v) => v.location).filter(Boolean))].sort(),
    [vehicles],
  );

  const statuses: VehicleStatus[] = [
    "In Stock",
    "Needs Attention",
    "Pending Deal",
    "Marked Sold",
  ];

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (make !== "all" && v.make !== make) return false;
      if (model !== "all" && v.model !== model) return false;
      if (status !== "all" && v.status !== status) return false;
      if (location !== "all" && v.location !== location) return false;
      if (!query) return true;
      return (
        v.make.toLowerCase().includes(query) ||
        v.model.toLowerCase().includes(query) ||
        v.stockNumber.toLowerCase().includes(query) ||
        v.vin.toLowerCase().includes(query) ||
        getVehicleName(v).toLowerCase().includes(query)
      );
    });
  }, [vehicles, search, make, model, status, location]);

  const exportToCSV = () => {
    const headers = [
      "Purchase Date",
      "Vehicle",
      "Stock #",
      "VIN",
      "Year",
      "Mileage",
      "Purchase Price",
      "Registration Fees",
      "Auction Fees",
      "Total Invested",
      "Cost",
      "Days in Inventory",
      "Status",
      "Title",
      "Image URL",
    ];

    const rows = filtered.map((v) => [
      formatDate(v.arrivalDate),
      getVehicleName(v),
      v.stockNumber,
      v.vin,
      String(v.year),
      formatMileage(v.mileage),
      formatCurrency(v.purchasePrice ?? v.cost),
      formatCurrency(v.registrationFees ?? 0),
      formatCurrency(v.auctionFees ?? 0),
      formatCurrency(v.totalInvested ?? v.cost),
      formatCurrency(v.cost),
      String(v.daysInInventory),
      v.status,
      v.titleReceived ? "Title Received" : "Missing Title",
      v.image,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const str = String(cell);
            if (str.includes(",") || str.includes('"') || str.includes("\n")) {
              return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `vehicles-export-${new Date().toISOString().split("T")[0]}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const columns: Column<Vehicle>[] = [
    {
      key: "purchaseDate",
      header: "Purchase Date",
      sortable: true,
      accessor: (v) => v.arrivalDate ?? "",
      cell: (v) => (
        <span className="text-slate-300">{formatDate(v.arrivalDate)}</span>
      ),
    },
    {
      key: "vehicle",
      header: "Vehicle",
      sortable: true,
      accessor: (v) => getVehicleName(v),
      cell: (v) => (
        <Link
          href={`/dashboard/vehicles/${v.id}`}
          className="flex items-center gap-2.5 transition hover:opacity-80"
        >
          {v.image ? (
            <img
              src={v.image}
              alt={getVehicleName(v)}
              className="h-9 w-14 shrink-0 rounded-md object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-9 w-14 shrink-0 items-center justify-center rounded-md bg-slate-800 text-[9px] text-slate-500">
              No Photo
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate font-semibold text-white">
              {getVehicleName(v)}
            </div>
            <div className="truncate text-[10px] text-slate-500">
              {v.trim}
            </div>
          </div>
        </Link>
      ),
    },
    {
      key: "stockNumber",
      header: "Stock #",
      sortable: true,
      cell: (v) => <span className="text-slate-300">{v.stockNumber}</span>,
    },
    {
      key: "vin",
      header: "VIN",
      sortable: true,
      cell: (v) => (
        <span
          className="inline-flex items-center gap-1.5 text-slate-400 font-mono text-[13px] cursor-pointer hover:text-slate-200"
          onClick={() => {
            navigator.clipboard.writeText(v.vin);
            toast.success("VIN copied");
          }}
          title="Click to copy VIN"
        >
          {v.vin}
          <Copy className="h-3 w-3 text-slate-500" />
        </span>
      ),
    },
    {
      key: "year",
      header: "Year",
      sortable: true,
      cell: (v) => <span className="text-slate-300">{v.year}</span>,
    },
    {
      key: "mileage",
      header: "Mileage",
      sortable: true,
      accessor: (v) => v.mileage,
      cell: (v) => (
        <span className="text-slate-300">{formatMileage(v.mileage)}</span>
      ),
    },
    {
      key: "purchasePrice",
      header: "Purchase Price",
      sortable: true,
      accessor: (v) => v.purchasePrice ?? v.cost,
      cell: (v) => (
        <span className="text-slate-400">{formatCurrency(v.purchasePrice ?? v.cost)}</span>
      ),
    },
    {
      key: "registrationFees",
      header: "Registration Fees",
      sortable: true,
      accessor: (v) => v.registrationFees ?? 0,
      cell: (v) => (
        <span className="text-slate-400">{formatCurrency(v.registrationFees ?? 0)}</span>
      ),
    },
    {
      key: "auctionFees",
      header: "Auction Fees",
      sortable: true,
      accessor: (v) => v.auctionFees ?? 0,
      cell: (v) => (
        <span className="text-slate-400">{formatCurrency(v.auctionFees ?? 0)}</span>
      ),
    },
    {
      key: "totalInvested",
      header: "Total Invested",
      sortable: true,
      accessor: (v) => v.totalInvested ?? v.cost,
      cell: (v) => (
        <span className="font-medium text-emerald-400">{formatCurrency(v.totalInvested ?? v.cost)}</span>
      ),
    },
    {
      key: "cost",
      header: "Cost",
      sortable: true,
      accessor: (v) => v.cost,
      cell: (v) => (
        <span className="text-slate-400">{formatCurrency(v.cost)}</span>
      ),
    },
    {
      key: "daysInInventory",
      header: "Days in Inventory",
      sortable: true,
      accessor: (v) => v.daysInInventory,
      cell: (v) => (
        <span className={cn("font-medium", getDaysColor(v.daysInInventory))}>
          {v.daysInInventory}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (v) => (
        <span
          className={cn(
            "rounded-md px-2 py-0.5 text-[10px] font-semibold",
            getStatusStyle(v.status),
          )}
        >
          {v.status}
        </span>
      ),
    },
    {
      key: "titleReceived",
      header: "Title",
      sortable: true,
      accessor: (v) => v.titleReceived ?? false,
      cell: (v) => {
        const received = v.titleReceived ?? false;
        return (
          <span className="inline-flex items-center gap-1.5">
            {received ? (
              <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <AlertCircle className="h-3.5 w-3.5 text-red-400" />
            )}
            <span className={received ? "text-emerald-400" : "text-red-400"}>
              {received ? "Title Received" : "Missing Title"}
            </span>
          </span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cell: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => {
              setEditingId(v.id);
              setActivePopover(null);
              window.history.replaceState(null, "", `?edit=${v.id}`);
            }}
            className="grid h-8 w-8 place-items-center rounded-md border border-blue-500/50 bg-card text-blue-400 transition-colors hover:border-blue-400 hover:bg-blue-500/10 hover:text-blue-300"
            aria-label="Edit vehicle"
            disabled={editLoading && editingId === v.id}
          >
            {editLoading && editingId === v.id ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Pencil className="h-3.5 w-3.5" />
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActivePopover(activePopover === v.id ? null : v.id)
              }
              className="grid h-8 w-8 place-items-center rounded-md border border-slate-700 bg-card text-slate-400 transition-colors hover:border-slate-600 hover:bg-slate-800/80 hover:text-slate-200"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {activePopover === v.id && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl"
              >
                <Link
                  href={`/dashboard/vehicles/${v.id}`}
                  onClick={() => setActivePopover(null)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setStatusVehicleId(v.id);
                    setActivePopover(null);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  <Shuffle className="h-3.5 w-3.5" />
                  Change Status
                </button>
              </div>
            )}
          </div>
        </div>
      ),
    },
  ];

  const filterKey = `${make}-${model}-${status}-${location}-${search}`;
  const hasActiveFilters = make !== "all" || model !== "all" || status !== "all" || location !== "all" || search.trim() !== "";
  const clearFilters = () => {
    setSearch("");
    setMake("all");
    setModel("all");
    setStatus("all");
    setLocation("all");
  };

  return (
    <div className="p-3.5 text-slate-200 shadow-none">
      <div className="mb-3.5 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:justify-between">
        <div className="relative w-full xl:max-w-sm">
          <InputGroup theme="dark">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by Make, Model, Stock #, or VIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              theme="dark"
            />
          </InputGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-between w-full">
          <div className="flex flex-wrap items-center gap-2">
            <Select value={make} onValueChange={(v: any) => { setMake(v); setModel("all"); }}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Makes" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectGroup>
                  <SelectLabel>Make</SelectLabel>
                  <SelectItem value="all" theme="dark" className="text-[11.5px]">All Makes</SelectItem>
                  {makes.map((opt) => (
                    <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={model} onValueChange={(v: any) => { setModel(v); }}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectGroup>
                  <SelectLabel>Model</SelectLabel>
                  <SelectItem value="all" theme="dark" className="text-[11.5px]">All Models</SelectItem>
                  {models.map((opt) => (
                    <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v: any) => { setStatus(v); }}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectGroup>
                  <SelectLabel>Status</SelectLabel>
                  <SelectItem value="all" theme="dark" className="text-[11.5px]">All Statuses</SelectItem>
                  {statuses.map((opt) => (
                    <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={(v: any) => { setLocation(v); }}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectGroup>
                  <SelectLabel>Location</SelectLabel>
                  <SelectItem value="all" theme="dark" className="text-[11.5px]">All Locations</SelectItem>
                  {locations.map((opt) => (
                    <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              theme="dark"
              className="shrink-0"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              More Filters
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                theme="dark"
                onClick={clearFilters}
                className="text-[11.5px]"
              >
                <X className="h-3 w-3" />
                Clear Filters
              </Button>
            )}
          </div>
          <Button
            variant="outline"
            theme="dark"
            onClick={exportToCSV}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <DataTable
        key={filterKey}
        columns={columns}
        data={filtered}
        rowKey="id"
        pageSize={10}
        addPagination
        emptyMessage="No vehicles match your filters."
      />

      {editingVehicle && (
        <EditVehicleModal
          vehicle={editingVehicle}
          open={!!editingVehicle}
          onOpenChange={(open) => {
            if (!open) {
              setEditingVehicle(null);
              setEditingId(null);
              window.history.replaceState(null, "", pathname);
            }
          }}
          onVehicleUpdated={setEditingVehicle}
        />
      )}

      <EntityActionModal
        open={!!statusVehicleId}
        onOpenChange={(open) => {
          if (!open) setStatusVehicleId(null);
        }}
        title="Change Status"
        subtitle="Update the status of this vehicle"
        sectionTitle="VEHICLE STATUS"
        icon={<Shuffle className="h-4 w-4" />}
        fields={[
          {
            name: "status",
            label: "New Status",
            type: "select",
            required: true,
            placeholder: "Select a status...",
            options: [
              { value: "in_stock", label: "In Stock" },
              { value: "needs_attention", label: "Needs Attention" },
              { value: "pending_deal", label: "Pending Deal" },
              { value: "sold", label: "Sold" },
              { value: "loss", label: "Loss" },
            ],
            defaultValue: "",
          },
          {
            name: "notes",
            label: "Notes (optional)",
            type: "textarea",
            placeholder: "Reason for status change...",
            rows: 3,
          },
        ]}
        saveLabel="Update Status"
        isSubmitting={statusSubmitting}
        onSave={async (values) => {
          if (!statusVehicleId) return;
          setStatusSubmitting(true);
          try {
            const formData = new FormData();
            formData.append(
              "payload",
              JSON.stringify({
                vehicleId: statusVehicleId,
                status: values.status,
                notes: values.notes || undefined,
              }),
            );
            const result = await updateVehicleStatus(formData);
            if (result.success) {
              toast.success("Status updated successfully");
              setStatusVehicleId(null);
              router.refresh();
            } else {
              toast.error(result.error || "Failed to update status");
            }
          } catch {
            toast.error("An unexpected error occurred");
          } finally {
            setStatusSubmitting(false);
          }
        }}
      />
    </div>
  );
}


