"use client";

import { AV } from "@/lib/ui/autovault-design-tokens";
import { formatCurrency } from "@/lib/profit-loss/types";
import type { PlTableRow } from "@/lib/profit-loss/types";

type Props = {
  rows: PlTableRow[];
  asOf: string;
};

export default function PnlStatement({ rows, asOf }: Props) {
  if (rows.length === 0) {
    return (
      <div
        className="rounded-[14px] border bg-card text-card-foreground px-6 py-12 text-center text-[13px]"
        style={{ backgroundColor: AV.panel, borderColor: AV.border, color: AV.muted }}
      >
        No data for this period.
      </div>
    );
  }

  return (
    <div
      className="rounded-[14px] border bg-card text-card-foreground"
      style={{
        backgroundColor: AV.panel,
        borderColor: AV.border,
        padding: "6px 24px 18px",
      }}
    >
      {rows.map((row) => {
        if (row.kind === "section-header") {
          return (
            <div
              key={row.id}
              className="border-b"
              style={{
                padding: "14px 0",
                borderColor: AV.border,
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: AV.blue,
                  fontWeight: 800,
                  marginBottom: "8px",
                }}
              >
                {row.label}
              </div>
            </div>
          );
        }

        if (row.kind === "line-item") {
          return (
            <div
              key={row.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px 0",
                fontSize: "13.5px",
                color: AV.muted,
              }}
            >
              <span>{row.label}</span>
              <span
                style={{
                  fontFamily: "var(--mono), ui-monospace, monospace",
                  color: AV.text,
                }}
              >
                {row.thisMonth != null ? formatCurrency(row.thisMonth) : "—"}
              </span>
            </div>
          );
        }

        if (row.kind === "subtotal") {
          return (
            <div
              key={row.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "9px 0 2px",
                marginTop: "6px",
                borderTop: `1px solid ${AV.border}`,
                fontSize: "13.5px",
                fontWeight: 800,
                color: AV.text,
              }}
            >
              <span>{row.label}</span>
              <span style={{ fontFamily: "var(--mono), ui-monospace, monospace" }}>
                {row.thisMonth != null ? formatCurrency(row.thisMonth) : "—"}
              </span>
            </div>
          );
        }

        if (row.kind === "total") {
          const isPositive = (row.thisMonth ?? 0) >= 0;
          const profitColor = isPositive ? AV.green : AV.red;

          return (
            <div
              key={row.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "15px 2px",
              }}
            >
              <span
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 800,
                  fontSize: "15px",
                  color: profitColor,
                }}
              >
                {row.label}
              </span>
              <span>
                <span
                  style={{
                    fontFamily: "var(--mono), ui-monospace, monospace",
                    fontSize: "20px",
                    fontWeight: 800,
                    color: profitColor,
                  }}
                >
                  {row.thisMonth != null ? formatCurrency(row.thisMonth) : "—"}
                </span>
              </span>
            </div>
          );
        }

        return null;
      })}

      {asOf && (
        <div
          style={{
            fontSize: "11.5px",
            color: AV.muted,
            lineHeight: "1.7",
            paddingTop: "16px",
          }}
        >
          {asOf}
        </div>
      )}
    </div>
  );
}
