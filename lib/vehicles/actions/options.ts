export const PRICING_STRATEGIES = [
  { value: "price_reduction", label: "Price Reduction" },
  { value: "price_increase", label: "Price Increase" },
  { value: "market_match", label: "Market Match" },
  { value: "promotional", label: "Promotional Pricing" },
] as const;

export const PRICE_UPDATE_REASONS = [
  { value: "slow_market", label: "Slow Market / No Activity" },
  { value: "competitive", label: "Competitive Adjustment" },
  { value: "aged_inventory", label: "Aged Inventory" },
  { value: "market_increase", label: "Market Value Increase" },
  { value: "promotion", label: "Promotion / Sale Event" },
  { value: "other", label: "Other" },
] as const;

export const REPAIR_CATEGORIES = [
  { value: "mechanical", label: "Mechanical" },
  { value: "body", label: "Body / Paint" },
  { value: "interior", label: "Interior" },
  { value: "electrical", label: "Electrical" },
  { value: "detailing", label: "Detailing" },
  { value: "other", label: "Other" },
] as const;

export const REPAIR_TYPES = [
  { value: "engine", label: "Engine" },
  { value: "transmission", label: "Transmission" },
  { value: "brakes", label: "Brakes" },
  { value: "suspension", label: "Suspension" },
  { value: "body_work", label: "Body Work" },
  { value: "paint", label: "Paint" },
  { value: "other", label: "Other" },
] as const;

export const REPAIR_PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
] as const;

export const VENDORS = [
  { value: "precision_auto", label: "Precision Auto Repair" },
  { value: "in_house", label: "In-House Shop" },
  { value: "dealership_service", label: "Dealership Service Center" },
  { value: "other", label: "Other Vendor" },
] as const;

export const PAYMENT_METHODS = [
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
  { value: "credit_card", label: "Credit Card" },
  { value: "ach", label: "ACH / Wire" },
  { value: "account", label: "Shop Account" },
] as const;

export const PAYMENT_STATUSES = [
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "partial", label: "Partially Paid" },
  { value: "unpaid", label: "Unpaid" },
] as const;

export const CUSTOMER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "wholesale", label: "Wholesale" },
  { value: "dealer", label: "Dealer" },
] as const;

export const US_STATES = [
  { value: "AL", label: "AL" },
  { value: "AK", label: "AK" },
  { value: "AZ", label: "AZ" },
  { value: "AR", label: "AR" },
  { value: "CA", label: "CA" },
  { value: "CO", label: "CO" },
  { value: "CT", label: "CT" },
  { value: "DE", label: "DE" },
  { value: "FL", label: "FL" },
  { value: "GA", label: "GA" },
  { value: "HI", label: "HI" },
  { value: "ID", label: "ID" },
  { value: "IL", label: "IL" },
  { value: "IN", label: "IN" },
  { value: "IA", label: "IA" },
  { value: "KS", label: "KS" },
  { value: "KY", label: "KY" },
  { value: "LA", label: "LA" },
  { value: "ME", label: "ME" },
  { value: "MD", label: "MD" },
  { value: "MA", label: "MA" },
  { value: "MI", label: "MI" },
  { value: "MN", label: "MN" },
  { value: "MS", label: "MS" },
  { value: "MO", label: "MO" },
  { value: "MT", label: "MT" },
  { value: "NE", label: "NE" },
  { value: "NV", label: "NV" },
  { value: "NH", label: "NH" },
  { value: "NJ", label: "NJ" },
  { value: "NM", label: "NM" },
  { value: "NY", label: "NY" },
  { value: "NC", label: "NC" },
  { value: "ND", label: "ND" },
  { value: "OH", label: "OH" },
  { value: "OK", label: "OK" },
  { value: "OR", label: "OR" },
  { value: "PA", label: "PA" },
  { value: "RI", label: "RI" },
  { value: "SC", label: "SC" },
  { value: "SD", label: "SD" },
  { value: "TN", label: "TN" },
  { value: "TX", label: "TX" },
  { value: "UT", label: "UT" },
  { value: "VT", label: "VT" },
  { value: "VA", label: "VA" },
  { value: "WA", label: "WA" },
  { value: "WV", label: "WV" },
  { value: "WI", label: "WI" },
  { value: "WY", label: "WY" },
] as const;

export const LOSS_REASONS = [
  { value: "theft", label: "Theft" },
  { value: "accident", label: "Accident / Damage" },
  { value: "flood", label: "Flood / Water Damage" },
  { value: "mechanical_failure", label: "Mechanical Failure" },
  { value: "title_issue", label: "Title Issue" },
  { value: "other", label: "Other" },
] as const;

export const LOSS_TYPES = [
  { value: "total_loss", label: "Total Loss" },
  { value: "partial_loss", label: "Partial Loss" },
  { value: "write_off", label: "Write-Off" },
  { value: "insurance_claim", label: "Insurance Claim" },
] as const;
