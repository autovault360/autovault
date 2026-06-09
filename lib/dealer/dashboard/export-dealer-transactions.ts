import { formatTransactionDate } from "./transaction-calculations";
import { TRANSACTION_TYPE_LABELS } from "./transaction-constants";
import { formatCurrencyExact } from "./calculations";
import type { DealerTransaction } from "./types";

function escapeCsv(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportDealerTransactionsCsv(
  transactions: DealerTransaction[],
  filename = "dealer-transactions.csv",
): void {
  const headers = [
    "Date",
    "Type",
    "Vehicle",
    "Stock #",
    "VIN",
    "Buyer / Seller",
    "Auction",
    "Sale / Purchase Price",
    "Gross Profit",
    "Payment Status",
    "Payment Method",
    "Documents",
    "Notes",
  ];

  const rows = transactions.map((txn) => [
    formatTransactionDate(txn.transactionDate),
    TRANSACTION_TYPE_LABELS[txn.type],
    txn.vehicleLabel,
    txn.stockNumber,
    txn.vin,
    txn.buyerSeller,
    txn.auction ?? "",
    formatCurrencyExact(txn.salePurchasePrice),
    txn.grossProfit != null ? formatCurrencyExact(txn.grossProfit) : "",
    txn.paymentStatus,
    txn.paymentMethod,
    String(txn.documents.length),
    txn.notes,
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsv).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
