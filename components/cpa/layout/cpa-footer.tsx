"use client";

import { Clock, Lock, Eye, Shield } from "lucide-react";
import { useCpaPortal } from "../context/cpa-portal-context";

export default function CpaFooter() {
  const { dashboard } = useCpaPortal();
  return (
    <footer className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-3 text-[10px] text-slate-500">
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" />
        <span>Data as of: {dashboard?.dataAsOf ?? "-"}</span>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-emerald-500" />
          Secure CPA Access
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3 text-blue-400" />
          Read-Only Access
        </span>
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3 text-violet-400" />
          Data is Encrypted
        </span>
      </div>
      <span>{`AutoVault360 CPA Portal (c) ${new Date().getFullYear()}`}</span>
    </footer>
  );
}
