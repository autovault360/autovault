"use client";

import { Receipt } from "lucide-react";
import type { CpaSalesTaxPanel } from "@/lib/cpa/types";
import { Badge } from "@/components/ui/badge";
import CpaPanelShell, {
  CpaPanelStatCell,
  CpaPanelStatGrid,
} from "./cpa-panel-shell";
import { formatMoney, formatPercent } from "./cpa-dashboard-utils";

export default function CpaSalesTaxPanel({
  panel,
  className
}: {
  panel: CpaSalesTaxPanel;
  className: string;
}) {
  return (
    <CpaPanelShell
      icon={Receipt}
      iconClassName="text-white"
      iconBgClassName="bg-cyan-700"
      title="Sales Tax"
      subtitle="Tax collection and filing summary"
      viewDetailsLinkClass="border-cyan-700 text-cyan-700"
      viewDetailsHref="/cpa/sales-tax"
      className={className}
    >
      <CpaPanelStatGrid gridClass="sm:grid-cols-2">
        <CpaPanelStatCell
          label="Sales Tax Collected"
          value={formatMoney(panel.taxCollected)}
        />
        <CpaPanelStatCell
          label="Sales Tax Paid"
          value={formatMoney(panel.taxPaid)}
        />
        <CpaPanelStatCell
          label="Sales Tax Due"
          value={formatMoney(panel.taxDue)}
          valueClassName="text-red-500"
        />
        <CpaPanelStatCell
          label="Effective Tax Rate"
          value={formatPercent(panel.effectiveTaxRate)}
        />
      </CpaPanelStatGrid>

      <div className="mt-5 rounded-lg border border-slate-800/80 bg-[#0e1626]/60 p-3">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          Upcoming Filing
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-[13px] font-semibold text-white">
              {panel.upcomingFiling}
            </div>
            <div className="mt-0.5 text-[11px] text-slate-500">
              Due Date: {panel.filingDueDate}
            </div>
          </div>
          <Badge className="border-blue-500/30 bg-blue-500/10 text-[10px] text-blue-300 hover:bg-blue-500/10">
            Vehicles Included: {panel.vehiclesIncluded}
          </Badge>
        </div>
      </div>
    </CpaPanelShell>
  );
}
