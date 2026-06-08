import { PAYROLL_EMPLOYEES } from "./employees";
import type {
  CommissionDealRow,
  DeductionLine,
  EmployeePayrollProfile,
  PaycheckDetail,
  PayrollCalendarEvent,
  PayHistoryEntry,
} from "./types";
import { getPayrollDashboardData } from "./mock-data";

const MIKE_DEDUCTIONS: DeductionLine[] = [
  { type: "Federal Tax", description: "Federal Income Tax", amount: -212.5 },
  { type: "Social Security", description: "Social Security (6.2%)", amount: -93.75 },
  { type: "Medicare", description: "Medicare (1.45%)", amount: -21.94 },
  { type: "State Tax", description: "California State Tax", amount: -56.81 },
  { type: "Health Insurance", description: "Medical Plan Premium", amount: -30 },
  { type: "Union Dues", description: "Monthly Union Dues", amount: -10 },
];

const MIKE_COMMISSION_DEALS: CommissionDealRow[] = [
  { dealJacketId: "DJ-1056", vehicle: "2024 Ford F-150", grossProfit: 4250, commissionRate: 20, commission: 850 },
  { dealJacketId: "DJ-1052", vehicle: "2023 Honda Accord", grossProfit: 3800, commissionRate: 20, commission: 760 },
  { dealJacketId: "DJ-1048", vehicle: "2022 Toyota Camry", grossProfit: 3200, commissionRate: 20, commission: 640 },
  { dealJacketId: "DJ-1044", vehicle: "2024 Chevy Silverado", grossProfit: 5100, commissionRate: 20, commission: 1020 },
  { dealJacketId: "DJ-1040", vehicle: "2023 Nissan Altima", grossProfit: 2900, commissionRate: 20, commission: 580 },
  { dealJacketId: "DJ-1036", vehicle: "2024 Jeep Wrangler", grossProfit: 4600, commissionRate: 20, commission: 920 },
  { dealJacketId: "DJ-1032", vehicle: "2023 BMW 3 Series", grossProfit: 6200, commissionRate: 20, commission: 1240 },
  { dealJacketId: "DJ-1028", vehicle: "2022 Ford Mustang", grossProfit: 3400, commissionRate: 20, commission: 680 },
  { dealJacketId: "DJ-1024", vehicle: "2024 Tesla Model 3", grossProfit: 4800, commissionRate: 20, commission: 960 },
  { dealJacketId: "DJ-1020", vehicle: "2023 Audi A4", grossProfit: 5500, commissionRate: 20, commission: 1100 },
  { dealJacketId: "DJ-1016", vehicle: "2022 Honda CR-V", grossProfit: 3100, commissionRate: 20, commission: 620 },
];

const MIKE_PAY_HISTORY: PayHistoryEntry[] = [
  { id: "ph-1", payPeriod: "Apr 27 -- May 10, 2026", payDate: "May 10, 2026", totalPay: 10850, status: "paid", paymentType: "direct_deposit" },
  { id: "ph-2", payPeriod: "Apr 13 -- Apr 26, 2026", payDate: "Apr 26, 2026", totalPay: 9420, status: "paid", paymentType: "direct_deposit" },
  { id: "ph-3", payPeriod: "Mar 30 -- Apr 12, 2026", payDate: "Apr 12, 2026", totalPay: 11280, status: "paid", paymentType: "direct_deposit" },
  { id: "ph-4", payPeriod: "Mar 16 -- Mar 29, 2026", payDate: "Mar 29, 2026", totalPay: 8950, status: "paid", paymentType: "direct_deposit" },
  { id: "ph-5", payPeriod: "Mar 2 -- Mar 15, 2026", payDate: "Mar 15, 2026", totalPay: 10340, status: "paid", paymentType: "direct_deposit" },
  { id: "ph-6", payPeriod: "Feb 16 -- Mar 1, 2026", payDate: "Mar 1, 2026", totalPay: 9780, status: "paid", paymentType: "direct_deposit" },
];

