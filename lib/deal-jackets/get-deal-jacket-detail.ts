import { authenticateUser } from "@/lib/vehicles/server/utils";
import { getDealJacketById } from "@/services/deal-jacket.service";
import { mapDealJacketDetailFromDto } from "./map-detail-from-dto";
import { fetchDealJacketActivity } from "./server/activity";
import type { DealJacketDetail } from "./detail-types";

export async function getDealJacketDetail(
  id: string,
): Promise<DealJacketDetail | null> {
  const auth = await authenticateUser();
  if (!auth.ok) {
    return null;
  }

  const dto = await getDealJacketById(id, auth.user.dealershipId);
  if (!dto) {
    return null;
  }

  const workflowActivities = await fetchDealJacketActivity({
    dealJacketId: id,
  });

  return mapDealJacketDetailFromDto(dto, {
    rosNumber: dto.dealRosNumber,
    dealNotes: dto.dealNotes,
    workflowActivities,
  });
}
