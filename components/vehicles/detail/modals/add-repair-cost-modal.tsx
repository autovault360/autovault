"use client";

import { Wrench } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { useAddRepairCostForm } from "@/hooks/vehicles/use-add-repair-cost-form";
import {
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REPAIR_CATEGORIES,
  REPAIR_PRIORITIES,
  REPAIR_TYPES,
  VENDORS,
} from "@/lib/vehicles/actions/options";
import { formatMileage } from "@/lib/vehicles/types";
import { FormGrid, FormSection } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectOptions,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldLabel,
  FilePreviewCard,
  FileUploadZone,
  InternalRepairRadio,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ReadOnlyField,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";

type Props = {
  vehicle: VehicleDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddRepairCostModal({
  vehicle,
  open,
  onOpenChange,
}: Props) {
  const {
    form,
    onSubmit,
    isSubmitting,
    derived,
    shake,
    attachments,
    addAttachments,
    removeAttachment,
  } = useAddRepairCostForm(vehicle, open, () => onOpenChange(false));

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} size="md">
      <ModalHeader
        icon={<Wrench className="h-4 w-4 text-white" />}
        iconClassName="bg-[#2563eb]"
        title="Add Repair Cost"
        subtitle="Record repair and reconditioning expenses for this vehicle."
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody shake={shake}>
            <FormSection title="Vehicle Information">
              <FormGrid cols={4}>
                <ReadOnlyField label="Stock Number" value={vehicle.stockNumber} />
                <ReadOnlyField label="VIN" value={vehicle.vin} />
                <ReadOnlyField label="Vehicle" value={vehicle.displayTitle} />
                <ReadOnlyField
                  label="Mileage"
                  value={`${formatMileage(vehicle.mileage)} mi`}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Repair Details">
              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name="repairDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Repair Date" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="date"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="repairCategory"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Repair Category" required />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectOptions options={REPAIR_CATEGORIES} label="Repair Category" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="repairType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Repair Type" required />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectOptions options={REPAIR_TYPES} label="Repair Type" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="priority"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Priority" />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectOptions options={REPAIR_PRIORITIES} label="Priority" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
               </FormGrid>
               <FormField
                 control={form.control}
                 name="description"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel
                        label="Description of Repair / Work Performed"
                        required
                      />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Textarea
                        showCount
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={1000}
                        placeholder="Describe the repair work performed..."
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Cost Information">
              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name="laborCost"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Labor Cost" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="partsCost"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Parts Cost" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shopVendor"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Shop / Vendor" />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Vendor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectOptions options={VENDORS} label="Shop / Vendor" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="otherFees"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Other Fees" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={2}>
                <FormItem>
                  <FieldLabel label="Total Repair Cost" required />
                  <Input
                    mode="currency"
                    value={derived.totalRepairCost}
                    onValueChange={() => {}}
                    disabled
                  />
                </FormItem>
                <FormField
                  control={form.control}
                  name="isInternalRepair"
                  render={({ field }) => (
                    <FormItem>
                      <InternalRepairRadio
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Payment Information">
              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Payment Method" />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectOptions options={PAYMENT_METHODS} label="Payment Method" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="invoiceNumber"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Invoice / RO Number" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="paymentStatus"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Payment Status" />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           <SelectOptions options={PAYMENT_STATUSES} label="Payment Status" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="datePaid"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Date Paid" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="date"
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value)}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Attachments (Optional)">
              <p className="text-[11px] text-gray-500">
                Upload Invoice / Receipt / Photos
              </p>
              <div className="grid gap-3 lg:grid-cols-2">
                <FileUploadZone
                  onFilesAdded={addAttachments}
                  accept=".jpg,.jpeg,.png,.pdf"
                  maxSizeMB={10}
                  allowedTypes={[
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                  ]}
                  hint="JPG, PNG, PDF up to 10MB each"
                />
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((file, index) => (
                      <FilePreviewCard
                        key={`${file.name}-${index}`}
                        file={file}
                        onRemove={() => removeAttachment(index)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </FormSection>

            <FormSection title="Additional Notes (Optional)">
              <FormField
                control={form.control}
                name="notes"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="Notes" />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Textarea
                        showCount
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={500}
                        placeholder="Add any additional notes about this repair..."
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            submitLabel="Save Repair Cost"
            submitClassName="bg-[#2563eb] hover:bg-[#1d4ed8]"
            isSubmitting={isSubmitting}
            className="sticky bottom-0 bg-white"
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
