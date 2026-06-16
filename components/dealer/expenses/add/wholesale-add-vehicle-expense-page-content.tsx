"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import {
  AlignLeft,
  Bold,
  Calendar,
  Car,
  Check,
  FileText,
  Italic,
  Lightbulb,
  Link as LinkIcon,
  List,
  Loader2,
  Paperclip,
  Receipt,
  ScanLine,
  Search,
  Underline,
  UploadCloud,
  X,
} from "lucide-react";
import { z } from "zod";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { lookupVehicle } from "@/lib/expenses/server/lookup-vehicle";
import { createVehicleExpense } from "@/lib/expenses/server/create-vehicle-expense";
import {
  PAYMENT_METHOD_OPTIONS,
  VEHICLE_EXPENSE_SUBCATEGORIES,
  type PaymentMethod,
  type VehicleExpenseSubcategory,
} from "@/lib/expenses/form-types";
import type { LinkedVehicleResult } from "@/lib/expenses/server/types";
import { cn } from "@/lib/utils";

const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;
const ACCEPTED_RECEIPT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

const schema = z
  .object({
    expenseName: z
      .string()
      .trim()
      .min(1, "Expense name is required.")
      .max(80, "Expense name must be 80 characters or less."),
    category: z.string().min(1, "Category is required."),
    amount: z.coerce.number().min(0, "Amount must be 0 or greater."),
    description: z
      .string()
      .trim()
      .max(500, "Description must be 500 characters or less.")
      .optional(),
    paymentMethod: z.string().min(1, "Payment method is required."),
    vendor: z
      .string()
      .trim()
      .min(1, "Vendor or payee is required.")
      .max(120, "Vendor must be 120 characters or less."),
    date: z.string().min(1, "Date is required."),
    status: z.enum(["paid", "unpaid", "partial"]),
    vehicleNotes: z.string().max(1000, "Notes must be 1000 characters or less."),
    addAnother: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const notesAmount = calculateNotesAmount(values.vehicleNotes);
    if (values.amount + notesAmount <= 0) {
      ctx.addIssue({
        code: "custom",
        path: ["amount"],
        message: "Enter an amount or vehicle expense notes with dollar amounts.",
      });
    }
  });

type FormValues = z.infer<typeof schema>;
type SearchMode = "vin" | "stock";

const defaultValues: FormValues = {
  expenseName: "",
  category: "",
  amount: 0,
  description: "",
  paymentMethod: "",
  vendor: "",
  date: new Date().toISOString().split("T")[0],
  status: "paid",
  vehicleNotes: "",
  addAnother: false,
};

