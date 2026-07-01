"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Search,
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
  sortInventoryVehicles,
  type InventoryVehicle,
  type SortField,
} from "@/lib/vehicles/inventory-calculations";
import type { KpiPreference } from "@/lib/vehicles/server/kpi-preferences";
import { updateInventoryCell } from "@/lib/vehicles/server/update-inventory-cell";
type VehiclesInventoryProps = {
  vehicles: InventoryVehicle[];
  defaultEditId?: string;
  initialKpiPreferences: KpiPreference[];
};

export default function VehiclesInventory({
  vehicles,
  defaultEditId,
  initialKpiPreferences,
}: VehiclesInventoryProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [salesRep, setSalesRep] = useState("all");
  const [sortBy, setSortBy] = useState<SortField>("");
  const [gridLines, setGridLines] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<VehicleDetail | null>(null);
  const [statusVehicleId, setStatusVehicleId] = useState<string | null>(null);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [flooringModalOpen, setFlooringModalOpen] = useState(false);
  const [liveVehicles, setLiveVehicles] = useState(vehicles);

  useEffect(() => {
    setLiveVehicles(vehicles);
  }, [vehicles]);

  useEffect(() => {
    if (defaultEditId) setEditingId(defaultEditId);
  }, [defaultEditId]);

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

  const salesRepNames = useMemo(
    () => [...new Set(liveVehicles.map((v) => v.salesRepName).filter(Boolean))].sort(),
    [liveVehicles],
  );

  const filtered = useMemo(() => {
    let result = filterInventoryVehicles(liveVehicles, {
      search,
      salesRep,
    });
    return sortBy ? sortInventoryVehicles(result, sortBy) : result;
  }, [liveVehicles, search, salesRep, sortBy]);

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
    salesRep !== "all" ||
    sortBy !== "" ||
    search.trim() !== "";

  const activeInventoryCount = useMemo(
    () =>
      liveVehicles.filter(
        (vehicle) => vehicle.dbStatus !== "sold" && vehicle.dbStatus !== "loss",
      ).length,
    [liveVehicles],
  );

  const columnColorMap = useMemo(
    () =>
      initialKpiPreferences.reduce<Record<string, string>>((acc, preference) => {
        if (preference.columnKey) acc[preference.columnKey] = preference.colorHex;
        return acc;
      }, {}),
    [initialKpiPreferences],
  );

  const clearFilters = () => {
    setSearch("");
    setSalesRep("all");
    setSortBy("");
  };

  return (
    <div className="p-3.5 text-slate-200 shadow-none">
      {/* Action row: Add Flooring Rate */}
      <div className="mb-3.5 flex flex-col gap-2.5 xl:flex-row xl:items-center xl:gap-3">
        <AddFlooringRateButton onClick={() => setFlooringModalOpen(true)} />

        {/* Search */}
        <div className="relative w-full xl:max-w-sm">
          <InputGroup theme="dark">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Filter by vehicle, VIN, or sales rep..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              theme="dark"
            />
          </InputGroup>
        </div>

        <div className="flex flex-wrap items-center gap-2 xl:ml-auto">
          {/* Sales Rep */}
          <Select value={salesRep} onValueChange={setSalesRep}>
            <SelectTrigger theme="dark" className="w-auto min-w-[130px]">
              <SelectValue placeholder="All Sales Reps" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Sales Rep</SelectLabel>
                <SelectItem value="all" theme="dark" className="text-[11.5px]">
                  All Sales Reps
                </SelectItem>
                {salesRepNames.map((opt) => (
                  <SelectItem key={opt} value={opt} theme="dark" className="text-[11.5px]">
                    {opt}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortBy} onValueChange={(v: SortField) => setSortBy(v)}>
            <SelectTrigger theme="dark" className="w-auto min-w-[140px]">
              <SelectValue placeholder="Sort: Default" />
            </SelectTrigger>
            <SelectContent theme="dark" className="text-slate-300">
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value="" theme="dark" className="text-[11.5px]">
                  Sort: Default
                </SelectItem>
                <SelectItem value="profit_desc" theme="dark" className="text-[11.5px]">
                  Net Profit (high → low)
                </SelectItem>
                <SelectItem value="roi_desc" theme="dark" className="text-[11.5px]">
                  ROI (high → low)
                </SelectItem>
                <SelectItem value="days_desc" theme="dark" className="text-[11.5px]">
                  Days in Inventory (high → low)
                </SelectItem>
                <SelectItem value="flooring_desc" theme="dark" className="text-[11.5px]">
                  Flooring Cost (high → low)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>

          {/* Grid Lines Toggle */}
          <button
            type="button"
            onClick={() => setGridLines((g) => !g)}
            className={cn(
              "grid-toggle-btn flex items-center gap-1.5 rounded-lg border px-3 py-[7px] text-[11.5px] font-semibold transition-all select-none",
              gridLines
                ? "border-blue-500 text-blue-500 bg-blue-500/10"
                : "border-slate-700 text-slate-400 hover:border-blue-500 hover:text-blue-500",
            )}
          >
            <span
              className={cn(
                "h-[7px] w-[7px] rounded-full transition-colors",
                gridLines ? "bg-blue-500" : "bg-slate-600",
              )}
            />
            {gridLines ? "Grid Lines ON" : "Add Grid Lines"}
          </button>

          {/* Tag */}
          <span className="text-[11px] text-slate-500">
            {hasActiveFilters
              ? `Showing ${filtered.length} vehicle${filtered.length === 1 ? "" : "s"}`
              : "Showing all vehicles"}
          </span>

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
        columnColorMap={columnColorMap}
        gridLines={gridLines}
        onEdit={(id) => {
          setEditingId(id);
          window.history.replaceState(null, "", `?edit=${id}`);
        }}
        onChangeStatus={setStatusVehicleId}
        onSaveField={async (vehicleId, field, value) => {
          const result = await updateInventoryCell({ vehicleId, field, value });
          if (!result.success) {
            toast.error(result.error || "Failed to save field");
            return;
          }
          setLiveVehicles((prev) =>
            prev.map((vehicle) =>
              vehicle.id === vehicleId
                ? {
                    ...vehicle,
                    purchasePrice:
                      field === "acquisition_cost" ? value : vehicle.purchasePrice,
                    cost: field === "acquisition_cost" ? value : vehicle.cost,
                    auctionFees: field === "auction_fees" ? value : vehicle.auctionFees,
                    repairs:
                      field === "reconditioning_cost" ? value : vehicle.repairs,
                    flooringCost: field === "flooring_fees" ? value : vehicle.flooringCost,
                    registrationFees:
                      field === "registration_fees" ? value : vehicle.registrationFees,
                  }
                : vehicle,
            ),
          );
          toast.success("Field updated");
        }}
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
