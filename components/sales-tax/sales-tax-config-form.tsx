"use client";

import { useState } from "react";
import { FilePenLine, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormGrid } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { SalesTaxConfig, SalesTaxReport } from "@/lib/sales-tax/types";

type Props = {
  config: SalesTaxConfig;
  options: SalesTaxReport["configOptions"];
};

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label className="text-[10.5px] font-medium text-slate-500">{label}</Label>
      {children}
    </div>
  );
}

const selectTriggerClass =
  "h-9 w-full border-slate-600 bg-slate-800/50 text-[12.5px] text-slate-200";

export default function SalesTaxConfigForm({ config, options }: Props) {
  const [form, setForm] = useState(config);

  const update = (key: keyof SalesTaxConfig, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="mb-3.5 rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      <div className="mb-4 flex flex-wrap items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-400">
          <FilePenLine className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-bold text-white">
            Input Your Sales Tax Information
          </h2>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
            Enter your sales tax information, filing frequency, and due dates. This
            information is used to calculate tax due and generate reminders.
          </p>
        </div>
      </div>

      <FormGrid className="grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <FormField label="State">
          <Select value={form.state} onValueChange={(v) => update("state", v)}>
            <SelectTrigger theme="dark" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent theme="dark" className="border-slate-700 bg-[#0e1626]">
              <SelectGroup>
                {options.states.map((s) => (
                  <SelectItem key={s} value={s} className="text-[12px]">
                    {s}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="State Sales Tax (%)">
          <div className="flex h-9 overflow-hidden rounded-[4px] border border-slate-600 bg-slate-800/50">
            <input
              type="text"
              value={form.stateSalesTaxPercent}
              onChange={(e) => update("stateSalesTaxPercent", e.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent px-3 text-[12.5px] text-slate-200 outline-none focus-visible:ring-0"
            />
            <span className="flex shrink-0 items-center border-l border-slate-600 px-2.5 text-[12px] text-slate-400">
              %
            </span>
          </div>
        </FormField>

        <FormField label="Additional Local Tax (%)">
          <Select
            value={form.additionalLocalTaxPercent}
            onValueChange={(v) => update("additionalLocalTaxPercent", v)}
          >
            <SelectTrigger theme="dark" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent theme="dark" className="border-slate-700 bg-[#0e1626]">
              <SelectGroup>
                {options.localTaxOptions.map((opt) => (
                  <SelectItem
                    key={opt.value}
                    value={opt.value}
                    className="text-[12px]"
                  >
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Filing Frequency">
          <Select
            value={form.filingFrequency}
            onValueChange={(v) => update("filingFrequency", v)}
          >
            <SelectTrigger theme="dark" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent theme="dark" className="border-slate-700 bg-[#0e1626]">
              <SelectGroup>
                {options.filingFrequencies.map((f) => (
                  <SelectItem key={f} value={f} className="text-[12px]">
                    {f}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Filing Due Dates">
          <Select
            value={form.filingDueDates}
            onValueChange={(v) => update("filingDueDates", v)}
          >
            <SelectTrigger theme="dark" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent theme="dark" className="border-slate-700 bg-[#0e1626]">
              <SelectGroup>
                {options.filingDueDateOptions.map((d) => (
                  <SelectItem key={d} value={d} className="text-[12px]">
                    {d}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>

        <FormField label="Does additional local tax apply in your area?">
          <Select
            value={form.additionalLocalTaxApplies}
            onValueChange={(v) => update("additionalLocalTaxApplies", v)}
          >
            <SelectTrigger theme="dark" className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent theme="dark" className="border-slate-700 bg-[#0e1626]">
              <SelectGroup>
                {options.yesNoOptions.map((o) => (
                  <SelectItem key={o} value={o} className="text-[12px]">
                    {o}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </FormField>
      </FormGrid>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-end justify-between gap-3">
          <div className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-[10.5px] text-blue-300">
            Example: Sales in May are due June 20
          </div>
          <Button theme="dark" type="button" size="lg" className="shrink-0">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-blue-500/25 bg-blue-500/10 px-3 py-2.5">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
        <p className="text-[10.5px] leading-relaxed text-blue-200/90">
          <span className="font-semibold text-blue-300">Important:</span> You are
          responsible for entering accurate tax rates and due dates. AutoVault does
          not verify or guarantee this information.
        </p>
      </div>
    </Card>
  );
}
