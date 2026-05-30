"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar, Upload, X } from "lucide-react";
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
import {
  FieldLabel,
  ModalBody,
  TextareaWithCount,
  VehicleActionDialog,
} from "@/components/vehicles/detail/modals/modal-primitives";
import { cn } from "@/lib/utils";
import {
  EXPENSE_FORM_CATEGORIES,
  getCategoryOption,
  getDefaultCategoryForType,
  TAX_DEDUCTIBLE_OPTIONS,
  type ExpenseFormCategory,
  type ExpenseFormType,
} from "@/lib/expenses/form-types";

type FormState = {
  category: ExpenseFormCategory;
  expenseDate: string;
  reference: string;
  vendor: string;
  description: string;
  amount: number;
  taxDeductible: "yes" | "no";
  markRecurring: boolean;
  saveMerchant: boolean;
  addNote: boolean;
};

const INITIAL_FORM: FormState = {
  category: "all",
  expenseDate: "2025-05-29",
  reference: "",
  vendor: "",
  description: "",
  amount: 0,
  taxDeductible: "yes",
  markRecurring: false,
  saveMerchant: false,
  addNote: false,
};

function formatDateLabel(value: string): string {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AddExpenseModal({
  open,
  onOpenChange,
  expenseType = "general",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseType?: ExpenseFormType;
}) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      ...INITIAL_FORM,
      category: getDefaultCategoryForType(expenseType),
    });
    setReceiptFile(null);
  }, [open, expenseType]);

  const patchForm = (patch: Partial<FormState>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const handleSave = (addAnother: boolean) => {
    toast.success(
      addAnother
        ? "Expense saved. You can add another."
        : "Expense saved successfully.",
    );
    if (addAnother) {
      setForm({
        ...INITIAL_FORM,
        category: getDefaultCategoryForType(expenseType),
      });
      setReceiptFile(null);
      return;
    }
    onOpenChange(false);
  };

  const selectedCategory = getCategoryOption(form.category);

  return (
    <VehicleActionDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      theme="dark"
    >
      <div className="flex items-start justify-between border-b border-slate-700 px-6 pb-4 pt-6">
        <div>
          <h2 className="text-[18px] font-bold text-white">Add Expense</h2>
          <p className="mt-1 text-[12.5px] text-slate-400">
            Enter expense details below. All fields marked with * are required.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <ModalBody className="space-y-0 pb-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-4">
            <FormFieldBlock label="Expense Category" required>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  patchForm({ category: value as ExpenseFormCategory })
                }
              >
                <SelectTrigger theme="dark" className="h-9 bg-[#1a2332]">
                  <SelectValue>
                    <span className="flex items-center gap-2">
                      <selectedCategory.icon
                        className={cn("h-4 w-4", selectedCategory.iconClassName)}
                      />
                      {selectedCategory.label}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent theme="dark" className="min-w-[var(--radix-select-trigger-width)]">
                  {EXPENSE_FORM_CATEGORIES.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        theme="dark"
                        className="py-2.5 pl-2.5 focus:bg-blue-600/90 focus:text-white data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className={cn("h-4 w-4", option.iconClassName)} />
                          {option.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </FormFieldBlock>

            <FormFieldBlock label="Expense Date" required>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => dateInputRef.current?.showPicker?.()}
                  className="flex h-9 w-full items-center justify-between rounded-[4px] border border-slate-600 bg-[#1a2332] px-3 text-left text-[13px] text-slate-100"
                >
                  {formatDateLabel(form.expenseDate)}
                  <Calendar className="h-4 w-4 text-slate-400" />
                </button>
                <input
                  ref={dateInputRef}
                  type="date"
                  value={form.expenseDate}
                  onChange={(e) => patchForm({ expenseDate: e.target.value })}
                  className="pointer-events-none absolute inset-0 opacity-0"
                  tabIndex={-1}
                />
              </div>
            </FormFieldBlock>

            <FormFieldBlock label="Reference / Check #">
              <Input
                theme="dark"
                value={form.reference}
                onChange={(e) => patchForm({ reference: e.target.value })}
                placeholder="Enter check # or reference"
                className="h-9 bg-[#1a2332]"
              />
            </FormFieldBlock>

            <FormFieldBlock label="Vendor / Payee" required>
              <Input
                theme="dark"
                value={form.vendor}
                onChange={(e) => patchForm({ vendor: e.target.value })}
                placeholder="Enter vendor or payee name"
                className="h-9 bg-[#1a2332]"
              />
            </FormFieldBlock>

            <FormFieldBlock label="Description" required>
              <TextareaWithCount
                value={form.description}
                onChange={(value) => patchForm({ description: value })}
                maxLength={150}
                placeholder="Enter expense description"
                rows={4}
              />
            </FormFieldBlock>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormFieldBlock label="Amount" required>
                <Input
                  theme="dark"
                  mode="currency"
                  value={form.amount}
                  onValueChange={(value) => patchForm({ amount: value })}
                  className="h-9"
                />
              </FormFieldBlock>

              <FormFieldBlock label="Tax Deductible">
                <Select
                  value={form.taxDeductible}
                  onValueChange={(value) =>
                    patchForm({ taxDeductible: value as "yes" | "no" })
                  }
                >
                  <SelectTrigger theme="dark" className="h-9 bg-[#1a2332]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent theme="dark">
                    {TAX_DEDUCTIBLE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value}
                        value={option.value}
                        theme="dark"
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormFieldBlock>
            </div>

            <label className="flex cursor-pointer items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                checked={form.markRecurring}
                onChange={(e) => patchForm({ markRecurring: e.target.checked })}
                className="h-4 w-4 rounded border-slate-600 bg-[#1a2332] accent-blue-500"
              />
              <span className="text-[12.5px] text-slate-300">
                Mark as recurring expense
              </span>
            </label>
          </div>

          <div className="space-y-4">
            <SideCard title="Receipt" subtitle="Upload a receipt or invoice for this expense.">
              <div
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-600 bg-[#101722] px-4 py-8 text-center transition hover:border-slate-500"
              >
                <Upload className="mb-3 h-7 w-7 text-slate-400" />
                <p className="text-[12.5px] font-medium text-slate-200">
                  Drag & drop your file here
                </p>
                <p className="mt-1 text-[11.5px] text-slate-500">or</p>
                <Button
                  type="button"
                  className="mt-3 h-8 bg-blue-600 px-4 text-[12px] hover:bg-blue-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                >
                  Choose File
                </Button>
                <p className="mt-3 text-[10.5px] text-slate-500">
                  JPG, PNG, PDF up to 10MB
                </p>
                {receiptFile && (
                  <p className="mt-2 truncate text-[11px] text-blue-400">
                    {receiptFile.name}
                  </p>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                className="hidden"
                onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
              />
            </SideCard>

            <SideCard title="Additional Options">
              <OptionCheckbox
                checked={form.saveMerchant}
                onChange={(checked) => patchForm({ saveMerchant: checked })}
                label="Add to a merchant / vendor"
                helper="Save this vendor for future use"
              />
              <OptionCheckbox
                checked={form.addNote}
                onChange={(checked) => patchForm({ addNote: checked })}
                label="Add a note"
                helper="Add a note or memo about this expense"
              />
            </SideCard>
          </div>
        </div>
      </ModalBody>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-700 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
        <Button
          type="button"
          theme="dark"
          variant="outline"
          className="h-9 border-slate-600 bg-transparent px-4 text-slate-300 hover:bg-slate-800"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="h-9 bg-blue-600 px-4 hover:bg-blue-500"
          onClick={() => handleSave(true)}
        >
          Save & Add Another
        </Button>
        <Button
          type="button"
          className="h-9 bg-emerald-600 px-4 hover:bg-emerald-500"
          onClick={() => handleSave(false)}
        >
          Save Expense
        </Button>
      </div>
    </VehicleActionDialog>
  );
}

function FormFieldBlock({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <FieldLabel label={label} required={required} />
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SideCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-700/80 bg-[#0b121f]/60 p-4">
      <h3 className="text-[13px] font-semibold text-white">{title}</h3>
      {subtitle && (
        <p className="mt-1 text-[11.5px] leading-relaxed text-slate-500">
          {subtitle}
        </p>
      )}
      <div className={subtitle ? "mt-3" : "mt-2"}>{children}</div>
    </div>
  );
}

function OptionCheckbox({
  checked,
  onChange,
  label,
  helper,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  helper: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 py-2 first:pt-0 last:pb-0">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-600 bg-[#1a2332] accent-blue-500"
      />
      <span>
        <span className="block text-[12.5px] text-slate-200">{label}</span>
        <span className="mt-0.5 block text-[11px] text-slate-500">{helper}</span>
      </span>
    </label>
  );
}
