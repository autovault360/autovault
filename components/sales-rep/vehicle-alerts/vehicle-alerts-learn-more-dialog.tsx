"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function VehicleAlertsLearnMoreDialog({
  open,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-700 bg-card text-slate-200 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">What Happens Next?</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 text-[12px] leading-relaxed text-slate-400">
          <p>
            After you close a deal, your vehicle sale enters the admin approval
            queue. An administrator will review the deal jacket, required
            documents, and customer information for compliance.
          </p>
          <p>
            If additional documents are needed, the status will update to
            Pending Documents. If changes are required, you will receive a Needs
            Changes alert with instructions.
          </p>
          <p>
            Once approved, the sale is finalized and your commission will be
            calculated and added to your account automatically.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
