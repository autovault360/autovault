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
import { cn } from "@/lib/utils";
import {
  EXPENSE_FORM_CATEGORIES,
  PAYMENT_METHOD_OPTIONS,
  TAX_DEDUCTIBLE_OPTIONS,
  type ExpenseFormType,
} from "@/lib/expenses/form-types";
import { useAddDealershipExpenseForm } from "@/hooks/expenses/use-add-dealership-expense-form";
import ExpenseFormModalShell, {
  ExpenseFileDrop,
  ExpenseFormGroup,
  ExpenseFormRow,
  ExpenseGhostButton,
  ExpensePrimaryButton,
} from "./expense-form-modal-shell";

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
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    saveModeRef,
  } = useAddDealershipExpenseForm(expenseType, open, () => onOpenChange(false));

  return (
    <ExpenseFormModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Add Expense"
      footer={
        <>
          <ExpenseGhostButton onClick={() => onOpenChange(false)}>
            Cancel
          </ExpenseGhostButton>
          <ExpensePrimaryButton
            disabled={form.formState.isSubmitting}
            onClick={() => {
              saveModeRef.current = "save";
              handleSubmit();
            }}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Expense"}
          </ExpensePrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <div className={cn(shake && "animate-shake")}>
          <FormField
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <FormItem>
                <ExpenseFormGroup label="Expense name" required>
                  <FormControl>
                    <Input
                      theme="dark"
                      placeholder="e.g. Showroom rent, Manheim buyer fee"
                      className="h-9 bg-slate-900/80"
                      aria-invalid={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </ExpenseFormGroup>
              </FormItem>
            )}
          />

          <ExpenseFormRow>
            <FormField
              control={form.control}
              name="category"
              render={({ field, fieldState }) => (
                <FormItem>
                  <ExpenseFormGroup label="Category" required>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark" className="h-9 bg-slate-900/80" aria-invalid={!!fieldState.error}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                          {EXPENSE_FORM_CATEGORIES.map((option) => (
                            <SelectItem key={option.value} value={option.value} theme="dark">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </ExpenseFormGroup>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field, fieldState }) => (
                <FormItem>
                  <ExpenseFormGroup label="Amount ($)" required>
                    <FormControl>
                      <Input
                        theme="dark"
                        mode="currency"
                        value={field.value}
                        onValueChange={field.onChange}
                        className="h-9"
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </ExpenseFormGroup>
                </FormItem>
              )}
            />
          </ExpenseFormRow>

          <ExpenseFormRow>
            <FormField
              control={form.control}
              name="expenseDate"
              render={({ field, fieldState }) => (
                <FormItem>
                  <ExpenseFormGroup label="Due date" required>
                    <FormControl>
                      <Input theme="dark" mode="date" className="h-9 bg-slate-900/80" aria-invalid={!!fieldState.error} {...field} />
                    </FormControl>
                    <FormMessage />
                  </ExpenseFormGroup>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="markRecurring"
              render={({ field }) => (
                <FormItem>
                  <ExpenseFormGroup label="Frequency">
                    <FormControl>
                      <Select
                        value={field.value || expenseType === "recurring" ? "recurring" : "one_time"}
                        onValueChange={(value) => field.onChange(value === "recurring")}
                      >
                        <SelectTrigger theme="dark" className="h-9 bg-slate-900/80">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                          <SelectItem value="one_time" theme="dark">One-time</SelectItem>
                          <SelectItem value="recurring" theme="dark">Monthly (recurring)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </ExpenseFormGroup>
                </FormItem>
              )}
            />
          </ExpenseFormRow>

          <ExpenseFormRow>
            <FormField
              control={form.control}
              name="vendor"
              render={({ field, fieldState }) => (
                <FormItem>
                  <ExpenseFormGroup label="Vendor / Payee" required>
                    <FormControl>
                      <Input theme="dark" placeholder="Enter vendor or payee name" className="h-9 bg-slate-900/80" aria-invalid={!!fieldState.error} {...field} />
                    </FormControl>
                    <FormMessage />
                  </ExpenseFormGroup>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem>
                  <ExpenseFormGroup label="Payment Method">
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark" className="h-9 bg-slate-900/80">
                          <SelectValue placeholder="Not specified" />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                          {PAYMENT_METHOD_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} theme="dark">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </ExpenseFormGroup>
                </FormItem>
              )}
            />
          </ExpenseFormRow>

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <ExpenseFormGroup label="Reference / check number">
                  <FormControl>
                    <Input theme="dark" placeholder="Enter check # or reference" className="h-9 bg-slate-900/80" {...field} />
                  </FormControl>
                </ExpenseFormGroup>
              </FormItem>
            )}
          />

          <ExpenseFormGroup label="Receipt">
            {receiptPreview ? (
              <div className="overflow-hidden rounded-[9px] border border-slate-700 bg-white">
                <img src={receiptPreview} alt="Receipt preview" className="max-h-[220px] w-full object-contain" />
              </div>
            ) : (
              <ExpenseFileDrop
                hasFile={!!receiptFile}
                label={
                  receiptFile
                    ? receiptFile.name
                    : "Upload receipt (PDF or image)"
                }
                onClick={() => fileInputRef.current?.click()}
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
            />
          </ExpenseFormGroup>

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <ExpenseFormGroup label="Notes">
                  <FormControl>
                    <Input
                      theme="dark"
                      placeholder="Optional — vendor, reference #, context"
                      className="h-9 bg-slate-900/80"
                      {...field}
                    />
                  </FormControl>
                </ExpenseFormGroup>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="taxDeductible"
            render={({ field }) => (
              <FormItem className="hidden">
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger theme="dark"><SelectValue /></SelectTrigger>
                  <SelectContent theme="dark">
                    {TAX_DEDUCTIBLE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} theme="dark">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </Form>
    </ExpenseFormModalShell>
  );
}
