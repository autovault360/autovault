"use client";

import { useState } from "react";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const CHANGE_CATEGORY_OPTIONS = [
  "Pricing",
  "Documents",
  "Customer Info",
  "Vehicle Info",
  "Fees/Taxes",
  "Commission",
  "Dates",
  "Other",
];

type ModalBaseProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dealJacketId: string;
  onSuccess: () => void;
};

export function ApproveModal({
  open,
  onOpenChange,
  dealJacketId,
  onSuccess,
}: ModalBaseProps) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      const { approveDealJacket } = await import(
        "@/lib/deal-jackets/server/workflow"
      );
      const result = await approveDealJacket(dealJacketId, notes || undefined);
      if (result.success) {
        onSuccess();
        onOpenChange(false);
        setNotes("");
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-800 bg-[var(--bg-secondary)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px] text-white">
            <CheckCircle className="h-5 w-5 text-emerald-400" />
            Approve Deal Jacket
          </DialogTitle>
          <DialogDescription className="text-[12px] text-slate-400">
            Approving this deal jacket will mark the vehicle as Sold and
            auto-generate the commission. This action is final.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="approve-notes" className="text-[12px] text-slate-300">
            Review Notes (optional)
          </Label>
          <Textarea
            id="approve-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this approval..."
            className="min-h-[80px] border-slate-700 bg-slate-900/50 text-[12px] text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-400">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 bg-transparent text-[11px] text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-emerald-600 text-[11px] text-white hover:bg-emerald-500"
          >
            {loading ? "Approving..." : "Confirm Approval"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectModal({
  open,
  onOpenChange,
  dealJacketId,
  onSuccess,
}: ModalBaseProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { rejectDealJacket } = await import(
        "@/lib/deal-jackets/server/workflow"
      );
      const result = await rejectDealJacket(dealJacketId, reason);
      if (result.success) {
        onSuccess();
        onOpenChange(false);
        setReason("");
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-800 bg-[var(--bg-secondary)]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px] text-white">
            <XCircle className="h-5 w-5 text-red-400" />
            Reject Deal Jacket
          </DialogTitle>
          <DialogDescription className="text-[12px] text-slate-400">
            Rejecting this deal jacket will mark it as rejected. The sales rep
            will need to create a new jacket. This action is final.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="reject-reason" className="text-[12px] text-slate-300">
            Rejection Reason <span className="text-red-400">*</span>
          </Label>
          <Textarea
            id="reject-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this deal jacket is being rejected..."
            className="min-h-[100px] border-slate-700 bg-slate-900/50 text-[12px] text-slate-200 placeholder:text-slate-500"
          />
        </div>

        {error && (
          <p className="text-[11px] text-red-400">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 bg-transparent text-[11px] text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-red-600 text-[11px] text-white hover:bg-red-500"
          >
            {loading ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RequestChangesModal({
  open,
  onOpenChange,
  dealJacketId,
  onSuccess,
}: ModalBaseProps) {
  const [notes, setNotes] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const handleConfirm = async () => {
    if (!notes.trim()) {
      setError("Please describe the changes needed");
      return;
    }
    if (selectedCategories.length === 0) {
      setError("Please select at least one change category");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { requestChangesOnDealJacket } = await import(
        "@/lib/deal-jackets/server/workflow"
      );
      const result = await requestChangesOnDealJacket(
        dealJacketId,
        notes,
        selectedCategories,
      );
      if (result.success) {
        onSuccess();
        onOpenChange(false);
        setNotes("");
        setSelectedCategories([]);
      } else {
        setError(result.error);
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-slate-800 bg-[var(--bg-secondary)] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[15px] text-white">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            Request Changes
          </DialogTitle>
          <DialogDescription className="text-[12px] text-slate-400">
            Specify what needs to be changed before this deal jacket can be
            approved. The sales rep will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-[12px] text-slate-300">
              Change Categories <span className="text-red-400">*</span>
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {CHANGE_CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    selectedCategories.includes(cat)
                      ? "bg-orange-500/20 text-orange-300 border border-orange-500/40"
                      : "bg-slate-800/60 text-slate-400 border border-slate-700/60 hover:border-slate-600"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="changes-notes" className="text-[12px] text-slate-300">
              Description of Changes Needed <span className="text-red-400">*</span>
            </Label>
            <Textarea
              id="changes-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe what needs to be changed and why..."
              className="min-h-[100px] border-slate-700 bg-slate-900/50 text-[12px] text-slate-200 placeholder:text-slate-500"
            />
          </div>
        </div>

        {error && (
          <p className="text-[11px] text-red-400">{error}</p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="border-slate-700 bg-transparent text-[11px] text-slate-300 hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="bg-orange-600 text-[11px] text-white hover:bg-orange-500"
          >
            {loading ? "Submitting..." : "Request Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
