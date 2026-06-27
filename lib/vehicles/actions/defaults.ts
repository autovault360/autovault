import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import type {
  AddRepairCostFormValues,
  MarkAsLossFormValues,
  MarkAsSoldFormValues,
  UpdatePricingFormValues,
} from "./schemas";
import { computeMarketStats, todayISO } from "./utils";

export function buildUpdatePricingDefaults(
  vehicle: VehicleDetail,
): UpdatePricingFormValues {
  const targetProfit = vehicle.price - vehicle.cost;
  return {
    currentAskingPrice: vehicle.price,
    newAskingPrice: vehicle.price,
    wholesalePrice: vehicle.cost,
    retailPrice: vehicle.price,
    minAcceptablePrice: Math.round(vehicle.cost * 1.05),
    targetProfit: Math.max(0, targetProfit),
    pricingStrategy: "price_reduction",
    reason: "",
    effectiveDate: todayISO(),
    notes: "",
    photoFile: null,
  };
}

export function buildAddRepairCostDefaults(): AddRepairCostFormValues {
  return {
    repairDate: todayISO(),
    repairCategory: "mechanical",
    repairType: "engine",
    priority: "medium",
    description: "",
    laborCost: 0,
    partsCost: 0,
    shopVendor: "precision_auto",
    otherFees: 0,
    isInternalRepair: "no",
    paymentMethod: "check",
    invoiceNumber: "",
    paymentStatus: "paid",
    datePaid: todayISO(),
    attachments: [],
    notes: "",
  };
}

export function buildMarkAsSoldDefaults(
  vehicle: VehicleDetail,
): MarkAsSoldFormValues {
  const suggestedTax = Math.round(vehicle.price * 0.075 * 100) / 100;
  return {
    customerType: "individual",
    customerName: "",
    phoneNumber: "",
    email: "",
    address: "",
    address2: "",
    city: "",
    state: "CA",
    zipCode: "",
    saleDate: todayISO(),
    totalPriceOtd: vehicle.price,
    salesTaxAmount: suggestedTax,
    licenseRegistrationFees: 450,
    dmvDocFees: 85,
    otherFees: 0,
    rosNumber: "",
    zipCodeOfSale: "",
    buyerIdFront: undefined,
    buyerIdBack: null,
    driversLicense: null,
    otherDocument: null,
    notes: "",
  };
}

export function buildMarkAsLossDefaults(
  vehicle: VehicleDetail,
): MarkAsLossFormValues {
  const totalInvestment = vehicle.acquisitionCost + (vehicle.registrationFees ?? 0) + (vehicle.auctionFees ?? 0) + vehicle.totalReconditioning;
  const totalExpenses = vehicle.totalReconditioning;
  const totalCostBasis = totalInvestment;
  const estimatedLoss = Math.max(
    0,
    totalCostBasis - vehicle.price - vehicle.marketValue * 0.5,
  );

  return {
    lossDate: todayISO(),
    lossReason: "",
    lossType: "",
    explanation: "",
    estimatedLossAmount: Math.round(estimatedLoss),
    insuranceProceeds: 0,
    documents: [],
  };
}

export function getLossFinancials(vehicle: VehicleDetail) {
  const totalInvestment = vehicle.acquisitionCost + (vehicle.registrationFees ?? 0) + (vehicle.auctionFees ?? 0) + vehicle.totalReconditioning;
  const totalExpenses = vehicle.totalReconditioning;
  const totalCostBasis = totalInvestment;
  return { totalInvestment, totalExpenses, totalCostBasis };
}

export { computeMarketStats };
