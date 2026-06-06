"use server";

import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getRecentDeals } from "@/services/deal-jacket.service";

export async function fetchFilteredDeals(statusFilter?: string) {
  const auth = await authenticateUser();
  if (!auth.ok) return [];

  return getRecentDeals(auth.user.dealershipId, 5, statusFilter);
}
