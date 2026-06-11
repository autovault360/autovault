"use client";

import { useMemo } from "react";
import { ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DealJacketFormEngine from "@/components/deal-jackets/create/deal-jacket-form-engine";
import { CREATE_DEAL_JACKET_MOCK } from "@/mock-data/create-deal-jacket.mock";
import { inventoryToLinkedVehicles } from "@/lib/sales-rep/deal-jacket/map-vehicles";
import type {
  IPricingConstants,
  IVehicleCard,
} from "@/lib/sales-rep/dashboard/types";

type Props = {
  expanded: boolean;
  onCollapse: () => void;
  selectedVehicle: IVehicleCard | null;
  inventory: IVehicleCard[];
  pricing: IPricingConstants;
  panelRef: React.RefObject<HTMLDivElement | null>;
};

export default function SalesRepDealJacketWorkspace({
  expanded,
  onCollapse,
  selectedVehicle,
  inventory,
  pricing,
  panelRef,
}: Props) {
  const linkedVehicles = useMemo(
    () => inventoryToLinkedVehicles(inventory),
    [inventory],
  );

  const defaultVehicleId = selectedVehicle?.stockNo;

  if (!expanded) return null;

  return (
    <div ref={panelRef} id="create-deal-jacket" className="scroll-mt-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
            CREATE DEAL JACKET
          </span>
          <Badge className="border-0 bg-blue-600/20 text-[10px] text-blue-400 hover:bg-blue-600/20">
            Draft
          </Badge>
        </div>
        <button
          type="button"
          onClick={onCollapse}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white"
        >
          Collapse <ChevronUp className="h-3.5 w-3.5" />
        </button>
      </div>

      <DealJacketFormEngine
        viewMode="linked"
        vehicles={linkedVehicles}
        documents={CREATE_DEAL_JACKET_MOCK.documents}
        commissionRate={pricing.commissionRate}
        defaultVehicleId={defaultVehicleId}
      />
    </div>
  );
}
