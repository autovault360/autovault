"use client";

import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type RegistrationFeesNoticeProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function RegistrationFeesNotice({
  open,
  onOpenChange,
}: RegistrationFeesNoticeProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[min(380px,calc(100vw-1.5rem))] max-w-none gap-0 rounded-lg border border-slate-700 bg-[#0b1322] p-0 text-slate-200 shadow-2xl"
      >
        <div className="flex flex-col items-center px-6 pb-4 pt-8 text-center">
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-amber-500/15 text-amber-400">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <p className="text-[13px] leading-relaxed text-slate-200">
            Mark this vehicle as sold first. Once the vehicle is marked as sold, you can enter
            Registration Fees and Sales Tax, and AutoVault will automatically calculate everything
            for you.
          </p>
        </div>
        <div className="flex justify-center border-t border-slate-700/80 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            theme="dark"
            onClick={() => onOpenChange(false)}
            className="h-8 border-slate-600 text-[11px] text-slate-300"
          >
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
