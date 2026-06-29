import type {
  FlooringCostBreakdown,
  FlooringPlanConfig,
  FlooringPlanRow,
} from "@/lib/vehicles/flooring/types";

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function parseDateOnly(value: string): Date {
  return new Date(`${value.split("T")[0]}T00:00:00`);
}

export function daysBetween(startDate: string, endDate: string): number {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  const diff = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

function getMonthlyRateForDay(plan: FlooringPlanConfig, day: number): number {
  let rate = plan.baseRate;
  if (
    plan.rateIncreaseEnabled &&
    plan.increaseAfterDays > 0 &&
    day > plan.increaseAfterDays
  ) {
    const periods = Math.floor((day - 1) / plan.increaseAfterDays);
    for (let i = 0; i < periods; i++) {
      if (plan.increaseAmountType === "fixed") {
        rate += plan.increaseAmount;
      } else {
        rate += rate * (plan.increaseAmount / 100);
      }
    }
  }
  if (plan.maxCap != null && plan.maxCap > 0) {
    rate = Math.min(rate, plan.maxCap);
  }
  return rate;
}

function calculateLateFee(plan: FlooringPlanConfig, daysHeld: number): number {
  if (plan.lateFeeAfterDays <= 0 || plan.lateFeePerDay <= 0) return 0;
  const lateFeeStartDay = plan.lateFeeAfterDays + plan.gracePeriodDays + 1;
  const lateDays = Math.max(0, daysHeld - lateFeeStartDay + 1);
  return roundMoney(lateDays * plan.lateFeePerDay);
}

export function calculateFlooringCost(input: {
  plan: FlooringPlanConfig;
  purchasePrice: number;
  flooringStartDate: string;
  asOfDate?: string;
}): FlooringCostBreakdown {
  const asOf = input.asOfDate ?? new Date().toISOString().split("T")[0];
  const daysHeld = daysBetween(input.flooringStartDate, asOf);

  if (daysHeld <= 0) {
    return {
      daysHeld: 0,
      interestCost: 0,
      buyFee: 0,
      lateFee: 0,
      totalCost: 0,
    };
  }

  let interestCost = 0;

  if (input.plan.rateType === "apr") {
    const dailyInterest =
      (input.purchasePrice * (input.plan.baseRate / 100)) / 365;
    interestCost = roundMoney(dailyInterest * daysHeld);
  } else if (input.plan.rateType === "daily") {
    interestCost = roundMoney(input.plan.baseRate * daysHeld);
  } else {
    for (let day = 1; day <= daysHeld; day++) {
      const monthlyRate = getMonthlyRateForDay(input.plan, day);
      interestCost += monthlyRate / 30;
    }
    interestCost = roundMoney(interestCost);
  }

  const buyFee = roundMoney(input.plan.buyFee);
  const lateFee = calculateLateFee(input.plan, daysHeld);
  const totalCost = roundMoney(interestCost + buyFee + lateFee);

  return {
    daysHeld,
    interestCost,
    buyFee,
    lateFee,
    totalCost,
  };
}

export function planRowToConfig(row: FlooringPlanRow): FlooringPlanConfig {
  return {
    rateType: row.rate_type,
    baseRate: Number(row.base_rate),
    effectiveDate: row.effective_date,
    rateIncreaseEnabled: row.rate_increase_enabled,
    increaseAfterDays: Number(row.increase_after_days ?? 0),
    increaseAmountType: row.increase_amount_type ?? "fixed",
    increaseAmount: Number(row.increase_amount ?? 0),
    maxCap: row.max_cap != null ? Number(row.max_cap) : null,
    buyFee: Number(row.buy_fee),
    lateFeeAfterDays: Number(row.late_fee_after_days ?? 0),
    lateFeePerDay: Number(row.late_fee_per_day),
    gracePeriodDays: Number(row.grace_period_days),
  };
}

export function resolveFlooringStartDate(
  acquisitionDate: string | null | undefined,
  planEffectiveDate: string,
): string {
  const acq = acquisitionDate?.split("T")[0] ?? planEffectiveDate;
  const eff = planEffectiveDate.split("T")[0];
  return acq > eff ? acq : eff;
}

export function buildFlooringTimeline(
  plan: FlooringPlanConfig,
  purchasePrice: number,
  dayMarks: number[] = [10, 20, 30, 45, 60, 90, 120],
): { days: number; interest: number; buyFee: number; total: number }[] {
  const start = plan.effectiveDate;
  return dayMarks.map((days) => {
    const end = new Date(parseDateOnly(start));
    end.setDate(end.getDate() + days);
    const breakdown = calculateFlooringCost({
      plan,
      purchasePrice,
      flooringStartDate: start,
      asOfDate: end.toISOString().split("T")[0],
    });
    return {
      days,
      interest: breakdown.interestCost,
      buyFee: breakdown.buyFee,
      total: breakdown.totalCost,
    };
  });
}
