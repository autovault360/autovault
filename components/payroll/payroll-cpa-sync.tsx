"use client";

import { CheckCircle2, Send } from "lucide-react";
import { toast } from "sonner";
import { CardShell } from "@/components/dashboard/card-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CpaSyncState } from "@/lib/payroll/types";

export default function PayrollCpaSync({ cpaSync }: { cpaSync: CpaSyncState }) {
  return (
    <CardShell>
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
          CPA NOTES &amp; SYNC
        </div>
        {cpaSync.isSynced && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9.5px] font-semibold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            Synced
          </span>
        )}
      </div>
      <div className="mb-1 text-[10px] font-medium text-slate-500">
        {cpaSync.author}
      </div>
      <Textarea
        readOnly
        value={cpaSync.note}
        className="mb-2 min-h-[80px] resize-none border-slate-800 bg-[#0e1626] text-[11px] text-slate-300"
      />
      <div className="mb-3 text-[9.5px] text-slate-500">
        Last sync: {cpaSync.syncedAt}
      </div>
      <Button
        className="w-full bg-blue-600 hover:bg-blue-500 text-[12px]"
        onClick={() => toast.success("Payroll data sent to CPA Dashboard")}
      >
        <Send className="mr-2 h-3.5 w-3.5" />
        Send Payroll Data to CPA
      </Button>
    </CardShell>
  );
}
