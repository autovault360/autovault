/** Pixel values from autovault-dashboard_76.html :root and module CSS */
export const AV = {
  panel: "#10151f",
  panel2: "#141b27",
  border: "#1f2733",
  text: "#e7ecf3",
  muted: "#7c8aa0",
  blue: "#3aa0ff",
  green: "#23d18b",
  orange: "#ff9f43",
  purple: "#a07bff",
  red: "#ff5470",
} as const;

export const AV_ACCENT = {
  blue: AV.blue,
  green: AV.green,
  orange: AV.orange,
  purple: AV.purple,
  red: AV.red,
} as const;

export type AvAccent = keyof typeof AV_ACCENT;

export const FIN_MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;
