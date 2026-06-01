export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatShortDate(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDayHeader(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const day = date.toLocaleDateString("en-US", { weekday: "short" });
  const month = date.getMonth() + 1;
  const dayNum = date.getDate();
  return `${day} ${month}/${dayNum}`;
}

export function formatWeekRange(weekStart: string): string {
  const start = parseLocalDate(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return `${startStr} - ${endStr}`;
}

export function parseLocalDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`);
}

export function addDays(dateStr: string, days: number): string {
  const date = parseLocalDate(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function getWeekStart(dateStr: string): string {
  const date = parseLocalDate(dateStr);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
  const a = parseLocalDate(from);
  const b = parseLocalDate(to);
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}
