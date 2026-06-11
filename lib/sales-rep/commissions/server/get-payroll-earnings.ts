"use server";

import { listSalesRepCommissions } from "./list-commissions";
import type {
  IEarningsByVehicle,
  IPayrollEarningsData,
  IPayrollEarningsKpiSummary,
  IPayrollEarningsBreakdown,
  IPaymentHistoryEntry,
  PayrollPeriodMonth,
} from "../../payroll-earnings/types";

export async function getPayrollEarnings(
  _month?: PayrollPeriodMonth,
): Promise<IPayrollEarningsData> {
  const result = await listSalesRepCommissions();

  const earningsByVehicle: IEarningsByVehicle[] = result.entries.map(
    (entry, i) => ({
      id: entry.id,
      year: entry.year,
      make: entry.make,
      model: entry.model,
      trim: entry.trim,
      stockNumber: entry.stockNumber,
      vehicleImageUrl: entry.imageUrl ?? "",
      customerName: entry.customerName,
      customerPhone: entry.customerPhone,
      soldDate: entry.saleDate,
      soldPrice: entry.soldPrice,
      grossProfit: entry.grossProfit,
      commissionRate: Math.round(entry.commissionRate * 100),
      commissionEarned: entry.commissionAmount,
      paymentStatus: mapStatus(entry.status),
      dealJacketId: entry.dealJacketId,
      employeeId: "",
      invoiceRef: `INV-${entry.jacketNumber}`,
      transactionId: `TXN-${entry.id.slice(0, 8)}`,
    }),
  );

  const totalCommission = result.summary.totalCommissions;
  const vehiclesSold = result.summary.totalVehiclesSold;
  const avgCommission =
    vehiclesSold > 0 ? totalCommission / vehiclesSold : 0;

  const paidVehicles = earningsByVehicle.filter(
    (e) => e.paymentStatus === "paid",
  ).length;
  const pendingVehicles = earningsByVehicle.filter(
    (e) => e.paymentStatus === "pending",
  ).length;

  return {
    periodLabel: "",
    periodMonth: _month ?? ("2026-05" as PayrollPeriodMonth),
    kpiSummary: {
      totalEarnings: totalCommission,
      totalCommissions: totalCommission,
      vehiclesSold,
      avgCommissionPerVehicle: avgCommission,
      nextPayDate: "TBD",
      daysUntilPay: 0,
      totalEarningsTrend: "",
      totalCommissionsTrend: "",
      vehiclesSoldTrend: "",
      avgCommissionTrend: "",
    },
    breakdown: {
      totalCommissions: totalCommission,
      otherBonuses: 0,
      adjustments: 0,
      chargebacks: 0,
      netPay: totalCommission,
    },
    earningsByVehicle,
    paymentHistory: [],
    chartData: [],
  };
}

function mapStatus(
  status: string,
): IEarningsByVehicle["paymentStatus"] {
  switch (status) {
    case "paid":
      return "paid";
    case "approved":
      return "processing";
    case "pending_review":
    case "changes_requested":
    case "resubmitted":
      return "pending";
    case "rejected":
      return "failed";
    default:
      return "on_hold";
  }
}
