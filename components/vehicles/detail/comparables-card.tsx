import {
  DetailCard,
  DetailCardHead,
  DetailCardFooter,
} from "@/components/vehicles/detail/detail-card";
import { formatCurrency, formatMileage, getDaysColor } from "@/lib/vehicles/types";
import { cn } from "@/lib/utils";
import type { VehicleComparable } from "@/lib/vehicles/detail-types";

export default function ComparablesCard({
  comparables,
}: {
  comparables: VehicleComparable[];
}) {
  return (
    <DetailCard>
      <DetailCardHead title="COMPARABLE VEHICLES" />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[480px] text-[11.5px]">
          <thead className="text-slate-500">
            <tr className="border-b border-slate-800">
              {["Vehicle", "Year", "Mileage", "Price", "Days in Inventory"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-1 py-1.5 text-left font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {comparables.map((c) => (
              <tr
                key={c.name}
                className="border-b border-slate-800/60 last:border-0"
              >
                <td className="px-1 py-2 font-medium text-white">{c.name}</td>
                <td className="px-1 py-2 text-slate-300">{c.year}</td>
                <td className="px-1 py-2 text-slate-300">
                  {formatMileage(c.mileage)}
                </td>
                <td className="px-1 py-2 text-slate-200">
                  {formatCurrency(c.price)}
                </td>
                <td
                  className={cn(
                    "px-1 py-2 font-medium",
                    getDaysColor(c.daysInInventory),
                  )}
                >
                  {c.daysInInventory}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <DetailCardFooter label="View More Comparables" />
    </DetailCard>
  );
}
