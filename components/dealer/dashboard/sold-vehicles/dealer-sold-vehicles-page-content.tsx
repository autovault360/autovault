"use client";

import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button, ButtonIcon } from "@/components/ui/button";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import type { SoldVehicleRecord } from "@/lib/dealer/dashboard/types";
import AddSoldVehicleWorkspace from "./add-sold-vehicle-workspace";
import DealerPageShell from "@/components/dealer/layout/dealer-page-shell";
import SoldVehiclesCenter from "./sold-vehicles-center";
import SoldVehiclesCenterSkeleton from "./sold-vehicles-center-skeleton";

type WorkspaceMode = "closed" | "add" | "edit" | "view";

export default function DealerSoldVehiclesPageContent() {
  const searchParams = useSearchParams();
  const {
    dashboardData,
    loading,
    isInitialLoading,
    selectedSoldVehicle,
    setSelectedSoldVehicle,
  } = useDealerDashboard();

  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("closed");

  useEffect(() => {
    if (searchParams.get("add") === "true") {
      setSelectedSoldVehicle(null);
      setWorkspaceMode("add");
    }
  }, [searchParams, setSelectedSoldVehicle]);

  if (isInitialLoading || !dashboardData) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden  text-slate-100">
        <SoldVehiclesCenterSkeleton />
      </div>
    );
  }

  const showWorkspace = workspaceMode !== "closed";

  const openAdd = () => {
    setSelectedSoldVehicle(null);
    setWorkspaceMode("add");
  };

  const openView = (record: SoldVehicleRecord) => {
    setSelectedSoldVehicle(record);
    setWorkspaceMode("view");
  };

  const openEdit = (record: SoldVehicleRecord) => {
    setSelectedSoldVehicle(record);
    setWorkspaceMode("edit");
  };

  const closeWorkspace = () => {
    setWorkspaceMode("closed");
    setSelectedSoldVehicle(null);
  };

  if (loading.soldVehicles) {
    return (
      <div className="w-full min-w-0 max-w-full overflow-x-hidden  text-slate-100">
        <SoldVehiclesCenterSkeleton />
      </div>
    );
  }

  return (
    <DealerPageShell
      title="Sold Vehicles"
      description="View and track all vehicles that have been marked as sold."
      headerExtra={
        <Button type="button" size="sm" onClick={openAdd}>
          <ButtonIcon tone="default">
            <Plus />
          </ButtonIcon>
          Add Sold Vehicle
        </Button>
      }
    >
      <SoldVehiclesCenter
        soldVehicles={dashboardData.soldVehicles}
        soldVehicleKpis={dashboardData.soldVehicleKpis}
        loading={loading.soldVehicles}
        activeRowKey={selectedSoldVehicle?.id ?? null}
        onAddSoldVehicle={openAdd}
        onViewSale={openView}
        onRowClick={openEdit}
        showTitle={false}
      />

      {showWorkspace && (
        <AddSoldVehicleWorkspace
          record={workspaceMode === "add" ? null : selectedSoldVehicle}
          readOnly={workspaceMode === "view"}
          onClose={closeWorkspace}
        />
      )}
    </DealerPageShell>
  );
}
