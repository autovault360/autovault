export type FlooringRateType = "monthly" | "daily" | "apr";
export type FlooringIncreaseAmountType = "fixed" | "percentage";
export type FlooringApplyTo = "all" | "select";

export type FlooringPlanConfig = {
  rateType: FlooringRateType;
  baseRate: number;
  effectiveDate: string;
  rateIncreaseEnabled: boolean;
  increaseAfterDays: number;
  increaseAmountType: FlooringIncreaseAmountType;
  increaseAmount: number;
  maxCap: number | null;
  buyFee: number;
  lateFeeAfterDays: number;
  lateFeePerDay: number;
  gracePeriodDays: number;
};

export type FlooringCostBreakdown = {
  daysHeld: number;
  interestCost: number;
  buyFee: number;
  lateFee: number;
  totalCost: number;
};

export type ApplyFlooringPlanInput = FlooringPlanConfig & {
  planName?: string;
  applyTo: FlooringApplyTo;
  vehicleIds?: string[];
};

export type FlooringPlanRow = {
  id: string;
  dealership_id: string;
  name: string;
  rate_type: FlooringRateType;
  base_rate: number;
  effective_date: string;
  rate_increase_enabled: boolean;
  increase_after_days: number | null;
  increase_amount_type: FlooringIncreaseAmountType | null;
  increase_amount: number | null;
  max_cap: number | null;
  buy_fee: number;
  late_fee_after_days: number | null;
  late_fee_per_day: number;
  grace_period_days: number;
  is_active: boolean;
};

export type FlooringSummary = {
  totalFlooringCost: number;
  vehicleCount: number;
  planName: string | null;
  planId: string | null;
};

export type FlooringVehicleOption = {
  id: string;
  label: string;
  stockNumber: string;
  vin: string;
  purchasePrice: number;
  status: string;
};
