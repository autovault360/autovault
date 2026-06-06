import { getMockSalesRepProfile } from "@/lib/sales-reps/profile-mock-data";
import type { SalesRepProfileDetail } from "@/lib/sales-reps/profile-types";

/**
 * Fetches a single sales rep profile for the detail dashboard.
 *
 * Integration point: replace the mock call with a service-layer fetch
 * (e.g. Supabase query scoped by dealership_id + rep id).
 */
export async function getSalesRepProfile(
  id: string,
): Promise<SalesRepProfileDetail | null> {
  if (!id?.trim()) return null;

  // TODO(backend): const profile = await salesRepProfileService.getById(id, dealershipId);
  const profile = getMockSalesRepProfile(id);
  return profile;
}
