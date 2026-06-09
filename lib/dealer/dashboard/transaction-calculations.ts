import type { KPICardData } from "@/components/ui/kpi-card";
import { formatCurrency, formatCurrencyExact } from "./calculations";
import type {
  DealerTransaction,
  TransactionKpiStrip,
  TransactionPaymentStatus,
  TransactionType,
} from "./types";

export function formatTransactionDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function isSaleType(type: TransactionType): boolean {
  return type === "dealer_sale" || type === "auction_sale";
}

export function isCompletedPayment(status: TransactionPaymentStatus): boolean {
  return status === "paid" || status === "partial";
}

export function filterTransactions(
  transactions: DealerTransaction[],
  filters: {
    search?: string;
    type?: TransactionType | "all";
    status?: TransactionPaymentStatus | "all";
    dateStart?: string;
    dateEnd?: string;
  },
): DealerTransaction[] {
  const q = filters.search?.trim().toLowerCase() ?? "";

  return transactions.filter((txn) => {
    if (filters.type && filters.type !== "all" && txn.type !== filters.type) {
      return false;
    }
    if (
      filters.status &&
      filters.status !== "all" &&
      txn.paymentStatus !== filters.status
    ) {
      return false;
    }
    if (filters.dateStart && txn.transactionDate < filters.dateStart) {
      return false;
    }
    if (filters.dateEnd && txn.transactionDate > filters.dateEnd) {
      return false;
    }
    if (!q) return true;
    return (
      txn.vin.toLowerCase().includes(q) ||
      txn.stockNumber.toLowerCase().includes(q) ||
      txn.buyerSeller.toLowerCase().includes(q) ||
      (txn.auction?.toLowerCase().includes(q) ?? false) ||
      txn.vehicleLabel.toLowerCase().includes(q)
    );
  });
}

export function computeTransactionStats(transactions: DealerTransaction[]) {
  const dealerSales = transactions.filter((t) => t.type === "dealer_sale");
  const auctionSales = transactions.filter((t) => t.type === "auction_sale");
  const sales = transactions.filter((t) => isSaleType(t.type));
  const pending = transactions.filter((t) => t.paymentStatus === "pending");
  const completed = transactions.filter((t) => isCompletedPayment(t.paymentStatus));

  const totalRevenue = sales.reduce((s, t) => s + t.salePurchasePrice, 0);
  const pendingAmount = pending.reduce((s, t) => s + t.salePurchasePrice, 0);
  const completedAmount = completed.reduce((s, t) => s + t.salePurchasePrice, 0);
  const grossProfit = sales.reduce((s, t) => s + (t.grossProfit ?? 0), 0);

  return {
    total: transactions.length,
    dealerSales: dealerSales.length,
    auctionSales: auctionSales.length,
    totalRevenue,
    pendingCount: pending.length,
    pendingAmount,
    completedCount: completed.length,
    completedAmount,
    grossProfit,
  };
}

const sparkPoints =
  "0,40 25,34 50,30 75,28 100,24 125,20 150,18 175,14 200,12 220,8";

export function buildTransactionKpiStrip(
  transactions: DealerTransaction[],
): TransactionKpiStrip {
  const stats = computeTransactionStats(transactions);

  const base = (label: string): Partial<KPICardData> => ({
    label,
    link: "#",
    sparkColor: "#3b82f6",
    sparkPoints,
  });

  return {
    totalTransactions: {
      ...base("Total Transactions"),
      icon: "shield",
      color: "blue",
      value: String(stats.total),
      delta: "? 12% vs last month",
    } as TransactionKpiStrip["totalTransactions"],
    dealerSales: {
      ...base("Dealer Sales"),
      icon: "car",
      color: "green",
      value: String(stats.dealerSales),
      delta: "? 15% vs last month",
    } as TransactionKpiStrip["dealerSales"],
    auctionSales: {
      ...base("Auction Sales"),
      icon: "gavel",
      color: "violet",
      value: String(stats.auctionSales),
      delta: "? 8% vs last month",
    } as TransactionKpiStrip["auctionSales"],
    totalRevenue: {
      ...base("Total Wholesale Revenue"),
      icon: "wallet",
      color: "amber",
      value: formatCurrency(stats.totalRevenue),
      delta: "? 88% vs last month",
    } as TransactionKpiStrip["totalRevenue"],
    pendingPayments: {
      ...base("Pending Payments"),
      icon: "circle-alert",
      color: "orange",
      value: String(stats.pendingCount),
      periodMetrics: [
        { value: String(stats.pendingCount), label: "Transactions" },
        { value: formatCurrency(stats.pendingAmount), label: "Amount" },
      ],
    } as TransactionKpiStrip["pendingPayments"],
    completedPayments: {
      ...base("Completed Payments"),
      icon: "badge-check",
      color: "teal",
      value: String(stats.completedCount),
      periodMetrics: [
        { value: String(stats.completedCount), label: "Transactions" },
        { value: formatCurrency(stats.completedAmount), label: "Amount" },
      ],
    } as TransactionKpiStrip["completedPayments"],
    grossProfit: {
      ...base("Gross Profit"),
      icon: "trending-up",
      color: "green",
      value: formatCurrency(stats.grossProfit),
      delta: "? 16% vs last month",
    } as TransactionKpiStrip["grossProfit"],
  };
}

export function computeTableFooter(transactions: DealerTransaction[]) {
  const stats = computeTransactionStats(transactions);
  return {
    count: stats.total,
    totalRevenue: stats.totalRevenue,
    completedAmount: stats.completedAmount,
    pendingAmount: stats.pendingAmount,
    grossProfit: stats.grossProfit,
    formatted: {
      totalRevenue: formatCurrencyExact(stats.totalRevenue),
      completedAmount: formatCurrencyExact(stats.completedAmount),
      pendingAmount: formatCurrencyExact(stats.pendingAmount),
      grossProfit: formatCurrencyExact(stats.grossProfit),
    },
  };
}
