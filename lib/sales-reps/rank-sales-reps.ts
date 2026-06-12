type RankableSalesRep = {
  id: string;
  totalSales: number;
  grossProfit: number;
  unitsSold: number;
};

/** Rank reps by total sales, then gross profit, then units sold. */
export function buildSalesRepRankMap(
  reps: RankableSalesRep[],
): Map<string, number> {
  const sorted = [...reps].sort((a, b) => {
    if (b.totalSales !== a.totalSales) return b.totalSales - a.totalSales;
    if (b.grossProfit !== a.grossProfit) return b.grossProfit - a.grossProfit;
    if (b.unitsSold !== a.unitsSold) return b.unitsSold - a.unitsSold;
    return a.id.localeCompare(b.id);
  });

  return new Map(sorted.map((rep, index) => [rep.id, index + 1]));
}

export function getSalesRepRank(
  rankByRepId: Map<string, number>,
  repId: string,
): number {
  return rankByRepId.get(repId) ?? 0;
}
