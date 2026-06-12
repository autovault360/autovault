"use client";

import { useMemo, useState } from "react";
import { Search, Folder } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardShell } from "@/components/dashboard/card-shell";
import type {
  DealJacketListItem,
  DealJacketStatus,
} from "@/lib/deal-jackets/types";
import { DEAL_JACKET_STATUS_LABELS } from "@/lib/deal-jackets/types";
import { buildDealJacketKpiSummary } from "@/lib/sales-rep/deal-jacket/kpi";
import { PageHeaderTitle } from "@/components/layout/page-header-title";
import SalesRepDealJacketKpiStrip from "./sales-rep-deal-jacket-kpi-strip";
import SalesRepDealJacketTable from "./sales-rep-deal-jacket-table";

type Props = {
  dealJackets: DealJacketListItem[];
  title: string;
  description: string;
};

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  ...(["pending_review", "changes_requested", "resubmitted", "approved", "rejected"] as DealJacketStatus[]).map(
    (s) => ({ value: s, label: DEAL_JACKET_STATUS_LABELS[s] }),
  ),
];

export default function SalesRepDealJacketsContent({
  dealJackets,
  title,
  description,
}: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let result = dealJackets;

    if (statusFilter !== "all") {
      result = result.filter((item) => item.workflowStatus === statusFilter);
    }

    const q = search.toLowerCase().trim();
    if (q) {
      result = result.filter((item) => {
        const vehicle = `${item.year} ${item.make} ${item.model}`.toLowerCase();
        return (
          vehicle.includes(q) ||
          item.stockNumber.toLowerCase().includes(q) ||
          item.vin.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [dealJackets, search, statusFilter]);

  const kpiSummary = useMemo(
    () => buildDealJacketKpiSummary(dealJackets),
    [dealJackets],
  );

  return (
    <div>
      <section className="mb-3.5 flex flex-wrap items-center justify-between gap-3 px-0.5">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 grid h-10 w-10 place-items-center rounded-lg border border-slate-700 bg-[#0e1626]">
            <Folder className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <PageHeaderTitle
              title={title}
              subtitle={description}
              subtitleClassName="text-[12.5px]"
            />
          </div>
        </div>
      </section>

      <div className="mb-3.5">
        <SalesRepDealJacketKpiStrip summary={kpiSummary} />
      </div>

      <CardShell className="border-slate-700/80 bg-card backdrop-blur-sm">
        <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
          <InputGroup theme="dark" className="min-w-[240px] max-w-xl flex-1">
            <InputGroupAddon>
              <Search className="h-3.5 w-3.5 text-slate-500" />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search by VIN, Stock #, Vehicle, or Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="text-[12px] text-slate-200 placeholder:text-slate-500"
            />
          </InputGroup>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-8 w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent theme="dark" align="start">
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value} theme="dark">
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SalesRepDealJacketTable
          records={filtered}
          showActions={true}
        />
      </CardShell>
    </div>
  );
}
