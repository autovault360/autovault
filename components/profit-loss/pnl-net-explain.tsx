"use client";

import { AV } from "@/lib/ui/autovault-design-tokens";
import { formatCurrency } from "@/lib/profit-loss/types";
import { cn } from "@/lib/utils";

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
  return (
    <div
      className="rounded-[14px] border bg-card text-card-foreground"
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
          color: AV.text,
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
        className={`text-[11.5px] text-gray-400 line-height-[1.6] mt-3 pt-3 border-t border-border color-[${AV.muted}] border-t-gray-700`}
      >
        Gross profit is what's left after the <span className="text-white font-semibold">cost of the vehicles</span> (COGS). From there we subtract the <span className="text-white font-semibold">commissions </span> paid to your sales reps and all <span className="text-white font-semibold">dealership overhead</span> (rent, utilities, marketing, etc.). What remains is your true bottom-line <span className="text-white font-semibold">net profit</span>.
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
