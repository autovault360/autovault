const SOURCE_LABELS: Record<string, string> = {
  deal_jacket: "Deal Jacket",
  customer: "Customer",
  document_center: "Document Center",
  vehicle: "Vehicle",
};

export function getSourceLabel(sourceEntity: string | null): string {
  if (!sourceEntity) return "Other";
  return SOURCE_LABELS[sourceEntity] ?? sourceEntity;
}
