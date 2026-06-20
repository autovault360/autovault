export type CpaPayrollCommissionsKpi = {
  id: string;
  label: string;
  value: string;
  delta: string;
  deltaColor: "green" | "red";
  icon: "landmark" | "handshake" | "dollar-sign" | "bar-chart-3" | "percent";
  color: string;
};

export type CpaPayrollBreakdownSegment = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
};

export type CpaPayrollTrendPoint = {
  label: string;
  payroll: number;
  commissions: number;
};

export type CpaDepartmentCompensation = {
  id: string;
  department: string;
  payroll: number;
  commissions: number;
  total: number;
};

export type CpaPayrollEmployeeBase = {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  baseSalary: number;
  overtime: number;
  bonuses: number;
  deductions: number;
  salesRepId?: string;
};

export type CpaPayrollEmployeeRow = CpaPayrollEmployeeBase & {
  commissions: number;
  totalPay: number;
} & Record<string, unknown>;

export type CpaDealershipCommissionAggregate = {
  salesRepId: string;
  employeeName: string;
  totalCommissions: number;
  paidCommissions: number;
  dealCount: number;
};

export type CpaPayrollCommissionsPageData = {
  periodLabel: string;
  comparisonLabel: string;
  dataAsOf: string;
  grossProfit: number;
  kpis: CpaPayrollCommissionsKpi[];
  payrollBreakdown: CpaPayrollBreakdownSegment[];
  payrollBreakdownTotal: number;
  trend: CpaPayrollTrendPoint[];
  departmentCompensation: CpaDepartmentCompensation[];
  employees: CpaPayrollEmployeeRow[];
  departmentOptions: string[];
  positionOptions: string[];
  commissionSummary: {
    totalCommissions: number;
    entryCount: number;
  };
};
