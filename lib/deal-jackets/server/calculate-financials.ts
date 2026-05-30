import type { DealJacketFees } from "./db-types";

export type FinancialInput = {
  soldPrice: number;
  vehicleInvested: number;
  vehicleExpensesTotal: number;
  additionalExpenses: number;
  commissionRate: number;
};

export type FinancialResult = {
  totalInvested: number;
  profitGross: number;
  commissionAmount: number;
  profitNet: number;
};

export function sumVehicleExpenses(
  expenses: { total_cost: number }[],
): number {
  return expenses.reduce((sum, e) => sum + Number(e.total_cost ?? 0), 0);
}

export function calculateDealJacketFinancials(
  input: FinancialInput,
): FinancialResult {
  const totalInvested =
    Number(input.vehicleInvested) + Number(input.vehicleExpensesTotal);
  const profitGross = roundMoney(input.soldPrice - totalInvested);
  const commissionAmount = roundMoney(
    Math.max(0, profitGross) * input.commissionRate,
  );
  const profitNet = roundMoney(
    profitGross - commissionAmount - Number(input.additionalExpenses),
  );

  return {
    totalInvested: roundMoney(totalInvested),
    profitGross,
    commissionAmount,
    profitNet,
  };
}

export function normalizeFees(fees: DealJacketFees): DealJacketFees {
  return {
    license: roundMoney(fees.license ?? 0),
    registration: roundMoney(fees.registration ?? 0),
    dmv: roundMoney(fees.dmv ?? 0),
    documentation: roundMoney(fees.documentation ?? 0),
    other: roundMoney(fees.other ?? 0),
  };
}

export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
