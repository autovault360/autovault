"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Download,
  Pencil,
  MoreHorizontal,
  X,
  Eye,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatField,
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

type VehiclesInventoryProps = {
  vehicles: Vehicle[];
};

export default function VehiclesInventory({ vehicles }: VehiclesInventoryProps) {
  const [search, setSearch] = useState("");
  const [make, setMake] = useState("all");
  const [model, setModel] = useState("all");
  const [status, setStatus] = useState("all");
  const [location, setLocation] = useState("all");
  const [activePopover, setActivePopover] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDetail | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!editingId) {
      setEditingVehicle(null);
      return;
    }
    setEditLoading(true);
    fetch(`/api/vehicles/${editingId}`)
      .then((r) => r.json())
      .then((data) => {
        setEditingVehicle(data);
        setEditLoading(false);
      })
      .catch(() => setEditLoading(false));
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
    () => [...new Set(vehicles.map((v) => v.make))].sort(),
    [vehicles],
  );

  const models = useMemo(() => {
    const source =
      make === "all" ? vehicles : vehicles.filter((v) => v.make === make);
    return [...new Set(source.map((v) => v.model))].sort();
  }, [vehicles, make]);

  const locations = useMemo(
    () => [...new Set(vehicles.map((v) => v.location))].sort(),
    [vehicles],
  );

  const statuses: VehicleStatus[] = [
    "In Stock",
    "Needs Attention",
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
      "Vehicle",
      "Stock #",
      "VIN",
      "Year",
      "Mileage",
      "Price",
      "Cost",
      "Days in Inventory",
      "Status",
      "Location",
      "Image URL",
    ];

    const rows = filtered.map((v) => [
      getVehicleName(v),
      v.stockNumber,
      v.vin,
      String(v.year),
      formatMileage(v.mileage),
      formatCurrency(v.price),
      formatCurrency(v.cost),
      String(v.daysInInventory),
      v.status,
      formatField("location", v.location),
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
        <span className="text-slate-400 font-mono text-[10.5px]">{v.vin}</span>
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
      key: "price",
      header: "Price",
      sortable: true,
      accessor: (v) => v.price,
      cell: (v) => (
        <span className="font-medium text-white">
          {formatCurrency(v.price)}
        </span>
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
      key: "location",
      header: "Location",
      sortable: true,
      cell: (v) => <span className="text-slate-400">{formatField("location", v.location)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-right",
      cell: (v) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => { setEditingId(v.id); setActivePopover(null); }}
            className="grid h-7 w-7 place-items-center rounded-md bg-blue-600 text-white transition hover:bg-blue-500"
            aria-label="Edit vehicle"
            disabled={editLoading && editingId === v.id}
          >
            {editLoading && editingId === v.id ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Pencil className="h-3 w-3" />
            )}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setActivePopover(activePopover === v.id ? null : v.id)
              }
              className="grid h-7 w-7 place-items-center rounded-md border border-slate-700 bg-slate-800/60 text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
              aria-label="More actions"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
            {activePopover === v.id && (
              <div
                ref={popoverRef}
                className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 py-1 shadow-xl"
              >
                <Link
                  href={`/dashboard/vehicles/${v.id}`}
                  onClick={() => setActivePopover(null)}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-slate-800"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Link>
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
                <SelectItem value="all" theme="dark" className="text-[11.5px]">All Makes</SelectItem>
                {makes.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={model} onValueChange={(v: any) => { setModel(v); }}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Models" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectItem value="all" theme="dark" className="text-[11.5px]">All Models</SelectItem>
                {models.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={(v: any) => { setStatus(v); }}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectItem value="all" theme="dark" className="text-[11.5px]">All Statuses</SelectItem>
                {statuses.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={location} onValueChange={(v: any) => { setLocation(v); }}>
              <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent theme="dark" className="text-slate-300">
                <SelectItem value="all" theme="dark" className="text-[11.5px]">All Locations</SelectItem>
                {locations.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">{opt}</SelectItem>
                ))}
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
            }
          }}
        />
      )}
    </div>
  );
}


