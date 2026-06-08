import type { PayrollDashboardData } from "./types";
import { PAYROLL_EMPLOYEES } from "./employees";

const paymentTypes = ["direct_deposit", "check", "paper_check"] as const;
const statuses = ["paid", "pending", "overdue"] as const;

function buildSummaryRows(): PayrollDashboardData["summaryRows"] {
  return PAYROLL_EMPLOYEES.map((emp, i) => {
    if (i === 0) {
      return {
        id: emp.payrollId,
        employeeName: emp.name,
        employeeId: emp.salesRepId,
        avatarUrl: emp.avatar,
        role: emp.role,
        paymentType: "direct_deposit" as const,
        payPeriod: "May 11 – May 24, 2026",
        payDate: "May 28, 2026",
        basePay: 2500,
        commission: 8450,
        bonus: 750,
        deductions: 425,
        totalPaid: 11275,
        status: "pending" as const,
      };
    }
    const basePay = 1200 + (i % 5) * 150;
    const commission = 800 + (i % 7) * 320;
    const bonus = i % 4 === 0 ? 250 : i % 3 === 0 ? 150 : 0;
    const deductions = 180 + (i % 3) * 45;
    const totalPaid = basePay + commission + bonus - deductions;
    const status = statuses[i % 3]!;
    const paymentType = paymentTypes[i % 3]!;

    return {
      id: emp.payrollId,
      employeeName: emp.name,
      employeeId: emp.salesRepId,
      avatarUrl: emp.avatar,
      role: emp.role,
      paymentType,
      payPeriod: "May 11 – May 24, 2026",
      payDate: status === "paid" ? "May 24, 2026" : "May 28, 2026",
      basePay,
      commission,
      bonus,
      deductions,
      totalPaid,
      status,
    };
  });
}

export function getPayrollDashboardData(): PayrollDashboardData {
  return {
    kpis: {
      totalPayrollPaid: 78450.25,
      commissionsPaid: 42680.0,
      bonusesPaid: 5750.0,
      employeesPaid: 18,
      pendingPayroll: 26345.5,
      nextPayrollDate: "May 28, 2026",
      periodLabel: "May 11, 2026 – May 24, 2026",
    },
    summaryRows: buildSummaryRows(),
    commissionSegments: [
      { name: "Mike Johnson", amount: 8420, percent: 19.7, color: "#22c55e" },
      { name: "Sarah Williams", amount: 7650, percent: 17.9, color: "#3b82f6" },
      { name: "Mike Thompson", amount: 6890, percent: 16.1, color: "#a855f7" },
      { name: "Emily Davis", amount: 6120, percent: 14.3, color: "#f59e0b" },
      { name: "James Wilson", amount: 5480, percent: 12.8, color: "#06b6d4" },
      { name: "Others", amount: 8120, percent: 19.2, color: "#64748b" },
    ],
    upcomingPayments: [
      { id: "up-1", label: "Weekly Payroll", amount: 28450.0, dueDate: "May 28, 2026", iconColor: "text-emerald-400" },
      { id: "up-2", label: "Sales Commissions", amount: 15280.5, dueDate: "May 28, 2026", iconColor: "text-blue-400" },
      { id: "up-3", label: "Bonuses", amount: 3250.0, dueDate: "May 30, 2026", iconColor: "text-purple-400" },
      { id: "up-4", label: "Payroll Taxes", amount: 7540.35, dueDate: "Jun 1, 2026", iconColor: "text-amber-400" },
    ],
    payrollRuns: [
      { id: "run-1", period: "May 11 – May 24, 2026", amount: 78450.25, status: "pending" },
      { id: "run-2", period: "Apr 27 – May 10, 2026", amount: 72180.0, status: "paid" },
      { id: "run-3", period: "Apr 13 – Apr 26, 2026", amount: 69840.5, status: "paid" },
      { id: "run-4", period: "Mar 30 – Apr 12, 2026", amount: 71205.75, status: "paid" },
      { id: "run-5", period: "Mar 16 – Mar 29, 2026", amount: 68420.0, status: "paid" },
    ],
    reports: [
      { id: "rpt-1", title: "Payroll Summary Report", actionLabel: "View & Export", icon: "file-text", color: "blue" },
      { id: "rpt-2", title: "Commission Report", actionLabel: "View & Export", icon: "handshake", color: "green" },
      { id: "rpt-3", title: "Earnings Report", actionLabel: "View & Export", icon: "trending-up", color: "amber" },
      { id: "rpt-4", title: "Deductions Report", actionLabel: "View & Export", icon: "trending-down", color: "purple" },
      { id: "rpt-5", title: "Tax Liability Report", actionLabel: "View & Export", icon: "landmark", color: "red" },
      { id: "rpt-6", title: "YTD Summary Report", actionLabel: "View & Export", icon: "bar-chart-3", color: "teal" },
      { id: "rpt-7", title: "PDF Export", actionLabel: "Download", icon: "file", color: "blue" },
      { id: "rpt-8", title: "Excel Export", actionLabel: "Download", icon: "table", color: "green" },
    ],
    cpaSync: {
      author: "John Smith, CPA",
      note: "Payroll data for May 11–24 period reviewed. Commission totals align with approved deal jackets. Sales tax ledger lock scheduled for May 29. Please confirm bonus adjustments for James Wilson before final run.",
      syncedAt: "May 24, 2026 at 2:45 PM",
      isSynced: true,
    },
  };
}
