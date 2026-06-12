"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  buildVehicleAlertKpiSummary,
  filterVehicleAlerts,
  getUniqueMakes,
  validateSearchQuery,
} from "@/lib/sales-rep/vehicle-alerts/calculations";
import { exportVehicleAlertsCsv } from "@/lib/sales-rep/vehicle-alerts/export";
import { getVehicleAlertTabCounts } from "@/lib/sales-rep/vehicle-alerts/mock-data";
import type {
  ISalesRepVehicleAlert,
  SortOption,
  VehicleAlertFilterState,
  VehicleAlertTab,
} from "@/lib/sales-rep/vehicle-alerts/types";
import VehicleAlertsDetailDialog from "./vehicle-alerts-detail-dialog";
import VehicleAlertsExportMenu from "./vehicle-alerts-export-menu";
import VehicleAlertsHowItWorks from "./vehicle-alerts-how-it-works";
import VehicleAlertsKpiStrip from "./vehicle-alerts-kpi-strip";
import VehicleAlertsLearnMoreDialog from "./vehicle-alerts-learn-more-dialog";
import VehicleAlertsTable from "./vehicle-alerts-table";
import VehicleAlertsTabs from "./vehicle-alerts-tabs";
import VehicleAlertsToolbar from "./vehicle-alerts-toolbar";

const DEFAULT_FILTERS: VehicleAlertFilterState = {
  search: "",
  make: "all",
  status: "all",
  alertType: "all",
  priority: "all",
  sort: "oldest_first",
};

type ConfirmAction = "resolve" | "delete" | null;

type Props = {
  initialAlerts: ISalesRepVehicleAlert[];
};

