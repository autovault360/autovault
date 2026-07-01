"use client";

import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatCurrencyDecimal } from "@/lib/vehicles/types";
import { Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type FlooringDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: {
    id: string;
    year: number;
    make: string;
    model: string;
    purchasePrice: number;
    acquisitionDate: string;
    flooringCost: number;
  } | null;
  onSave: (vehicleId: string, cost: number) => Promise<void>;
};

type EntryMode = "quick" | "calc";

export default function FlooringDetailModal({
  open,
  onOpenChange,
  vehicle,
  onSave,
}: FlooringDetailModalProps) {
  const [mode, setMode] = useState<EntryMode>("quick");
  const [lender, setLender] = useState("");
  const [lenderCustom, setLenderCustom] = useState("");
  const [payoffAmount, setPayoffAmount] = useState(0);
  const [quickNotes, setQuickNotes] = useState("");
  const [rate, setRate] = useState(0);
  const [dailyRate, setDailyRate] = useState(0);
  const [startDate, setStartDate] = useState("");
  const [extraFees, setExtraFees] = useState(0);
  const [endMode, setEndMode] = useState<"today" | "custom">("today");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open || !vehicle) return;
    const today = new Date().toISOString().split("T")[0];
    setMode("quick");
    setLender("");
    setLenderCustom("");
    setPayoffAmount(vehicle.flooringCost > 0 ? vehicle.flooringCost : 0);
    setQuickNotes("");
    setRate(0);
    setDailyRate(0);
    setStartDate(vehicle.acquisitionDate || today);
    setExtraFees(0);
    setEndMode("today");
    setRangeStart(vehicle.acquisitionDate || today);
    setRangeEnd(today);
    setNotes("");
  }, [open, vehicle]);

  const calculatedCost = useMemo(() => {
    if (mode === "quick") return payoffAmount;
    if (rate <= 0 && extraFees <= 0) return 0;
    const start = new Date(startDate);
    const end = endMode === "today" ? new Date() : new Date(rangeEnd);
    const days = Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const dailyInt = vehicle ? (vehicle.purchasePrice * (rate / 100)) / 365 : 0;
    return dailyInt * days + extraFees;
  }, [mode, payoffAmount, rate, startDate, endMode, rangeEnd, extraFees, vehicle]);

  const calcDays = useMemo(() => {
    if (mode === "quick") return 0;
    const start = new Date(startDate);
    const end = endMode === "today" ? new Date() : new Date(rangeEnd);
    return Math.max(0, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  }, [mode, startDate, endMode, rangeEnd]);

  const syncRateFromPct = (pct: number) => {
    setRate(pct);
    if (vehicle && pct > 0) {
      setDailyRate((vehicle.purchasePrice * (pct / 100)) / 365);
    } else {
      setDailyRate(0);
    }
  };

  const syncRateFromDaily = (daily: number) => {
    setDailyRate(daily);
    if (vehicle && daily > 0) {
      setRate((daily * 365 / vehicle.purchasePrice) * 100);
    } else {
      setRate(0);
    }
  };

  const handleSave = async () => {
    if (!vehicle) return;
    setSubmitting(true);
    try {
      await onSave(vehicle.id, calculatedCost);
      onOpenChange(false);
    } finally {
      setSubmitting(false);
    }
  };

  const resolvedLender = lender === "Other" ? lenderCustom : lender;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-h-[90vh] w-[min(520px,calc(100vw-1.5rem))] max-w-none gap-0 overflow-hidden rounded-lg border border-slate-700 bg-[#0b1322] p-0 text-slate-200 shadow-2xl"
      >
        <div className="flex items-start justify-between border-b border-slate-700/80 px-5 py-4">
          <div>
            <h2 className="text-[13px] font-bold text-white">
              Flooring Cost {vehicle ? `- ${vehicle.year} ${vehicle.make} ${vehicle.model}` : ""}
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">Configure flooring cost for this vehicle.</p>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid h-7 w-7 shrink-0 place-items-center rounded text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto px-5 py-4">
          {vehicle && vehicle.flooringCost > 0 && (
            <div className="rounded-md border border-slate-700 bg-slate-900/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Current Flooring Cost</span>
                <span className="font-mono text-sm font-bold text-red-400">
                  -{formatCurrencyDecimal(vehicle.flooringCost)}
                </span>
              </div>
            </div>
          )}

          <div>
            <Label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              Floor Plan Lender
            </Label>
            <Select value={lender} onValueChange={setLender}>
              <SelectTrigger theme="dark" className="h-8 w-full text-[12px]">
                <SelectValue placeholder="Select lender..." />
              </SelectTrigger>
              <SelectContent theme="dark">
                <SelectItem value="" theme="dark" className="text-[12px]">Select lender...</SelectItem>
                <SelectItem value="NextGear Capital" theme="dark" className="text-[12px]">NextGear Capital</SelectItem>
                <SelectItem value="Westlake Financial" theme="dark" className="text-[12px]">Westlake Financial</SelectItem>
                <SelectItem value="AFC" theme="dark" className="text-[12px]">AFC (Automotive Finance Corp)</SelectItem>
                <SelectItem value="Ally Financial" theme="dark" className="text-[12px]">Ally Financial</SelectItem>
                <SelectItem value="Other" theme="dark" className="text-[12px]">Other / Custom</SelectItem>
              </SelectContent>
            </Select>
            {lender === "Other" && (
              <Input
                theme="dark"
                className="mt-2 h-8 text-[12px]"
                placeholder="Enter lender name"
                value={lenderCustom}
                onChange={(e) => setLenderCustom(e.target.value)}
              />
            )}
          </div>

          <div>
            <Label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              Entry Method
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("quick")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-[11px] font-semibold transition",
                  mode === "quick"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-slate-600 text-slate-400 hover:border-slate-500",
                )}
              >
                Quick Entry
              </button>
              <button
                type="button"
                onClick={() => setMode("calc")}
                className={cn(
                  "flex-1 rounded-md border px-3 py-2 text-[11px] font-semibold transition",
                  mode === "calc"
                    ? "border-blue-500 bg-blue-500/10 text-blue-400"
                    : "border-slate-600 text-slate-400 hover:border-slate-500",
                )}
              >
                Calculate It
              </button>
            </div>
          </div>

          {mode === "quick" ? (
            <div className="space-y-3 rounded-md border border-slate-700 bg-slate-900/40 p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">Lender Payoff Amount</div>
              <p className="text-[11px] text-slate-400">Enter the amount provided by your lender.</p>
              <Input
                mode="currency"
                theme="dark"
                value={payoffAmount}
                onValueChange={setPayoffAmount}
              />
              <div>
                <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Notes (optional)</Label>
                <Input
                  theme="dark"
                  className="h-8 text-[12px]"
                  placeholder="e.g. Statement dated Jun 2026"
                  value={quickNotes}
                  onChange={(e) => setQuickNotes(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {calculatedCost > 0 && (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Calculated Flooring Cost
                    </span>
                    <span className="font-mono text-lg font-bold text-amber-400">
                      {formatCurrencyDecimal(calculatedCost)}
                    </span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500">
                    {vehicle ? `${formatCurrencyDecimal(vehicle.purchasePrice)} purchase price · ${rate.toFixed(2)}% annual · ${calcDays} days` : ""}
                    {extraFees > 0 ? ` · + ${formatCurrencyDecimal(extraFees)} fees` : ""}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Annual Rate (%)</Label>
                  <Input
                    theme="dark"
                    type="number"
                    min={0}
                    step={0.01}
                    className="h-8 text-[12px]"
                    placeholder="e.g. 5.0"
                    value={rate || ""}
                    onChange={(e) => syncRateFromPct(Number(e.target.value) || 0)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Daily Cost ($/day)</Label>
                  <Input
                    theme="dark"
                    type="number"
                    min={0}
                    step={0.01}
                    className="h-8 text-[12px]"
                    placeholder="e.g. 3.00"
                    value={dailyRate || ""}
                    onChange={(e) => syncRateFromDaily(Number(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Flooring Start Date</Label>
                  <Input
                    mode="date"
                    theme="dark"
                    className="h-8 text-[12px]"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Additional Fees ($)</Label>
                  <Input
                    mode="currency"
                    theme="dark"
                    value={extraFees}
                    onValueChange={setExtraFees}
                  />
                </div>
              </div>

              <div>
                <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Date Range</Label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setEndMode("today")}
                    className={cn(
                      "flex-1 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold transition",
                      endMode === "today"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-600 text-slate-400",
                    )}
                  >
                    Through Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setEndMode("custom")}
                    className={cn(
                      "flex-1 rounded-md border px-2.5 py-1.5 text-[10px] font-semibold transition",
                      endMode === "custom"
                        ? "border-blue-500 bg-blue-500/10 text-blue-400"
                        : "border-slate-600 text-slate-400",
                    )}
                  >
                    Custom Range
                  </button>
                </div>
                {endMode === "custom" && (
                  <div className="grid grid-cols-2 gap-2">
                    <Input mode="date" theme="dark" className="h-8 text-[12px]" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} />
                    <Input mode="date" theme="dark" className="h-8 text-[12px]" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} />
                  </div>
                )}
              </div>

              <div>
                <Label className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.06em] text-slate-500">Notes (optional)</Label>
                <Input
                  theme="dark"
                  className="h-8 text-[12px]"
                  placeholder="e.g. NextGear account #1234"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="flex items-start gap-2 rounded-md border border-blue-500/25 bg-[#0c1a2e] px-3 py-2.5">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
                <p className="text-[10px] leading-relaxed text-slate-300">
                  Formula: (Purchase Price × Annual Rate ÷ 365) × Days + Additional Fees
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-700/80 px-5 py-3">
          <Button
            type="button"
            variant="outline"
            theme="dark"
            onClick={() => onOpenChange(false)}
            className="h-8 border-slate-600 text-[11px] text-slate-300"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={submitting}
            onClick={handleSave}
            className="h-8 bg-blue-600 text-[11px] text-white hover:bg-blue-500"
          >
            {submitting ? "Saving..." : "Save & Recalculate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
