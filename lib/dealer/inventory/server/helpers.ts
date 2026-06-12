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
  status: "in_stock" | "pending_sale" | "sold",
): string {
  return status;
}
