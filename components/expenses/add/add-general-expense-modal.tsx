"use client";

import { useRef } from "react";
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
import {
  FieldLabel,
  ModalBody,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";
import { cn } from "@/lib/utils";
import {
  EXPENSE_FORM_CATEGORIES,
  PAYMENT_METHOD_OPTIONS,
  TAX_DEDUCTIBLE_OPTIONS,
  type ExpenseFormType,
} from "@/lib/expenses/form-types";
import { useAddDealershipExpenseForm } from "@/hooks/expenses/use-add-dealership-expense-form";
import {
  ModalFooterActions,
  OptionCheckbox,
  ReceiptUploadSection,
  SideCard,
} from "./add-expense-modal-parts";

export default function AddGeneralExpenseModal({
  open,
  onOpenChange,
  expenseType = "general",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenseType?: ExpenseFormType;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    form,
    handleSubmit,
    selectedCategory,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    saveModeRef,
  } = useAddDealershipExpenseForm(expenseType, open, () => onOpenChange(false));

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} theme="dark">
      <Form {...form}>
        <div className="flex max-h-[min(90vh,820px)] flex-col">
          <div className="shrink-0 border-b border-slate-700/80 px-6 pb-4 pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[17px] font-bold leading-tight text-white">
                  Add Expense
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
                  Enter expense details below. All fields marked with * are
                  required.
                </p>
              </div>
            </div>
          </div>

          <ModalBody shake={shake} className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,1fr)] lg:gap-6">
              <div className="min-w-0 space-y-3.5">
                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
                          <FieldLabel label="Expense Category" required />
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
                                <span className="flex items-center gap-2 truncate">
                                  <selectedCategory.icon
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      selectedCategory.iconClassName,
                                    )}
                                  />
                                  <span className="truncate">
                                    {selectedCategory.label}
                                  </span>
                                </span>
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent
                              theme="dark"
                              className="min-w-[var(--radix-select-trigger-width)]"
                            >
                              {EXPENSE_FORM_CATEGORIES.map((option) => {
                                const Icon = option.icon;
                                return (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                    theme="dark"
                                    className="py-2 pl-2.5 focus:bg-blue-600 focus:text-white data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                                  >
                                    <span className="flex items-center gap-2.5">
                                      <Icon
                                        className={cn(
                                          "h-4 w-4 shrink-0",
                                          option.iconClassName,
                                        )}
                                      />
                                      {option.label}
                                    </span>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expenseDate"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
                          <FieldLabel label="Expense Date" required />
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Input
                            theme="dark"
                            mode="date"
                            aria-invalid={!!fieldState.error}
                            {...field}
                            className="bg-slate-800/50"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Reference / Check #" />
                      <FormControl>
                        <Input
                          theme="dark"
                          placeholder="Enter check # or reference"
                          className="h-8 bg-slate-800/50"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
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
                  name="description"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Description" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Textarea
                          showCount
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          maxLength={150}
                          placeholder="Enter expense description"
                          rows={5}
                          aria-invalid={!!fieldState.error}
                          className="min-h-[88px] resize-none rounded-[6px] border-slate-600 bg-[#1a2332] px-3 py-2.5 text-[13px] text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
                          <FieldLabel label="Amount" required />
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Input
                            theme="dark"
                            mode="currency"
                            value={field.value}
                            onValueChange={field.onChange}
                            className="h-8"
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxDeductible"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
                          <FieldLabel label="Tax Deductible" />
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger theme="dark" className="bg-slate-800/50">
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
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {expenseType !== "recurring" && (
                  <FormField
                    control={form.control}
                    name="markRecurring"
                    render={({ field }) => (
                      <label className="flex cursor-pointer items-center gap-2.5 pt-0.5">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          className="h-4 w-4 rounded border-slate-600 bg-slate-800/50 accent-blue-500"
                        />
                        <span className="text-[12px] text-slate-300">
                          Mark as recurring expense
                        </span>
                      </label>
                    )}
                  />
                )}
              </div>

              <div className="flex min-w-0 flex-col gap-3.5 lg:pt-0">
                <ReceiptUploadSection
                  receiptFile={receiptFile}
                  receiptPreview={receiptPreview}
                  fileInputRef={fileInputRef}
                  onFileChange={setReceiptFile}
                />

                <SideCard title="Additional Options">
                  <FormField
                    control={form.control}
                    name="saveMerchant"
                    render={({ field }) => (
                      <OptionCheckbox
                        checked={field.value}
                        onChange={field.onChange}
                        label="Add to a merchant / vendor"
                        helper="Save this vendor for future use"
                      />
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="addNote"
                    render={({ field }) => (
                      <>
                        <OptionCheckbox
                          checked={field.value}
                          onChange={field.onChange}
                          label="Add a note"
                          helper="Add a note or memo about this expense"
                        />
                        {field.value && (
                          <FormField
                            control={form.control}
                            name="notes"
                            render={({ field: noteField }) => (
                              <FormControl>
                                <Input
                                  theme="dark"
                                  placeholder="Enter note"
                                  className="mt-2 h-8 bg-slate-800/50"
                                  {...noteField}
                                />
                              </FormControl>
                            )}
                          />
                        )}
                      </>
                    )}
                  />
                </SideCard>
              </div>
            </div>
          </ModalBody>

          <ModalFooterActions
            saving={form.formState.isSubmitting}
            onCancel={() => onOpenChange(false)}
            onSaveAndAddAnother={() => {
              saveModeRef.current = "saveAndAddAnother";
              handleSubmit();
            }}
            onSave={() => {
              saveModeRef.current = "save";
              handleSubmit();
            }}
          />
        </div>
      </Form>
    </VehicleActionDialog>
  );
}
