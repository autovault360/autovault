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
  bmw: { X5: "x5", "X5 M": "x5", X3: "x3", "X3 M": "x3", "3": "3_series", "3 SERIES": "3_series" },
  mercedes: { "E 350": "e350", E350: "e350", "C 300": "c300", C300: "c300", GLE: "gle", GLC: "c300", CLA: "c300" },
  audi: { Q5: "q5", A4: "a4", Q7: "q7", Q3: "q5", A3: "a4", A5: "a4", A6: "a4" },
  toyota: { CAMRY: "camry", RAV4: "rav4", COROLLA: "camry", HIGHLANDER: "rav4" },
  honda: { ACCORD: "accord", "CR-V": "cr_v", CIVIC: "accord" },
  ford: { "F-150": "f150", EXPLORER: "explorer", "MUSTANG": "explorer", "ESCAPE": "explorer" },
  chevrolet: { SILVERADO: "silverado", EQUINOX: "equinox", TAHOE: "silverado", SUBURBAN: "silverado" },
  lexus: { "RX 350": "rx350", "ES 350": "es350", "NX": "rx350" },
};

function normalizeMake(raw: string): string {
  const cleaned = raw.trim().toUpperCase();
  return MAKE_ALIASES[cleaned] ?? cleaned.toLowerCase();
}

function normalizeModel(make: string, raw: string): string {
  const cleaned = raw.trim();
  if (!cleaned) return "";
  const makeModels = MODEL_ALIASES[make];
  if (makeModels) {
    const upper = cleaned.toUpperCase();
    if (makeModels[upper]) return makeModels[upper];
    const sortedKeys = Object.keys(makeModels).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (upper.startsWith(key)) return makeModels[key];
    }
    return cleaned.toLowerCase().replace(/\s+/g, "_");
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
    throw new Error("VIN is not correct");
  }

  if (results.VIN && results.VIN !== vin) {
    throw new Error("VIN is not correct");
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
