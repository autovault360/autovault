"use client";

import { useRef } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TextareaWithCount } from "@/components/vehicles/detail/modals/modal-primitives";
import { getModalShellClass } from "@/components/vehicles/detail/modals/modal-theme";
import { ModalThemeProvider } from "@/components/vehicles/detail/modals/modal-theme-context";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  EXPENSE_FORM_CATEGORIES,
  PAYMENT_METHOD_OPTIONS,
  TAX_DEDUCTIBLE_OPTIONS,
  type ExpenseFormType,
} from "@/lib/expenses/form-types";
import { useAddDealershipExpenseForm } from "@/hooks/expenses/use-add-dealership-expense-form";
import {
  FormFieldBlock,
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
    patchForm,
    selectedCategory,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    saving,
    submit,
  } = useAddDealershipExpenseForm(expenseType, open);

  const handleSave = async (addAnother: boolean) => {
    const ok = await submit(addAnother);
    if (ok && !addAnother) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "gap-0 overflow-hidden border-0 p-0 shadow-xl ring-0",
          "w-[min(980px,calc(100vw-2rem))] max-w-none sm:max-w-none",
          getModalShellClass("dark"),
        )}
      >
        <DialogTitle className="sr-only">Add Expense</DialogTitle>
        <ModalThemeProvider theme="dark">
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
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="rounded-md p-1 text-slate-400 transition hover:bg-slate-800/50 hover:text-slate-200"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,1fr)] lg:gap-6">
                <div className="min-w-0 space-y-3.5">
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <FormFieldBlock label="Expense Category" required>
                      <Select
                        value={form.category}
                        onValueChange={(value) =>
                          patchForm({
                            category: value as typeof form.category,
                          })
                        }
                      >
                        <SelectTrigger theme="dark" className="bg-slate-800/50">
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
                    </FormFieldBlock>

                    <FormFieldBlock label="Expense Date" required>
                      <Input
                        theme="dark"
                        mode="date"
                        value={form.expenseDate}
                        onChange={(e) => patchForm({ expenseDate: e.target.value })}
                        className="bg-slate-800/50"
                      />
                    </FormFieldBlock>
                  </div>

                  <FormFieldBlock label="Reference / Check #">
                    <Input
                      theme="dark"
                      value={form.reference}
                      onChange={(e) => patchForm({ reference: e.target.value })}
                      placeholder="Enter check # or reference"
                      className="h-8 bg-slate-800/50"
                    />
                  </FormFieldBlock>

                  <FormFieldBlock label="Vendor / Payee" required>
                    <Input
                      theme="dark"
                      value={form.vendor}
                      onChange={(e) => patchForm({ vendor: e.target.value })}
                      placeholder="Enter vendor or payee name"
                      className="h-8 bg-slate-800/50"
                    />
                  </FormFieldBlock>

                  <FormFieldBlock label="Description" required>
                    <TextareaWithCount
                      value={form.description}
                      onChange={(value) => patchForm({ description: value })}
                      maxLength={150}
                      placeholder="Enter expense description"
                      rows={5}
                    />
                  </FormFieldBlock>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <FormFieldBlock label="Amount" required>
                      <Input
                        theme="dark"
                        mode="currency"
                        value={form.amount}
                        onValueChange={(value) => patchForm({ amount: value })}
                        className="h-8"
                      />
                    </FormFieldBlock>

                    <FormFieldBlock label="Tax Deductible">
                      <Select
                        value={form.taxDeductible}
                        onValueChange={(value) =>
                          patchForm({
                            taxDeductible: value as "yes" | "no",
                          })
                        }
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
                    </FormFieldBlock>
                  </div>

                  {expenseType !== "recurring" && (
                    <label className="flex cursor-pointer items-center gap-2.5 pt-0.5">
                      <input
                        type="checkbox"
                        checked={form.markRecurring}
                        onChange={(e) =>
                          patchForm({ markRecurring: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-slate-600 bg-slate-800/50 accent-blue-500"
                      />
                      <span className="text-[12px] text-slate-300">
                        Mark as recurring expense
                      </span>
                    </label>
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
                    {form.addNote && (
                      <Input
                        theme="dark"
                        value={form.notes}
                        onChange={(e) => patchForm({ notes: e.target.value })}
                        placeholder="Enter note"
                        className="mt-2 h-8 bg-slate-800/50"
                      />
                    )}
                  </SideCard>
                </div>
              </div>
            </div>

            <ModalFooterActions
              saving={saving}
              onCancel={() => onOpenChange(false)}
              onSaveAndAddAnother={() => handleSave(true)}
              onSave={() => handleSave(false)}
            />
          </div>
        </ModalThemeProvider>
      </DialogContent>
    </Dialog>
  );
}
