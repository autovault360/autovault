"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { FilePenLine, Info, Save } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { FormGrid } from "@/components/ui/form";
import { saveTaxSettingsAction } from "@/lib/tax-filing/server/save-tax-settings";
import type { FilingDashboardData } from "@/lib/tax-filing/types";

const schema = z.object({
  state: z.string().min(1, "State is required"),
  filingFrequency: z.enum(["monthly", "quarterly", "annual", "custom"]),
  reminderDays: z.coerce.number().min(1, "Must be at least 1").max(90, "Must be 90 or less"),
});

type FormValues = z.infer<typeof schema>;

const US_STATES_LIST = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const FREQUENCIES = [
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
  { value: "custom", label: "Custom" },
] as const;

type Props = {
  settings: FilingDashboardData["settings"];
};

export default function StateTaxConfigForm({ settings }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues: {
      state: settings?.state ?? "CA",
      filingFrequency: (settings?.frequency as FormValues["filingFrequency"]) ?? "quarterly",
      reminderDays: settings?.reminderDays ?? 14,
    },
  });

  const selectedState = watch("state");
  const selectedFrequency = watch("filingFrequency");

  const onSubmit = handleSubmit(async (values) => {
    const result = await saveTaxSettingsAction(values);
    if (result.success) {
      toast.success("Tax settings saved successfully.");
    } else {
      toast.error(result.error ?? "Failed to save settings.");
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <Card className="mb-3.5 rounded-sm border border-slate-700 bg-card p-3.5 shadow-none">
        <div className="mb-4 flex flex-wrap items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-blue-500/15 text-blue-400">
            <FilePenLine className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-[14px] font-bold text-white">
              Input Your State Tax Information
            </h2>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-slate-500">
              Enter your sales tax information, filing frequency, and due dates.
              This information is used to generate filing periods and reminders.
            </p>
          </div>
        </div>

        <FormGrid className="grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-[13px] font-medium text-slate-500">State</Label>
            <Select
              value={selectedState}
              onValueChange={(v) => setValue("state", v)}
            >
              <SelectTrigger theme="dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent theme="dark" className="border-slate-700 bg-[#0e1626]">
                <SelectGroup>
                  {US_STATES_LIST.map((s) => (
                    <SelectItem key={s} value={s} className="text-[12px]">
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.state && (
              <p className="text-[10px] text-red-400">{errors.state.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[13px] font-medium text-slate-500">Filing Frequency</Label>
            <Select
              value={selectedFrequency}
              onValueChange={(v) => setValue("filingFrequency", v as FormValues["filingFrequency"])}
            >
              <SelectTrigger theme="dark">
                <SelectValue />
              </SelectTrigger>
              <SelectContent theme="dark" className="border-slate-700 bg-[#0e1626]">
                <SelectGroup>
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f.value} value={f.value} className="text-[12px]">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.filingFrequency && (
              <p className="text-[10px] text-red-400">{errors.filingFrequency.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-[13px] font-medium text-slate-500">Reminder Days Before Due</Label>
            <Input
              type="number"
              theme="dark"
              min={1}
              max={90}
              {...register("reminderDays")}
            />
            {errors.reminderDays && (
              <p className="text-[10px] text-red-400">{errors.reminderDays.message}</p>
            )}
          </div>
        </FormGrid>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-start gap-2 rounded-md border border-blue-500/25 bg-blue-500/10 px-3 py-2">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
            <p className="text-[12px] leading-relaxed text-blue-200/90">
              <span className="font-semibold text-blue-300">Important:</span>{" "}
              AutoVault does not calculate tax rates or provide tax advice. The
              dealer is responsible for entering accurate information.
            </p>
          </div>
          <Button
            theme="dark"
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="shrink-0"
          >
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </Card>
    </form>
  );
}
