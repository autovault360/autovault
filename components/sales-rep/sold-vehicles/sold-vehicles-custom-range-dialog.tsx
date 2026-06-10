"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { validateDateRange } from "@/lib/sales-rep/sold-vehicles/calculations";
import type { SoldVehicleDateRange } from "@/lib/sales-rep/sold-vehicles/types";

type Props = {
  open: boolean;
  initialRange: SoldVehicleDateRange;
  onOpenChange: (open: boolean) => void;
  onApply: (range: SoldVehicleDateRange) => void;
};

export default function SoldVehiclesCustomRangeDialog({
  open,
  initialRange,
  onOpenChange,
  onApply,
}: Props) {
  const [start, setStart] = useState(initialRange.start);
  const [end, setEnd] = useState(initialRange.end);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    const range = { start, end };
    const validationError = validateDateRange(range);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onApply(range);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-card text-slate-200 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Custom Date Range</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          <div>
            <label className="mb-1 block text-[11px] text-slate-500">
              Start Date
            </label>
            <Input
              theme="dark"
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="border-slate-700 bg-slate-800/50"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] text-slate-500">
              End Date
            </label>
            <Input
              theme="dark"
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="border-slate-700 bg-slate-800/50"
            />
          </div>
          {error && <p className="text-[11px] text-red-400">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            theme="dark"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button theme="dark" onClick={handleApply}>
            Apply Range
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
