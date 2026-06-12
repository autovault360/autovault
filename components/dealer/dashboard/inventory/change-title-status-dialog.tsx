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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateVehicleTitleStatus } from "@/lib/dealer/inventory/server/update-vehicle-title-status";
import { getVehicleLabel } from "@/lib/dealer/inventory/map-wholesale-vehicle";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";

export default function ChangeTitleStatusDialog({
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
  const [titleReceived, setTitleReceived] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (vehicle && open) {
      setTitleReceived(vehicle.titleStatus === "received");
    }
  }, [vehicle, open]);

  const handleSave = async () => {
    if (!vehicle) return;
    setSaving(true);
    const result = await updateVehicleTitleStatus({
      vehicleId: vehicle.id,
      titleReceived,
    });
    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(
      titleReceived ? "Title marked as received" : "Title marked as missing",
    );
    onOpenChange(false);
    onSuccess?.();
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#1e293b] bg-[#0a101d] text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Change Title Status</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update title status for {getVehicleLabel(vehicle)} ({vehicle.stockNumber})
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={titleReceived ? "yes" : "no"}
          onValueChange={(v) => setTitleReceived(v === "yes")}
          className="space-y-3 py-2"
        >
          <div className="flex items-center space-x-2 rounded-md border border-[#1e293b] p-3">
            <RadioGroupItem value="yes" id="title-yes" />
            <Label htmlFor="title-yes" className="text-[13px] text-slate-200">
              Yes - Title received
            </Label>
          </div>
          <div className="flex items-center space-x-2 rounded-md border border-[#1e293b] p-3">
            <RadioGroupItem value="no" id="title-no" />
            <Label htmlFor="title-no" className="text-[13px] text-slate-200">
              No - Missing title
            </Label>
          </div>
        </RadioGroup>

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
            className="bg-emerald-600 hover:bg-emerald-500"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
