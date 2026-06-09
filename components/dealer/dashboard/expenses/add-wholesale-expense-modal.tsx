"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Pencil, Upload, X } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  FieldLabel,
  ModalBody,
  ModalSectionTitle,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";
import { cn } from "@/lib/utils";
import { PAYMENT_METHOD_OPTIONS } from "@/lib/expenses/form-types";
import type { ExpenseCategory } from "@/lib/dealer/dashboard/types";
import {
  WHOLESALE_EXPENSE_CATEGORY_LABELS,
  WHOLESALE_EXPENSE_STATUSES,
  WHOLESALE_EXPENSE_TAG_OPTIONS,
} from "@/lib/dealer/dashboard/expense-form-constants";
import { useAddWholesaleExpenseForm } from "@/hooks/dealer/use-add-wholesale-expense-form";
import { DateField } from "@/components/expenses/add/add-expense-modal-parts";

export default function AddWholesaleExpenseModal({
  open,
  onOpenChange,
  onSave,
  saving = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<void>;
  saving?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const {
    form,
    handleSubmit,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    saveModeRef,
  } = useAddWholesaleExpenseForm(open, onSave, () => onOpenChange(false));

  const [addAnother, setAddAnother] = useState(false);
  const selectedTags = form.watch("tags") ?? [];

  useEffect(() => {
    if (open) {
      setAddAnother(false);
      saveModeRef.current = "save";
    }
  }, [open, saveModeRef]);

  const toggleTag = (tag: string) => {
    const current = form.getValues("tags") ?? [];
    const next = current.includes(tag)
      ? current.filter((value) => value !== tag)
      : [...current, tag];
    form.setValue("tags", next, { shouldDirty: true });
  };

  return (
    <VehicleActionDialog
      open={open}
      onOpenChange={onOpenChange}
      theme="dark"
      size="xl"
    >
      <Form {...form}>
        <div className="flex max-h-[min(90vh,820px)] flex-col">
          <div className="shrink-0 border-b border-slate-700/80 px-6 pb-4 pt-5">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-[17px] font-bold leading-tight text-white">
                Add New Expense
              </h2>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <ModalBody shake={shake} className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
              <div className="min-w-0 space-y-3.5">
                <ModalSectionTitle>Expense Information</ModalSectionTitle>

                <FormField
                  control={form.control}
                  name="expenseName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Expense Name" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          theme="dark"
                          placeholder="e.g. Auction Fees"
                          className="h-8 bg-slate-800/50"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Category" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            theme="dark"
                            className="bg-slate-800/50"
                            aria-invalid={!!fieldState.error}
                          >
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                          <SelectContent theme="dark">
                            {(
                              Object.keys(
                                WHOLESALE_EXPENSE_CATEGORY_LABELS,
                              ) as ExpenseCategory[]
                            ).map((cat) => (
                              <SelectItem key={cat} value={cat} theme="dark">
                                {WHOLESALE_EXPENSE_CATEGORY_LABELS[cat]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Amount" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          theme="dark"
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          className="h-8 bg-slate-800/50"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Description" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Textarea
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          placeholder="Enter description (optional)..."
                          rows={3}
                          aria-invalid={!!fieldState.error}
                          className="min-h-[72px] resize-none rounded-[6px] border-slate-600 bg-slate-800/50 px-3 py-2.5 text-[13px] text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="rounded-[6px] border border-emerald-500/40 bg-emerald-500/5 p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Pencil className="h-3.5 w-3.5 text-emerald-400" />
                          <FieldLabel label="Add Notes (Optional)" />
                        </div>
                        <FormControl>
                          <Textarea
                            showCount
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            maxLength={500}
                            placeholder="Add internal notes about this expense..."
                            rows={3}
                            aria-invalid={!!fieldState.error}
                            className="min-h-[72px] resize-none rounded-[6px] border-slate-600 bg-slate-800/50 px-3 py-2.5 text-[13px] text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:border-emerald-500 focus-visible:ring-0"
                          />
                        </FormControl>
                        <FormMessage className="mt-1" />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Reference #" />
                      <FormControl>
                        <Input
                          theme="dark"
                          placeholder="Enter reference number (optional)..."
                          className="h-8 bg-slate-800/50"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={() => (
                    <FormItem>
                      <FieldLabel label="Tags (Optional)" />
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (value) toggleTag(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger theme="dark" className="bg-slate-800/50">
                            <SelectValue placeholder="Add tags..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          {WHOLESALE_EXPENSE_TAG_OPTIONS.map((option) => (
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
                      {selectedTags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedTags.map((tag) => {
                            const label =
                              WHOLESALE_EXPENSE_TAG_OPTIONS.find(
                                (option) => option.value === tag,
                              )?.label ?? tag;
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => toggleTag(tag)}
                                className="inline-flex items-center gap-1 rounded-full border border-slate-600 bg-slate-800/60 px-2 py-0.5 text-[11px] text-slate-300 hover:border-slate-500"
                              >
                                {label}
                                <X className="h-3 w-3" />
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </FormItem>
                  )}
                />
              </div>

              <div className="min-w-0 space-y-3.5">
                <ModalSectionTitle>Payment Details</ModalSectionTitle>

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Payment Method" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Select
                          value={field.value || undefined}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger
                            theme="dark"
                            className="bg-slate-800/50"
                            aria-invalid={!!fieldState.error}
                          >
                            <SelectValue placeholder="Select Payment Method" />
                          </SelectTrigger>
                          <SelectContent theme="dark">
                            {PAYMENT_METHOD_OPTIONS.map((option) => (
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
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Vendor / Payee" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          theme="dark"
                          placeholder="Enter vendor or payee name"
                          className="h-8 bg-slate-800/50"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expenseDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-1">
                        <FieldLabel label="Date" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <DateField
                          value={field.value}
                          onChange={field.onChange}
                          dateInputRef={dateInputRef}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field, fieldState }) => {
                    const selectedStatus = WHOLESALE_EXPENSE_STATUSES.find(
                      (option) => option.value === field.value,
                    );
                    return (
                      <FormItem>
                        <div className="flex items-center justify-between gap-1">
                          <FieldLabel label="Status" required />
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger
                              theme="dark"
                              className="bg-slate-800/50"
                              aria-invalid={!!fieldState.error}
                            >
                              <SelectValue>
                                <span
                                  className={cn(
                                    selectedStatus?.className ?? "text-slate-100",
                                  )}
                                >
                                  {selectedStatus?.label ?? "Select status"}
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent theme="dark">
                              {WHOLESALE_EXPENSE_STATUSES.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                  theme="dark"
                                >
                                  <span className={option.className}>
                                    {option.label}
                                  </span>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    );
                  }}
                />

                <div>
                  <FieldLabel label="Attach Receipt (Optional)" />
                  {receiptPreview ? (
                    <div className="group relative mt-1 min-h-[180px] overflow-hidden rounded-md border border-dashed border-slate-600/90 bg-[#0d1420]">
                      <img
                        src={receiptPreview}
                        alt="Receipt preview"
                        className="h-full min-h-[180px] w-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          type="button"
                          className="h-8 rounded-[4px] bg-blue-600 px-4 text-[11.5px] font-medium hover:bg-blue-500"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Change
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          className="ml-2 h-8 rounded-[4px] px-4 text-[11.5px] font-medium"
                          onClick={() => setReceiptFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && fileInputRef.current?.click()
                      }
                      onClick={() => fileInputRef.current?.click()}
                      className="mt-1 flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-md border border-dashed border-slate-600/90 bg-[#0d1420] px-4 py-6 text-center transition hover:border-slate-500"
                    >
                      <Upload className="mb-2 h-8 w-8 text-slate-500" />
                      <p className="text-[12px] text-slate-300">
                        Drag & drop file here or
                      </p>
                      <Button
                        type="button"
                        className="mt-2.5 h-8 rounded-[4px] bg-slate-700 px-4 text-[11.5px] font-medium text-slate-200 hover:bg-slate-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        Choose File
                      </Button>
                      <p className="mt-2.5 text-[10px] text-slate-500">
                        Accepted formats: PDF, JPG, PNG (Max 10MB)
                      </p>
                      {receiptFile && (
                        <p className="mt-2 max-w-full truncate text-[13px] text-blue-400">
                          {receiptFile.name}
                        </p>
                      )}
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    className="hidden"
                    onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            </div>
          </ModalBody>

          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-700/80 bg-[#0f1621] px-6 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={addAnother}
                onChange={(e) => {
                  setAddAnother(e.target.checked);
                  saveModeRef.current = e.target.checked
                    ? "saveAndAddAnother"
                    : "save";
                }}
                className="h-4 w-4 rounded border-slate-600 bg-slate-800/50 accent-emerald-500"
              />
              <span className="text-[12px] text-slate-300">
                Add Another Expense
              </span>
            </label>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                theme="dark"
                variant="outline"
                className="h-8 rounded-[4px] border-slate-600 bg-transparent px-4 text-[12px] text-slate-300 hover:bg-slate-800/50"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="h-8 rounded-[4px] bg-emerald-600 px-4 text-[12px] font-medium hover:bg-emerald-500"
                onClick={() => {
                  saveModeRef.current = addAnother
                    ? "saveAndAddAnother"
                    : "save";
                  handleSubmit();
                }}
                disabled={saving}
              >
                {saving && (
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                )}
                Save Expense
              </Button>
            </div>
          </div>
        </div>
      </Form>
    </VehicleActionDialog>
  );
}
