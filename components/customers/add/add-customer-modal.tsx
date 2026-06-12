"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Save, User } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { FormGrid, FormSection } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import CustomerStatusBadge from "@/components/customers/customer-status-badge";
import { useCustomerForm } from "@/hooks/customers/use-customer-form";
import { US_STATES } from "@/lib/vehicles/actions/add-vehicle/options";
import {
  CUSTOMER_SOURCES,
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
  formatCustomerSource,
  formatCustomerStatus,
  formatCustomerType,
  type CustomerDetail,
  type CustomerStatus,
  type SalesRepOption,
} from "@/lib/customers/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesReps: SalesRepOption[];
  editCustomer?: CustomerDetail | null;
  onSaved?: () => void;
};

export default function AddCustomerModal({
  open,
  onOpenChange,
  salesReps,
  editCustomer,
  onSaved,
}: Props) {
  const { form, onSubmit, isSubmitting, isEdit, isDuplicatePhone, shake, imageFile, setImageFile, handlePhoneChange } =
    useCustomerForm(
      open,
      () => {
        onOpenChange(false);
        onSaved?.();
      },
      editCustomer,
    );

  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (imageFile) {
      const url = URL.createObjectURL(imageFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [imageFile]);

  const displayPhoto = previewUrl ?? editCustomer?.imageUrl ?? null;

  useEffect(() => {
    setImgError(false);
  }, [displayPhoto]);

  const handleImgError = useCallback(() => {
    setImgError(true);
  }, []);

  return (
    <VehicleActionDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      theme="dark"
    >
      <ModalHeader
        icon={<User className="h-4 w-4 text-white" />}
        iconClassName="bg-purple-600"
        title={isEdit ? "Edit Customer" : "Add Customer"}
        titleExtra={
          <CustomerStatusBadge status={(editCustomer?.status ?? "lead") as CustomerStatus} />
        }
        subtitle={
          isEdit
            ? "Update customer profile and CRM details."
            : "Add a new customer to your CRM."
        }
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody className="space-y-4" shake={shake}>
            <FormSection title="Basic Information" theme="dark">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto]">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FieldLabel label="Full Name" required />
                        <FormControl>
                      <Input
                        {...field}
                        theme="dark"
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FieldLabel label="Phone" required />
                      <FormControl>
                        <Input
                          value={field.value}
                          onChange={(e) => handlePhoneChange(e.target.value)}
                          onBlur={field.onBlur}
                          placeholder="(555) 123-4567"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Email" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          theme="dark"
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
                  name="type"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Customer Type" />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          {CUSTOMER_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {formatCustomerType(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Status" />
                        <FormMessage />
                      </div>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          {CUSTOMER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {formatCustomerStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Source" />
                        <FormMessage />
                      </div>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v === "none" ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select source" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          <SelectItem value="none">None</SelectItem>
                          {CUSTOMER_SOURCES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {formatCustomerSource(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="salesRepId"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Sales Rep" />
                        <FormMessage />
                      </div>
                      <Select
                        value={field.value}
                        onValueChange={(v) => field.onChange(v === "unassigned" ? "" : v)}
                      >
                        <FormControl>
                          <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Unassigned" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {salesReps.map((r) => (
                            <SelectItem key={r.id} value={r.id}>
                              {r.fullName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-[150px] w-[200px] items-center justify-center overflow-hidden rounded-md border border-slate-600 bg-card">
                    {displayPhoto && !imgError ? (
                      <img
                        src={displayPhoto}
                        alt="Customer"
                        className="h-full w-full object-cover"
                        onError={handleImgError}
                      />
                    ) : (
                      <User className="h-10 w-10 text-slate-600" />
                    )}
                  </div>
                  <input
                    ref={inputRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImageFile(file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-slate-600 bg-card text-[11px] text-slate-200 hover:bg-slate-800"
                    onClick={() => inputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Change Photo
                  </button>
                  <p className="text-[10px] text-slate-500">JPG or PNG, max 5MB</p>
                </div>
              </div>
          </FormSection>

            <FormSection title="Address" theme="dark">
              <FormField
                control={form.control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormItem>
                    <div className="flex items-center gap-1 justify-between">
                      <FieldLabel label="Street Address" />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        theme="dark"
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
                      <FieldLabel label="Address Line 2" />
                      <FormMessage />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        theme="dark"
                        aria-invalid={!!fieldState.error}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="City" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          theme="dark"
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
                      <FieldLabel label="State" />
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent theme="dark">
                           <SelectOptions options={US_STATES} label="State" theme="dark" />
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                   )}
                 />
                 <FormField
                   control={form.control}
                   name="zip"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="ZIP" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Identity" theme="dark">
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Date of Birth" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          mode="date"
                          theme="dark"
                          defaultToToday={false}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driversLicenseNumber"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Driver's License #" />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          {...field}
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={() => void onSubmit()}
            submitLabel={isEdit ? "Save Changes" : "Add Customer"}
            submitClassName="h-8 disabled:opacity-50"
            isSubmitting={isSubmitting}
            disabled={isDuplicatePhone}
            submitIcon={<Save className="h-4 w-4" />}
            className="sticky bottom-0 bg-card"
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
