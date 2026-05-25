"use client";

import { AlertCircle } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";
import { useMarkAsLossForm } from "@/hooks/vehicles/use-mark-as-loss-form";
import { LOSS_REASONS, LOSS_TYPES } from "@/lib/vehicles/actions/options";
import { FormGrid, FormSection } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
  InfoBanner,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ReadOnlyField,
  TextareaWithCount,
  VehicleActionDialog,
} from "./modal-primitives";

type Props = {
  vehicle: VehicleDetail;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function MarkAsLossModal({
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
    documents,
    addDocuments,
    removeDocument,
  } = useMarkAsLossForm(vehicle, open, () => onOpenChange(false));

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} size="md">
      <ModalHeader
        icon={<AlertCircle className="h-4 w-4 text-white" />}
        iconClassName="bg-red-600"
        title="Mark Vehicle as Loss"
        subtitle="Enter loss details and reason for inventory write-off."
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody shake={shake}>
            <FormSection title="Vehicle Information">
              <FormGrid cols={3}>
                <ReadOnlyField label="Stock Number" value={vehicle.stockNumber} />
                <ReadOnlyField label="VIN" value={vehicle.vin} />
                <ReadOnlyField label="Vehicle" value={vehicle.displayTitle} />
              </FormGrid>
            </FormSection>

            <FormSection title="Loss Details">
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="lossDate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Loss Date" required />
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
                  name="lossReason"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Loss Reason" required />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger aria-invalid={!!fieldState.error}>
                          <SelectValue placeholder="Select Loss Reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectOptions options={LOSS_REASONS} />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lossType"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Loss Type" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select Loss Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectOptions options={LOSS_TYPES} />
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormField
                control={form.control}
                name="explanation"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="Explanation / Notes" required />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <TextareaWithCount
                        value={field.value}
                        onChange={field.onChange}
                        maxLength={1000}
                        placeholder="Provide details about the loss, including circumstances and any relevant information..."
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Financial Summary">
              <FormGrid cols={3}>
                <div>
                  <FieldLabel label="Total Investment" />
                  <Input
                    mode="currency"
                    value={derived.totalInvestment}
                    onValueChange={() => {}}
                    disabled
                  />
                </div>
                <div>
                  <FieldLabel label="Total Expenses (to date)" />
                  <Input
                    mode="currency"
                    value={derived.totalExpenses}
                    onValueChange={() => {}}
                    disabled
                  />
                </div>
                <div>
                  <FieldLabel label="Total Cost Basis" />
                  <Input
                    mode="currency"
                    value={derived.totalCostBasis}
                    onValueChange={() => {}}
                    disabled
                  />
                </div>
              </FormGrid>
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="estimatedLossAmount"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Estimated Loss Amount" required />
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
                  name="insuranceProceeds"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Insurance Proceeds (if any)" />
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
                <div className="max-w-xs">
                  <div className="flex items-center gap-1 justify-between mb-1.5">
                    <FieldLabel label="Net Loss" />
                    <p className="text-[10px] text-blue-500">Auto-calculated</p>
                  </div>
                  <Input
                    mode="currency"
                    value={derived.netLoss}
                    onValueChange={() => {}}
                    disabled
                    tone="negative"
                  />
                </div>
              </FormGrid>
            </FormSection>

            <FormSection title="Additional Documentation">
              <p className="text-[11px] text-gray-500">
                Upload Supporting Documents (if any)
              </p>
              <FileUploadZone
                onFilesAdded={addDocuments}
                accept=".jpg,.jpeg,.png,.pdf"
                maxSizeMB={10}
                allowedTypes={["image/jpeg", "image/png", "application/pdf"]}
                hint="JPG, PNG, PDF up to 10MB each"
              />
              {documents.length > 0 && (
                <div className="mt-3 space-y-2">
                  {documents.map((file, index) => (
                    <FilePreviewCard
                      key={`${file.name}-${index}`}
                      file={file}
                      onRemove={() => removeDocument(index)}
                    />
                  ))}
                </div>
              )}
            </FormSection>

            <InfoBanner>
              Once saved, this vehicle will be marked as LOSS and removed from
              active inventory. This action can be reversed if needed.
            </InfoBanner>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            submitLabel="Mark as Loss & Save"
            submitClassName="bg-red-600 hover:bg-red-500"
            isSubmitting={isSubmitting}
            className="sticky bottom-0 bg-white"
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