const MIKE_CALENDAR_EVENTS: PayrollCalendarEvent[] = [
  { date: "2026-05-11", type: "period_start", label: "Pay Period Start", period: "May 11 -- May 24, 2026" },
  { date: "2026-05-24", type: "period_end", label: "Pay Period End", period: "May 11 -- May 24, 2026" },
  { date: "2026-05-28", type: "pay_date", label: "Pay Date", amount: 11275, period: "May 11 -- May 24, 2026" },
  { date: "2026-06-11", type: "period_start", label: "Pay Period Start", period: "Jun 11 -- Jun 24, 2026" },
  { date: "2026-06-24", type: "period_end", label: "Pay Period End", period: "Jun 11 -- Jun 24, 2026" },
  { date: "2026-06-28", type: "pay_date", label: "Pay Date", amount: 10950, period: "Jun 11 -- Jun 24, 2026" },
];

function buildMikeJohnsonProfile(): EmployeePayrollProfile {
  const emp = PAYROLL_EMPLOYEES[0]!;
  const paycheckDetail: PaycheckDetail = {
    period: "May 11 -- May 24, 2026",
    payDate: "May 28, 2026",
    basePay: 2500,
    commission: 8450,
    bonus: 750,
    deductions: 425,
    netPay: 11275,
    paymentType: "direct_deposit",
    verificationStatus: "verified",
    adminNote: "Commission totals verified against approved deal jackets DJ-1056 through DJ-1020.",
    documents: [
      { id: "doc-1", name: "Pay Stub -- May 2026", uploadedAt: "May 24, 2026", type: "pay_stub" },
      { id: "doc-2", name: "Direct Deposit Confirmation", uploadedAt: "Jan 15, 2024", type: "direct_deposit" },
    ],
  };

  return {
    id: emp.payrollId,
    empCode: emp.empCode,
    name: emp.name,
    avatarUrl: emp.avatar,
    role: emp.role,
    phone: emp.phone,
    email: emp.email,
    hireDate: emp.hireDate,
    payFrequency: emp.payFrequency,
    isActive: true,
    periodLabel: "May 11, 2026 -- May 24, 2026",
    payPeriodSummary: {
      status: "pending",
      payPeriod: "May 11 -- May 24, 2026",
      payDate: "May 28, 2026",
      paymentType: "direct_deposit",
      basePay: 2500,
      commission: 8450,
      bonus: 750,
      deductions: 425,
      totalPay: 11275,
    },
    deductions: MIKE_DEDUCTIONS,
    earnings: [
      { type: "Base Pay", reference: "---", description: "Bi-Weekly Salary", rateOrAmount: "$2,500.00", amount: 2500 },
      { type: "Commission", reference: "DJ-1056", description: "2024 Ford F-150 Sale", rateOrAmount: "20%", amount: 850 },
      { type: "Commission", reference: "DJ-1052", description: "2023 Honda Accord Sale", rateOrAmount: "20%", amount: 760 },
      { type: "Commission", reference: "DJ-1048", description: "2022 Toyota Camry Sale", rateOrAmount: "20%", amount: 640 },
      { type: "Commission", reference: "DJ-1044", description: "2024 Chevy Silverado Sale", rateOrAmount: "20%", amount: 1020 },
      { type: "Commission", reference: "DJ-1040", description: "2023 Nissan Altima Sale", rateOrAmount: "20%", amount: 580 },
      { type: "Commission", reference: "DJ-1036", description: "2024 Jeep Wrangler Sale", rateOrAmount: "20%", amount: 920 },
      { type: "Commission", reference: "DJ-1032", description: "2023 BMW 3 Series Sale", rateOrAmount: "20%", amount: 1240 },
      { type: "Commission", reference: "DJ-1028", description: "2022 Ford Mustang Sale", rateOrAmount: "20%", amount: 680 },
      { type: "Commission", reference: "DJ-1024", description: "2024 Tesla Model 3 Sale", rateOrAmount: "20%", amount: 960 },
      { type: "Commission", reference: "DJ-1020", description: "2023 Audi A4 Sale", rateOrAmount: "20%", amount: 1100 },
      { type: "Bonus", reference: "---", description: "Performance Bonus", rateOrAmount: "Flat", amount: 750 },
    ],
    commissionDeals: MIKE_COMMISSION_DEALS,
    payHistory: MIKE_PAY_HISTORY,
    paymentSummary: {
      status: "pending",
      paymentType: "direct_deposit",
      bank: "Chase Bank",
      accountMasked: "**** **** 4567",
      estimatedDeposit: "May 28, 2026",
      netPay: 11275,
      infoNote: "Direct deposit typically posts by 9:00 AM on the pay date. Pay stub will be available in the employee portal 24 hours before deposit.",
    },
    ytdSummary: {
      year: 2026,
      grossEarnings: 98500,
      taxes: 8240,
      otherDeductions: 9225.3,
      netPayYtd: 81034.7,
      totalCommissions: 74250,
      totalBonuses: 4500,
    },
    upcomingPayDates: [
      { id: "up-1", date: "May 28, 2026", label: "Bi-Weekly Paycheck", daysUntil: 4, estimatedAmount: 11275 },
      { id: "up-2", date: "Jun 11, 2026", label: "Bi-Weekly Paycheck", daysUntil: 18, estimatedAmount: 10950 },
      { id: "up-3", date: "Jun 28, 2026", label: "Bi-Weekly Paycheck", daysUntil: 35, estimatedAmount: 11420 },
    ],
    documents: [
      { id: "ed-1", name: "W-4 Form", uploadedAt: "Jan 15, 2024", type: "w4" },
      { id: "ed-2", name: "Direct Deposit Authorization", uploadedAt: "Jan 15, 2024", type: "direct_deposit" },
      { id: "ed-3", name: "Pay Stub -- Apr 2026", uploadedAt: "Apr 26, 2026", type: "pay_stub" },
      { id: "ed-4", name: "Pay Stub -- Mar 2026", uploadedAt: "Mar 29, 2026", type: "pay_stub" },
    ],
    adminNote: "Mike exceeded monthly sales target by 15%. Approved $750 performance bonus for May period. Commission verified against 11 approved deal jackets.",
    adminNoteUpdatedAt: "May 24, 2026 at 10:30 AM",
    calendarEvents: MIKE_CALENDAR_EVENTS,
    paycheckDetails: {
      "2026-05-28": paycheckDetail,
      "2026-06-28": { ...paycheckDetail, period: "Jun 11 -- Jun 24, 2026", payDate: "Jun 28, 2026", netPay: 10950, commission: 8200, bonus: 500, deductions: 400 },
    },
  };
}

