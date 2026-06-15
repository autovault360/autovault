import type { WholesaleInventoryStatus } from "@/lib/dealer/dashboard/types";

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function resolveWholesalePaymentStatus(params: {
  inventoryStatus: string;
  titleStatus: string;
  explicit?: string | null;
}): string | null {
  if (
    params.explicit === "paid" ||
    params.explicit === "on_hold" ||
    params.explicit === "partial"
  ) {
    return params.explicit;
  }
  if (params.inventoryStatus === "sold") {
    return params.titleStatus === "missing" ? "on_hold" : "paid";
  }
  return null;
}

export function mapInventoryStatusToDb(
  status: WholesaleInventoryStatus,
): string {
  return status;
}

export function resolveArbitrationFields(params: {
  inventoryStatus: WholesaleInventoryStatus;
  previousStatus?: string | null;
  arbitrationReason?: string | null;
  arbitrationBuyerDealer?: string | null;
  existingListedAt?: string | null;
}): Record<string, unknown> {
  if (params.inventoryStatus !== "arbitration") {
    return {};
  }

  const enteringArbitration = params.previousStatus !== "arbitration";

  return {
    arbitration_reason: params.arbitrationReason?.trim() || null,
    arbitration_buyer_dealer: params.arbitrationBuyerDealer?.trim() || null,
    arbitration_listed_at: enteringArbitration
      ? todayISO()
      : params.existingListedAt || todayISO(),
  };
}
