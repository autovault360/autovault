import { formatCurrency } from "@/lib/deal-jackets/types";
import type { DealJacketDetail } from "@/lib/deal-jackets/detail-types";
import { KPICard, type KPICardData, type KPIIconName } from "@/components/ui/kpi-card";
import { cn } from "@/lib/utils";

function buildHeroKpis(detail: DealJacketDetail): KPICardData[] {
  return [
    {
      icon: "dollar-sign" as KPIIconName,
      color: "green",
      label: "Total Sale Price",
      value: formatCurrency(detail.financial.totalSalePrice),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "0,40 55,35 110,30 165,25 220,20",
    },
    {
      icon: "pie-chart" as KPIIconName,
      color: "red",
      label: "Total Expenses",
      value: formatCurrency(detail.financial.vehicleExpenses),
      link: "",
      sparkColor: "#f87171",
      sparkPoints: "0,20 55,25 110,30 165,35 220,40",
    },
    {
      icon: "bar-chart-3" as KPIIconName,
      color: "violet",
      label: "Gross Profit",
      value: formatCurrency(detail.financial.grossProfit),
      link: "",
      sparkColor: "#a78bfa",
      sparkPoints: "0,35 55,30 110,28 165,22 220,18",
    },
    {
      icon: "percent" as KPIIconName,
      color: "green",
      label: "Net Profit",
      value: formatCurrency(detail.financial.netProfit),
      link: "",
      sparkColor: "#22c55e",
      sparkPoints: "0,38 55,32 110,28 165,24 220,20",
    },
  ];
}

export default function DealJacketMetricCards({
  detail,
  className,
}: {
  detail: DealJacketDetail;
  className?: string;
}) {
  const kpis = buildHeroKpis(detail);

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-2 lg:grid-cols-4 lg:grid-rows-1",
        className,
      )}
    >
      {kpis.map((data) => (
        <KPICard
          key={data.label}
          data={data}
          showSparkline={false}
          showLink={false}
          className="min-h-[76px] rounded-md border-slate-800/80 bg-[var(--bg-primary)] p-2.5"
        />
      ))}
    </div>
  );
}
