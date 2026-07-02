"use client";

import { AV } from "@/lib/ui/autovault-design-tokens";
import { formatCurrency } from "@/lib/profit-loss/types";

type Props = {
  totalRevenue: number;
  totalCogs: number;
  totalExpenses: number;
  netProfit: number;
};

export default function PnlNetExplain({
  totalRevenue,
  totalCogs,
  totalExpenses,
  netProfit,
}: Props) {
  const isPositive = netProfit >= 0;

  return (
    <div
      style={{
        backgroundColor: AV.panel,
        border: `1px solid ${AV.border}`,
        borderRadius: "14px",
        padding: "16px 18px",
        marginTop: "16px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          letterSpacing: "1px",
          textTransform: "uppercase",
          color: AV.muted,
          fontWeight: 800,
          marginBottom: "12px",
        }}
      >
        Net Profit Explanation
      </div>

      <Row label="Total Revenue" value={totalRevenue} />
      <Row label="Cost of Goods Sold" value={totalCogs} minus />
      <Row label="Total Expenses" value={totalExpenses} minus />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderTop: `2px solid ${AV.border}`,
          marginTop: "6px",
          paddingTop: "11px",
          fontWeight: 800,
          fontSize: "15px",
          color: isPositive ? AV.green : AV.red,
        }}
      >
        <span>Net Profit</span>
        <span
          style={{
            fontFamily: "var(--mono), ui-monospace, monospace",
            fontSize: "17px",
          }}
        >
          {formatCurrency(netProfit)}
        </span>
      </div>

      <div
        style={{
          fontSize: "11.5px",
          color: AV.muted,
          lineHeight: 1.6,
          marginTop: "12px",
          paddingTop: "12px",
          borderTop: `1px solid ${AV.border}`,
        }}
      >
        Net profit is total revenue minus COGS, commissions, and overhead expenses.
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  minus,
}: {
  label: string;
  value: number;
  minus?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "6px 0",
        fontSize: "13px",
        color: minus ? AV.muted : AV.text,
      }}
    >
      <span>{label}</span>
      <span
        style={{
          fontFamily: "var(--mono), ui-monospace, monospace",
          color: minus ? AV.red : AV.text,
        }}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}
