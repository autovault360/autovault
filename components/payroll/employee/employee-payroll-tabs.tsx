"use client";

import { cn } from "@/lib/utils";
import type { EmployeePayrollTab } from "@/lib/payroll/types";

const TABS: { id: EmployeePayrollTab; label: string }[] = [
  { id: "overview", label: "Payroll Overview" },
  { id: "calendar", label: "Calendar" },
];

export default function EmployeePayrollTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: EmployeePayrollTab;
  onTabChange: (tab: EmployeePayrollTab) => void;
}) {
  return (
    <div className="mb-3.5 flex gap-0 border-b border-slate-800">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative px-4 py-2.5 text-[12px] font-medium transition",
            activeTab === tab.id
              ? "text-white"
              : "text-slate-500 hover:text-slate-300",
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-500" />
          )}
        </button>
      ))}
    </div>
  );
}
