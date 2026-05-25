type VinDecodeResult = {
  year: string;
  make: string;
  model: string;
  trim: string;
  bodyStyle: string;
  driveType: string;
  fuelType: string;
};

const MAKE_ALIASES: Record<string, string> = {
  MERCEDES: "mercedes",
  "MERCEDES-BENZ": "mercedes",
  "MERCEDES BENZ": "mercedes",
  BMW: "bmw",
  AUDI: "audi",
  TOYOTA: "toyota",
  HONDA: "honda",
  FORD: "ford",
  CHEVROLET: "chevrolet",
  CHEVY: "chevrolet",
  LEXUS: "lexus",
};

const MODEL_ALIASES: Record<string, Record<string, string>> = {
  bmw: { X5: "x5", X3: "x3" },
  mercedes: { "E 350": "e350", "C 300": "c300", GLE: "gle" },
  audi: { Q5: "q5", A4: "a4", Q7: "q7" },
  toyota: { CAMRY: "camry", RAV4: "rav4" },
  honda: { ACCORD: "accord", "CR-V": "cr_v" },
  ford: { "F-150": "f150", EXPLORER: "explorer" },
  chevrolet: { SILVERADO: "silverado", EQUINOX: "equinox" },
  lexus: { "RX 350": "rx350", "ES 350": "es350" },
};

function normalizeMake(raw: string): string {
  const cleaned = raw.trim().toUpperCase();
  return MAKE_ALIASES[cleaned] ?? cleaned.toLowerCase();
}

function normalizeModel(make: string, raw: string): string {
  const cleaned = raw.trim();
  const makeModels = MODEL_ALIASES[make];
  if (makeModels) {
    return makeModels[cleaned.toUpperCase()] ?? cleaned.toLowerCase().replace(/\s+/g, "_");
  }
  return cleaned.toLowerCase().replace(/\s+/g, "_");
}

function normalizeBodyClass(raw: string): string {
  if (!raw || raw === "") return "";
  const upper = raw.toUpperCase();
  if (upper.includes("SUV") || upper.includes("SPORT UTILITY")) return "suv";
  if (upper.includes("SEDAN")) return "sedan";
  if (upper.includes("COUPE")) return "coupe";
  if (upper.includes("TRUCK") || upper.includes("PICKUP")) return "truck";
  if (upper.includes("HATCHBACK")) return "hatchback";
  if (upper.includes("VAN") || upper.includes("MINIVAN")) return "van";
  if (upper.includes("WAGON")) return "sedan";
  if (upper.includes("CONVERTIBLE")) return "coupe";
  return "";
}

function normalizeDriveType(raw: string): string {
  if (!raw || raw === "") return "";
  const upper = raw.toUpperCase();
  if (upper.includes("FWD") || upper.includes("FRONT")) return "fwd";
  if (upper.includes("RWD") || upper.includes("REAR")) return "rwd";
  if (upper.includes("AWD") || upper.includes("ALL")) return "awd";
  if (upper.includes("4WD") || upper.includes("4-WHEEL")) return "4wd";
  return "";
}

function normalizeFuelType(raw: string): string {
  if (!raw || raw === "") return "";
  const upper = raw.toUpperCase();
  if (upper.includes("GASOLINE") || upper.includes("GAS")) return "gasoline";
  if (upper.includes("DIESEL")) return "diesel";
  if (upper.includes("HYBRID") && upper.includes("PLUG")) return "plug_in_hybrid";
  if (upper.includes("HYBRID")) return "hybrid";
  if (upper.includes("ELECTRIC")) return "electric";
  return "";
}

export async function decodeVin(vin: string): Promise<VinDecodeResult> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/${vin}?format=json`;

  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (!res.ok) {
    throw new Error("Failed to reach VIN decoder service");
  }

  const json = await res.json();
  const results = json.Results?.[0];

  if (!results) {
    throw new Error("No data returned from VIN decoder");
  }

  if (results.ErrorCode && results.ErrorCode !== "0") {
    throw new Error(results.ErrorText || "Invalid VIN");
  }

  if (results.VIN && results.VIN !== vin) {
    throw new Error("VIN check digit mismatch");
  }

  const rawMake = results.Make ?? "";
  const make = normalizeMake(rawMake);

  return {
    year: results.ModelYear ?? "",
    make,
    model: normalizeModel(make, results.Model ?? ""),
    trim: results.Trim ?? "",
    bodyStyle: normalizeBodyClass(results.BodyClass ?? ""),
    driveType: normalizeDriveType(results.DriveType ?? ""),
    fuelType: normalizeFuelType(results.FuelTypePrimary ?? ""),
  };
}
