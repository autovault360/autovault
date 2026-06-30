"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import { toast } from "sonner";
import {
  Search,
  SlidersHorizontal,
  Download,
  X,
  Shuffle,
} from "lucide-react";
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
import {
  formatCurrency,
  formatDate,
  getVehicleName,
} from "@/lib/vehicles/types";
import { Button } from "../ui/button";
import EditVehicleModal from "@/components/vehicles/detail/edit-vehicle-modal";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import EntityActionModal from "@/components/shared/entity-action-modal";
import { updateVehicleStatus } from "@/lib/vehicles/server/update-vehicle-status";
import AddFlooringRateButton from "@/components/vehicles/flooring/add-flooring-rate-button";
import AddFlooringRateModal from "@/components/vehicles/flooring/add-flooring-rate-modal";
import VehiclesInventoryTable from "@/components/vehicles/vehicles-inventory-table";
import {
  filterInventoryVehicles,
  INVENTORY_STATUS_OPTIONS,
  type InventoryVehicle,
} from "@/lib/vehicles/inventory-calculations";

type VehiclesInventoryProps = {
  vehicles: InventoryVehicle[];
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
  const [titleFilter, setTitleFilter] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDetail | null>(null);
  const [statusVehicleId, setStatusVehicleId] = useState<string | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [flooringModalOpen, setFlooringModalOpen] = useState(false);

  useEffect(() => {
    if (defaultEditId) setEditingId(defaultEditId);
  }, [defaultEditId]);

  useEffect(() => {
    if (!filtersOpen) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const panel = document.getElementById("inventory-filters-panel");
      const button = document.getElementById("inventory-filters-button");
      if (
        panel &&
        !panel.contains(target) &&
        button &&
        !button.contains(target)
      ) {
        setFiltersOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filtersOpen]);

  useEffect(() => {
    if (!editingId) {
      setEditingVehicle(null);
      return;
    }
    NProgress.start();
    fetch(`/api/vehicles/${editingId}`)
      .then(async (r) => {
        if (!r.ok) return null;
        const text = await r.text();
        if (!text) return null;
        return JSON.parse(text) as VehicleDetail;
      })
      .then((data) => {
        if (data) setEditingVehicle(data);
        NProgress.done();
      })
      .catch(() => {
        NProgress.done();
        toast.error("Failed to load vehicle details");
      });
  }, [editingId]);

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

  const filtered = useMemo(() => {
    let result = filterInventoryVehicles(vehicles, {
      search,
      make,
      model,
      status,
      location,
    });

    if (titleFilter === "in") {
      result = result.filter((v) => v.titleReceived);
    } else if (titleFilter === "missing") {
      result = result.filter((v) => !v.titleReceived);
    }

    return result;
  }, [vehicles, search, make, model, status, location, titleFilter]);

  const exportToCSV = () => {
    const headers = [
      "Purchase Date",
      "Vehicle",
      "Stock #",
      "VIN",
      "Purchase Price",
      "Fees",
      "Repairs",
      "Flooring Cost",
      "Sales Tax",
      "Reg. Fees",
      "Total Investment",
      "Flooring Age (Days)",
      "Total Vehicle Cost",
      "Commission",
      "Commission Rate",
      "Net Vehicle Profit",
      "ROI",
      "Sales Rep",
      "Days in Inventory",
      "Status",
      "Title",
    ];

    const rows = filtered.map((v) => [
      formatDate(v.arrivalDate),
      getVehicleName(v),
      v.stockNumber,
      v.vin,
      formatCurrency(v.purchasePrice ?? v.cost),
      formatCurrency(v.auctionFees),
      formatCurrency(v.repairs),
      formatCurrency(v.flooringCost),
      formatCurrency(v.salesTax),
      formatCurrency(v.registrationFees ?? 0),
      formatCurrency(v.totalInvestment),
      String(v.flooringAgeDays),
      formatCurrency(v.totalVehicleCost),
      formatCurrency(v.commissionAmount),
      v.commissionRate > 0 ? `${v.commissionRate.toFixed(1)}%` : "",
      formatCurrency(v.netProfit),
      v.roiPercent > 0 ? `${v.roiPercent.toFixed(1)}%` : "",
      v.salesRepName,
      String(v.daysInInventory),
      v.status,
      v.titleReceived ? "Title In" : "Missing",
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

  const hasActiveFilters =
    make !== "all" ||
    model !== "all" ||
    status !== "all" ||
    location !== "all" ||
    titleFilter !== "all" ||
    search.trim() !== "";

  const activeInventoryCount = useMemo(
    () => vehicles.filter((vehicle) => vehicle.dbStatus !== "sold" && vehicle.dbStatus !== "loss").length,
    [vehicles],
  );

  const clearFilters = () => {
    setSearch("");
    setMake("all");
    setModel("all");
    setStatus("all");
    setLocation("all");
    setTitleFilter("all");
    setFiltersOpen(false);
  };

  return (
    <div className="p-3.5 text-slate-200 shadow-none">
      <div className="mb-3.5 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-3">
        <AddFlooringRateButton onClick={() => setFlooringModalOpen(true)} />

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

        <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
          <Select
            value={make}
            onValueChange={(v) => {
              setMake(v);
              setModel("all");
            }}
          >
            <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
              <SelectValue placeholder="All Makes" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Make</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Makes
                </SelectItem>
                {makes.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={model} onValueChange={setModel}>
            <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
              <SelectValue placeholder="All Models" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Model</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Models
                </SelectItem>
                {models.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Statuses
                </SelectItem>
                {INVENTORY_STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
              <SelectValue placeholder="All Locations" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Location</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Locations
                </SelectItem>
                {locations.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          <div className="relative">
            <Button
              id="inventory-filters-button"
              variant="outline"
              theme="dark"
              className="shrink-0"
              onClick={() => setFiltersOpen((open) => !open)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
            </Button>
            {filtersOpen && (
              <div
                id="inventory-filters-panel"
                className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-xl"
              >
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Title Status
                </p>
                <Select value={titleFilter} onValueChange={setTitleFilter}>
                  <SelectTrigger theme="dark" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent theme="dark">
                    <SelectItem value="all" theme="dark">
                      All Titles
                    </SelectItem>
                    <SelectItem value="in" theme="dark">
                      Title In
                    </SelectItem>
                    <SelectItem value="missing" theme="dark">
                      Missing Title
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" theme="dark" onClick={clearFilters} className="text-[11.5px]">
              <X className="h-3 w-3" />
              Clear Filters
            </Button>
          )}

          <Button variant="outline" theme="dark" onClick={exportToCSV}>
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </div>

      <VehiclesInventoryTable
        vehicles={filtered}
        onEdit={(id) => {
          setEditingId(id);
          window.history.replaceState(null, "", `?edit=${id}`);
        }}
        onChangeStatus={setStatusVehicleId}
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

      <AddFlooringRateModal
        open={flooringModalOpen}
        onOpenChange={setFlooringModalOpen}
        activeInventoryCount={activeInventoryCount}
      />
    </div>
  );
}
