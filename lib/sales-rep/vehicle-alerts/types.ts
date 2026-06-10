export type VehicleAlertTab =
  | "all_pending"
  | "pending_documents"
  | "under_review"
  | "needs_changes";

export type VehicleAlertStatus =
  | "pending_approval"
  | "pending_documents"
  | "under_review"
  | "needs_changes"
  | "resolved";

export type AlertPriority = "low" | "medium" | "high" | "critical";

export type AlertType =
  | "vehicle_expiry"
  | "maintenance"
  | "inventory"
  | "registration"
  | "insurance"
  | "follow_up"
  | "custom"
  | "pending_approval";

export type SortOption = "oldest_first" | "newest_first" | "price_high" | "price_low";

export type ISalesRepVehicleAlert = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  vin: string;
  stockNumber: string;
  vehicleImageUrl: string;
  customerName: string;
  customerPhone: string;
  soldDate: string;
  soldPrice: number;
  dealJacketId: string;
  status: VehicleAlertStatus;
  alertType: AlertType;
  priority: AlertPriority;
  pendingSince: string;
  assignedTo: string;
  dueDate: string;
  alertTitle: string;
} & Record<string, unknown>;

export interface IVehicleAlertKpiSummary {
  pendingCount: number;
  totalValue: number;
  oldestPendingDays: number;
  oldestPendingDate: string;
}

export interface VehicleAlertFilterState {
  search: string;
  make: string;
  status: string;
  alertType: string;
  priority: string;
  sort: SortOption;
}

export interface VehicleAlertDateRange {
  start: string;
  end: string;
}
