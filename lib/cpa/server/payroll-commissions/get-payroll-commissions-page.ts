"use server";

import {
  buildStaticKpis,
  CPA_DEPARTMENT_COMPENSATION,
  CPA_PAYROLL_BREAKDOWN,
  CPA_PAYROLL_BREAKDOWN_TOTAL,
  CPA_PAYROLL_EMPLOYEES,
  CPA_PAYROLL_TREND,
} from "@/lib/cpa/payroll-commissions/mock-data";
import type {
  CpaPayrollCommissionsPageData,
  CpaPayrollEmployeeRow,
} from "@/lib/cpa/payroll-commissions/types";
import { listDealershipCommissions } from "./list-dealership-commissions";

const GROSS_PROFIT = 317_500;

function mergeEmployeeCommissions(
  commissionByName: Map<string, number>,
): CpaPayrollEmployeeRow[] {
  return CPA_PAYROLL_EMPLOYEES.map((employee): CpaPayrollEmployeeRow => {
    const dynamicCommission =
      commissionByName.get(employee.employeeName.toLowerCase()) ?? 0;
    const commissions =
      dynamicCommission > 0 ? dynamicCommission : fallbackCommission(employee.id);
    const totalPay =
      employee.baseSalary +
      employee.overtime +
      employee.bonuses +
      commissions -
      employee.deductions;

    return {
      ...employee,
      commissions,
      totalPay,
    };
  });
}

function fallbackCommission(employeeId: string): number {
  const fallback: Record<string, number> = {
    "emp-1": 2_450,
    "emp-2": 2_180,
    "emp-3": 1_920,
    "emp-4": 1_760,
    "emp-5": 3_470,
    "emp-6": 980,
    "emp-7": 720,
    "emp-8": 540,
    "emp-9": 1_120,
    "emp-10": 240,
  };
  return fallback[employeeId] ?? 0;
}

export async function getPayrollCommissionsPageData(): Promise<CpaPayrollCommissionsPageData> {
  const { aggregates, totalCommissions, entryCount } =
    await listDealershipCommissions();

  const commissionByName = new Map(
    aggregates.map((item) => [
      item.employeeName.toLowerCase(),
      item.totalCommissions,
    ]),
  );

  const resolvedTotalCommissions =
    totalCommissions > 0 ? totalCommissions : 34_780;

  const employees = mergeEmployeeCommissions(commissionByName);
  const departments = Array.from(new Set(employees.map((e) => e.department))).sort();
  const positions = Array.from(new Set(employees.map((e) => e.position))).sort();

  return {
    periodLabel: "June 2026",
    comparisonLabel: "May 2026",
    dataAsOf: new Date().toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }),
    grossProfit: GROSS_PROFIT,
    kpis: buildStaticKpis(resolvedTotalCommissions, GROSS_PROFIT),
    payrollBreakdown: CPA_PAYROLL_BREAKDOWN,
    payrollBreakdownTotal: CPA_PAYROLL_BREAKDOWN_TOTAL,
    trend: CPA_PAYROLL_TREND.map((point) => ({
      ...point,
      commissions:
        point.label === "Jun" ? resolvedTotalCommissions : point.commissions,
    })),
    departmentCompensation: CPA_DEPARTMENT_COMPENSATION,
    employees,
    departmentOptions: departments,
    positionOptions: positions,
    commissionSummary: {
      totalCommissions: resolvedTotalCommissions,
      entryCount,
    },
  };
}
