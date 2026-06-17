export const DEAL_TYPES = ["Retail", "Wholesale", "Fleet"] as const;

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export const REQUIRED_DOCUMENTS = [
  { key: "buyersOrder", label: "Buyer's Order" },
  { key: "driverLicense", label: "Driver License" },
  { key: "insuranceCard", label: "Insurance Card" },
  { key: "signedContract", label: "Signed Contract" },
  { key: "fundingAgreement", label: "Funding Agreement" },
  { key: "tradeInDocuments", label: "Trade-In Documents" },
  { key: "warrantyDocument", label: "Warranty Document" },
] as const;
