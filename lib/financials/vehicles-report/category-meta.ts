import { AV } from "@/lib/ui/autovault-design-tokens";

export type HtmlVehicleCategory =
  | "Trucks"
  | "SUVs"
  | "Sedans"
  | "Coupes"
  | "EVs"
  | "Vans"
  | "Luxury";

export const CATEGORY_ORDER: HtmlVehicleCategory[] = [
  "Trucks",
  "SUVs",
  "Sedans",
  "Coupes",
  "EVs",
  "Vans",
];

export const CATEGORY_META: Record<
  HtmlVehicleCategory,
  { accent: string }
> = {
  Trucks: { accent: AV.blue },
  SUVs: { accent: AV.orange },
  Sedans: { accent: AV.blue },
  Coupes: { accent: AV.purple },
  EVs: { accent: AV.green },
  Vans: { accent: AV.orange },
  Luxury: { accent: AV.purple },
};

export function normalizeHtmlCategory(
  bodyStyle: string | null | undefined,
  model: string,
  make?: string | null,
): HtmlVehicleCategory {
  const text = `${bodyStyle ?? ""} ${model} ${make ?? ""}`.toLowerCase();

  if (
    text.includes("truck") ||
    text.includes("pickup") ||
    text.includes("f-150") ||
    text.includes("silverado") ||
    text.includes("sierra") ||
    text.includes("ram")
  ) {
    return "Trucks";
  }
  if (
    text.includes("suv") ||
    text.includes("crossover") ||
    text.includes("wagon") ||
    text.includes("rav4") ||
    text.includes("cherokee") ||
    text.includes("explorer")
  ) {
    return "SUVs";
  }
  if (text.includes("coupe") || text.includes("camaro") || text.includes("mustang")) {
    return "Coupes";
  }
  if (
    text.includes("ev") ||
    text.includes("electric") ||
    text.includes("tesla") ||
    text.includes("ev6") ||
    text.includes("model 3") ||
    text.includes("model y")
  ) {
    return "EVs";
  }
  if (text.includes("van") || text.includes("transit") || text.includes("sprinter")) {
    return "Vans";
  }
  if (
    text.includes("luxury") ||
    text.includes("mercedes") ||
    text.includes("bmw") ||
    text.includes("audi") ||
    text.includes("lexus") ||
    text.includes("porsche")
  ) {
    return "Luxury";
  }
  if (text.includes("sedan") || text.includes("accord") || text.includes("camry")) {
    return "Sedans";
  }

  return "Sedans";
}
