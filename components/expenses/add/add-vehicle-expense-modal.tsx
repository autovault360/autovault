"use client";

import { useRef } from "react";
import { AlertTriangle, Car } from "lucide-react";
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
import {
  PAYMENT_METHOD_OPTIONS,
  VEHICLE_EXPENSE_SUBCATEGORIES,
} from "@/lib/expenses/form-types";
import { useAddVehicleExpenseForm } from "@/hooks/expenses/use-add-vehicle-expense-form";
import LinkedVehicleSection from "./linked-vehicle-section";
import {
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
    handleSubmit,
    linkedVehicle,
    setLinkedVehicle,
    receiptFile,
    setReceiptFile,
    receiptPreview,
    shake,
    vehicleIsSold,
    saveModeRef,
  } = useAddVehicleExpenseForm(open, () => onOpenChange(false));

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} theme="dark">
      <Form {...form}>
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
            </div>
          </div>

          <ModalBody shake={shake} className="min-h-0 flex-1 overflow-y-auto">
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

                <FormField
                  control={form.control}
                  name="expenseName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Expense Name" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          theme="dark"
                          placeholder="e.g. Brake pads replacement"
                          className="h-8 bg-slate-800/50"
                          aria-invalid={!!fieldState.error}
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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

                  <FormField
                    control={form.control}
                    name="vehicleSubcategory"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
                          <FieldLabel label="Type" required />
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
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
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
                    name="reference"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Invoice / Reference #" />
                        <FormControl>
                          <Input
                            theme="dark"
                            placeholder="Enter invoice or reference #"
                            className="h-8 bg-slate-800/50"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
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
                        </FormControl>
                      </FormItem>
                    )}
                  />

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
                </div>

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
                          placeholder="Enter description of this expense"
                          rows={5}
                          aria-invalid={!!fieldState.error}
                          className="min-h-[88px] resize-none rounded-[6px] border-slate-600 bg-slate-800/50 px-3 py-2.5 text-[13px] text-slate-100 shadow-none placeholder:text-slate-500 focus-visible:border-blue-500 focus-visible:ring-0"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
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
            saving={form.formState.isSubmitting || vehicleIsSold}
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