export default function SalesRepVehicleAlertsContent({
  initialAlerts,
}: Props) {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<VehicleAlertTab>("all_pending");
  const [filters, setFilters] =
    useState<VehicleAlertFilterState>(DEFAULT_FILTERS);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [selectedAlert, setSelectedAlert] =
    useState<ISalesRepVehicleAlert | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [pendingActionAlert, setPendingActionAlert] =
    useState<ISalesRepVehicleAlert | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const tabCounts = useMemo(
    () => getVehicleAlertTabCounts(alerts),
    [alerts],
  );

  const filteredAlerts = useMemo(
    () =>
      filterVehicleAlerts(alerts, {
        tab: activeTab,
        filters,
      }),
    [alerts, activeTab, filters],
  );

  const kpiSummary = useMemo(
    () => buildVehicleAlertKpiSummary(alerts),
    [alerts],
  );

  const makes = useMemo(() => getUniqueMakes(alerts), [alerts]);

  const hasActiveFilters =
    filters.make !== "all" ||
    filters.status !== "all" ||
    filters.alertType !== "all" ||
    filters.priority !== "all" ||
    filters.search.trim() !== "" ||
    filters.sort !== "oldest_first";

  const handleSearchChange = (value: string) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setSearchError(validateSearchQuery(value));
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSearchError(null);
  };

  const handleExportFiltered = () => {
    if (filteredAlerts.length === 0) {
      toast.error("No records to export. Adjust your filters and try again.");
      return;
    }
    exportVehicleAlertsCsv(
      filteredAlerts,
      `vehicle-alerts-filtered-${new Date().toISOString().split("T")[0]}.csv`,
    );
    toast.success(`Exported ${filteredAlerts.length} alerts.`);
  };

  const handleExportAll = () => {
    const active = alerts.filter((a) => a.status !== "resolved");
    if (active.length === 0) {
      toast.error("No records available to export.");
      return;
    }
    exportVehicleAlertsCsv(
      active,
      `vehicle-alerts-all-${new Date().toISOString().split("T")[0]}.csv`,
    );
    toast.success(`Exported all ${active.length} alerts.`);
  };

  const handleView = (alert: ISalesRepVehicleAlert) => {
    setSelectedAlert(alert);
    setDetailOpen(true);
  };

  const handleResolve = (alert: ISalesRepVehicleAlert) => {
    if (alert.status === "under_review") {
      toast.error("Alerts under admin review cannot be resolved manually.");
      return;
    }
    setPendingActionAlert(alert);
    setConfirmAction("resolve");
  };

  const handleEdit = (alert: ISalesRepVehicleAlert) => {
    if (alert.status !== "needs_changes") {
      toast.error("Only alerts with Needs Changes status can be edited.");
      return;
    }
    toast.success(`Opening edit for ${alert.dealJacketId}...`);
    setSelectedAlert(alert);
    setDetailOpen(true);
  };

  const handleDelete = (alert: ISalesRepVehicleAlert) => {
    if (alert.status === "under_review") {
      toast.error("Alerts under review cannot be deleted.");
      return;
    }
    setPendingActionAlert(alert);
    setConfirmAction("delete");
  };

  const confirmResolve = () => {
    if (!pendingActionAlert) return;
    setAlerts((prev) =>
      prev.map((a) =>
        a.id === pendingActionAlert.id
          ? { ...a, status: "resolved" as const }
          : a,
      ),
    );
    toast.success(
      `Alert for ${pendingActionAlert.dealJacketId} marked as resolved.`,
    );
    setConfirmAction(null);
    setPendingActionAlert(null);
  };

  const confirmDelete = () => {
    if (!pendingActionAlert) return;
    setAlerts((prev) => prev.filter((a) => a.id !== pendingActionAlert.id));
    toast.success(
      `Alert for ${pendingActionAlert.dealJacketId} has been removed.`,
    );
    setConfirmAction(null);
    setPendingActionAlert(null);
  };

  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div>
          <h1 className="text-xl font-bold tracking-[0.12em] text-white">VEHICLE ALERTS</h1>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            Vehicles you sold that are pending approval.
          </p>
        </div>
      </section>

      <div className="mb-3.5">
        <VehicleAlertsKpiStrip
          summary={kpiSummary}
          loading={loading}
          onLearnMore={() => setLearnMoreOpen(true)}
        />
      </div>

      <CardShell className="border-slate-700/80 bg-card backdrop-blur-sm">
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0 flex-1">
            <VehicleAlertsTabs
              activeTab={activeTab}
              tabCounts={tabCounts}
              onTabChange={setActiveTab}
            />
          </div>
          <VehicleAlertsExportMenu
            disabled={loading || alerts.length === 0}
            onExportFiltered={handleExportFiltered}
            onExportAll={handleExportAll}
          />
        </div>

        <VehicleAlertsToolbar
          filters={filters}
          makes={makes}
          searchError={searchError}
          showAdvancedFilters={showAdvancedFilters}
          hasActiveFilters={hasActiveFilters}
          onSearchChange={handleSearchChange}
          onMakeChange={(make) =>
            setFilters((prev) => ({ ...prev, make }))
          }
          onStatusChange={(status) =>
            setFilters((prev) => ({ ...prev, status }))
          }
          onAlertTypeChange={(alertType) =>
            setFilters((prev) => ({ ...prev, alertType }))
          }
          onPriorityChange={(priority) =>
            setFilters((prev) => ({ ...prev, priority }))
          }
          onSortChange={(sort: SortOption) =>
            setFilters((prev) => ({ ...prev, sort }))
          }
          onToggleAdvancedFilters={() =>
            setShowAdvancedFilters((prev) => !prev)
          }
          onClearFilters={handleClearFilters}
        />

        <div className="mt-3">
          <VehicleAlertsTable
            records={filteredAlerts}
            loading={loading}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            onView={handleView}
            onResolve={handleResolve}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </CardShell>

      <VehicleAlertsHowItWorks />

      <VehicleAlertsDetailDialog
        alert={selectedAlert}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <VehicleAlertsLearnMoreDialog
        open={learnMoreOpen}
        onOpenChange={setLearnMoreOpen}
      />

      <Dialog
        open={confirmAction !== null}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setPendingActionAlert(null);
          }
        }}
      >
        <DialogContent className="border-slate-700 bg-card text-slate-200 sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-white">
              {confirmAction === "resolve"
                ? "Mark as Resolved?"
                : "Delete Alert?"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-[12px] text-slate-400">
            {confirmAction === "resolve"
              ? `Confirm that deal jacket ${pendingActionAlert?.dealJacketId} has been resolved.`
              : `This will permanently remove the alert for ${pendingActionAlert?.dealJacketId} from your list.`}
          </p>
          <DialogFooter>
            <Button
              variant="ghost"
              theme="dark"
              onClick={() => {
                setConfirmAction(null);
                setPendingActionAlert(null);
              }}
            >
              Cancel
            </Button>
            <Button
              theme="dark"
              variant={confirmAction === "delete" ? "destructive" : "default"}
              onClick={
                confirmAction === "resolve" ? confirmResolve : confirmDelete
              }
            >
              {confirmAction === "resolve" ? "Mark Resolved" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
