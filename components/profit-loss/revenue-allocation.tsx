"use client";

import { AV } from "@/lib/ui/autovault-design-tokens";
import { formatCurrencyRound } from "@/lib/profit-loss/types";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import type { CategoryAmount } from "@/lib/profit-loss/types";

type Props = {
  revenueBreakdown: CategoryAmount[];
  expenseBreakdown: CategoryAmount[];
  netProfit: number;
  totalRevenue: number;
};

const COLORS = [
  "#23d18b",
  "#3aa0ff",
  "#ff9f43",
  "#a07bff",
  "#ff5470",
  "#54a0ff",
  "#5f6c80",
  "#2ed573",
  "#1e90ff",
  "#ffa502",
];

export default function RevenueAllocation({
  revenueBreakdown,
  expenseBreakdown,
  netProfit,
  totalRevenue,
}: Props) {
  const items: { name: string; value: number; color: string }[] = [];

  revenueBreakdown.forEach((cat, i) => {
    if (cat.amount > 0) {
      items.push({
        name: cat.label,
        value: cat.amount,
        color: COLORS[i % COLORS.length],
      });
    }
  });

  expenseBreakdown.forEach((cat, i) => {
    if (cat.amount > 0) {
      items.push({
        name: cat.label,
        value: cat.amount,
        color: COLORS[(revenueBreakdown.length + i) % COLORS.length],
      });
    }
  });

  if (items.length === 0) {
    return (
      <div
        className="rounded-[14px] border bg-card text-card-foreground px-[26px] py-[22px]"
        style={{ backgroundColor: AV.panel, borderColor: AV.border }}
      >
        <div className="py-12 text-center text-[13px]" style={{ color: AV.muted }}>
          No data for this period.
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] border bg-card text-card-foreground"
      style={{
        backgroundColor: AV.panel,
        borderColor: AV.border,
        marginBottom: "22px",
        padding: "22px 26px",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        gap: "38px",
      }}
    >
      {/* orange bottom accent bar */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "2px",
          backgroundColor: AV.orange,
        }}
      />

      {/* Donut */}
      <div
        style={{
          position: "relative",
          width: "186px",
          height: "186px",
          flexShrink: 0,
          alignSelf: "center",
        }}
      >
        <ResponsiveContainer width={186} height={186}>
          <PieChart>
            <Pie
              data={items}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={82}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {items.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} className="donut-seg" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono), ui-monospace, monospace",
              fontWeight: 800,
              fontSize: "23px",
              color: AV.text,
              lineHeight: 1,
            }}
          >
            {formatCurrencyRound(netProfit)}
          </div>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
              color: AV.text,
              fontWeight: 700,
              opacity: 0.85,
              marginTop: "2px",
            }}
          >
            Net Profit
          </div>
        </div>
      </div>

      {/* Legend - single column for P&L */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 0,
          marginTop: "14px",
          width: "100%",
        }}
      >
        {items.map((item) => {
          const total = items.reduce((s, i) => s + i.value, 0);
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : "0.0";
          return (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                padding: "9px 4px",
                borderBottom: `1px solid ${AV.border}`,
              }}
            >
              <div
                style={{
                  width: "11px",
                  height: "11px",
                  borderRadius: "3px",
                  flexShrink: 0,
                  backgroundColor: item.color,
                }}
              />
              <span
                style={{
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "visible",
                  fontSize: "13px",
                  color: AV.text,
                }}
              >
                {item.name}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono), ui-monospace, monospace",
                  fontSize: "13px",
                  color: AV.text,
                }}
              >
                {formatCurrencyRound(item.value)}
              </span>
              <span
                style={{
                  color: AV.muted,
                  fontSize: "12px",
                  minWidth: "38px",
                  textAlign: "right",
                  fontFamily: "var(--mono), ui-monospace, monospace",
                }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
