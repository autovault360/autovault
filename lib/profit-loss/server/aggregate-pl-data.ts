import type { PeriodTotals } from "../build-report";
import { finalizePeriodTotals } from "../build-report";

export type RawDealJacket = {
  sold_price: number;
  total_invested: number;
  profit_gross: number;
  profit_net: number;
  commission_amount: number;
  total_tax: number;
  date_sold: string;
  vehicle_id: string;
  amount_financed: number;
  acquisition_cost: number | null;
};

export type RawVehicleExpense = {
  vehicle_id: string;
  total_cost: number;
  category: string;
  repair_type: string;
  repair_date: string;
};

export type RawDealershipExpense = {
  category: string;
  amount: number;
  expense_date: string;
};

const DEALERSHIP_CATEGORY_MAP: Record<string, keyof PeriodTotals> = {
  salary_wages: "payroll",
  rent: "rent",
  advertising: "advertising",
  utilities: "utilities",
  software: "software",
  insurance: "insurance",
  office: "office",
  other: "other_expenses",
  accounting: "other_expenses",
};

function classifyVehicleExpense(repairType: string, category: string): keyof PeriodTotals {
  const text = `${repairType} ${category}`.toLowerCase();
  if (text.includes("auction")) return "auction_fees";
  if (text.includes("transport") || text.includes("shipping")) return "transportation";
  if (text.includes("part") || text.includes("supply")) return "parts_supplies";
  return "reconditioning";
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

export function aggregatePeriodTotals(
  jackets: RawDealJacket[],
  vehicleExpenses: RawVehicleExpense[],
  dealershipExpenses: RawDealershipExpense[],
): PeriodTotals {
  const vehicleIds = new Set(jackets.map((j) => j.vehicle_id));

  let vehicle_sales = 0;
  let vehicle_purchases = 0;
  let payrollCommissions = 0;
  let sales_tax_collected = 0;

  for (const jacket of jackets) {
    vehicle_sales += Number(jacket.sold_price);
    vehicle_purchases += Number(
      jacket.acquisition_cost ?? jacket.total_invested * 0.7,
    );
    payrollCommissions += Number(jacket.commission_amount);
    sales_tax_collected += Number(jacket.total_tax);
  }

  let auction_fees = 0;
  let transportation = 0;
  let reconditioning = 0;
  let parts_supplies = 0;

  for (const expense of vehicleExpenses) {
    if (!vehicleIds.has(expense.vehicle_id)) continue;
    const bucket = classifyVehicleExpense(expense.repair_type, expense.category);
    const amount = Number(expense.total_cost);
    if (bucket === "auction_fees") auction_fees += amount;
    else if (bucket === "transportation") transportation += amount;
    else if (bucket === "parts_supplies") parts_supplies += amount;
    else reconditioning += amount;
  }

  const op: Partial<PeriodTotals> = {
    payroll: payrollCommissions,
    rent: 0,
    advertising: 0,
    utilities: 0,
    software: 0,
    insurance: 0,
    office: 0,
    other_expenses: 0,
  };

  for (const expense of dealershipExpenses) {
    const key = DEALERSHIP_CATEGORY_MAP[expense.category] ?? "other_expenses";
    if (key === "payroll") {
      op.payroll = (op.payroll ?? 0) + Number(expense.amount);
    } else {
      op[key] = ((op[key] as number) ?? 0) + Number(expense.amount);
    }
  }

  return finalizePeriodTotals({
    vehicle_sales: roundMoney(vehicle_sales),
    other_income: 0,
    vehicle_purchases: roundMoney(vehicle_purchases),
    auction_fees: roundMoney(auction_fees),
    transportation: roundMoney(transportation),
    reconditioning: roundMoney(reconditioning),
    parts_supplies: roundMoney(parts_supplies),
    payroll: roundMoney(op.payroll ?? 0),
    rent: roundMoney(op.rent ?? 0),
    advertising: roundMoney(op.advertising ?? 0),
    utilities: roundMoney(op.utilities ?? 0),
    software: roundMoney(op.software ?? 0),
    insurance: roundMoney(op.insurance ?? 0),
    office: roundMoney(op.office ?? 0),
    other_expenses: roundMoney(op.other_expenses ?? 0),
    sales_tax_collected: roundMoney(sales_tax_collected),
    tax_expense: 0,
  });
}

export function buildDailyNetMap(
  jackets: RawDealJacket[],
  dealershipExpenses: RawDealershipExpense[],
): Map<string, number> {
  const map = new Map<string, number>();

  for (const jacket of jackets) {
    const day = jacket.date_sold.slice(0, 10);
    const gross = Number(jacket.profit_gross);
    const commission = Number(jacket.commission_amount);
    map.set(day, (map.get(day) ?? 0) + gross - commission);
  }

  for (const expense of dealershipExpenses) {
    const day = expense.expense_date.slice(0, 10);
    map.set(day, (map.get(day) ?? 0) - Number(expense.amount));
  }

  return map;
}

export function matchesDealType(
  jacket: RawDealJacket,
  dealType: string,
): boolean {
  if (dealType === "all") return true;
  const financed = Number(jacket.amount_financed);
  if (dealType === "cash") return financed <= 0;
  if (dealType === "finance") return financed > 0;
  if (dealType === "lease") return false;
  return true;
}
