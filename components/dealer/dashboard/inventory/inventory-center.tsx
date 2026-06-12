"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import { exportInventoryCsv } from "@/lib/dealer/inventory/export-inventory";
import {
  buildInventoryKpiStrip,
  computeInventoryTableFooter,
  filterInventory,
  getUniqueLocations,
} from "@/lib/dealer/inventory/inventory-calculations";
import { updateInventoryStatus } from "@/lib/dealer/inventory/server/update-inventory-status";
import type {
  InventoryKpiFilterKey,
  WholesaleInventoryStatus,
  WholesaleVehicle,
} from "@/lib/dealer/dashboard/types";
import AddEditVehicleModal from "./add-edit-vehicle-modal";
import AddVehicleModal from "@/components/vehicles/add/add-vehicle-modal";
import ChangeTitleStatusDialog from "./change-title-status-dialog";
import InventoryCenterHeader from "./inventory-center-header";
import InventoryDetailSheet from "./inventory-detail-sheet";
import InventoryKpiStrip from "./inventory-kpi-strip";
import InventoryTable from "./inventory-table";
import InventoryToolbar, {
  type InventoryToolbarFilters,
} from "./inventory-toolbar";

export default function InventoryCenter({
  vehicles,
  loading,
  variant = "embedded",
  addSignal = 0,
  onAddSignalConsumed,
}: {
  vehicles: WholesaleVehicle[];
  loading?: boolean;
  variant?: "embedded" | "page";
  addSignal?: number;
  onAddSignalConsumed?: () => void;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState<
    WholesaleInventoryStatus | "all"
  >("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState<
    InventoryToolbarFilters["condition"]
  >("all");
  const [activeKpiFilter, setActiveKpiFilter] =
    useState<InventoryKpiFilterKey>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetVariant, setSheetVariant] = useState<
    Exclude<InventoryKpiFilterKey, "all"> | null
  >(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalVehicle, setModalVehicle] = useState<WholesaleVehicle | null>(
    null,
  );
  const [modalReadOnly, setModalReadOnly] = useState(false);
  const [titleDialogVehicle, setTitleDialogVehicle] =
    useState<WholesaleVehicle | null>(null);
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);

  const openAddModal = () => {
    setAddModalOpen(true);
  };

  useEffect(() => {
    if (addSignal > 0) {
      openAddModal();
      onAddSignalConsumed?.();
    }
  }, [addSignal, onAddSignalConsumed]);

  const locations = useMemo(() => getUniqueLocations(vehicles), [vehicles]);

  const filters: InventoryToolbarFilters = {
    search,
    inventoryStatus: inventoryStatusFilter,
    location: locationFilter,
    condition: conditionFilter,
    kpiFilter: activeKpiFilter,
  };

  const filtered = useMemo(
    () =>
      filterInventory(vehicles, {
        search,
        inventoryStatus: inventoryStatusFilter,
        location: locationFilter,
        condition: conditionFilter,
        kpiFilter: activeKpiFilter,
      }),
    [
      vehicles,
      search,
      inventoryStatusFilter,
      locationFilter,
      conditionFilter,
      activeKpiFilter,
    ],
  );

  const kpis = useMemo(
    () =>
      activeKpiFilter === "all" && !search && inventoryStatusFilter === "all"
        ? buildInventoryKpiStrip(vehicles)
        : buildInventoryKpiStrip(filtered),
    [vehicles, filtered, activeKpiFilter, search, inventoryStatusFilter],
  );

  const footer = useMemo(
    () => computeInventoryTableFooter(filtered),
    [filtered],
  );

  const handleKpiClick = (filter: InventoryKpiFilterKey) => {
    if (filter === "all") return;
    setActiveKpiFilter(filter);
    setSheetVariant(filter);
    setSheetOpen(true);
  };

  const handleClearFilters = () => {
    setSearch("");
    setInventoryStatusFilter("all");
    setLocationFilter("all");
    setConditionFilter("all");
    setActiveKpiFilter("all");
    setSheetOpen(false);
    setSheetVariant(null);
  };

  const openEditModal = (vehicle: WholesaleVehicle) => {
    setModalVehicle(vehicle);
    setModalReadOnly(false);
    setModalOpen(true);
  };

  const openViewModal = (vehicle: WholesaleVehicle) => {
    setModalVehicle(vehicle);
    setModalReadOnly(true);
    setModalOpen(true);
  };

  const handleChangeInventoryStatus = async (
    vehicle: WholesaleVehicle,
    status: WholesaleInventoryStatus,
  ) => {
    const result = await updateInventoryStatus({
      vehicleId: vehicle.id,
      inventoryStatus: status,
      timesInAuction: vehicle.timesInAuction,
      nextAuctionDate: vehicle.nextAuctionDate,
      lastAuctionDate: vehicle.lastAuctionDate,
      soldAt: vehicle.soldAt,
      soldPrice: vehicle.soldPrice,
    });

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(`Status updated to ${status.replace("_", " ")}`);
    router.refresh();
  };

  const handleRefresh = () => {
    router.refresh();
  };

  const content = (
    <div className="space-y-3.5">
      {variant === "embedded" && (
        <InventoryCenterHeader onAddVehicle={openAddModal} />
      )}

      <InventoryKpiStrip
        kpis={kpis}
        loading={loading}
        activeKpiFilter={activeKpiFilter}
        onKpiClick={handleKpiClick}
      />

      <div
        className={
          variant === "page"
            ? "space-y-3.5 rounded-sm border border-slate-800 bg-card p-3.5 text-slate-200 shadow-none"
            : "space-y-3.5"
        }
      >
        <InventoryToolbar
          filters={filters}
          locations={locations}
          onSearchChange={setSearch}
          onInventoryStatusChange={setInventoryStatusFilter}
          onLocationChange={setLocationFilter}
          onConditionChange={setConditionFilter}
          onClearFilters={handleClearFilters}
          onExport={() => exportInventoryCsv(filtered)}
        />

        <InventoryTable
          vehicles={filtered}
          loading={loading}
          onView={openViewModal}
          onEdit={openEditModal}
          onChangeTitleStatus={(vehicle) => {
            setTitleDialogVehicle(vehicle);
            setTitleDialogOpen(true);
          }}
          onChangeInventoryStatus={handleChangeInventoryStatus}
        />

        <div className="flex flex-wrap gap-x-6 gap-y-1 border-t border-slate-800 pt-3 text-[11px]">
          <span className="text-[#64748b]">
            Showing{" "}
            <strong className="text-white tabular-nums">{footer.count}</strong>{" "}
            vehicles
          </span>
          <span className="text-[#64748b]">
            Total Cost:{" "}
            <strong className="text-white tabular-nums">
              {footer.formatted.totalCost}
            </strong>
          </span>
          <span className="text-[#64748b]">
            Wholesale Value:{" "}
            <strong className="text-white tabular-nums">
              {footer.formatted.totalWholesaleValue}
            </strong>
          </span>
          <span className="text-[#64748b]">
            Profit:{" "}
            <strong className="text-emerald-400 tabular-nums">
              {footer.formatted.totalProfit}
            </strong>
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === "embedded" ? (
        <CardShell className="min-w-0 max-w-full overflow-hidden border-[#1e293b] bg-[#0a101d]/60 backdrop-blur-sm">
          {content}
        </CardShell>
      ) : (
        content
      )}

      <InventoryDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        variant={sheetVariant}
        vehicles={vehicles}
        onViewVehicle={openViewModal}
      />

      <AddVehicleModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={handleRefresh}
      />

      {modalVehicle && (
        <AddEditVehicleModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          vehicle={modalVehicle}
          readOnly={modalReadOnly}
          onSuccess={handleRefresh}
        />
      )}

      <ChangeTitleStatusDialog
        vehicle={titleDialogVehicle}
        open={titleDialogOpen}
        onOpenChange={setTitleDialogOpen}
        onSuccess={handleRefresh}
      />
    </>
  );
}
