"use client";

import { useState, useRef } from "react";
import { CloudUpload, FileText, Info, X } from "lucide-react";
import { toast } from "sonner";
import { DetailCard, DetailCardHead } from "@/components/vehicles/detail/detail-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatPayrollCurrency,
  type PayPeriodSummary,
} from "@/lib/payroll/types";
import PayrollPaymentTypeBadge from "../payroll-payment-type-badge";
import PayrollStatusBadge from "../payroll-status-badge";
import { logPayrollAudit } from "@/lib/payroll/audit";

function SummaryRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1 last:border-0">
      <span className="text-[13px] text-slate-500">{label}</span>
      <span className={`font-mono text-[11px] tabular-nums tracking-wide ${valueClass ?? "text-slate-300"}`}>
        {value}
      </span>
    </div>
  );
}

export default function PayPeriodSummaryCard({
  summary,
  employeeId,
  onUpdate,
}: {
  summary: PayPeriodSummary;
  employeeId: string;
  onUpdate?: (next: PayPeriodSummary) => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [bonusOpen, setBonusOpen] = useState(false);
  const [deductionOpen, setDeductionOpen] = useState(false);
  const [bonusAmount, setBonusAmount] = useState("");
  const [deductionAmount, setDeductionAmount] = useState("");
  const [deductionType, setDeductionType] = useState("Health Insurance");
  const [localSummary, setLocalSummary] = useState(summary);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ id: string; name: string; uploadedAt: string }[]>([]);

  const validateAndAdd = (file: File) => {
    const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
    const acceptedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const acceptedMime = ["application/pdf", "image/jpeg", "image/png"];
    if (!acceptedExts.includes(ext) && !acceptedMime.includes(file.type)) {
      toast.error("Only PDF, JPEG, or PNG files are supported");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File must be under 20 MB");
      return;
    }
    const entry = {
      id: `upload-${Date.now()}`,
      name: file.name,
      uploadedAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    setUploadedFiles((prev) => [...prev, entry]);
    logPayrollAudit({ entity: "employee_payroll", employeeId, action: "upload_document", timestamp: new Date().toISOString(), metadata: { fileName: file.name } });
    toast.success("Payment document uploaded");
  };

  const applyBonus = () => {
    const amt = parseFloat(bonusAmount);
    if (!bonusAmount || isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid bonus amount greater than 0");
      return;
    }
    const next = {
      ...localSummary,
      bonus: localSummary.bonus + amt,
      totalPay: localSummary.totalPay + amt,
    };
    setLocalSummary(next);
    onUpdate?.(next);
    logPayrollAudit({ entity: "employee_payroll", employeeId, action: "add_bonus", timestamp: new Date().toISOString(), metadata: { amount: amt } });
    toast.success(`Bonus of ${formatPayrollCurrency(amt)} added`);
    setBonusOpen(false);
    setBonusAmount("");
  };

  const applyDeduction = () => {
    const amt = parseFloat(deductionAmount);
    if (!deductionAmount || isNaN(amt) || amt <= 0) {
      toast.error("Enter a valid deduction amount greater than 0");
      return;
    }
    const next = {
      ...localSummary,
      deductions: localSummary.deductions + amt,
      totalPay: localSummary.totalPay - amt,
    };
    setLocalSummary(next);
    onUpdate?.(next);
    logPayrollAudit({ entity: "employee_payroll", employeeId, action: "add_deduction", timestamp: new Date().toISOString(), metadata: { amount: amt, type: deductionType } });
    toast.success(`${deductionType} deduction of ${formatPayrollCurrency(amt)} added`);
    setDeductionOpen(false);
    setDeductionAmount("");
  };

  return (
    <DetailCard className="mb-2 bg-card/60 border-slate-800/80 h-auto">
      <DetailCardHead
        title="PAY SUMMARY FOR PERIOD"
        action={<PayrollStatusBadge status={localSummary.status} />}
      />
      <SummaryRow label="Pay Period" value={localSummary.payPeriod} />
      <SummaryRow label="Pay Date" value={localSummary.payDate} />
      <div className="flex items-center justify-between py-1">
        <span className="text-[13px] text-slate-500">Payment Type</span>
        <span className="flex items-center gap-1">
          <PayrollPaymentTypeBadge type={localSummary.paymentType} />
          <Info className="h-3 w-3 text-slate-500" />
        </span>
      </div>
      <SummaryRow label="Base Pay" value={formatPayrollCurrency(localSummary.basePay)} />
      <SummaryRow label="Commission" value={formatPayrollCurrency(localSummary.commission)} valueClass="text-emerald-400" />
      <SummaryRow label="Bonus" value={formatPayrollCurrency(localSummary.bonus)} valueClass="text-purple-400" />
      <SummaryRow label="Deductions" value={`-${formatPayrollCurrency(localSummary.deductions)}`} valueClass="text-red-400" />
      <div className="mt-2 flex items-center justify-between border-t border-slate-800 pt-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Total Pay</span>
        <span className="font-mono text-2xl font-bold tabular-nums tracking-wide text-emerald-400">
          {formatPayrollCurrency(localSummary.totalPay)}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Button size="sm" className="bg-blue-600 text-[11px] hover:bg-blue-500" onClick={() => setEditOpen(true)}>
          Edit Payroll
        </Button>
        <Button size="sm" className="bg-orange-500 text-[11px] text-white hover:bg-orange-500/10" onClick={() => setBonusOpen(true)}>
          Add Bonus
        </Button>
        <Select value={deductionType} onValueChange={(v) => { setDeductionType(v); setDeductionOpen(true); }}>
          <SelectTrigger className="h-8 w-fit gap-1 border-slate-700 text-[11px] text-slate-300">
            <SelectValue placeholder="Add Deduction" />
          </SelectTrigger>
          <SelectContent className="border-slate-800 bg-card text-[11px]">
            <SelectItem value="Health Insurance">Health Insurance</SelectItem>
            <SelectItem value="Union Dues">Union Dues</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-3 border-t border-slate-800 pt-3">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Upload Payment Type</div>
        <div
          className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-700 bg-card/40 px-3 py-3 transition hover:border-blue-500/40"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) validateAndAdd(f); }}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
        >
          <CloudUpload className="mb-2 h-6 w-6 text-slate-500" />
          <p className="text-center text-[11px] text-slate-400">Upload Check Image / Document</p>
          <Button type="button" size="sm" className="mt-2 h-7 bg-blue-600 text-[10px] hover:bg-blue-500" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
            Choose File
          </Button>
          <p className="mt-2 text-[9px] text-slate-600">PDF, JPEG, PNG · Max 20 MB</p>
          <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndAdd(f); e.target.value = ""; }} />
        </div>
        {uploadedFiles.length > 0 && (
          <ul className="mt-2 space-y-1.5">
            {uploadedFiles.map((f) => (
              <li key={f.id} className="flex items-center justify-between rounded border border-slate-800 bg-card px-2 py-1.5">
                <span className="flex items-center gap-1.5 truncate text-[13px] text-slate-300">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-red-400" />
                  {f.name}
                </span>
                <button type="button" className="text-slate-500 hover:text-white" onClick={() => setUploadedFiles((prev) => prev.filter((x) => x.id !== f.id))}>
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-slate-700 bg-card sm:max-w-md">
          <DialogHeader><DialogTitle className="text-white">Edit Payroll</DialogTitle></DialogHeader>
          <div className="space-y-2 text-[11px]">
            <div className="flex justify-between"><span className="text-slate-500">Base Pay</span><span className="font-mono text-white">{formatPayrollCurrency(localSummary.basePay)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Commission</span><span className="font-mono text-emerald-400">{formatPayrollCurrency(localSummary.commission)}</span></div>
          </div>
          <DialogFooter>
            <Button className="bg-blue-600" onClick={() => { logPayrollAudit({ entity: "employee_payroll", employeeId, action: "edit_payroll", timestamp: new Date().toISOString() }); toast.success("Payroll changes saved"); setEditOpen(false); }}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bonusOpen} onOpenChange={setBonusOpen}>
        <DialogContent className="border-slate-700 bg-card sm:max-w-sm">
          <DialogHeader><DialogTitle className="text-white">Add Bonus</DialogTitle></DialogHeader>
          <div><Label className="text-slate-400">Amount</Label><Input type="number" min="0" step="0.01" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} className="mt-1 border-slate-700 bg-slate-900" /></div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700" onClick={() => setBonusOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-500" onClick={applyBonus}>Add Bonus</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deductionOpen} onOpenChange={setDeductionOpen}>
        <DialogContent className="border-slate-700 bg-card sm:max-w-sm">
          <DialogHeader>          <DialogTitle className="text-white">Add Deduction �€” {deductionType}</DialogTitle></DialogHeader>
          <div><Label className="text-slate-400">Amount</Label><Input type="number" min="0" step="0.01" value={deductionAmount} onChange={(e) => setDeductionAmount(e.target.value)} className="mt-1 border-slate-700 bg-slate-900" /></div>
          <DialogFooter>
            <Button variant="outline" className="border-slate-700" onClick={() => setDeductionOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-500" onClick={applyDeduction}>Add Deduction</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DetailCard>
  );
}
