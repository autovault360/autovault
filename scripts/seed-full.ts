/**
 * AutoVault360 — Full System Seeder
 *
 * Seeds ALL modules with properly related sample data.
 * Uses Supabase service_role key (bypasses RLS).
 * Auto-rollback on error.
 *
 * Usage:
 *   npx tsx scripts/seed-full.ts                          # use first active dealership
 *   npx tsx scripts/seed-full.ts --dealership-id <uuid>   # specific dealership
 *   npx tsx scripts/seed-full.ts --force                  # overwrite existing
 *   npx tsx scripts/seed-full.ts --cleanup                # remove all seeded data
 *   npx tsx scripts/seed-full.ts --skip-auth              # skip creating auth users
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ─────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────
const SEED_PASSWORD = "SeedRep123!";
const SCRIPT_LABEL = "seed-full";

// ─────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────
type SeedArgs = {
  dealershipId?: string;
  force: boolean;
  cleanup: boolean;
  skipAuth: boolean;
};

type TrackedIds = {
  authUserIds: string[];
  userIds: string[];
  cpaProfileIds: string[];
  vehicleIds: string[];
  vehicleImageIds: string[];
  vehicleExpenseIds: string[];
  vehicleLossIds: string[];
  pricingHistoryIds: string[];
  customerIds: string[];
  customerNoteIds: string[];
  customerCommIds: string[];
  customerDocIds: string[];
  dealIds: string[];
  dealJacketIds: string[];
  dealJacketDocIds: string[];
  dealershipExpenseIds: string[];
  cpaNoteIds: string[];
  cpaCommentIds: string[];
  cpaActivityIds: string[];
  cpaAttachmentIds: string[];
  calendarEventIds: string[];
  fileIds: string[];
  statusHistoryIds: string[];
};

function emptyTracker(): TrackedIds {
  return {
    authUserIds: [],
    userIds: [],
    cpaProfileIds: [],
    vehicleIds: [],
    vehicleImageIds: [],
    vehicleExpenseIds: [],
    vehicleLossIds: [],
    pricingHistoryIds: [],
    customerIds: [],
    customerNoteIds: [],
    customerCommIds: [],
    customerDocIds: [],
    dealIds: [],
    dealJacketIds: [],
    dealJacketDocIds: [],
    dealershipExpenseIds: [],
    cpaNoteIds: [],
    cpaCommentIds: [],
    cpaActivityIds: [],
    cpaAttachmentIds: [],
    calendarEventIds: [],
    fileIds: [],
    statusHistoryIds: [],
  };
}

// ─────────────────────────────────────────────────────────
// Data Definitions
// ─────────────────────────────────────────────────────────
const OWNER = {
  fullName: "John Dealer",
  email: "john.dealer@autovault360.test",
  phone: "(916) 555-0001",
  role: "owner" as const,
  isActive: true,
};

const MANAGER = {
  fullName: "Emily Chen",
  email: "emily.chen@autovault360.test",
  phone: "(408) 555-0104",
  role: "manager" as const,
  isActive: true,
  commissionRate: 0.15,
  monthlyGoal: 75000,
  hireDate: "2021-05-20",
  address: "2001 Stevens Creek Blvd",
  city: "San Jose",
  state: "CA",
  zip: "95128",
};

const SALES_REPS = [
  {
    fullName: "Marcus Johnson",
    email: "marcus.johnson@autovault360.test",
    phone: "(415) 555-0101",
    role: "sales_rep" as const,
    isActive: true,
    commissionRate: 0.10,
    monthlyGoal: 50000,
    hireDate: "2023-03-15",
    address: "1240 Market St",
    city: "San Francisco",
    state: "CA",
    zip: "94102",
  },
  {
    fullName: "Sarah Williams",
    email: "sarah.williams@autovault360.test",
    phone: "(415) 555-0102",
    role: "sales_rep" as const,
    isActive: true,
    commissionRate: 0.12,
    monthlyGoal: 60000,
    hireDate: "2022-08-01",
    address: "88 Valencia St",
    address2: "Apt 4B",
    city: "San Francisco",
    state: "CA",
    zip: "94103",
  },
  {
    fullName: "Mike Thompson",
    email: "mike.thompson@autovault360.test",
    phone: "(510) 555-0103",
    role: "sales_rep" as const,
    isActive: true,
    commissionRate: 0.08,
    monthlyGoal: 45000,
    hireDate: "2024-01-10",
    address: "450 Broadway",
    city: "Oakland",
    state: "CA",
    zip: "94607",
  },
];

const CPA_USER = {
  fullName: "Wilson & Associates CPA",
  email: "cpa@autovault360.test",
  phone: "(916) 555-0002",
  role: "cpa" as const,
  isActive: true,
  firstName: "Wilson",
  lastName: "Associates",
  firmName: "Wilson & Associates CPA",
  licenseNumber: "CPA-2024-CA-0842",
};

const SUPER_ADMIN = {
  fullName: "Super Admin",
  email: "admin@autovault.com",
  phone: "(916) 555-0000",
  role: "super_admin" as const,
  isActive: true,
};

type VehicleSeed = {
  year: number;
  make: string;
  model: string;
  trim?: string;
  stockNumber: string;
  vin: string;
  bodyStyle: string;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
  drivetrain: string;
  fuelType: string;
  engine: string;
  transmission: string;
  acquisitionCost: number;
  askingPrice: number;
  reconditioningCost: number;
  totalInvested: number;
  status: "in_stock" | "sold";
  lotLocation: string;
};

const VEHICLES: VehicleSeed[] = [
  { year: 2021, make: "Ford", model: "F-150", trim: "XLT", stockNumber: "1001", vin: "1FTFW1E55MFB12345", bodyStyle: "Truck", mileage: 32450, exteriorColor: "Oxford White", interiorColor: "Medium Earth Gray", drivetrain: "4WD", fuelType: "Gasoline", engine: "3.5L V6 EcoBoost", transmission: "10-Speed Automatic", acquisitionCost: 28500, askingPrice: 34995, reconditioningCost: 850, totalInvested: 29350, status: "in_stock", lotLocation: "A-12" },
  { year: 2022, make: "Honda", model: "CR-V", trim: "EX", stockNumber: "1002", vin: "2HKRW2H85NH123456", bodyStyle: "SUV", mileage: 22100, exteriorColor: "Modern Steel Metallic", interiorColor: "Black", drivetrain: "AWD", fuelType: "Gasoline", engine: "1.5L I4 Turbo", transmission: "CVT", acquisitionCost: 22500, askingPrice: 26900, reconditioningCost: 450, totalInvested: 22950, status: "in_stock", lotLocation: "B-04" },
  { year: 2020, make: "Ford", model: "Mustang", trim: "GT", stockNumber: "1003", vin: "1FA6P8CF0L5123456", bodyStyle: "Coupe", mileage: 18400, exteriorColor: "Race Red", interiorColor: "Ebony", drivetrain: "RWD", fuelType: "Gasoline", engine: "5.0L V8", transmission: "6-Speed Manual", acquisitionCost: 24500, askingPrice: 29995, reconditioningCost: 720, totalInvested: 25220, status: "in_stock", lotLocation: "A-08" },
  { year: 2021, make: "Toyota", model: "Camry", trim: "SE", stockNumber: "1004", vin: "4T1B11HKXJU123678", bodyStyle: "Sedan", mileage: 28500, exteriorColor: "Celestial Silver", interiorColor: "Black", drivetrain: "FWD", fuelType: "Gasoline", engine: "2.5L I4", transmission: "8-Speed Automatic", acquisitionCost: 17500, askingPrice: 21995, reconditioningCost: 380, totalInvested: 17880, status: "in_stock", lotLocation: "C-01" },
  { year: 2019, make: "BMW", model: "3 Series", trim: "330i", stockNumber: "1005", vin: "WBA5R1C50KA123987", bodyStyle: "Sedan", mileage: 34200, exteriorColor: "Alpine White", interiorColor: "Cognac", drivetrain: "RWD", fuelType: "Gasoline", engine: "2.0L I4 Turbo", transmission: "8-Speed Automatic", acquisitionCost: 20500, askingPrice: 25995, reconditioningCost: 1100, totalInvested: 21600, status: "sold", lotLocation: "B-12" },
  { year: 2022, make: "Chevrolet", model: "Equinox", trim: "LT", stockNumber: "1006", vin: "3GNAXUEV3NS123456", bodyStyle: "SUV", mileage: 15800, exteriorColor: "Summit White", interiorColor: "Jet Black", drivetrain: "AWD", fuelType: "Gasoline", engine: "1.5L I4 Turbo", transmission: "6-Speed Automatic", acquisitionCost: 19800, askingPrice: 24995, reconditioningCost: 320, totalInvested: 20120, status: "in_stock", lotLocation: "C-06" },
  { year: 2020, make: "Honda", model: "Accord", trim: "LX", stockNumber: "1008", vin: "1HGCV1F14LA123456", bodyStyle: "Sedan", mileage: 31200, exteriorColor: "Crystal Black Pearl", interiorColor: "Black", drivetrain: "FWD", fuelType: "Gasoline", engine: "1.5L I4 Turbo", transmission: "CVT", acquisitionCost: 14200, askingPrice: 18900, reconditioningCost: 320, totalInvested: 14520, status: "sold", lotLocation: "A-01" },
  { year: 2021, make: "Tesla", model: "Model 3", trim: "Long Range", stockNumber: "1010", vin: "5YJ3E1EB5MF123456", bodyStyle: "Sedan", mileage: 18500, exteriorColor: "Pearl White", interiorColor: "Black", drivetrain: "AWD", fuelType: "Electric", engine: "Dual Motor", transmission: "Single Speed", acquisitionCost: 28500, askingPrice: 34995, reconditioningCost: 200, totalInvested: 28700, status: "sold", lotLocation: "B-09" },
  { year: 2023, make: "Hyundai", model: "Tucson", trim: "SEL", stockNumber: "1011", vin: "KM8J3CE6XPU123456", bodyStyle: "SUV", mileage: 9800, exteriorColor: "Deep Sea Blue", interiorColor: "Gray", drivetrain: "AWD", fuelType: "Gasoline", engine: "2.5L I4", transmission: "8-Speed Automatic", acquisitionCost: 23800, askingPrice: 28995, reconditioningCost: 180, totalInvested: 23980, status: "sold", lotLocation: "A-15" },
  { year: 2020, make: "Jeep", model: "Grand Cherokee", trim: "Limited", stockNumber: "1013", vin: "1C4RJFBG3LC123456", bodyStyle: "SUV", mileage: 36800, exteriorColor: "Granite Crystal", interiorColor: "Light Frost", drivetrain: "4WD", fuelType: "Gasoline", engine: "3.6L V6", transmission: "8-Speed Automatic", acquisitionCost: 26500, askingPrice: 31995, reconditioningCost: 950, totalInvested: 27450, status: "sold", lotLocation: "B-02" },
  { year: 2019, make: "Chevrolet", model: "Silverado 1500", trim: "LT", stockNumber: "0989", vin: "3GCPYBEK2KG123456", bodyStyle: "Truck", mileage: 52400, exteriorColor: "Black", interiorColor: "Dark Ash", drivetrain: "4WD", fuelType: "Gasoline", engine: "5.3L V8", transmission: "6-Speed Automatic", acquisitionCost: 24800, askingPrice: 29995, reconditioningCost: 680, totalInvested: 25480, status: "sold", lotLocation: "C-10" },
  { year: 2021, make: "Nissan", model: "Rogue", trim: "SV", stockNumber: "1014", vin: "5N1AT3BB3MC123456", bodyStyle: "SUV", mileage: 14200, exteriorColor: "Gun Metallic", interiorColor: "Charcoal", drivetrain: "AWD", fuelType: "Gasoline", engine: "2.5L I4", transmission: "CVT", acquisitionCost: 21200, askingPrice: 26495, reconditioningCost: 280, totalInvested: 21480, status: "in_stock", lotLocation: "A-05" },
];

type CustomerSeed = {
  name: string;
  phone: string;
  email: string;
  type: "individual" | "dealer";
  status: "customer" | "active_deal" | "lead";
  salesRepIndex: number; // index into SALES_REPS
  source: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};

const CUSTOMERS: CustomerSeed[] = [
  { name: "Michael Johnson", phone: "(916) 555-7890", email: "michael.johnson@email.test", type: "individual", status: "customer", salesRepIndex: 1, source: "referral", address: "4521 Oak Ave", city: "Sacramento", state: "CA", zip: "95814" },
  { name: "David Martinez", phone: "(916) 444-2311", email: "david.martinez@email.test", type: "individual", status: "customer", salesRepIndex: 2, source: "website", address: "887 Elm St", city: "Sacramento", state: "CA", zip: "95816" },
  { name: "James Anderson", phone: "(916) 555-6622", email: "james.anderson@email.test", type: "individual", status: "customer", salesRepIndex: 1, source: "walk_in", address: "231 Pine Rd", city: "Roseville", state: "CA", zip: "95678" },
  { name: "Robert Brown", phone: "(916) 777-3344", email: "robert.brown@email.test", type: "individual", status: "customer", salesRepIndex: 2, source: "referral", address: "1654 Maple Dr", city: "Citrus Heights", state: "CA", zip: "95621" },
  { name: "Jessica Davis", phone: "(916) 555-9811", email: "jessica.davis@email.test", type: "individual", status: "customer", salesRepIndex: 0, source: "website", address: "754 Sunset Blvd", city: "Elk Grove", state: "CA", zip: "95758" },
  { name: "Christopher Wilson", phone: "(916) 444-7755", email: "chris.wilson@email.test", type: "individual", status: "customer", salesRepIndex: 1, source: "social_media", address: "321 River Way", city: "Sacramento", state: "CA", zip: "95818" },
  { name: "Brian Taylor", phone: "(916) 333-2288", email: "brian.taylor@email.test", type: "individual", status: "customer", salesRepIndex: 2, source: "referral", address: "890 Lake Blvd", city: "Folsom", state: "CA", zip: "95630" },
  { name: "Amanda Lee", phone: "(916) 888-6677", email: "amanda.lee@email.test", type: "individual", status: "customer", salesRepIndex: 0, source: "ads", address: "567 Park Ave", city: "Sacramento", state: "CA", zip: "95825" },
  { name: "Thomas Wright", phone: "(916) 555-4433", email: "thomas.wright@email.test", type: "individual", status: "lead", salesRepIndex: 0, source: "website", address: "112 College St", city: "Davis", state: "CA", zip: "95616" },
  { name: "Sophia Garcia", phone: "(916) 555-1122", email: "sophia.garcia@email.test", type: "individual", status: "active_deal", salesRepIndex: 1, source: "referral", address: "433 Mission Blvd", city: "Sacramento", state: "CA", zip: "95819" },
];

type DealSeed = {
  vehicleIndex: number;
  customerIndex: number;
  saleDate: string;
  salePrice: number;
  salesTax: number;
  totalCollected: number;
  salesRepIndex: number;
};

const SOLD_VEHICLE_INDICES = VEHICLES.map((v, i) => v.status === "sold" ? i : -1).filter(i => i >= 0);
const DEALS: DealSeed[] = [
  { vehicleIndex: SOLD_VEHICLE_INDICES[0], customerIndex: 0, saleDate: "2025-05-31", salePrice: 18900, salesTax: 1512, totalCollected: 20412, salesRepIndex: 1 },
  { vehicleIndex: SOLD_VEHICLE_INDICES[1], customerIndex: 4, saleDate: "2025-05-27", salePrice: 32750, salesTax: 2620, totalCollected: 35370, salesRepIndex: 0 },
  { vehicleIndex: SOLD_VEHICLE_INDICES[2], customerIndex: 5, saleDate: "2025-05-23", salePrice: 27800, salesTax: 2224, totalCollected: 30024, salesRepIndex: 1 },
  { vehicleIndex: SOLD_VEHICLE_INDICES[3], customerIndex: 6, saleDate: "2025-05-28", salePrice: 16250, salesTax: 1300, totalCollected: 17550, salesRepIndex: 2 },
  { vehicleIndex: SOLD_VEHICLE_INDICES[4], customerIndex: 1, saleDate: "2025-05-30", salePrice: 22500, salesTax: 1800, totalCollected: 24300, salesRepIndex: 2 },
  { vehicleIndex: SOLD_VEHICLE_INDICES[5], customerIndex: 3, saleDate: "2025-05-24", salePrice: 29500, salesTax: 2360, totalCollected: 31860, salesRepIndex: 2 },
];

type CompanyExpenseSeed = {
  expenseDate: string;
  category: string;
  vendor: string;
  description: string;
  amount: number;
  taxDeductible: boolean;
};

const COMPANY_EXPENSES: CompanyExpenseSeed[] = [
  { expenseDate: "2025-05-01", category: "rent", vendor: "SAC Property Management", description: "Monthly lot rent - May 2025", amount: 5200, taxDeductible: true },
  { expenseDate: "2025-05-05", category: "salary_wages", vendor: "Paychex", description: "Sales staff salaries - Week 1", amount: 3200, taxDeductible: true },
  { expenseDate: "2025-05-05", category: "salary_wages", vendor: "Paychex", description: "Management salaries - Week 1", amount: 2800, taxDeductible: true },
  { expenseDate: "2025-05-12", category: "salary_wages", vendor: "Paychex", description: "Sales staff salaries - Week 2", amount: 3200, taxDeductible: true },
  { expenseDate: "2025-05-12", category: "salary_wages", vendor: "Paychex", description: "Management salaries - Week 2", amount: 2800, taxDeductible: true },
  { expenseDate: "2025-05-19", category: "salary_wages", vendor: "Paychex", description: "Sales staff salaries - Week 3", amount: 3200, taxDeductible: true },
  { expenseDate: "2025-05-19", category: "salary_wages", vendor: "Paychex", description: "Management salaries - Week 3", amount: 2800, taxDeductible: true },
  { expenseDate: "2025-05-26", category: "salary_wages", vendor: "Paychex", description: "Sales staff salaries - Week 4", amount: 3200, taxDeductible: true },
  { expenseDate: "2025-05-26", category: "salary_wages", vendor: "Paychex", description: "Management salaries - Week 4", amount: 2800, taxDeductible: true },
  { expenseDate: "2025-05-03", category: "advertising", vendor: "Google Ads", description: "Search campaign - May 2025", amount: 1850, taxDeductible: true },
  { expenseDate: "2025-05-03", category: "advertising", vendor: "Facebook Ads", description: "Social media campaign - May 2025", amount: 1200, taxDeductible: true },
  { expenseDate: "2025-05-10", category: "advertising", vendor: "AutoTrader", description: "Vehicle listing subscriptions", amount: 980, taxDeductible: true },
  { expenseDate: "2025-05-02", category: "utilities", vendor: "SMUD", description: "Electricity - May 2025", amount: 520, taxDeductible: true },
  { expenseDate: "2025-05-02", category: "utilities", vendor: "Consolidated Communications", description: "Internet & phone", amount: 340, taxDeductible: true },
  { expenseDate: "2025-05-02", category: "utilities", vendor: "City of Sacramento", description: "Water & sewer", amount: 260, taxDeductible: true },
  { expenseDate: "2025-05-08", category: "software", vendor: "AutoVault360", description: "DMS software subscription", amount: 890, taxDeductible: true },
  { expenseDate: "2025-05-08", category: "software", vendor: "VinSolutions", description: "CRM platform", amount: 650, taxDeductible: true },
  { expenseDate: "2025-05-08", category: "software", vendor: "Microsoft 365", description: "Business licenses (10 users)", amount: 440, taxDeductible: true },
  { expenseDate: "2025-05-15", category: "insurance", vendor: "Progressive Commercial", description: "Dealer liability & property insurance", amount: 2560, taxDeductible: true },
  { expenseDate: "2025-05-10", category: "office", vendor: "Office Depot", description: "Office supplies - May 2025", amount: 380, taxDeductible: true },
  { expenseDate: "2025-05-10", category: "office", vendor: "FedEx", description: "Shipping & mailing", amount: 220, taxDeductible: true },
  { expenseDate: "2025-05-17", category: "office", vendor: "Staples", description: "Printer toner & paper", amount: 340, taxDeductible: true },
  { expenseDate: "2025-05-20", category: "accounting", vendor: "Wilson & Associates CPA", description: "Monthly accounting & bookkeeping", amount: 1800, taxDeductible: true },
  { expenseDate: "2025-05-22", category: "other", vendor: "Various", description: "Lot maintenance & cleaning", amount: 480, taxDeductible: true },
  { expenseDate: "2025-05-25", category: "other", vendor: "Catering", description: "Client refreshments & events", amount: 320, taxDeductible: true },
];

type CpaNoteSeed = {
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  assignedToRepIndex: number | null;
};

const CPA_NOTES: CpaNoteSeed[] = [
  { title: "Monthly Sales Tax Filing Due", description: "Sales tax for April 2025 must be filed by May 20th. Total collected: $14,880.", category: "Sales Tax", priority: "HIGH", status: "OPEN", assignedToRepIndex: null },
  { title: "Payroll Review - May 2025", description: "Review payroll records for May. Total payroll including commissions: $12,940.", category: "Payroll", priority: "MEDIUM", status: "IN_PROGRESS", assignedToRepIndex: 0 },
  { title: "Missing Deal Jacket Documents", description: "Deal jacket DJ-000003 is missing signed buyer's order and credit application.", category: "Deal Jackets", priority: "HIGH", status: "OPEN", assignedToRepIndex: 2 },
  { title: "Profit & Loss Statement Ready", description: "April 2025 P&L has been finalized. Net profit: $20,790. Gross profit margin: 34.6%.", category: "General", priority: "LOW", status: "RESOLVED", assignedToRepIndex: null },
  { title: "Inventory Audit - Used Vehicles", description: "Quarterly inventory audit scheduled. Verify all 8 in-stock vehicles match lot locations.", category: "Vehicle Records", priority: "MEDIUM", status: "OPEN", assignedToRepIndex: null },
  { title: "Commission Payouts Pending", description: "Sarah Williams has $1,599.75 pending commission for Ford F-150 sale. Mike Thompson has $1,390 pending for Mustang GT.", category: "Payroll", priority: "HIGH", status: "OPEN", assignedToRepIndex: 1 },
  { title: "Insurance Renewal Reminder", description: "Commercial insurance policy renews June 1st. Current premium: $2,560/mo. Review quotes from competitors.", category: "Documents", priority: "MEDIUM", status: "IN_PROGRESS", assignedToRepIndex: null },
  { title: "CDTFA Quarterly Report", description: "Q2 2025 CDTFA report due July 31st. Prepare sales tax collected data for April-June.", category: "Sales Tax", priority: "LOW", status: "OPEN", assignedToRepIndex: null },
];

// ─────────────────────────────────────────────────────────
// Utilities
// ─────────────────────────────────────────────────────────
const scriptDir = fileURLToPath(new URL(".", import.meta.url));
const envContent = readFileSync(resolve(scriptDir, "..", ".env"), "utf-8");
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx).trim();
  const value = trimmed.slice(eqIdx + 1).trim();
  if (!process.env[key]) process.env[key] = value;
}

function r2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseArgs(): SeedArgs {
  const args = process.argv.slice(2);
  let dealershipId: string | undefined;
  let force = false;
  let cleanup = false;
  let skipAuth = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dealership-id" && args[i + 1]) dealershipId = args[++i];
    else if (args[i] === "--force") force = true;
    else if (args[i] === "--cleanup") cleanup = true;
    else if (args[i] === "--skip-auth") skipAuth = true;
  }
  return { dealershipId, force, cleanup, skipAuth };
}

function log(emoji: string, msg: string) {
  console.log(`  ${emoji} ${msg}`);
}

function logStep(step: number, total: number, label: string) {
  console.log(`\n─── [${step}/${total}] ${label} ───`);
}

// ─────────────────────────────────────────────────────────
// Supabase helpers
// ─────────────────────────────────────────────────────────
async function findAuthUserByEmail(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) return null;
  return data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null;
}

async function resolveDealershipId(supabase: SupabaseClient, requestedId?: string): Promise<string> {
  if (requestedId) {
    const { data, error } = await supabase.from("dealerships").select("id, name").eq("id", requestedId).maybeSingle();
    if (error || !data) throw new Error(`Dealership not found: ${requestedId}`);
    log("🏢", `Using dealership: ${data.name} (${data.id})`);
    return data.id;
  }
  const { data, error } = await supabase.from("dealerships").select("id, name").eq("status", "active").order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error || !data) throw new Error("No active dealership found. Pass --dealership-id <uuid>.");
  log("🏢", `Using dealership: ${data.name} (${data.id})`);
  return data.id;
}

async function resolveCreatedBy(supabase: SupabaseClient, dealershipId: string): Promise<string> {
  const preferred = await supabase.from("users").select("id").eq("dealership_id", dealershipId).in("role", ["owner", "manager", "super_admin"]).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (preferred.data?.id) return preferred.data.id;
  const { data, error } = await supabase.from("users").select("id").eq("dealership_id", dealershipId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (error || !data) throw new Error("No users found for dealership");
  return data.id;
}

function isColMissing(msg: string) {
  return msg.includes("does not exist") || msg.includes("Could not find") || msg.includes("column");
}

// ─────────────────────────────────────────────────────────
// Cleanup (reverse order)
// ─────────────────────────────────────────────────────────
async function cleanup(supabase: SupabaseClient, ids: TrackedIds) {
  const tables = [
    { name: "cpa_note_attachments", ids: ids.cpaAttachmentIds },
    { name: "cpa_note_comments", ids: ids.cpaCommentIds },
    { name: "cpa_note_activity", ids: ids.cpaActivityIds },
    { name: "cpa_notes", ids: ids.cpaNoteIds },
    { name: "cpa_profiles", ids: ids.cpaProfileIds },
    { name: "deal_jacket_documents", ids: ids.dealJacketDocIds },
    { name: "deal_jacket_expenses_relation", ids: [] },
    { name: "deal_jackets", ids: ids.dealJacketIds },
    { name: "deals", ids: ids.dealIds },
    { name: "vehicle_losses", ids: ids.vehicleLossIds },
    { name: "vehicle_images", ids: ids.vehicleImageIds },
    { name: "customer_documents", ids: ids.customerDocIds },
    { name: "customer_communications", ids: ids.customerCommIds },
    { name: "customer_notes", ids: ids.customerNoteIds },
    { name: "customers", ids: ids.customerIds },
    { name: "pricing_history", ids: ids.pricingHistoryIds },
    { name: "vehicle_expenses", ids: ids.vehicleExpenseIds },
    { name: "status_history", ids: ids.statusHistoryIds },
    { name: "vehicles", ids: ids.vehicleIds },
    { name: "dealership_expenses", ids: ids.dealershipExpenseIds },
    { name: "calendar_events", ids: ids.calendarEventIds },
    { name: "files", ids: ids.fileIds },
    { name: "users", ids: ids.userIds },
  ];

  for (const table of tables) {
    if (table.ids.length > 0) {
      const { error } = await supabase.from(table.name).delete().in("id", table.ids);
      if (error) log("⚠️", `Cleanup ${table.name}: ${error.message}`);
      else log("🧹", `Removed ${table.ids.length} from ${table.name}`);
    }
  }

  if (ids.authUserIds.length > 0) {
    for (const uid of ids.authUserIds) {
      await supabase.auth.admin.deleteUser(uid);
    }
    log("🧹", `Removed ${ids.authUserIds.length} auth users`);
  }
}

// ─────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs();
  const ids = emptyTracker();

  console.log("\n╔══════════════════════════════════════════╗");
  console.log("║     AutoVault360 — Full System Seeder    ║");
  console.log("╚══════════════════════════════════════════╝\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("❌ Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const dealershipId = await resolveDealershipId(supabase, args.dealershipId);

  // ── Step 1: Auth users + User profiles (before resolveCreatedBy) ──
  if (!args.skipAuth && !args.cleanup) {
    logStep(1, 6, "Auth Users & Profiles");

    const allUsers = [
      { ...SUPER_ADMIN },
      { ...OWNER },
      { ...MANAGER },
      ...SALES_REPS,
      { ...CPA_USER },
    ];

    for (const u of allUsers) {
      const existingProfile = await supabase.from("users").select("id").eq("dealership_id", dealershipId).ilike("email", u.email).maybeSingle();
      if (existingProfile.data && !args.force) {
        log("↷", `User exists: ${u.fullName}`);
        ids.userIds.push(existingProfile.data.id);
        continue;
      }

      let authUser = await findAuthUserByEmail(supabase, u.email);
      const userPassword = u.email === "admin@autovault.com" ? "AdminAutoVault" : SEED_PASSWORD;
      if (!authUser) {
        const { data, error } = await supabase.auth.admin.createUser({
          email: u.email,
          password: userPassword,
          email_confirm: true,
          user_metadata: { full_name: u.fullName, role: u.role },
        });
        if (error) throw new Error(`Auth create failed for ${u.email}: ${error.message}`);
        authUser = data.user;
        ids.authUserIds.push(authUser.id);
        log("✅", `Auth user: ${u.email}`);
      } else {
        log("ℹ️", `Auth exists: ${u.email}`);
      }

      const payload: Record<string, unknown> = {
        auth_user_id: authUser.id,
        dealership_id: dealershipId,
        email: u.email,
        full_name: u.fullName,
        role: u.role,
        is_active: u.isActive,
      };

      if ("commissionRate" in u && u.commissionRate !== undefined) {
        payload.commission_rate = u.commissionRate;
        payload.monthly_goal = u.monthlyGoal;
        payload.hire_date = u.hireDate;
        payload.phone = u.phone;
        const rep = u as typeof SALES_REPS[0];
        payload.address = rep.address;
        payload.city = rep.city;
        payload.state = rep.state;
        payload.zip = rep.zip;
        if ("address2" in rep) payload.address2 = (rep as typeof SALES_REPS[0] & { address2?: string }).address2 ?? null;
      }

      if (u.role === "cpa") {
        payload.firm_name = u.firmName;
        payload.license_number = u.licenseNumber;
        payload.phone = CPA_USER.phone;
      }

      let result = await supabase.from("users").upsert(payload).select("id").single();

      if (result.error && isColMissing(result.error.message)) {
        const basePayload: Record<string, unknown> = {
          auth_user_id: authUser.id,
          dealership_id: dealershipId,
          email: u.email,
          full_name: u.fullName,
          role: u.role,
          is_active: u.isActive,
        };
        result = await supabase.from("users").upsert(basePayload).select("id").single();
      }

      if (result.error) throw new Error(`Profile create failed for ${u.email}: ${result.error.message}`);

      if (!existingProfile.data) ids.userIds.push(result.data.id);
      log("✅", `Profile: ${u.fullName} (${u.role})`);
    }
    log("✅", `${allUsers.length} user profiles ready`);
  }

  // Ensure admin@autovault.com always has a profile (survives cleanup)
  {
    const adminAuth = await findAuthUserByEmail(supabase, "admin@autovault.com");
    if (adminAuth) {
      const existing = await supabase.from("users").select("id").eq("auth_user_id", adminAuth.id).maybeSingle();
      if (!existing.data) {
        const { error } = await supabase.from("users").insert({
          auth_user_id: adminAuth.id,
          dealership_id: dealershipId,
          email: "admin@autovault.com",
          full_name: "Super Admin",
          role: "super_admin",
          is_active: true,
        });
        if (error) console.log("  ⚠️  Admin profile:", error.message);
        else log("✅", "Admin profile restored");
      }
    }
  }

  const createdBy = await resolveCreatedBy(supabase, dealershipId);
  log("👤", `Created-by user resolved: ${createdBy}`);

  if (args.cleanup) {
    console.log("\n🧹 Running cleanup mode...\n");

    const tables = [
      "cpa_note_attachments",
      "cpa_note_comments",
      "cpa_note_activity",
      "cpa_notes",
      "cpa_profiles",
      "deal_jacket_expenses_relation",
      "deal_jacket_documents",
      "deal_jackets",
      "deals",
      "vehicle_losses",
      "vehicle_images",
      "customer_documents",
      "customer_communications",
      "customer_notes",
      "customers",
      "pricing_history",
      "vehicle_expenses",
      "status_history",
      "vehicles",
      "dealership_expenses",
      "calendar_events",
      "audit_logs",
      "files",
      "users",
    ];

    for (const table of tables) {
      const { error, count } = await supabase.from(table).delete().neq("id", "00000000-0000-0000-0000-000000000000");
      if (error) console.log(`  ⚠️  ${table}: ${error.message}`);
      else console.log(`  🧹 ${table}: cleared`);
    }

    // Delete seed auth users (keep real ones)
    const { data: seedAuthIds } = await supabase.auth.admin.listUsers();
    const seedEmails = ["john.dealer@autovault360.test", "emily.chen@autovault360.test", "marcus.johnson@autovault360.test", "sarah.williams@autovault360.test", "mike.thompson@autovault360.test", "cpa@autovault360.test"];
    if (seedAuthIds?.users) {
      for (const u of seedAuthIds.users) {
        if (seedEmails.includes(u.email ?? "")) {
          await supabase.auth.admin.deleteUser(u.id);
          console.log(`  🧹 Auth user: ${u.email}`);
        }
      }
    }

    console.log("\n✅ Cleanup complete.\n");
    return;
  }

  async function resolveSalesRepId(salesRepIndex: number): Promise<string> {
    const rep = SALES_REPS[salesRepIndex];
    if (!rep) return createdBy;
    const { data } = await supabase.from("users").select("id").eq("dealership_id", dealershipId).ilike("email", rep.email).maybeSingle();
    return data?.id ?? createdBy;
  }

  try {
    // ── Step 2: CPA Profiles ──
    logStep(2, 6, "CPA Profiles");

    const { data: cpaUser } = await supabase.from("users").select("id").eq("dealership_id", dealershipId).ilike("email", CPA_USER.email).maybeSingle();
    if (cpaUser) {
      const { error } = await supabase.from("cpa_profiles").upsert({
        user_id: cpaUser.id,
        first_name: CPA_USER.firstName,
        last_name: CPA_USER.lastName,
        status: "ACTIVE",
      }, { onConflict: "user_id", ignoreDuplicates: false });
      if (error) log("⚠️", `CPA profile: ${error.message}`);
      else log("✅", `CPA profile: ${CPA_USER.firstName} ${CPA_USER.lastName}`);
      ids.cpaProfileIds.push(cpaUser.id);
    }

    // ── Step 3: Vehicles ──
    logStep(3, 6, "Vehicles");

    for (const v of VEHICLES) {
      const existing = await supabase.from("vehicles").select("id, status").eq("dealership_id", dealershipId).eq("vin", v.vin).maybeSingle();
      if (existing.data && !args.force) {
        log("↷", `Vehicle exists: ${v.year} ${v.make} ${v.model} (${v.vin})`);
        ids.vehicleIds.push(existing.data.id);
        continue;
      }

      const payload = {
        dealership_id: dealershipId,
        vin: v.vin,
        stock_number: v.stockNumber,
        make: v.make,
        model: v.model,
        trim: v.trim ?? null,
        year: v.year,
        body_style: v.bodyStyle,
        mileage: v.mileage,
        exterior_color: v.exteriorColor,
        interior_color: v.interiorColor,
        drivetrain: v.drivetrain,
        fuel_type: v.fuelType,
        engine: v.engine,
        transmission: v.transmission,
        acquisition_cost: v.acquisitionCost,
        asking_price: v.askingPrice,
        reconditioning_cost: v.reconditioningCost,
        total_invested: v.totalInvested,
        status: v.status,
        lot_location: v.lotLocation,
        created_by: createdBy,
      };

      let vehicleId: string;
      if (existing.data && args.force) {
        await supabase.from("vehicles").update(payload).eq("id", existing.data.id);
        vehicleId = existing.data.id;
      } else {
        const { data, error } = await supabase.from("vehicles").insert(payload).select("id").single();
        if (error) throw new Error(`Vehicle insert failed: ${error.message}`);
        vehicleId = data.id;
      }

      ids.vehicleIds.push(vehicleId);

      // Status history
      const { error: shErr } = await supabase.from("status_history").insert({
        vehicle_id: vehicleId,
        dealership_id: dealershipId,
        to_status: v.status,
        changed_by: createdBy,
        notes: `Seeded via ${SCRIPT_LABEL}`,
      }).select("id").single();

      if (shErr) log("⚠️", `Status history: ${shErr.message}`);
      log("✅", `${v.year} ${v.make} ${v.model} (${v.status})`);
    }

    // ── Step 4: Customers ──
    logStep(4, 6, "Customers");

    for (const c of CUSTOMERS) {
      const salesRepUserId = await resolveSalesRepId(c.salesRepIndex);
      const existing = await supabase.from("customers").select("id").eq("dealership_id", dealershipId).eq("phone", c.phone).is("deleted_at", null).maybeSingle();
      if (existing.data && !args.force) {
        log("↷", `Customer exists: ${c.name}`);
        ids.customerIds.push(existing.data.id);
        continue;
      }

      const { data, error } = await supabase.from("customers").upsert({
        ...(existing.data ? { id: existing.data.id } : {}),
        dealership_id: dealershipId,
        type: c.type,
        name: c.name,
        phone: c.phone,
        email: c.email,
        status: c.status,
        sales_rep_id: salesRepUserId,
        source: c.source,
        address: c.address,
        city: c.city,
        state: c.state,
        zip: c.zip,
        created_by: createdBy,
      }).select("id").single();

      if (error) throw new Error(`Customer insert failed: ${error.message}`);
      if (!existing.data) ids.customerIds.push(data.id);
      log("✅", `${c.name} (${c.status}) → rep index ${c.salesRepIndex}`);
    }

    // ── Step 5: Deals + Deal Jackets ──
    logStep(5, 6, "Deals & Deal Jackets");

    for (let di = 0; di < DEALS.length; di++) {
      const d = DEALS[di];
      const vehicleId = ids.vehicleIds[d.vehicleIndex];
      const customerId = ids.customerIds[d.customerIndex];
      const salesRepUserId = await resolveSalesRepId(d.salesRepIndex);
      const vehicle = VEHICLES[d.vehicleIndex];
      const customer = CUSTOMERS[d.customerIndex];
      const commissionRate = SALES_REPS[d.salesRepIndex]?.commissionRate ?? 0.1;
      const grossProfit = r2(d.salePrice - vehicle.totalInvested);
      const commissionAmount = r2(grossProfit * commissionRate);
      const netProfit = r2(grossProfit - commissionAmount);
      const jacketNumber = `DJ-${String(di + 1).padStart(6, "0")}`;
      const dateSold = `${d.saleDate}T12:00:00Z`;

      // Check existing deal
      const existingDeal = await supabase.from("deals").select("id").eq("vehicle_id", vehicleId).maybeSingle();
      if (existingDeal.data && !args.force) {
        log("↷", `Deal exists for ${vehicle.make} ${vehicle.model}`);
        ids.dealIds.push(existingDeal.data.id);
        continue;
      }

      // Create deal
      const { data: deal, error: dealErr } = await supabase.from("deals").upsert({
        ...(existingDeal.data ? { id: existingDeal.data.id } : {}),
        vehicle_id: vehicleId,
        customer_id: customerId,
        dealership_id: dealershipId,
        sale_date: d.saleDate,
        total_price_otd: d.salePrice,
        sales_tax_amount: d.salesTax,
        license_fees: 0,
        dmv_fees: 0,
        other_fees: 0,
        total_collected: d.totalCollected,
        created_by: salesRepUserId,
      }).select("id").single();

      if (dealErr) throw new Error(`Deal insert failed: ${dealErr.message}`);
      if (!existingDeal.data) ids.dealIds.push(deal.id);

      // Update vehicle status to sold
      if (vehicle.status === "sold") {
        await supabase.from("vehicles").update({ status: "sold" }).eq("id", vehicleId);
      }

      // Create deal jacket (delete + insert to avoid immutability trigger on financial fields)
      const existingJacket = await supabase.from("deal_jackets").select("id").eq("vehicle_id", vehicleId).is("deleted_at", null).maybeSingle();

      if (existingJacket.data) {
        if (args.force) {
          await supabase.from("deal_jacket_documents").delete().eq("deal_jacket_id", existingJacket.data.id);
          await supabase.from("deal_jackets").delete().eq("id", existingJacket.data.id);
        } else {
          log("↷", `Jacket exists for ${vehicle.make} ${vehicle.model}`);
          ids.dealJacketIds.push(existingJacket.data.id);
          continue;
        }
      }

      const jacketPayload = {
        dealership_id: dealershipId,
        deal_id: deal.id,
        vehicle_id: vehicleId,
        customer_id: customerId,
        sales_rep_id: salesRepUserId,
        jacket_number: jacketNumber,
        sold_price: d.salePrice,
        total_tax: d.salesTax,
        fees: { license: 0, dmv: 0, other: 0 },
        total_sale_price: d.totalCollected,
        down_payment: r2(d.totalCollected * 0.2),
        amount_financed: r2(d.totalCollected * 0.8),
        balance_due: 0,
        total_invested: vehicle.totalInvested,
        additional_expenses: 0,
        commission_amount: commissionAmount,
        commission_status: di % 3 === 0 ? "pending" : "paid",
        profit_gross: grossProfit,
        profit_net: netProfit,
        date_sold: dateSold,
        created_by: salesRepUserId,
      };

      const { data: newJacket, error: jkErr } = await supabase.from("deal_jackets").insert(jacketPayload).select("id").single();
      if (jkErr) throw new Error(`Deal jacket insert failed: ${jkErr.message}`);
      ids.dealJacketIds.push(newJacket.id);

      // Deal jacket document
      const { error: docErr } = await supabase.from("deal_jacket_documents").insert({
        deal_jacket_id: newJacket.id,
        file_url: `/seed/${jacketNumber}/buyers-order.pdf`,
        file_type: "application/pdf",
        document_name: `Buyer's Order - ${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      });
      if (!docErr) ids.dealJacketDocIds.push(newJacket.id);

      log("✅", `${jacketNumber} — ${vehicle.year} ${vehicle.make} ${vehicle.model} → ${customer.name} (GP: $${grossProfit.toLocaleString()})`);
    }

    // ── Step 6: Expenses & Calendar & CPA Notes ──
    logStep(6, 6, "Expenses, CPA Notes & Calendar");

    // Dealership Expenses
    for (const e of COMPANY_EXPENSES) {
      const { data, error } = await supabase.from("dealership_expenses").insert({
        dealership_id: dealershipId,
        expense_date: e.expenseDate,
        category: e.category,
        vendor: e.vendor,
        description: e.description,
        amount: e.amount,
        tax_deductible: e.taxDeductible,
        created_by: createdBy,
      }).select("id").single();
      if (error) log("⚠️", `Expense: ${error.message}`);
      else ids.dealershipExpenseIds.push(data.id);
    }
    log("✅", `${COMPANY_EXPENSES.length} dealership expenses`);

    // CPA Notes
    for (const n of CPA_NOTES) {
      const assignedTo = n.assignedToRepIndex !== null
        ? (await resolveSalesRepId(n.assignedToRepIndex)) ?? null
        : null;

      const { data, error } = await supabase.from("cpa_notes").insert({
        dealership_id: dealershipId,
        title: n.title,
        description: n.description,
        category: n.category,
        priority: n.priority,
        status: n.status,
        created_by: createdBy,
        assigned_to: assignedTo,
      }).select("id").single();

      if (error) { log("⚠️", `CPA note: ${error.message}`); continue; }
      ids.cpaNoteIds.push(data.id);

      // Activity entries
      const activities = [
        { activity_type: "CREATED", activity_description: `Note created: ${n.title}` },
        { activity_type: "STATUS", activity_description: `Status set to ${n.status}` },
      ];
      for (const a of activities) {
        const { error: actErr } = await supabase.from("cpa_note_activity").insert({
          note_id: data.id,
          user_id: createdBy,
          activity_type: a.activity_type,
          activity_description: a.activity_description,
        });
        if (!actErr) ids.cpaActivityIds.push(data.id);
      }

      // Comment on some notes
      if (CPA_NOTES.indexOf(n) % 2 === 0) {
        const { error: cmtErr } = await supabase.from("cpa_note_comments").insert({
          note_id: data.id,
          user_id: createdBy,
          comment: `Reviewed and acknowledged. Follow-up needed on this item.`,
        });
        if (!cmtErr) ids.cpaCommentIds.push(data.id);
      }
    }
    log("✅", `${CPA_NOTES.length} CPA notes with activity & comments`);

    // Calendar events
    const calendarEvents = [
      { eventDate: "2025-05-20", title: "Sales Tax Filing Due (April)", eventType: "compliance" as const, description: "Monthly sales tax return due to CDTFA" },
      { eventDate: "2025-05-25", title: "Payroll Run - Week 4", eventType: "payroll" as const, description: "Process final May payroll including commissions" },
      { eventDate: "2025-06-01", title: "Insurance Renewal", eventType: "compliance" as const, description: "Commercial insurance policy renews" },
      { eventDate: "2025-06-05", title: "Commission Payout Processing", eventType: "payroll" as const, description: "Process pending commission payouts for May sales" },
      { eventDate: "2025-06-10", title: "Inventory Audit", eventType: "task" as const, description: "Quarterly physical inventory count" },
      { eventDate: "2025-06-15", title: "Client Meeting - Michael Johnson", eventType: "appointment" as const, description: "Follow-up on recent vehicle purchase" },
      { eventDate: "2025-06-20", title: "Sales Tax Filing Due (May)", eventType: "compliance" as const, description: "Monthly sales tax return for May" },
      { eventDate: "2025-07-31", title: "Q2 CDTFA Quarterly Report", eventType: "compliance" as const, description: "Quarterly report due for April-June" },
    ];

    for (const ev of calendarEvents) {
      const { error } = await supabase.from("calendar_events").insert({
        dealership_id: dealershipId,
        event_date: ev.eventDate,
        title: ev.title,
        event_type: ev.eventType,
        description: ev.description,
        created_by: createdBy,
      });
      if (error) log("⚠️", `Calendar: ${error.message}`);
    }
    log("✅", `${calendarEvents.length} calendar events`);

    // Files registry
    const sampleFiles = [
      { bucket: "vehicle-images", storagePath: "seed/vehicle1.jpg", originalName: "2021_ford_f150.jpg", fileSize: 245000, mimeType: "image/jpeg", fileType: "jpg", sourceEntity: "vehicle", sourceEntityId: ids.vehicleIds[0] },
      { bucket: "vehicle-images", storagePath: "seed/vehicle2.jpg", originalName: "2022_honda_crv.jpg", fileSize: 212000, mimeType: "image/jpeg", fileType: "jpg", sourceEntity: "vehicle", sourceEntityId: ids.vehicleIds[1] },
      { bucket: "expense-receipts", storagePath: "seed/receipt1.pdf", originalName: "reconditioning_invoice_1001.pdf", fileSize: 89000, mimeType: "application/pdf", fileType: "pdf", sourceEntity: "expense", sourceEntityId: null },
      { bucket: "vehicle-documents", storagePath: "seed/buyers_order_1008.pdf", originalName: "buyers_order_accord.pdf", fileSize: 156000, mimeType: "application/pdf", fileType: "pdf", sourceEntity: "deal", sourceEntityId: ids.dealIds[0] },
    ];

    for (const f of sampleFiles) {
      const { error } = await supabase.from("files").insert({
        dealership_id: dealershipId,
        bucket: f.bucket,
        storage_path: f.storagePath,
        original_name: f.originalName,
        file_size: f.fileSize,
        mime_type: f.mimeType,
        file_type: f.fileType,
        source_entity: f.sourceEntity,
        source_entity_id: f.sourceEntityId,
        uploaded_by: createdBy,
      });
      if (error) log("⚠️", `Files: ${error.message}`);
    }
    log("✅", `${sampleFiles.length} file records`);

    // ── Summary ──
    console.log("\n╔══════════════════════════════════════════╗");
    console.log("║           Seed Complete! 🎉             ║");
    console.log("╚══════════════════════════════════════════╝");
    console.log(`   Dealership ID:  ${dealershipId}`);
    console.log(`   Auth users:     ${ids.authUserIds.length}`);
    console.log(`   User profiles:  ${ids.userIds.length}`);
    console.log(`   Vehicles:       ${ids.vehicleIds.length}`);
    console.log(`   Customers:      ${ids.customerIds.length}`);
    console.log(`   Deals/Jackets:  ${ids.dealIds.length}`);
    console.log(`   Co. Expenses:   ${ids.dealershipExpenseIds.length}`);
    console.log(`   CPA Notes:      ${ids.cpaNoteIds.length}`);
    console.log(`   Calendar Events:${calendarEvents.length}`);
    console.log(`\n   Password: ${SEED_PASSWORD}`);
    console.log("");

  } catch (err) {
    console.error("\n❌ Seed failed:", err instanceof Error ? err.message : err);
    console.log("\n🔄 Rolling back...");
    await cleanup(supabase, ids);
    console.log("\n❌ Seed rolled back.\n");
    process.exit(1);
  }
}

main();
