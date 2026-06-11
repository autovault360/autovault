"use client";

import { useRouter } from "next/navigation";
import { ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DealJacketFormEngine from "@/components/deal-jackets/create/deal-jacket-form-engine";
import type { IPricingConstants } from "@/lib/sales-rep/dashboard/types";

type Props = {
  expanded: boolean;
  onCollapse: () => void;
  pricing: IPricingConstants;
  panelRef: React.RefObject<HTMLDivElement | null>;
};

export default function SalesRepDealJacketWorkspace({
  expanded,
  onCollapse,
  pricing,
  panelRef,
}: Props) {
  const router = useRouter();

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
        vinLookup
        commissionRate={pricing.commissionRate}
        onSuccess={() => router.push("/sales-rep/deal-jackets")}
      />
    </div>
  );
}
