"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateInventoryStatus } from "@/lib/dealer/inventory/server/update-inventory-status";
import { getVehicleLabel } from "@/lib/dealer/inventory/map-wholesale-vehicle";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";

export default function ChangeArbitrationStatusDialog({
  vehicle,
  open,
  onOpenChange,
  onSuccess,
}: {
  vehicle: WholesaleVehicle | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}) {
  const [arbitrationReason, setArbitrationReason] = useState("");
  const [arbitrationBuyerDealer, setArbitrationBuyerDealer] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vehicle && open) {
      setArbitrationReason(vehicle.arbitrationReason ?? "");
      setArbitrationBuyerDealer(vehicle.arbitrationBuyerDealer ?? "");
    }
  }, [vehicle, open]);

  const handleSave = async () => {
    if (!vehicle) return;
    if (!arbitrationReason.trim()) {
      toast.error("Arbitration reason is required");
      return;
    }

    setSaving(true);
    const result = await updateInventoryStatus({
      vehicleId: vehicle.id,
      inventoryStatus: "arbitration",
      arbitrationReason: arbitrationReason.trim(),
      arbitrationBuyerDealer: arbitrationBuyerDealer.trim() || undefined,
      timesInAuction: vehicle.timesInAuction,
      nextAuctionDate: vehicle.nextAuctionDate,
      lastAuctionDate: vehicle.lastAuctionDate,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Vehicle moved to arbitration");
    onOpenChange(false);
    onSuccess?.();
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e293b] bg-[#0a101d] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Set Arbitration Status</DialogTitle>
          <DialogDescription className="text-slate-400">
            {getVehicleLabel(vehicle)} ({vehicle.stockNumber}) will appear in the
            Arbitration list automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="arbitration-reason" className="text-[12px] text-slate-300">
              Arbitration Reason *
            </Label>
            <Input
              id="arbitration-reason"
              theme="dark"
              value={arbitrationReason}
              onChange={(e) => setArbitrationReason(e.target.value)}
              placeholder="e.g. Engine Noise, Title Issue"
              className="h-9 text-[13px]"
              maxLength={200}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="arbitration-buyer" className="text-[12px] text-slate-300">
              Buyer / Dealer
            </Label>
            <Input
              id="arbitration-buyer"
              theme="dark"
              value={arbitrationBuyerDealer}
              onChange={(e) => setArbitrationBuyerDealer(e.target.value)}
              placeholder="Counterparty name"
              className="h-9 text-[13px]"
              maxLength={120}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            theme="dark"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-500"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Set to Arbitration"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
