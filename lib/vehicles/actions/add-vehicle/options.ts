export const VEHICLE_YEARS = Array.from({ length: 25 }, (_, i) => {
  const year = new Date().getFullYear() + 1 - i;
  return { value: String(year), label: String(year) };
});

export const VEHICLE_MAKES = [
  { value: "bmw", label: "BMW" },
  { value: "mercedes", label: "Mercedes-Benz" },
  { value: "audi", label: "Audi" },
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "ford", label: "Ford" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "lexus", label: "Lexus" },
] as const;

export const VEHICLE_MODELS: Record<string, { value: string; label: string }[]> = {
  bmw: [
    { value: "x5", label: "X5" },
    { value: "x3", label: "X3" },
    { value: "3_series", label: "3 Series" },
  ],
  mercedes: [
    { value: "e350", label: "E 350" },
    { value: "c300", label: "C 300" },
    { value: "gle", label: "GLE" },
  ],
  audi: [
    { value: "q5", label: "Q5" },
    { value: "a4", label: "A4" },
    { value: "q7", label: "Q7" },
  ],
  toyota: [
    { value: "camry", label: "Camry" },
    { value: "rav4", label: "RAV4" },
  ],
  honda: [
    { value: "accord", label: "Accord" },
    { value: "cr_v", label: "CR-V" },
  ],
  ford: [
    { value: "f150", label: "F-150" },
    { value: "explorer", label: "Explorer" },
  ],
  chevrolet: [
    { value: "silverado", label: "Silverado" },
    { value: "equinox", label: "Equinox" },
  ],
  lexus: [
    { value: "rx350", label: "RX 350" },
    { value: "es350", label: "ES 350" },
  ],
};

export const BODY_STYLES = [
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "coupe", label: "Coupe" },
  { value: "truck", label: "Truck" },
  { value: "hatchback", label: "Hatchback" },
  { value: "van", label: "Van" },
] as const;

export const EXTERIOR_COLORS = [
  { value: "white", label: "White", swatch: "#ffffff" },
  { value: "black", label: "Black", swatch: "#1a1a1a" },
  { value: "silver", label: "Silver", swatch: "#c0c0c0" },
  { value: "gray", label: "Gray", swatch: "#6b7280" },
  { value: "blue", label: "Blue", swatch: "#2563eb" },
  { value: "red", label: "Red", swatch: "#dc2626" },
] as const;

export const INTERIOR_COLORS = [
  { value: "black", label: "Black", swatch: "#1a1a1a" },
  { value: "beige", label: "Beige", swatch: "#d4c4a8" },
  { value: "gray", label: "Gray", swatch: "#6b7280" },
  { value: "brown", label: "Brown", swatch: "#78350f" },
] as const;

export const DRIVE_TYPES = [
  { value: "fwd", label: "FWD" },
  { value: "rwd", label: "RWD" },
  { value: "awd", label: "AWD" },
  { value: "4wd", label: "4WD" },
] as const;

export const LOT_LOCATIONS = [
  { value: "main_lot", label: "Main Lot" },
  { value: "overflow", label: "Overflow Lot" },
  { value: "service", label: "Service Lane" },
  { value: "offsite", label: "Offsite Storage" },
] as const;

export const PURCHASE_TYPES = [
  { value: "auction", label: "Auction" },
  { value: "trade_in", label: "Trade-In" },
  { value: "private_party", label: "Private Party" },
  { value: "dealer", label: "Dealer Purchase" },
] as const;

export const TITLE_STATUSES = [
  { value: "clean", label: "Clean" },
  { value: "salvage", label: "Salvage" },
  { value: "rebuilt", label: "Rebuilt" },
  { value: "pending", label: "Pending" },
] as const;

export const ODOMETER_STATUSES = [
  { value: "actual", label: "Actual" },
  { value: "not_actual", label: "Not Actual" },
  { value: "exempt", label: "Exempt" },
] as const;

export const FUEL_TYPES = [
  { value: "gasoline", label: "Gasoline" },
  { value: "diesel", label: "Diesel" },
  { value: "hybrid", label: "Hybrid" },
  { value: "electric", label: "Electric" },
  { value: "plug_in_hybrid", label: "Plug-in Hybrid" },
] as const;

export { US_STATES } from "../options";
