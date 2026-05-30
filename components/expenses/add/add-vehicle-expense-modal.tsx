"use client";

import { useRef } from "react";
import { AlertTriangle, Car, X } from "lucide-react";
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
  PAYMENT_METHOD_OPTIONS,
  VEHICLE_EXPENSE_SUBCATEGORIES,
  type PaymentMethod,
  type VehicleExpenseSubcategory,
} from "@/lib/expenses/form-types";
import { useAddVehicleExpenseForm } from "@/hooks/expenses/use-add-vehicle-expense-form";
import LinkedVehicleSection from "./linked-vehicle-section";
import {
  FormFieldBlock,
  ModalFooterActions,
  OptionCheckbox,
  ReceiptUploadSection,
  SideCard,
} from "./add-expense-modal-parts";

export default function AddVehicleExpenseModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    form,
    patchForm,
    linkedVehicle,
    setLinkedVehicle,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    saving,
    submit,
  } = useAddVehicleExpenseForm(open);

  const vehicleIsSold =
    linkedVehicle?.status === "Sold" || linkedVehicle?.status === "Loss";

  const handleSave = async (addAnother: boolean) => {
    if (vehicleIsSold) return;
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
        <DialogTitle className="sr-only">Add Vehicle Expense</DialogTitle>
        <ModalThemeProvider theme="dark">
          <div className="flex max-h-[min(90vh,820px)] flex-col">
            <div className="shrink-0 border-b border-slate-700/80 px-6 pb-4 pt-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-emerald-500/15">
                    <Car className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold leading-tight text-white">
                      Add Vehicle Expense
                    </h2>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-400">
                      Link this expense to a vehicle.
                    </p>
                  </div>
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
              {vehicleIsSold && (
                <div className="mb-4 flex items-start gap-2.5 rounded-md border border-red-500/40 bg-red-500/10 p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <div>
                    <p className="text-[13px] font-medium text-red-300">
                      Vehicle is already marked as sold
                    </p>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-red-400/80">
                      This vehicle is no longer available for expenses. Remove the vehicle
                      link or select a different vehicle.
                    </p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(260px,1fr)] lg:gap-6">
                <div className="min-w-0 space-y-3.5">
                  <LinkedVehicleSection
                    vehicle={linkedVehicle}
                    onVehicleChange={setLinkedVehicle}
                  />

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <FormFieldBlock label="Expense Date" required>
                      <Input
                        theme="dark"
                        mode="date"
                        value={form.expenseDate}
                        onChange={(e) => patchForm({ expenseDate: e.target.value })}
                        className="bg-slate-800/50"
                      />
                    </FormFieldBlock>

                    <FormFieldBlock label="Type" required>
                      <Select
                        value={form.vehicleSubcategory || undefined}
                        onValueChange={(value) =>
                          patchForm({
                            vehicleSubcategory: value as VehicleExpenseSubcategory,
                          })
                        }
                      >
                        <SelectTrigger theme="dark" className="bg-slate-800/50">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                          {VEHICLE_EXPENSE_SUBCATEGORIES.map((option) => (
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

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <FormFieldBlock label="Vendor / Payee" required>
                      <Input
                        theme="dark"
                        value={form.vendor}
                        onChange={(e) => patchForm({ vendor: e.target.value })}
                        placeholder="Enter vendor or payee name"
                        className="h-8 bg-slate-800/50"
                      />
                    </FormFieldBlock>

                    <FormFieldBlock label="Invoice / Reference #">
                      <Input
                        theme="dark"
                        value={form.reference}
                        onChange={(e) => patchForm({ reference: e.target.value })}
                        placeholder="Enter invoice or reference #"
                        className="h-8 bg-slate-800/50"
                      />
                    </FormFieldBlock>
                  </div>

                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    <FormFieldBlock label="Payment Method" required>
                      <Select
                        value={form.paymentMethod || undefined}
                        onValueChange={(value) =>
                          patchForm({ paymentMethod: value as PaymentMethod })
                        }
                      >
                        <SelectTrigger theme="dark" className="bg-slate-800/50">
                          <SelectValue placeholder="Select payment method" />
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
                    </FormFieldBlock>

                    <FormFieldBlock label="Amount" required>
                      <Input
                        theme="dark"
                        mode="currency"
                        value={form.amount}
                        onValueChange={(value) => patchForm({ amount: value })}
                        className="h-8"
                      />
                    </FormFieldBlock>
                  </div>

                  <FormFieldBlock label="Description" required>
                    <TextareaWithCount
                      value={form.description}
                      onChange={(value) => patchForm({ description: value })}
                      maxLength={150}
                      placeholder="Enter description of this expense"
                      rows={5}
                    />
                  </FormFieldBlock>
                </div>

                <div className="flex min-w-0 flex-col gap-3.5 lg:pt-0">
                  <ReceiptUploadSection
                    title="Receipt / Invoice"
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
              saving={saving || vehicleIsSold}
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