function calculateNotesAmount(notes: string): number {
  const matches = notes.match(/\$\s*\d+(?:,\d{3})*(?:\.\d{1,2})?/g) ?? [];
  return matches.reduce((sum, token) => {
    const normalized = token.replace(/[$,\s]/g, "");
    const value = Number(normalized);
    return Number.isFinite(value) ? sum + value : sum;
  }, 0);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getVehicleTitle(vehicle: LinkedVehicleResult): string {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
}

function SectionCard({
  number,
  title,
  icon,
  children,
  className,
}: {
  number: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-md border border-slate-800/90 bg-card/80 p-3.5 shadow-sm shadow-black/10",
        className,
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-400">
        <span className="text-emerald-500">{icon}</span>
        <span>
          {number}. {title}
        </span>
      </div>
      {children}
    </section>
  );
}

function FieldLabel({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="mb-1.5 text-[11px] font-medium text-slate-300">
      {children}
      {required && <span className="ml-0.5 text-red-500">*</span>}
    </div>
  );
}

function VehicleLookup({
  vehicle,
  onVehicleChange,
}: {
  vehicle: LinkedVehicleResult | null;
  onVehicleChange: (vehicle: LinkedVehicleResult | null) => void;
}) {
  const [mode, setMode] = useState<SearchMode>("vin");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (vehicle) setQuery(mode === "vin" ? vehicle.vin : vehicle.stockNumber);
  }, [vehicle, mode]);

  const handleLookup = async () => {
    const trimmed = query.trim();
    if (!trimmed) {
      toast.error(mode === "vin" ? "Enter a VIN number." : "Enter a stock number.");
      return;
    }

    setLoading(true);
    try {
      const result = await lookupVehicle({
        mode,
        query: mode === "vin" ? trimmed.toUpperCase() : trimmed,
      });
      if (!result.success) {
        toast.error(result.error);
        onVehicleChange(null);
        return;
      }
      onVehicleChange(result.vehicle);
      setQuery(mode === "vin" ? result.vehicle.vin : result.vehicle.stockNumber);
    } finally {
      setLoading(false);
    }
  };

  const handleVinScan = async () => {
    const vin = query.trim().toUpperCase();
    if (vin.length !== 17) {
      toast.error("Enter a valid 17-character VIN to scan.");
      setMode("vin");
      return;
    }

    setMode("vin");
    setLoading(true);
    try {
      const result = await lookupVehicle({ mode: "vin", query: vin });
      if (!result.success) {
        toast.error(result.error ?? "No vehicle found for that VIN.");
        onVehicleChange(null);
        return;
      }
      onVehicleChange(result.vehicle);
      setQuery(result.vehicle.vin);
      toast.success("VIN scanned successfully.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-8 border-b border-slate-800">
        {(["vin", "stock"] as SearchMode[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMode(tab)}
            className={cn(
              "relative pb-2 text-[11.5px] font-medium transition-colors",
              mode === tab
                ? "text-emerald-400 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-emerald-500"
                : "text-slate-500 hover:text-slate-300",
            )}
          >
            {tab === "vin" ? "Search by VIN" : "Search by Stock #"}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <InputGroup theme="dark">
            <InputGroupInput
              theme="dark"
              value={query}
              onChange={(e) =>
                setQuery(mode === "vin" ? e.target.value.toUpperCase() : e.target.value)
              }
              placeholder={
                mode === "vin"
                  ? "Enter VIN number (17 characters)"
                  : "Enter stock number"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleLookup();
                }
              }} />
            <InputGroupAddon>
              <button
                type="button"
                onClick={handleLookup}
                aria-label="Search vehicle"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </button>
            </InputGroupAddon>
          </InputGroup>

        </div>
        <Button
          type="button"
          variant="outline"
          className="shrink-0 gap-1.5 border-slate-800 bg-[#07111d] px-4 text-[11.5px] text-slate-300 hover:bg-slate-800"
          onClick={handleVinScan}
          disabled={loading}
        >
          {loading && mode === "vin" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ScanLine className="h-3.5 w-3.5" />
          )}
          {loading && mode === "vin" ? "Scanning..." : "Scan VIN"}
        </Button>
      </div>

      {vehicle && (
        <div className="relative rounded-md border border-slate-800 bg-[#07111d]/80 p-3">
          <button
            type="button"
            onClick={() => onVehicleChange(null)}
            className="absolute right-2 top-2 rounded p-1 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            aria-label="Remove vehicle"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="flex min-w-0 gap-3">
              <div className="relative h-[72px] w-[112px] shrink-0 overflow-hidden rounded-md bg-slate-900">
                <Image
                  src={vehicle.image}
                  alt={getVehicleTitle(vehicle)}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 pt-1">
                <div className="truncate text-[14px] font-semibold text-white">
                  {getVehicleTitle(vehicle)}
                </div>
                <div className="mt-1 text-[11.5px] text-slate-400">
                  VIN: <span className="text-emerald-400">{vehicle.vin}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-slate-400">
                  <span>Stock #: {vehicle.stockNumber}</span>
                  <span>Odometer: {vehicle.mileage.toLocaleString()} mi</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 pr-7 md:justify-end">
              <div className="space-y-1 text-[11.5px] text-slate-400">
                <div>
                  Status: <span className="text-emerald-400">{vehicle.status}</span>
                </div>
                <div>Location: {vehicle.location || "Not set"}</div>
              </div>
              <Link
                href={`/dealer/inventory/${vehicle.id}`}
                className="inline-flex h-8 items-center rounded-md border border-emerald-500/40 px-3 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/10"
              >
                View Vehicle
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NotesEditor({
  value,
  onChange,
  amount,
}: {
  value: string;
  onChange: (value: string) => void;
  amount: number;
}) {
  const applyToken = (token: string) => {
    onChange(value ? `${value}${token}` : token.trimStart());
  };

  return (
    <div className="rounded-md border border-slate-800 p-3">
      <div className="mb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-emerald-400">
          Vehicle Expense Notes
        </span>
        <span className="ml-1 text-[10px] uppercase text-slate-500">(Optional)</span>
      </div>
      <p className="mb-2 text-[11px] text-slate-500">
        Add notes about work done or items added to this vehicle.
      </p>
      <div className="mb-2 flex flex-wrap items-center gap-1.5 border-b border-slate-800 pb-2 text-slate-300">
        {[
          { icon: Bold, token: "**bold**" },
          { icon: Italic, token: "*italic*" },
          { icon: Underline, token: "__underline__" },
          { icon: AlignLeft, token: "\n" },
          { icon: List, token: "\n• " },
          { icon: LinkIcon, token: " [link](url)" },
        ].map(({ icon: Icon, token }, index) => (
          <button
            key={index}
            type="button"
            onClick={() => applyToken(token)}
            className="grid h-6 w-6 place-items-center rounded text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        ))}
      </div>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
        <div className="relative">
          <Textarea
            theme="dark"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={1000}
            rows={5}
            placeholder="• $15 Mirror Borrowed&#10;• $311 parts geek&#10;• $220"
            className="min-h-[105px] resize-none border-0 bg-transparent px-0 py-0 text-[12px] leading-relaxed text-slate-200 focus-visible:ring-0"
          />
          <div className="absolute bottom-0 right-0 text-[10px] text-slate-500">
            {value.length}/1000
          </div>
        </div>
        <div className="rounded-md border border-slate-800 bg-card/80 p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            Total Notes Amount
          </div>
          <div className="mt-2 text-[20px] font-bold text-emerald-400">
            {formatCurrency(amount)}
          </div>
          <p className="mt-2 text-[10.5px] leading-relaxed text-slate-500">
            This amount is automatically included in the vehicle deal.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReceiptDropZone({
  file,
  onFileChange,
}: {
  file: File | null;
  onFileChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const setValidated = (next: File | null) => {
    if (!next) {
      onFileChange(null);
      return;
    }
    if (!ACCEPTED_RECEIPT_TYPES.includes(next.type)) {
      toast.error("Accepted receipt formats are PDF, JPG, and PNG.");
      return;
    }
    if (next.size > MAX_RECEIPT_SIZE) {
      toast.error("Receipt file must be 10MB or smaller.");
      return;
    }
    onFileChange(next);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
      onDrop={(e) => {
        e.preventDefault();
        setValidated(e.dataTransfer.files[0] ?? null);
      }}
      onDragOver={(e) => e.preventDefault()}
      className="flex flex-col gap-2 min-h-[58px] cursor-pointer items-center justify-center rounded-md border border-dashed border-slate-800 px-4 py-3 text-center transition hover:border-slate-600"
    >
      <UploadCloud className="mr-2 h-6 w-6 text-slate-400" />
      <div>
        <div className="text-[12px] font-medium text-slate-200">
          {file ? file.name : "Drag & drop file here or"}
        </div>
        <div className="mt-1 text-[10px] text-slate-500">
          Accepted formats: PDF, JPG, PNG (Max 10MB)
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png,image/jpeg,image/png,application/pdf"
        onChange={(e) => setValidated(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function SummaryPanel({
  vehicle,
  values,
  notesAmount,
  total,
}: {
  vehicle: LinkedVehicleResult | null;
  values: FormValues;
  notesAmount: number;
  total: number;
}) {
  const category =
    VEHICLE_EXPENSE_SUBCATEGORIES.find((item) => item.value === values.category)?.label ??
    "•";

  return (
    <div className="space-y-3">
      <aside className="rounded-md border border-slate-800/90 bg-card/80 p-4">
        <div className="mb-4 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-400">
          <Receipt className="h-4 w-4" />
          Expense Summary
        </div>

        <div className="space-y-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] text-slate-400">Vehicle</div>
              {vehicle ? (
                <>
                  <div className="mt-1 text-[12px] text-slate-200">
                    {getVehicleTitle(vehicle)}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    VIN: <span className="text-emerald-400">{vehicle.vin}</span>
                  </div>
                </>
              ) : (
                <div className="mt-1 text-[12px] text-slate-500">•</div>
              )}
            </div>
            {vehicle && (
              <div className="relative h-[58px] w-[82px] shrink-0 overflow-hidden rounded-md bg-slate-900">
                <Image
                  src={vehicle.image}
                  alt={getVehicleTitle(vehicle)}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          {[
            ["Expense Name", values.expenseName || "•"],
            ["Amount", formatCurrency(values.amount || 0)],
            ["Vehicle Notes Amount", `+${formatCurrency(notesAmount)}`],
            ["Total Expense", formatCurrency(total)],
            ["Category", values.category ? category : "•"],
            ["Vendor / Payee", values.vendor || "•"],
            ["Date", formatDate(values.date)],
          ].map(([label, value], index) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className="text-[11.5px] text-slate-300">{label}</span>
              <span
                className={cn(
                  "max-w-[150px] truncate text-right text-[12px]",
                  index === 1 || index === 2 || index === 3
                    ? "font-semibold text-emerald-400"
                    : "text-slate-300",
                  value === "•" && "text-slate-500",
                )}
              >
                {value}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between gap-3">
            <span className="text-[11.5px] text-slate-300">Status</span>
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-[11px] font-medium capitalize text-emerald-400">
              {values.status.replace("_", " ")}
            </span>
          </div>
        </div>
      </aside>

      <aside className="rounded-md border border-slate-800/90 bg-card/80 p-4">
        <div className="mb-3 flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em] text-emerald-400">
          <Lightbulb className="h-4 w-4" />
          Tip
        </div>
        <p className="pl-6 text-[12px] leading-relaxed text-slate-400">
          Vehicle expense notes and amount are automatically included in the vehicle
          deal&apos;s total cost and profit calculations.
        </p>
      </aside>
    </div>
  );
}

export default function WholesaleAddVehicleExpensePageContent() {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<LinkedVehicleResult | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as Resolver<FormValues>,
    defaultValues,
    mode: "onBlur",
  });

  const values = form.watch();
  const notesAmount = useMemo(
    () => calculateNotesAmount(values.vehicleNotes),
    [values.vehicleNotes],
  );
  const total = (Number(values.amount) || 0) + notesAmount;

  const resetForAnother = () => {
    form.reset({ ...defaultValues, addAnother: true });
    setVehicle(null);
    setReceiptFile(null);
  };

  const onSubmit = form.handleSubmit(async (formValues) => {
    if (!vehicle) {
      toast.error("Associate a vehicle before saving this expense.");
      return;
    }
    if (vehicle.status === "Sold" || vehicle.status === "Loss") {
      toast.error("Expenses cannot be added to sold or loss vehicles.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        vehicleId: vehicle.id,
        expenseName: formValues.expenseName.trim(),
        expenseDate: formValues.date,
        expenseSubcategory: formValues.category as VehicleExpenseSubcategory,
        vendor: formValues.vendor.trim(),
        description: formValues.description?.trim() || undefined,
        amount: Number(formValues.amount) || 0,
        vehicleNotesAmount: notesAmount,
        referenceNumber: undefined,
        paymentMethod: formValues.paymentMethod as PaymentMethod,
        paymentStatus: formValues.status,
        notes:
          [
            formValues.vehicleNotes.trim(),
            formValues.description?.trim()
              ? `Description: ${formValues.description.trim()}`
              : "",
            notesAmount > 0
              ? `Vehicle notes amount: ${formatCurrency(notesAmount)}`
              : "",
          ]
            .filter(Boolean)
            .join("\n") || undefined,
        saveMerchant: false,
      };

      const formData = new FormData();
      formData.set("payload", JSON.stringify(payload));
      if (receiptFile) formData.set("receipt", receiptFile);

      const result = await createVehicleExpense(formData);
      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Vehicle expense saved successfully.");
      if (formValues.addAnother) {
        resetForAnother();
      } else {
        router.push("/dealer/dashboard#expenses");
      }
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="min-h-[calc(100vh-5rem)] text-slate-100">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[22px] font-bold text-white">Add Vehicle Expense</h1>
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_300px] 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-3">
              <SectionCard
                number="1"
                title="Associate With Vehicle"
                icon={<Car className="h-4 w-4" />}
              >
                <VehicleLookup vehicle={vehicle} onVehicleChange={setVehicle} />
                <div className="mt-3">
                  <FormField
                    control={form.control}
                    name="vehicleNotes"
                    render={({ field }) => (
                      <FormItem>
                        <NotesEditor
                          value={field.value}
                          onChange={field.onChange}
                          amount={notesAmount}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </SectionCard>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                <SectionCard
                  number="2"
                  title="Expense Information"
                  icon={<Receipt className="h-4 w-4" />}
                >
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="expenseName"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FieldLabel required>Expense Name</FieldLabel>
                          <FormControl>
                            <Input
                              theme="dark"
                              placeholder="e.g. Auction Fees"
                              aria-invalid={!!fieldState.error}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-3">
                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FieldLabel required>Category</FieldLabel>
                            <Select value={field.value || undefined} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger
                                  theme="dark"
                                  aria-invalid={!!fieldState.error}
                                >
                                  <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent theme="dark">
                                {VEHICLE_EXPENSE_SUBCATEGORIES.map((option) => (
                                  <SelectItem key={option.value} value={option.value} theme="dark">
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FieldLabel required>Amount</FieldLabel>
                            <FormControl>
                                <Input
                                  theme="dark"
                                  mode="currency"
                                  aria-invalid={!!fieldState.error}
                                  value={field.value}
                                onValueChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FieldLabel>Description (Optional)</FieldLabel>
                          <FormControl>
                            <Textarea
                              theme="dark"
                              rows={3}
                              maxLength={500}
                              showCount
                              placeholder="Enter description..."
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  number="3"
                  title="Payment Details"
                  icon={<FileText className="h-4 w-4" />}
                >
                  <div className="space-y-3">
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FieldLabel required>Payment Method</FieldLabel>
                          <Select value={field.value || undefined} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger
                                theme="dark"
                                aria-invalid={!!fieldState.error}
                              >
                                <SelectValue placeholder="Select Payment Method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent theme="dark">
                              {PAYMENT_METHOD_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value} theme="dark">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vendor"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FieldLabel required>Vendor / Payee</FieldLabel>
                          <FormControl>
                            <Input
                              theme="dark"
                              placeholder="Enter vendor or payee name"
                              aria-invalid={!!fieldState.error}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field, fieldState }) => (
                          <FormItem>
                            <FieldLabel required>Date</FieldLabel>
                            <FormControl>
                                <Input
                                  theme="dark"
                                  mode="date"
                                  aria-invalid={!!fieldState.error}
                                {...field}
                                value={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FieldLabel required>Status</FieldLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger
                                  theme="dark"
                                >
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent theme="dark">
                                <SelectItem value="paid" theme="dark">Paid</SelectItem>
                                <SelectItem value="unpaid" theme="dark">Unpaid</SelectItem>
                                <SelectItem value="partial" theme="dark">Partial</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </SectionCard>
              </div>

              <SectionCard
                number="4"
                title="Attach Receipt (Optional)"
                icon={<Paperclip className="h-4 w-4" />}
              >
                <ReceiptDropZone file={receiptFile} onFileChange={setReceiptFile} />
              </SectionCard>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <FormField
                  control={form.control}
                  name="addAnother"
                  render={({ field }) => (
                    <label className="flex cursor-pointer items-center gap-3">
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-checked:bg-emerald-600"
                      />
                      <span>
                        <span className="block text-[12px] font-medium text-slate-200">
                          Add Another Expense
                        </span>
                        <span className="block text-[11px] text-slate-500">
                          Save and add another expense
                        </span>
                      </span>
                    </label>
                  )}
                />

                <div className="flex items-center gap-2 self-end">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 border-slate-800 bg-card px-5 text-[12px] text-slate-300 hover:bg-slate-800"
                    onClick={() => router.back()}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="h-9 bg-emerald-600 px-6 text-[12px] hover:bg-emerald-500"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Check className="mr-1.5 h-4 w-4" />
                        Save Expense
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <SummaryPanel
              vehicle={vehicle}
              values={values}
              notesAmount={notesAmount}
              total={total}
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
