"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { CalendarFilterOptions, CalendarFilters } from "@/lib/calendar/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CalendarFilters;
  filterOptions: CalendarFilterOptions;
  onApply: (filters: CalendarFilters) => void;
};

export default function CalendarFilterDialog({
  open,
  onOpenChange,
  filters,
  filterOptions,
  onApply,
}: Props) {
  const [local, setLocal] = React.useState(filters);

  React.useEffect(() => {
    if (open) setLocal(filters);
  }, [open, filters]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-[#0e1626] text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Filter Calendar</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-400">Sales Rep</Label>
            <Select
              value={local.salesRep}
              onValueChange={(v) => setLocal((p) => ({ ...p, salesRep: v }))}
            >
              <SelectTrigger theme="dark" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-[#0e1626]">
                {filterOptions.salesReps.map((rep) => (
                  <SelectItem key={rep.value} value={rep.value}>
                    {rep.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] text-slate-400">Location</Label>
            <Select
              value={local.location}
              onValueChange={(v) => setLocal((p) => ({ ...p, location: v }))}
            >
              <SelectTrigger theme="dark" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-800 bg-[#0e1626]">
                {filterOptions.locations.map((loc) => (
                  <SelectItem key={loc.value} value={loc.value}>
                    {loc.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 bg-transparent text-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply(local);
              onOpenChange(false);
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
