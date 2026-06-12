"use client";

import { useEffect, useState } from "react";
import { Car, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  VehicleActionDialog,
  ModalBody,
  ModalFooter,
  ModalHeader,
  FieldLabel,
} from "@/components/shared/modal-primitives";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  FormGrid,
  FormSection,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  INVENTORY_STATUS_LABELS,
  CONDITION_LABELS,
} from "@/lib/dealer/inventory/inventory-constants";
import { addWholesaleVehicle } from "@/lib/dealer/inventory/server/add-wholesale-vehicle";
import { updateWholesaleVehicle } from "@/lib/dealer/inventory/server/update-wholesale-vehicle";
import {
  ODOMETER_STATUSES,
  LOT_LOCATIONS,
} from "@/lib/vehicles/actions/add-vehicle/options";
import {
  resetInventoryForm,
  useInventoryWorkspaceForm,
} from "@/hooks/dealer/use-inventory-workspace-form";
import type { WholesaleVehicle } from "@/lib/dealer/dashboard/types";
import InventoryProfitDisplay from "./inventory-profit-display";

export default function AddEditVehicleModal({
  open,
  onOpenChange,
  vehicle,
  readOnly = false,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicle: WholesaleVehicle | null;
  readOnly?: boolean;
  onSuccess?: () => void;
}) {
  const form = useInventoryWorkspaceForm(vehicle);
  const watched = form.watch();
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(vehicle);

  useEffect(() => {
    if (open) {
      resetInventoryForm(form, vehicle);
    }
  }, [open, vehicle, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (readOnly) return;
    setSaving(true);
    const formData = new FormData();
    formData.set("payload", JSON.stringify(values));

    const result = isEdit
      ? await updateWholesaleVehicle(formData)
      : await addWholesaleVehicle(formData);

    setSaving(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Vehicle updated" : "Vehicle added");
    onOpenChange(false);
    onSuccess?.();
  });

  return (
    <VehicleActionDialog open={open} onOpenChange={onOpenChange} size="xl" theme="dark">
      <ModalHeader
        icon={<Car className="h-4 w-4" />}
        iconClassName="bg-emerald-500/15 text-emerald-400"
        title={readOnly ? "View Vehicle" : isEdit ? "Edit Vehicle" : "Add Vehicle"}
        subtitle="Wholesale inventory management"
        onClose={() => onOpenChange(false)}
      />
      <Form {...form}>
        <form onSubmit={handleSubmit}>
          <ModalBody className="max-h-[70vh] overflow-y-auto">
            <FormSection theme="dark" title="Vehicle Identity">
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="VIN" />
                      <FormControl>
                        <Input
                          theme="dark"
                          {...field}
                          disabled={readOnly}
                          maxLength={17}
                          className="h-8 uppercase"
                          onBlur={(e) => {
                            field.onChange(e.target.value.toUpperCase());
                            field.onBlur();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Year" />
                      <FormControl>
                        <Input theme="dark" type="number" {...field} disabled={readOnly} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="stockNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Stock #" />
                      <FormControl>
                        <Input theme="dark" {...field} disabled={readOnly} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="make"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Make" />
                      <FormControl>
                        <Input theme="dark" {...field} disabled={readOnly} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Model" />
                      <FormControl>
                        <Input theme="dark" {...field} disabled={readOnly} className="h-8" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="trim"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Trim" />
                      <FormControl>
                        <Input theme="dark" {...field} disabled={readOnly} className="h-8" />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mileage"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Mileage" />
                      <FormControl>
                        <Input
                          theme="dark"
                          type="number"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? Number(e.target.value) : undefined,
                            )
                          }
                          disabled={readOnly}
                          className="h-8"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="acquisitionDate"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Date Acquired" />
                      <FormControl>
                        <Input theme="dark" type="date" {...field} disabled={readOnly} className="h-8" />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection theme="dark" title="Location & Condition">
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="lotLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Location" />
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger theme="dark" className="h-8">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          {LOT_LOCATIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} theme="dark">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Condition" />
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger theme="dark" className="h-8">
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          {(Object.keys(CONDITION_LABELS) as Array<
                            keyof typeof CONDITION_LABELS
                          >).map((key) => (
                            <SelectItem key={key} value={key} theme="dark">
                              {CONDITION_LABELS[key]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection theme="dark" title="Cost Structure">
              <FormGrid cols={3}>
                {(
                  [
                    ["acquisitionCost", "Acquisition Cost"],
                    ["auctionFees", "Auction Fees"],
                    ["transportationCosts", "Transportation"],
                    ["reconRepairDetails", "Recon / Repair"],
                    ["storageFees", "Storage Fees"],
                    ["dealerFees", "Dealer Fees"],
                    ["marketValue", "Market Value"],
                    ["wholesaleValue", "Wholesale Value"],
                  ] as const
                ).map(([name, label]) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label={label} />
                        <FormControl>
                          <Input
                            theme="dark"
                            mode="currency"
                            value={(field.value as number) ?? 0}
                            onValueChange={field.onChange}
                            disabled={readOnly}
                            className="h-8"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </FormGrid>
            </FormSection>

            <InventoryProfitDisplay values={watched} />

            <FormSection theme="dark" title="Additional Information">
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="titleReceived"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Title Received?" />
                      <RadioGroup
                        value={field.value ? "yes" : "no"}
                        onValueChange={(v) => field.onChange(v === "yes")}
                        disabled={readOnly}
                        className="space-y-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="yes" id="modal-title-yes" />
                          <Label htmlFor="modal-title-yes" className="text-[12px]">
                            Yes ' Title received
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="no" id="modal-title-no" />
                          <Label htmlFor="modal-title-no" className="text-[12px]">
                            No ' Missing title
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="inventoryStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Inventory Status" />
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger theme="dark" className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          {(Object.keys(INVENTORY_STATUS_LABELS) as Array<
                            keyof typeof INVENTORY_STATUS_LABELS
                          >).map((key) => (
                            <SelectItem key={key} value={key} theme="dark">
                              {INVENTORY_STATUS_LABELS[key]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="odometerStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Odometer Status" />
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                        disabled={readOnly}
                      >
                        <FormControl>
                          <SelectTrigger theme="dark" className="h-8">
                            <SelectValue placeholder="Odometer status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          {ODOMETER_STATUSES.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} theme="dark">
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </FormGrid>

              {watched.inventoryStatus === "pending_sale" && (
                <FormGrid cols={3} className="mt-3">
                  <FormField
                    control={form.control}
                    name="timesInAuction"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Times in Auction" />
                        <FormControl>
                          <Input theme="dark" type="number" {...field} disabled={readOnly} className="h-8" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nextAuctionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Next Auction Date" />
                        <FormControl>
                          <Input theme="dark" type="date" {...field} disabled={readOnly} className="h-8" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastAuctionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Last Auction Date" />
                        <FormControl>
                          <Input theme="dark" type="date" {...field} disabled={readOnly} className="h-8" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormGrid>
              )}

              {watched.inventoryStatus === "sold" && (
                <FormGrid cols={2} className="mt-3">
                  <FormField
                    control={form.control}
                    name="soldAt"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Date Sold" />
                        <FormControl>
                          <Input theme="dark" type="date" {...field} disabled={readOnly} className="h-8" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="soldPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Sold Price" />
                        <FormControl>
                          <Input
                            theme="dark"
                            mode="currency"
                            value={field.value ?? 0}
                            onValueChange={field.onChange}
                            disabled={readOnly}
                            className="h-8"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormGrid>
              )}

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="mt-3">
                    <FieldLabel label="Notes" />
                    <FormControl>
                      <Textarea
                        theme="dark"
                        {...field}
                        disabled={readOnly}
                        className="min-h-[72px] resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
          </ModalBody>

          {!readOnly ? (
            <ModalFooter
              onCancel={() => onOpenChange(false)}
              onSubmit={() => {
                void handleSubmit();
              }}
              submitLabel={isEdit ? "Save Changes" : "Add Vehicle"}
              submitClassName="h-8"
              isSubmitting={saving}
              disabled={saving}
            />
          ) : (
            <div className="flex justify-end border-t border-[#1e293b] px-6 py-4">
              <Button
                type="button"
                variant="outline"
                theme="dark"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          )}
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
