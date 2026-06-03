"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import DataTable, { type Column } from "@/components/reusable/DataTable";
import type { CpaVehicleSold } from "@/lib/cpa/types";

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

export default function CpaVehiclesSoldTable({
  vehicles,
  total,
  monthLabel,
  bare,
}: {
  vehicles: CpaVehicleSold[];
  total: number;
  monthLabel: string;
  bare?: boolean;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter(
      (v) =>
        v.stockNumber.toLowerCase().includes(q) ||
        v.vehicle.toLowerCase().includes(q) ||
        v.vin.toLowerCase().includes(q),
    );
  }, [vehicles, search]);

  const columns: Column<CpaVehicleSold>[] = useMemo(
    () => [
      { key: "dateSold", header: "Date Sold", sortable: true, accessor: (r) => r.dateSold },
      {
        key: "stock", header: "Stock #", sortable: true, accessor: (r) => r.stockNumber,
        cell: (r) => <span className="text-blue-400">{r.stockNumber}</span>,
      },
      { key: "vehicle", header: "Year/Make/Model", sortable: true, accessor: (r) => r.vehicle },
      {
        key: "vin", header: "VIN", accessor: (r) => r.vin,
        cell: (r) => <span className="font-mono text-[10px] text-slate-500">{r.vin}</span>,
      },
      {
        key: "price", header: "Sale Price", sortable: true, accessor: (r) => r.salePrice,
        cell: (r) => formatMoney(r.salePrice),
      },
      {
        key: "profit", header: "Gross Profit", sortable: true, accessor: (r) => r.grossProfit,
        cell: (r) => <span className="text-emerald-400">{formatMoney(r.grossProfit)}</span>,
      },
    ],
    [],
  );

  const content = (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="text-[11px] font-bold tracking-[0.14em] text-slate-500">
          {`VEHICLES SOLD - ${monthLabel} (${total} Total)`}
        </div>
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 max-w-[160px] border-slate-700 bg-[#060d18] text-[11px]"
        />
      </div>
      <DataTable columns={columns} data={filtered} rowKey="id" emptyMessage="No vehicles found." pageSize={5} />
      {total > 5 && (
        <p className="mt-2 text-center text-[10px] text-blue-400">{`Show More (${total - 5} more vehicles)`}</p>
      )}
    </>
  );

  if (bare) return content;

  return (
    <Card className="rounded-sm border border-slate-700 bg-transparent p-3.5 shadow-none">
      {content}
    </Card>
  );
}
