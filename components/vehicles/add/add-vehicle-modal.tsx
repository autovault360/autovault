"use client";

import { Car, Save } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { AutoCalculatedCaption } from "@/components/shared/modal-primitives";
import { useAddVehicleForm } from "@/hooks/vehicles/use-add-vehicle-form";
import {
  BODY_STYLES,
  DRIVE_TYPES,
  EXTERIOR_COLORS,
  FUEL_TYPES,
  INTERIOR_COLORS,
  LOT_LOCATIONS,
  ODOMETER_STATUSES,
  PURCHASE_TYPES,
  TITLE_STATUSES,
  US_STATES,
  VEHICLE_MAKES,
  VEHICLE_MODELS,
  VEHICLE_YEARS,
} from "@/lib/vehicles/actions/add-vehicle/options";
import { FormGrid, FormSection } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectOptions,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldLabel,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VehicleActionDialog,
} from "@/components/shared/modal-primitives";
import { PhotoGalleryUpload } from "./photo-gallery-upload";
import { VinInputWithScan } from "./vin-input-with-scan";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AddVehicleModal({ open, onOpenChange }: Props) {
  const {
    form,
    onSubmit,
    isSubmitting,
    isDuplicateVin,
    shake,
    isScanning,
    totalInvested,
    photoUrls,
    photos,
    make,
    addPhotos,
    removePhoto,
    reorderPhotos,
    scanVin,
  } = useAddVehicleForm(open, () => onOpenChange(false));

  const modelOptions = make ? (VEHICLE_MODELS[make] ?? []) : [];

  return (
    <VehicleActionDialog
      open={open}
      onOpenChange={onOpenChange}
      size="xl"
      theme="dark"
    >
      <ModalHeader
        icon={<Car className="h-4 w-4 text-white" />}
        iconClassName="bg-[#2563eb]"
        title="Add Vehicle"
        subtitle="Enter vehicle details to add a new unit to your inventory."
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody shake={shake} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormSection title="Vehicle Information" theme="dark">
                <FormField
                  control={form.control}
                  name="vin"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FieldLabel label="VIN" />
                      <FormControl>
                        <VinInputWithScan
                          value={field.value}
                          onChange={field.onChange}
                          onScan={scanVin}
                          isScanning={isScanning}
                          disabled={isDuplicateVin}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormGrid cols={3}>
                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Year" required />
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                              <SelectValue placeholder="Year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            <SelectOptions options={VEHICLE_YEARS} label="Year" theme="dark" />
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="make"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Make" required />
                        <Select value={field.value} onValueChange={(v: string) => { field.onChange(v); form.setValue("model", ""); }}>
                          <FormControl>
                            <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                              <SelectValue placeholder="Make" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            <SelectOptions options={VEHICLE_MAKES} label="Make" theme="dark" />
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="model"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Model" required />
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                              <SelectValue placeholder="Model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            <SelectOptions options={modelOptions} label="Model" theme="dark" />
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </FormGrid>
                <FormGrid cols={3}>
                  <FormField
                    control={form.control}
                    name="trim"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Trim" />
                        <FormControl>
                          <Input
                            theme="dark"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            placeholder="Trim"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bodyStyle"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Body Style" />
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark">
                              <SelectValue placeholder="Body style" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            <SelectOptions options={BODY_STYLES} label="Body Style" theme="dark" />
                          </SelectContent>
                        </Select>
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
                              field.onChange(Number(e.target.value) || 0)
                            }
                            placeholder="0"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormGrid>
                <FormGrid cols={3}>
                  <FormField
                    control={form.control}
                    name="exteriorColor"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Exterior Color" />
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark">
                              <SelectValue placeholder="Exterior" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            {EXTERIOR_COLORS.map((c) => (
                              <SelectItem key={c.value} value={c.value} theme="dark">
                                <span className="flex items-center gap-2">
                                  {c.swatch && (
                                    <span
                                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-500"
                                      style={{ backgroundColor: c.swatch }}
                                    />
                                  )}
                                  {c.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="interiorColor"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Interior Color" />
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark">
                              <SelectValue placeholder="Interior" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            {INTERIOR_COLORS.map((c) => (
                              <SelectItem key={c.value} value={c.value} theme="dark">
                                <span className="flex items-center gap-2">
                                  {c.swatch && (
                                    <span
                                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-slate-500"
                                      style={{ backgroundColor: c.swatch }}
                                    />
                                  )}
                                  {c.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="driveType"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Drive Type" />
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark">
                              <SelectValue placeholder="Drive type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            <SelectOptions options={DRIVE_TYPES} label="Drive Type" theme="dark" />
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>

              <FormSection
                title="Vehicle Photos"
                theme="dark"
                headerRight={`${photos.length} / 20 Photos`}
              >
                <PhotoGalleryUpload
                  items={photos.map((photo, index) => ({
                    id: `${photo.name}-${photo.size}-${index}`,
                    url: photoUrls[index] ?? "",
                  }))}
                  onAdd={addPhotos}
                  onRemove={removePhoto}
                  onReorder={reorderPhotos}
                />
              </FormSection>

              <FormSection title="Stock & Location" theme="dark">
                <FormGrid cols={3}>
                  <FormField
                    control={form.control}
                    name="stockNumber"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Stock Number" required />
                        <FormControl>
                          <Input
                            theme="dark"
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="STK-001"
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lotLocation"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Lot / Location" required />
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                              <SelectValue placeholder="Select lot" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            <SelectOptions options={LOT_LOCATIONS} label="Lot / Location" theme="dark" />
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="acquisitionDate"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Acquisition Date" />
                        <FormControl>
                          <Input
                            mode="date"
                            theme="dark"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormGrid>
              </FormSection>

              <FormSection title="Additional Details" theme="dark">
                <FormGrid cols={2}>
                  <FormField
                    control={form.control}
                    name="titleNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Title Number" />
                        <FormControl>
                          <Input
                            theme="dark"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licensePlate"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="License Plate" />
                        <FormControl>
                          <Input
                            theme="dark"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormGrid>
                <FormGrid cols={3}>
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="State" />
                        <Select value={field.value ?? ""} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger theme="dark">
                              <SelectValue placeholder="State" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent theme="dark">
                            <SelectOptions options={US_STATES} label="State" theme="dark" />
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expirationDate"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Expiration Date" />
                        <FormControl>
                          <Input
                            mode="date"
                            theme="dark"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sellerAuction"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Seller / Auction" />
                        <FormControl>
                          <Input
                            theme="dark"
                            value={field.value ?? ""}
                            onChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormGrid>
                <FormField
                  control={form.control}
                  name="purchaseType"
                  render={({ field }) => (
                    <FormItem className="max-w-xs">
                      <FieldLabel label="Purchase Type" />
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark">
                            <SelectValue placeholder="Purchase type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          <SelectOptions options={PURCHASE_TYPES} label="Purchase Type" theme="dark" />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </FormSection>
            </div>

            <div className="md:w-1/2">
              <FormSection title="Pricing & Cost" theme="dark">
                <FormGrid cols={3}>
                  <FormField
                    control={form.control}
                    name="acquisitionCost"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Acquisition Cost" required />
                        <FormControl>
                          <Input
                            mode="currency"
                            theme="dark"
                            value={field.value}
                            onValueChange={field.onChange}
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="askingPrice"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Asking Price" required />
                        <FormControl>
                          <Input
                            mode="currency"
                            theme="dark"
                            value={field.value}
                            onValueChange={field.onChange}
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marketValue"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Market Value" />
                        <FormControl>
                          <Input
                            mode="currency"
                            theme="dark"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </FormGrid>
                <FormGrid cols={3}>
                  <FormField
                    control={form.control}
                    name="wholesalePrice"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Wholesale Price" />
                        <FormControl>
                          <Input
                            mode="currency"
                            theme="dark"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="reconditioningCost"
                    render={({ field }) => (
                      <FormItem>
                        <FieldLabel label="Reconditioning Cost" />
                        <FormControl>
                          <Input
                            mode="currency"
                            theme="dark"
                            value={field.value}
                            onValueChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div>
                    <div className="flex items-center gap-1 justify-between mb-1.5">
                      <FieldLabel label="Total Invested" />
                      <AutoCalculatedCaption />
                    </div>
                    <FormControl>
                    <Input
                      mode="currency"
                      theme="dark"
                      value={totalInvested}
                      onValueChange={() => {}}
                      disabled
                    />
                    </FormControl>
                  </div>
                </FormGrid>
              </FormSection>
            </div>

            <FormSection title="Additional Information" theme="dark">
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="titleStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Title Status" />
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark">
                            <SelectValue placeholder="Title status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          <SelectOptions options={TITLE_STATUSES} label="Title Status" theme="dark" />
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
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark">
                            <SelectValue placeholder="Odometer status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          <SelectOptions options={ODOMETER_STATUSES} label="Odometer Status" theme="dark" />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="fuelType"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Fuel Type" />
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark">
                            <SelectValue placeholder="Fuel type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          <SelectOptions options={FUEL_TYPES} label="Fuel Type" theme="dark" />
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormField
                control={form.control}
                name="notes"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <FieldLabel label="Notes" />
                    <FormControl>
                      <Textarea
                        showCount
                        theme="dark"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                        maxLength={500}
                        placeholder="Add any additional notes about this vehicle..."
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={onSubmit}
            submitLabel="Save Vehicle"
            submitClassName="bg-[#16a34a] hover:bg-[#15803d]"
            isSubmitting={isSubmitting}
            disabled={isDuplicateVin}
            submitIcon={<Save className="mr-2 h-4 w-4" />}
            className="sticky bottom-0 bg-card"
            leftSlot={
              <FormField
                control={form.control}
                name="addAnother"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <input
                        id="add-another"
                        type="checkbox"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-600 bg-card accent-[#16a34a]"
                      />
                    </FormControl>
                    <label
                      htmlFor="add-another"
                      className="cursor-pointer text-[12px] text-slate-400"
                    >
                      Add another vehicle after saving
                    </label>
                  </FormItem>
                )}
              />
            }
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
