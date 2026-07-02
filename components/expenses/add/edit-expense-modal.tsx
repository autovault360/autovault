"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
  VEHICLE_EXPENSE_SUBCATEGORIES,
} from "@/lib/expenses/form-types";
import type { ExpenseDetail } from "@/lib/expenses/types";
import { deleteExpense } from "@/lib/expenses/server/delete-expense";
import { useEditExpenseForm } from "@/hooks/expenses/use-edit-expense-form";
import LinkedVehicleSection from "./linked-vehicle-section";
import ExpenseFormModalShell, {
  ExpenseFileDrop,
  ExpenseFormGroup,
  ExpenseFormRow,
  ExpenseGhostButton,
  ExpensePrimaryButton,
} from "./expense-form-modal-shell";

export default function EditExpenseModal({
  expense,
  open,
  onOpenChange,
  onDeleted,
}: {
  expense: ExpenseDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted?: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();
  const {
    form,
    handleSubmit,
    linkedVehicle,
    setLinkedVehicle,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    isVehicle,
    vehicleIsSold,
    linkedVehicleLoading,
  } = useEditExpenseForm(expense, open, () => onOpenChange(false));

  const handleDelete = () => {
    if (!confirm("Delete this expense? This action cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteExpense({
        expenseKind: expense.expenseKind,
        expenseId: expense.id,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Expense deleted.");
      onDeleted?.();
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <ExpenseFormModalShell
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Expense"
      footer={
        <>
          <ExpenseGhostButton
            onClick={handleDelete}
            className="mr-auto border-red-500/40 text-red-400 hover:border-red-500/60 hover:bg-red-500/10"
          >
            Delete
          </ExpenseGhostButton>
          <ExpenseGhostButton onClick={() => onOpenChange(false)}>
            Cancel
          </ExpenseGhostButton>
          <ExpensePrimaryButton
            disabled={form.formState.isSubmitting || vehicleIsSold}
            onClick={() => handleSubmit()}
          >
            {form.formState.isSubmitting ? "Saving..." : "Save Expense"}
          </ExpensePrimaryButton>
        </>
      }
    >
      <Form {...form}>
        <div className={cn(shake && "animate-shake")}>
          {linkedVehicleLoading && (
            <div className="mb-4 flex items-center gap-2 text-[12px] text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading linked vehicle...
            </div>
          )}

          {vehicleIsSold && (
            <div className="mb-4 flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 p-3 text-[12px] text-red-300">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              This vehicle is already marked as sold. Select a different vehicle.
            </div>
          )}

          {isVehicle && (
            <div className="mb-4">
              <LinkedVehicleSection
                vehicle={linkedVehicle}
                onVehicleChange={setLinkedVehicle}
                readOnly
              />
            </div>
          )}

          <FormField
            control={form.control}
            name={isVehicle ? "expenseName" : "description"}
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
            {isVehicle ? (
              <FormField
                control={form.control}
                name="vehicleSubcategory"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <ExpenseFormGroup label="Category" required>
                      <FormControl>
                        <Select value={field.value || undefined} onValueChange={field.onChange}>
                          <SelectTrigger theme="dark" className="h-9 bg-slate-900/80" aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent theme="dark">
                            {VEHICLE_EXPENSE_SUBCATEGORIES.map((option) => (
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
            ) : (
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
            )}

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

            {!isVehicle && (
              <FormField
                control={form.control}
                name="markRecurring"
                render={({ field }) => (
                  <FormItem>
                    <ExpenseFormGroup label="Frequency">
                      <FormControl>
                        <Select
                          value={field.value ? "recurring" : "one_time"}
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
            )}
          </ExpenseFormRow>

          <ExpenseFormRow>
            <FormField
              control={form.control}
              name="vendor"
              render={({ field, fieldState }) => (
                <FormItem>
                  <ExpenseFormGroup label="Vendor / Payee" required>
                    <FormControl>
                      <Input theme="dark" className="h-9 bg-slate-900/80" aria-invalid={!!fieldState.error} {...field} />
                    </FormControl>
                    <FormMessage />
                  </ExpenseFormGroup>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field, fieldState }) => (
                <FormItem>
                  <ExpenseFormGroup label="Payment Method" required={isVehicle}>
                    <FormControl>
                      <Select value={field.value || undefined} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark" className="h-9 bg-slate-900/80" aria-invalid={!!fieldState.error}>
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
                    <FormMessage />
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
                label={receiptFile ? receiptFile.name : "Upload receipt (PDF or image)"}
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
        </div>
      </Form>
    </ExpenseFormModalShell>
  );
}