function buildDerivedProfile(payrollId: string): EmployeePayrollProfile | null {
  const emp = PAYROLL_EMPLOYEES.find((e) => e.payrollId === payrollId);
  if (!emp) return null;

  const dashboard = getPayrollDashboardData();
  const row = dashboard.summaryRows.find((r) => r.id === payrollId);
  if (!row) return null;

  const idx = PAYROLL_EMPLOYEES.findIndex((e) => e.payrollId === payrollId);
  const scale = 1 + (idx % 5) * 0.08;
  const basePay = row.basePay;
  const commission = row.commission;
  const bonus = row.bonus;
  const deductions = row.deductions;
  const totalPay = row.totalPaid;

  const fedTax = -(deductions * 0.5);
  const ssTax = -(deductions * 0.22);
  const medTax = -(deductions * 0.05);
  const stateTax = -(deductions * 0.13);
  const health = -(deductions * 0.07);
  const union = -(deductions * 0.03);

  return {
    id: emp.payrollId,
    empCode: emp.empCode,
    name: emp.name,
    avatarUrl: emp.avatar,
    role: emp.role,
    phone: emp.phone,
    email: emp.email,
    hireDate: emp.hireDate,
    payFrequency: emp.payFrequency,
    isActive: true,
    periodLabel: dashboard.kpis.periodLabel,
    payPeriodSummary: {
      status: row.status,
      payPeriod: row.payPeriod,
      payDate: row.payDate,
      paymentType: row.paymentType,
      basePay,
      commission,
      bonus,
      deductions,
      totalPay,
    },
    deductions: [
      { type: "Federal Tax", description: "Federal Income Tax", amount: fedTax },
      { type: "Social Security", description: "Social Security (6.2%)", amount: ssTax },
      { type: "Medicare", description: "Medicare (1.45%)", amount: medTax },
      { type: "State Tax", description: "State Tax", amount: stateTax },
      { type: "Health Insurance", description: "Medical Plan Premium", amount: health },
      { type: "Union Dues", description: "Union Dues", amount: union },
    ],
    earnings: [
      { type: "Base Pay", reference: "---", description: "Bi-Weekly Salary", rateOrAmount: `$${basePay.toFixed(2)}`, amount: basePay },
      { type: "Commission", reference: `DJ-${1050 + idx}`, description: "Vehicle Sale Commission", rateOrAmount: "20%", amount: commission * 0.4 },
      { type: "Commission", reference: `DJ-${1040 + idx}`, description: "Vehicle Sale Commission", rateOrAmount: "20%", amount: commission * 0.35 },
      { type: "Commission", reference: `DJ-${1030 + idx}`, description: "Vehicle Sale Commission", rateOrAmount: "20%", amount: commission * 0.25 },
      ...(bonus > 0 ? [{ type: "Bonus", reference: "---", description: "Performance Bonus", rateOrAmount: "Flat", amount: bonus }] : []),
    ],
    commissionDeals: [
      { dealJacketId: `DJ-${1050 + idx}`, vehicle: "2024 Ford F-150", grossProfit: 4000 * scale, commissionRate: 20, commission: commission * 0.4 },
      { dealJacketId: `DJ-${1040 + idx}`, vehicle: "2023 Honda Accord", grossProfit: 3500 * scale, commissionRate: 20, commission: commission * 0.35 },
      { dealJacketId: `DJ-${1030 + idx}`, vehicle: "2022 Toyota Camry", grossProfit: 3000 * scale, commissionRate: 20, commission: commission * 0.25 },
    ],
    payHistory: MIKE_PAY_HISTORY.map((h, i) => ({
      ...h,
      id: `${emp.payrollId}-ph-${i}`,
      totalPay: Math.round(h.totalPay * (0.85 + idx * 0.02)),
    })),
    paymentSummary: {
      status: row.status,
      paymentType: row.paymentType,
      bank: "Chase Bank",
      accountMasked: `**** **** ${4567 + idx}`,
      estimatedDeposit: row.payDate,
      netPay: totalPay,
      infoNote: "Direct deposit typically posts by 9:00 AM on the pay date.",
    },
    ytdSummary: {
      year: 2026,
      grossEarnings: Math.round(98500 * (0.7 + idx * 0.03)),
      taxes: Math.round(8240 * (0.7 + idx * 0.03)),
      otherDeductions: Math.round(9225 * (0.7 + idx * 0.03)),
      netPayYtd: Math.round(81034 * (0.7 + idx * 0.03)),
      totalCommissions: Math.round(74250 * (0.7 + idx * 0.03)),
      totalBonuses: Math.round(4500 * (0.5 + idx * 0.05)),
    },
    upcomingPayDates: [
      { id: "up-1", date: "May 28, 2026", label: "Bi-Weekly Paycheck", daysUntil: 4, estimatedAmount: totalPay },
      { id: "up-2", date: "Jun 11, 2026", label: "Bi-Weekly Paycheck", daysUntil: 18, estimatedAmount: Math.round(totalPay * 0.97) },
      { id: "up-3", date: "Jun 28, 2026", label: "Bi-Weekly Paycheck", daysUntil: 35, estimatedAmount: Math.round(totalPay * 1.01) },
    ],
    documents: [
      { id: "ed-1", name: "W-4 Form", uploadedAt: emp.hireDate, type: "w4" },
      { id: "ed-2", name: "Direct Deposit Authorization", uploadedAt: emp.hireDate, type: "direct_deposit" },
      { id: "ed-3", name: "Pay Stub -- Apr 2026", uploadedAt: "Apr 26, 2026", type: "pay_stub" },
    ],
    adminNote: `${emp.name} payroll profile. Commission verified against approved deal jackets.`,
    adminNoteUpdatedAt: "May 24, 2026 at 10:30 AM",
    calendarEvents: MIKE_CALENDAR_EVENTS,
    paycheckDetails: {
      "2026-05-28": {
        period: row.payPeriod,
        payDate: row.payDate,
        basePay,
        commission,
        bonus,
        deductions,
        netPay: totalPay,
        paymentType: row.paymentType,
        verificationStatus: "verified",
        adminNote: "Payroll verified for current period.",
        documents: [{ id: "ps-1", name: "Pay Stub", uploadedAt: row.payDate, type: "pay_stub" }],
      },
    },
  };
}

export function getEmployeePayrollProfile(id: string): EmployeePayrollProfile | null {
  if (id === "payroll-1") return buildMikeJohnsonProfile();
  return buildDerivedProfile(id);
}

export function getAllEmployeePayrollIds(): string[] {
  return PAYROLL_EMPLOYEES.map((e) => e.payrollId);
}
