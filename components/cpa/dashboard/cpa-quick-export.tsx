"use client";

import { FileText, Sheet, Receipt, Users, Package, FileSpreadsheet, BookOpen } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const EXPORTS = [
  { label: "P&L PDF", icon: FileText, color: "hover:border-blue-500/50 hover:bg-blue-500/10" },
  { label: "General Ledger Excel", icon: Sheet, color: "hover:border-red-500/50 hover:bg-red-500/10" },
  { label: "Sales Tax PDF", icon: Receipt, color: "hover:border-yellow-500/50 hover:bg-yellow-500/10" },
  { label: "Payroll Excel", icon: Users, color: "hover:border-orange-500/50 hover:bg-orange-500/10" },
  { label: "CPA Package", icon: Package, color: "hover:border-emerald-500/50 hover:bg-emerald-500/10" },
  { label: "CSV Export", icon: FileSpreadsheet, color: "hover:border-cyan-500/50 hover:bg-cyan-500/10" },
  { label: "QuickBooks Export", icon: BookOpen, color: "hover:border-purple-500/50 hover:bg-purple-500/10" },
];

export default function CpaQuickExport() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
      {EXPORTS.map(({ label, icon: Icon, color }) => (
        <button
          key={label}
          type="button"
          onClick={() => toast.success(`${label} export queued`)}
          className={cn(
            "flex flex-col items-center gap-2 rounded-lg border border-slate-700 bg-[#0b1322] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
            color,
          )}
        >
          <Icon className="h-5 w-5 text-slate-400" />
          <span className="text-center text-[9px] text-slate-400">{label}</span>
        </button>
      ))}
    </div>
  );
}
