"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Calendar, ChevronDown, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  periodLabel: string;
  employeeCount?: number;
};

export default function PayrollToolbarActions({
  periodLabel,
  employeeCount = 18,
}: Props) {
  const [runDialogOpen, setRunDialogOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const importInputRef = useRef<HTMLInputElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!exportOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [exportOpen]);

  const handleRunPayroll = useCallback(() => {
    setRunDialogOpen(false);
    startTransition(() => {
      toast.success("Payroll run initiated for May 11\u201324, 2026");
    });
  }, []);

  const handleImportHours = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "csv" && ext !== "xlsx" && ext !== "xls") {
      toast.error("Import hours accepts CSV or Excel files only");
      return;
    }
    const recordCount = Math.floor(Math.random() * 12) + 8;
    toast.success(`Hours imported: ${recordCount} records`);
  };

  const handleExport = (format: string) => {
    setExportOpen(false);
    toast.success(`${format} export queued`);
  };

  return (
    <>
      {isPending && (
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-0.5 animate-pulse bg-blue-500" />
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="flex h-9 items-center gap-1.5 rounded-md border border-slate-800 bg-[#0e1626] px-3.5 text-[12.5px] text-slate-300"
        >
          <Calendar className="h-3.5 w-3.5 text-slate-400" />
          {periodLabel}
        </button>
        <Button
          className="h-9 bg-blue-600 px-4 text-[12.5px] hover:bg-blue-500"
          onClick={() => setRunDialogOpen(true)}
        >
          Run Payroll
        </Button>
        <Button
          variant="outline"
          className="h-9 border-slate-700 bg-transparent px-4 text-[12.5px] text-slate-300 hover:bg-slate-800"
          onClick={() => importInputRef.current?.click()}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" />
          Import Hours
        </Button>
        <input
          ref={importInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleImportHours}
        />
        <div className="relative" ref={exportRef}>
          <Button
            variant="outline"
            className="h-9 border-slate-700 bg-transparent px-4 text-[12.5px] text-slate-300 hover:bg-slate-800"
            onClick={() => setExportOpen((v) => !v)}
          >
            <Download className="mr-1.5 h-3.5 w-3.5" />
            Export
            <ChevronDown className="ml-1 h-3.5 w-3.5" />
          </Button>
          {exportOpen && (
            <div className="absolute right-0 top-full z-20 mt-1 min-w-[140px] rounded-md border border-slate-700 bg-[#0e1626] py-1 shadow-lg">
              {["PDF", "Excel", "CSV"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className="block w-full px-3 py-1.5 text-left text-[11px] text-slate-300 hover:bg-slate-800"
                  onClick={() => handleExport(fmt)}
                >
                  Export as {fmt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={runDialogOpen} onOpenChange={setRunDialogOpen}>
        <DialogContent className="border-slate-700 bg-[#0e1626] text-slate-200 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Run Payroll</DialogTitle>
            <DialogDescription className="text-slate-400">
              Process payroll for {periodLabel}? This will calculate final
              payouts for {employeeCount} employees.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-slate-800 bg-card">
            <Button
              variant="outline"
              className="border-slate-700 text-slate-300"
              onClick={() => setRunDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-500"
              onClick={handleRunPayroll}
            >
              Confirm Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
