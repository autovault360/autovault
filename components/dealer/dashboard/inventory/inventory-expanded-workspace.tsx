"use client";

import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormGrid,
  FormSection,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useDealerDashboard } from "@/components/dealer/context/dealer-dashboard-context";
import {
  resetInventoryForm,
  useInventoryWorkspaceForm,
} from "@/hooks/dealer/use-inventory-workspace-form";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";
import InventoryProfitDisplay from "./inventory-profit-display";

function SkeletonBar({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-slate-800/80", className)}
    />
  );
}

export default function InventoryExpandedWorkspace({
  vehicle,
  onClose,
}: {
  vehicle: WholesaleVehicle | null;
  onClose: () => void;
}) {
  const { workspaceSaving, simulateSave } = useDealerDashboard();
  const form = useInventoryWorkspaceForm(vehicle);
  const watched = form.watch();

  useEffect(() => {
    resetInventoryForm(form, vehicle);
  }, [vehicle, form]);

  const onSubmit = form.handleSubmit(async () => {
    await simulateSave();
    onClose();
  });

  if (workspaceSaving) {
    return (
      <div className="mt-3 rounded-md border border-[#1e293b] bg-[#0a101d]/80 p-4">
        <SkeletonBar className="mb-3 h-4 w-48" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <SkeletonBar key={i} className="h-8" />
          ))}
        </div>
        <SkeletonBar className="mt-3 h-16 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-md border border-blue-500/30 bg-[#0a101d]/80 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[13px] font-bold tracking-tight text-white">
          {vehicle ? "Edit Vehicle" : "Add Vehicle"} - Management Workspace
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] text-slate-500 hover:text-white"
        >
          Collapse
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <FormSection theme="dark" title="Vehicle Identity">
            <FormGrid cols={3}>
              <FormField
                control={form.control}
                name="vin"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-1">
                      <FormLabel className="text-[11px] text-[#64748b]">
                        VIN
                      </FormLabel>
                      <FormMessage className="text-[11px]" />
                    </div>
                    <FormControl>
                      <Input
                        theme="dark"
                        {...field}
                        maxLength={17}
                        className="h-8 border-[#1e293b] bg-[#070c14]/60 uppercase"
                        onBlur={(e) => {
                          field.onChange(e.target.value.toUpperCase());
                          field.onBlur();
                        }}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-1">
                      <FormLabel className="text-[11px] text-[#64748b]">
                        Year
                      </FormLabel>
                      <FormMessage className="text-[11px]" />
                    </div>
                    <FormControl>
                      <Input
                        theme="dark"
                        type="number"
                        {...field}
                        className="h-8 border-[#1e293b] bg-[#070c14]/60"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stockNumber"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-1">
                      <FormLabel className="text-[11px] text-[#64748b]">
                        Stock #
                      </FormLabel>
                      <FormMessage className="text-[11px]" />
                    </div>
                    <FormControl>
                      <Input
                        theme="dark"
                        {...field}
                        className="h-8 border-[#1e293b] bg-[#070c14]/60"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="make"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-1">
                      <FormLabel className="text-[11px] text-[#64748b]">
                        Make
                      </FormLabel>
                      <FormMessage className="text-[11px]" />
                    </div>
                    <FormControl>
                      <Input
                        theme="dark"
                        {...field}
                        className="h-8 border-[#1e293b] bg-[#070c14]/60"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between gap-1">
                      <FormLabel className="text-[11px] text-[#64748b]">
                        Model
                      </FormLabel>
                      <FormMessage className="text-[11px]" />
                    </div>
                    <FormControl>
                      <Input
                        theme="dark"
                        {...field}
                        className="h-8 border-[#1e293b] bg-[#070c14]/60"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormGrid>
          </FormSection>

          <FormSection theme="dark" title="Cost Structure">
            <FormGrid cols={3}>
              {(
                [
                  ["acquisitionCost", "Acquisition Cost"],
                  ["auctionFees", "Auction Fees"],
                  ["transportationCosts", "Transportation"],
                  ["reconRepairDetails", "Recon / Repair"],
                  ["storageFees", "Storage Fees"],
                  ["dealerFees", "Dealer Fees"],
                  ["marketValue", "Market Value"],
                ] as const
              ).map(([name, label]) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FormLabel className="text-[11px] text-[#64748b]">
                          {label}
                        </FormLabel>
                        <FormMessage className="text-[11px]" />
                      </div>
                      <FormControl>
                        <Input
                          theme="dark"
                          mode="currency"
                          value={field.value as number}
                          onValueChange={field.onChange}
                          className="h-8 border-[#1e293b] bg-[#070c14]/60"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </FormGrid>
          </FormSection>

          <InventoryProfitDisplay values={watched} />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-8 border-[#1e293b] bg-transparent text-[12px] text-slate-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={workspaceSaving}
              className="h-8 bg-blue-600 text-[12px] hover:bg-blue-500"
            >
              {workspaceSaving && (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              )}
              Save Vehicle
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
