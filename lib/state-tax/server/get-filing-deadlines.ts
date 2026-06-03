/**
 * State tax / CDTFA filing deadlines derived from dealership calendar config.
 * Replace with persisted state-tax config when that module gains a DB layer.
 */

export type FilingDeadline = {
  id: string;
  title: string;
  date: string;
  description?: string;
};

const ANNUAL_DEADLINES: Array<{ month: number; day: number; title: string; description?: string }> = [
  { month: 1, day: 31, title: "CDTFA Annual Filing", description: "California CDTFA annual filing deadline" },
  { month: 4, day: 15, title: "Tax Filing Deadline", description: "Federal and state tax filing deadline" },
  { month: 6, day: 1, title: "Insurance Renewal", description: "Dealership insurance policy renewal" },
  { month: 2, day: 28, title: "CPA Year-End Review", description: "Schedule CPA year-end review" },
];

const QUARTERLY_SALES_TAX = [
  { month: 1, day: 31, title: "Q4 Sales Tax Due" },
  { month: 4, day: 30, title: "Q1 Sales Tax Due" },
  { month: 7, day: 31, title: "Q2 Sales Tax Due" },
  { month: 10, day: 31, title: "Q3 Sales Tax Due" },
];

export function getStateTaxFilingDeadlines(from: string, to: string): FilingDeadline[] {
  const fromYear = Number(from.slice(0, 4));
  const toYear = Number(to.slice(0, 4));
  const results: FilingDeadline[] = [];

  for (let year = fromYear; year <= toYear + 1; year++) {
    for (const d of ANNUAL_DEADLINES) {
      const date = `${year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
      if (date >= from && date <= to) {
        results.push({
          id: `tax-annual-${year}-${d.month}`,
          title: d.title,
          date,
          description: d.description,
        });
      }
    }
    for (const d of QUARTERLY_SALES_TAX) {
      const date = `${year}-${String(d.month).padStart(2, "0")}-${String(d.day).padStart(2, "0")}`;
      if (date >= from && date <= to) {
        results.push({
          id: `tax-q-${year}-${d.month}`,
          title: d.title,
          date,
        });
      }
    }
  }

  return results.sort((a, b) => a.date.localeCompare(b.date));
}

export function getYearlyComplianceEvents(from: string, to: string): FilingDeadline[] {
  return getStateTaxFilingDeadlines(from, to).filter(
    (e) => e.title.includes("Annual") || e.title.includes("Tax Filing") || e.title.includes("CPA"),
  );
}
