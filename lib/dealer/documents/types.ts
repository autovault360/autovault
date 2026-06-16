import type { KPIIconName } from "@/components/ui/kpi-card";
import type {
  WholesaleDocumentCategory,
  WholesaleDocumentStatus,
  WholesaleDocumentType,
} from "./constants";

export type WholesaleDocumentVehicle = {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
  vin: string;
  imageUrl?: string;
};

export type WholesaleDocument = {
  id: string;
  dealershipId: string;
  wholesaleDealerId: string;
  vehicleId: string | null;
  vehicle: WholesaleDocumentVehicle | null;
  documentName: string;
  documentType: WholesaleDocumentType;
  category: WholesaleDocumentCategory;
  description: string | null;
  originalFileName: string;
  storedFileName: string;
  storagePath: string;
  mimeType: string;
  fileSize: number;
  uploadDate: string;
  expiryDate: string | null;
  status: WholesaleDocumentStatus;
  remarks: string | null;
  uploadedBy: string;
  uploadedByName: string;
  fileId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

export type WholesaleDocumentStats = {
  totalDocuments: number;
  missingDocuments: number;
  pendingReview: number;
  uploadedToday: number;
};

export type WholesaleDocumentListParams = {
  page?: number;
  pageSize?: number;
  search?: string;
  documentType?: WholesaleDocumentType | "all";
  category?: WholesaleDocumentCategory | "all";
  status?: WholesaleDocumentStatus | "all";
  vehicleId?: string | "all";
  includeDeleted?: boolean;
  sortBy?: keyof Pick<
    WholesaleDocument,
    "documentName" | "uploadDate" | "expiryDate" | "fileSize" | "status"
  >;
  sortDir?: "asc" | "desc";
};

export type WholesaleDocumentListResult = {
  items: WholesaleDocument[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type WholesaleDocumentsDashboardData = {
  stats: WholesaleDocumentStats;
  list: WholesaleDocumentListResult;
};

export function formatDocumentFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDocumentDate(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDocumentDateTime(iso: string | null | undefined): string {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function buildDocumentsStatsCards(stats: WholesaleDocumentStats) {
  return [
    {
      icon: "badge-check" as KPIIconName,
      color: "green",
      label: "Total Documents",
      value: stats.totalDocuments.toLocaleString(),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "0,38 25,32 50,30 75,28 100,24 125,22 150,18 175,14 200,12 220,8",
    },
    {
      icon: "triangle-alert" as KPIIconName,
      color: "orange",
      label: "Missing Documents",
      value: stats.missingDocuments.toLocaleString(),
      link: "",
      sparkColor: "#f97316",
      sparkPoints: "0,36 25,34 50,30 75,28 100,26 125,22 150,18 175,16 200,12 220,10",
    },
    {
      icon: "refresh-cw" as KPIIconName,
      color: "violet",
      label: "Pending Review",
      value: stats.pendingReview.toLocaleString(),
      link: "",
      sparkColor: "#a855f7",
      sparkPoints: "0,34 25,32 50,28 75,26 100,24 125,20 150,18 175,14 200,12 220,10",
    },
    {
      icon: "bar-chart-3" as KPIIconName,
      color: "blue",
      label: "Uploaded Today",
      value: stats.uploadedToday.toLocaleString(),
      link: "",
      sparkColor: "#3b82f6",
      sparkPoints: "0,32 25,30 50,28 75,26 100,24 125,22 150,20 175,18 200,14 220,12",
    },
  ];
}
