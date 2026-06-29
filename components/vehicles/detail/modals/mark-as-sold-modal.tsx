"use client";

import { CheckCircle2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { useMarkAsSoldForm } from "@/hooks/vehicles/use-mark-as-sold-form";
import { CUSTOMER_TYPES, US_STATES } from "@/lib/vehicles/actions/options";
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
  AutoCalculatedCaption,
  FieldLabel,
  HelperText,
  ImageUploadSlot,
  InfoBanner,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UploadSectionHint,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";

type Props = {
  vehicle: VehicleDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MarkAsSoldModal({
  vehicle,
  open,
  onOpenChange,
}: Props) {
  const { form, onSubmit, isSubmitting, derived, shake, handlePhoneChange } =
    useMarkAsSoldForm(vehicle, open, () => onOpenChange(false));

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} size="lg" theme="dark">
      <ModalHeader
        icon={<CheckCircle2 className="h-4 w-4 text-white" />}
        iconClassName="bg-emerald-600"
        title="Mark Vehicle as Sold"
        subtitle="Enter sale and customer information to complete the transaction."
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody shake={shake}>
            <FormSection theme="dark" title="Customer Information">
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="customerType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Customer Type" required />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                           <SelectOptions theme="dark" options={CUSTOMER_TYPES} label="Customer Type" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="customerName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Customer Name" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Phone Number" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          value={field.value}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          onBlur={field.onBlur}
                          placeholder="(310) 555-1234"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Email Address" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          type="email"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Address" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address2"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Address 2 (Optional)" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="City" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="State" required />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select state..." />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                           <SelectOptions theme="dark" options={US_STATES} label="State" />
                         </SelectContent>
                       </Select>
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="zipCode"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="ZIP Code" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection theme="dark" title="Sale Information">
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="saleDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Sale Date" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
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
                  name="totalPriceOtd"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Total Price (Out the Door)" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark" mode="currency"
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
                  name="salesTaxAmount"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Sales Tax Amount" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark" mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="licenseRegistrationFees"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="License & Registration Fees" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark" mode="currency"
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
                  name="dmvDocFees"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="DMV / Doc Fees (Optional)" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark" mode="currency"
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
                  name="otherFees"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Other Fees (Optional)" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark" mode="currency"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <div className="max-w-xs">
                <div className="flex items-center gap-1 justify-between mb-1.5">
                  <FieldLabel label="Total Collected" />
                  <AutoCalculatedCaption />
                </div>
                <FormControl>
                  <Input theme="dark"
                    mode="currency"
                    value={derived.totalCollected}
                    onValueChange={() => {}}
                    disabled
                  />
                </FormControl>
              </div>
            </FormSection>

            <FormSection theme="dark" title="Tax & Document Information">
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="rosNumber"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="ROS Number (Required)" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zipCodeOfSale"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="ZIP Code of Sale (Required)" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input theme="dark"
                          {...field}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <HelperText>
                        ZIP code where the vehicle was sold (used for CDTFA
                        reporting)
                      </HelperText>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection theme="dark" title="ID & Documents Upload">
              <UploadSectionHint
                left="Upload clear images of IDs and supporting documents."
                right="JPG only, max 5MB per file"
              />
              <FormGrid cols={4}>
                <FormField
                  control={form.control}
                  name="buyerIdFront"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploadSlot
                          label="Buyer's ID (Front)"
                          required
                          file={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buyerIdBack"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploadSlot
                          label="Buyer's ID (Back)"
                          file={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driversLicense"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploadSlot
                          label="Driver's License / ID"
                          file={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="otherDocument"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormControl>
                        <ImageUploadSlot
                          label="Other Document (Optional)"
                          file={field.value}
                          onChange={field.onChange}
                          error={fieldState.error?.message}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection theme="dark" title="Additional Notes (Optional)">
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
                      <Textarea theme="dark"
                        showCount
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={500}
                        placeholder="Add any notes about this sale..."
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <InfoBanner>
              Once saved, this vehicle will be marked as SOLD and added to CDTFA
              filing records automatically.
            </InfoBanner>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            submitLabel="Mark as Sold & Save"
            submitClassName="bg-emerald-600 hover:bg-emerald-500"
            isSubmitting={isSubmitting}
            className="sticky bottom-0"
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
