export interface IVehicleCard {
  stockNo: string;
  vin: string;
  yearModel: string;
  mileage: string;
  type: string;
  color: string;
  price: number;
  status: "Available" | "Sold";
  imageUrl?: string;
}

export interface IDealJacketLine {
  id: string;
  vehicleDesc: string;
  buyerName: string;
  status: "Pending" | "Approved" | "Changes Requested";
  dateString: string;
}

export interface ITeamMessage {
  id: string;
  name: string;
  avatarInitials: string;
  message: string;
  timestamp: string;
}

export interface IActivityItem {
  id: string;
  message: string;
  timestamp: string;
  type: "info" | "success" | "warning" | "upload";
}

export interface ILeaderboardEntry {
  rank: number;
  name: string;
  units: number;
  isCurrentUser?: boolean;
}

export interface ITopPerformer {
  name: string;
  imageUrl?: string;
  units: number;
  unitsDelta: number;
  profit: number;
  profitDelta: number;
  commission: number;
  commissionDelta: number;
}

export interface ISalesRepProfile {
  name: string;
  title: string;
  id: string;
  initials: string;
  imageUrl?: string;
}

export interface ISalesRepMetrics {
  currentMonthUnits: number;
  currentMonthGross: number;
  currentMonthCommission: number;
  awaitingApprovalCommission: number;
}

export interface IPricingConstants {
  costPrice: number;
  reconditioning: number;
  commissionRate: number;
}

export interface ITradeInOption {
  value: string;
  label: string;
}

export type DashboardSectionKey =
  | "inventory"
  | "deals"
  | "messages"
  | "activity"
  | "topPerformer"
  | "leaderboard";

export interface SalesRepDashboardData {
  profile: ISalesRepProfile;
  topPerformer: ITopPerformer;
  myMetrics: ISalesRepMetrics;
  inventory: IVehicleCard[];
  leaderboard: ILeaderboardEntry[];
  recentDealJackets: IDealJacketLine[];
  teamMessages: ITeamMessage[];
  recentActivity: IActivityItem[];
  tradeInOptions: ITradeInOption[];
  pricing: IPricingConstants;
  notificationCount: number;
}

export type DashboardLoadingState = Record<DashboardSectionKey, boolean>;
