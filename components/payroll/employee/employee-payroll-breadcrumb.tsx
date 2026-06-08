import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function EmployeePayrollBreadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-3 flex items-center gap-1.5 text-[12px] text-slate-400"
    >
      <Link
        href="/dashboard/payroll"
        className="transition hover:text-slate-200"
      >
        Payroll Dashboard
      </Link>
      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
      <span className="font-medium text-slate-300">Employee Details</span>
    </nav>
  );
}
