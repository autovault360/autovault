"use client";

import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import { DEALER_SECTION_IDS } from "@/lib/dealer/dashboard/navigation";
import InventoryPreviewTable from "./inventory-preview-table";
import InventoryExpandedWorkspace from "./inventory-expanded-workspace";

export default function InventoryOverviewSection() {
  const {
    dashboardData,
    loading,
    inventoryRef,
    expandedSection,
    selectedVehicle,
    expandInventory,
    collapseExpanded,
    setSelectedVehicle,
  } = useDealerDashboard();

  if (!dashboardData) return null;

  const isExpanded = expandedSection === "inventory";

  return (
    <section
      id={DEALER_SECTION_IDS.inventory}
      ref={inventoryRef}
      className="scroll-mt-4"
    >
      <InventoryPreviewTable
        vehicles={dashboardData.vehicles}
        loading={loading.inventory}
        onEdit={(vehicle) => {
          setSelectedVehicle(vehicle);
          expandInventory(vehicle);
        }}
        onView={(vehicle) => {
          setSelectedVehicle(vehicle);
          expandInventory(vehicle);
        }}
      />

      {isExpanded && (
        <InventoryExpandedWorkspace
          vehicle={selectedVehicle}
          onClose={collapseExpanded}
        />
      )}
    </section>
  );
}
