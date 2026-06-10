"use client";

import { useEffect, useRef, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  disabled?: boolean;
  onExportFiltered: () => void;
  onExportAll: () => void;
};

export default function VehicleAlertsExportMenu({
  disabled,
  onExportFiltered,
  onExportAll,
}: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div className="relative shrink-0" ref={ref}>
      <Button
        variant="outline"
        theme="dark"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </Button>
      {open && (
        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-md border border-slate-700 bg-card py-1 shadow-xl">
          <button
            type="button"
            className="flex w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800"
            onClick={() => {
              onExportFiltered();
              setOpen(false);
            }}
          >
            Export Filtered
          </button>
          <button
            type="button"
            className="flex w-full px-3 py-2 text-left text-[11px] text-slate-300 hover:bg-slate-800"
            onClick={() => {
              onExportAll();
              setOpen(false);
            }}
          >
            Export All
          </button>
        </div>
      )}
    </div>
  );
}
