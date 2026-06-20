import type {
  CpaDepartmentCompensation,
  CpaPayrollBreakdownSegment,
  CpaPayrollCommissionsKpi,
  CpaPayrollEmployeeBase,
  CpaPayrollEmployeeRow,
  CpaPayrollTrendPoint,
} from "./types";

export const CPA_PAYROLL_BREAKDOWN: CpaPayrollBreakdownSegment[] = [
  { id: "salaries", label: "Salaries", amount: 31_240, percent: 53.4, color: "#a855f7" },
  { id: "hourly", label: "Hourly Wages", amount: 14_650, percent: 25.1, color: "#3b82f6" },
  { id: "benefits", label: "Benefits", amount: 6_980, percent: 11.9, color: "#22c55e" },
  { id: "taxes", label: "Taxes", amount: 4_220, percent: 7.2, color: "#f97316" },
  { id: "other", label: "Other", amount: 1_330, percent: 2.3, color: "#eab308" },
];

export const CPA_PAYROLL_BREAKDOWN_TOTAL = 58_420;

export const CPA_PAYROLL_TREND: CpaPayrollTrendPoint[] = [
  { label: "Jul", payroll: 52_400, commissions: 28_900 },
  { label: "Aug", payroll: 54_100, commissions: 30_200 },
  { label: "Sep", payroll: 53_800, commissions: 29_600 },
  { label: "Oct", payroll: 55_600, commissions: 31_400 },
  { label: "Nov", payroll: 56_200, commissions: 32_100 },
  { label: "Dec", payroll: 57_800, commissions: 33_500 },
  { label: "Jan", payroll: 56_900, commissions: 32_800 },
  { label: "Feb", payroll: 57_400, commissions: 33_100 },
  { label: "Mar", payroll: 58_100, commissions: 33_900 },
  { label: "Apr", payroll: 57_600, commissions: 32_700 },
  { label: "May", payroll: 53_300, commissions: 32_100 },
  { label: "Jun", payroll: 58_420, commissions: 34_780 },
];

export const CPA_DEPARTMENT_COMPENSATION: CpaDepartmentCompensation[] = [
  { id: "sales", department: "Sales", payroll: 28_240, commissions: 29_580, total: 57_820 },
  { id: "service", department: "Service", payroll: 12_650, commissions: 2_450, total: 15_100 },
  { id: "parts", department: "Parts", payroll: 7_820, commissions: 1_680, total: 9_500 },
  { id: "administration", department: "Administration", payroll: 5_340, commissions: 520, total: 5_860 },
  { id: "management", department: "Management", payroll: 3_420, commissions: 520, total: 3_940 },
  { id: "other", department: "Other", payroll: 950, commissions: 30, total: 980 },
];

export const CPA_PAYROLL_EMPLOYEES: CpaPayrollEmployeeBase[] = [
  {
    id: "emp-1",
    employeeId: "EMP-1001",
    employeeName: "Mike Johnson",
    department: "Sales",
    position: "Sales Representative",
    baseSalary: 4_800,
    overtime: 320,
    bonuses: 500,
    deductions: 200,
    salesRepId: "SR-001",
  },
  {
    id: "emp-2",
    employeeId: "EMP-1002",
    employeeName: "Sarah Williams",
    department: "Sales",
    position: "Sales Representative",
    baseSalary: 4_600,
    overtime: 280,
    bonuses: 400,
    deductions: 180,
    salesRepId: "SR-002",
  },
  {
    id: "emp-3",
    employeeId: "EMP-1003",
    employeeName: "Mike Thompson",
    department: "Sales",
    position: "Sales Representative",
    baseSalary: 4_500,
    overtime: 260,
    bonuses: 350,
    deductions: 160,
    salesRepId: "SR-003",
  },
  {
    id: "emp-4",
    employeeId: "EMP-1004",
    employeeName: "Emily Davis",
    department: "Sales",
    position: "Sales Representative",
    baseSalary: 4_400,
    overtime: 240,
    bonuses: 300,
    deductions: 150,
    salesRepId: "SR-004",
  },
  {
    id: "emp-5",
    employeeId: "EMP-1005",
    employeeName: "James Wilson",
    department: "Management",
    position: "Sales Manager",
    baseSalary: 5_200,
    overtime: 0,
    bonuses: 250,
    deductions: 220,
    salesRepId: "SR-005",
  },
  {
    id: "emp-6",
    employeeId: "EMP-1006",
    employeeName: "Lisa Anderson",
    department: "Service",
    position: "Service Advisor",
    baseSalary: 3_800,
    overtime: 180,
    bonuses: 0,
    deductions: 120,
    salesRepId: "SR-006",
  },
  {
    id: "emp-7",
    employeeId: "EMP-1007",
    employeeName: "David Martinez",
    department: "Parts",
    position: "Parts Specialist",
    baseSalary: 3_600,
    overtime: 160,
    bonuses: 0,
    deductions: 110,
    salesRepId: "SR-007",
  },
  {
    id: "emp-8",
    employeeId: "EMP-1008",
    employeeName: "Jennifer Lee",
    department: "Administration",
    position: "Finance Admin",
    baseSalary: 3_900,
    overtime: 120,
    bonuses: 0,
    deductions: 100,
    salesRepId: "SR-008",
  },
  {
    id: "emp-9",
    employeeId: "EMP-1009",
    employeeName: "Robert Brown",
    department: "Sales",
    position: "Sales Representative",
    baseSalary: 4_200,
    overtime: 420,
    bonuses: 0,
    deductions: 140,
    salesRepId: "SR-009",
  },
  {
    id: "emp-10",
    employeeId: "EMP-1010",
    employeeName: "Amanda Taylor",
    department: "Sales",
    position: "Sales Representative",
    baseSalary: 4_400,
    overtime: 420,
    bonuses: 0,
    deductions: 120,
    salesRepId: "SR-010",
  },
];

export function buildStaticKpis(
  totalCommissions: number,
  grossProfit: number,
): CpaPayrollCommissionsKpi[] {
  const totalPayroll = CPA_PAYROLL_BREAKDOWN_TOTAL;
  const totalCombined = totalPayroll + totalCommissions;
  const payrollPct = grossProfit > 0 ? (totalPayroll / grossProfit) * 100 : 0;
  const commissionPct = grossProfit > 0 ? (totalCommissions / grossProfit) * 100 : 0;

  return [
    {
      id: "total-payroll",
      label: "Total Payroll",
      value: formatMoney(totalPayroll),
      delta: "↑ 9.6% vs May 2026",
      deltaColor: "green",
      icon: "landmark",
      color: "violet",
    },
    {
      id: "total-commissions",
      label: "Total Commissions",
      value: formatMoney(totalCommissions),
      delta: "↑ 8.3% vs May 2026",
      deltaColor: "green",
      icon: "handshake",
      color: "blue",
    },
    {
      id: "total-combined",
      label: "Total Payroll & Commissions",
      value: formatMoney(totalCombined),
      delta: "↑ 9.1% vs May 2026",
      deltaColor: "green",
      icon: "dollar-sign",
      color: "green",
    },
    {
      id: "payroll-pct",
      label: "Payroll % of Gross Profit",
      value: `${payrollPct.toFixed(1)}%`,
      delta: "↑ 1.2% vs May 2026",
      deltaColor: "green",
      icon: "bar-chart-3",
      color: "orange",
    },
    {
      id: "commission-pct",
      label: "Commissions % of Gross Profit",
      value: `${commissionPct.toFixed(1)}%`,
      delta: "↓ 0.3% vs May 2026",
      deltaColor: "red",
      icon: "percent",
      color: "teal",
    },
  ];
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}
