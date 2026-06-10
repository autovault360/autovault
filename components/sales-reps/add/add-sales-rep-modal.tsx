"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Save, UserRound } from "lucide-react";
import Image from "next/image";
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
import { useSalesRepForm } from "@/hooks/sales-reps/use-sales-rep-form";
import {
  SALES_REP_ROLES,
  formatSalesRepRole,
} from "@/lib/sales-reps/actions/schemas";
import { US_STATES } from "@/lib/vehicles/actions/add-vehicle/options";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved?: () => void;
};

export default function AddSalesRepModal({ open, onOpenChange, onSaved }: Props) {
  const {
    form,
    onSubmit,
    isSubmitting,
    isDuplicateEmail,
    shake,
    imageFile,
    setImageFile,
    handlePhoneChange,
  } = useSalesRepForm(open, () => {
    onOpenChange(false);
    onSaved?.();
  });

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

  const displayPhoto = previewUrl ?? null;

  return (
    <VehicleActionDialog
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      theme="dark"
    >
      <ModalHeader
        icon={<UserRound className="h-4 w-4 text-white" />}
        iconClassName="bg-blue-600"
        title="Add Sales Rep"
        subtitle="Add a new team member to track performance and assign customers."
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
                    name="fullName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <div className="flex items-center gap-1 justify-between">
                          <FieldLabel label="Full Name" required />
                          <FormMessage />
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="John Doe"
                            theme="dark"
                            aria-invalid={!!fieldState.error}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormGrid cols={2}>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center gap-1 justify-between">
                            <FieldLabel label="Phone" required />
                            <FormMessage />
                          </div>
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
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center gap-1 justify-between">
                            <FieldLabel label="Email" required />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="john@dealership.com"
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
                      name="role"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center gap-1 justify-between">
                            <FieldLabel label="Role" />
                            <FormMessage />
                          </div>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <FormControl>
                              <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent theme="dark">
                              {SALES_REP_ROLES.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {formatSalesRepRole(role)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-1 justify-between">
                            <FieldLabel label="Status" />
                            <FormMessage />
                          </div>
                          <Select
                            value={field.value ? "active" : "inactive"}
                            onValueChange={(v) => field.onChange(v === "active")}
                          >
                            <FormControl>
                              <SelectTrigger theme="dark">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent theme="dark">
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="hireDate"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <div className="flex items-center gap-1 justify-between">
                            <FieldLabel label="Hire Date" />
                            <FormMessage />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              mode="date"
                              theme="dark"
                              aria-invalid={!!fieldState.error}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </FormGrid>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-[150px] w-[200px] overflow-hidden rounded-md border border-slate-600 bg-[#1a2332]">
                    {displayPhoto && (
                      <Image
                        src={displayPhoto}
                        alt="Sales rep"
                        fill
                        className="object-cover"
                        unoptimized
                      />
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
                    className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-slate-600 bg-[#1a2332] text-[11px] text-slate-200 hover:bg-slate-800"
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
                        placeholder="123 Main St"
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
                        placeholder="Apt, Suite, Floor, etc."
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
                          placeholder="New York"
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
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="State" />
                        <FormMessage />
                      </div>
                      <Select value={field.value ?? ""} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger theme="dark" aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select state" />
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
                          placeholder="10001"
                          theme="dark"
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
            </FormSection>

            <FormSection title="Compensation & Goals" theme="dark">
              <FormGrid cols={2}>
                <FormField
                  control={form.control}
                  name="commissionRate"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Commission Rate (%)" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          placeholder="10"
                          theme="dark"
                          value={field.value}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="monthlyGoal"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <div className="flex items-center gap-1 justify-between">
                        <FieldLabel label="Monthly Sales Goal" required />
                        <FormMessage />
                      </div>
                      <FormControl>
                        <Input
                          mode="currency"
                          placeholder="$50,000"
                          theme="dark"
                          value={field.value}
                          onValueChange={field.onChange}
                          aria-invalid={!!fieldState.error}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </FormGrid>
              <p className="text-[11px] text-slate-500">
                Commission is calculated as a percentage of gross profit per deal.
                The monthly goal drives progress tracking on the dashboard.
              </p>
            </FormSection>
          </ModalBody>

          <ModalFooter
            onCancel={() => onOpenChange(false)}
            onSubmit={() => void onSubmit()}
            submitLabel="Add Sales Rep"
            submitClassName="bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
            isSubmitting={isSubmitting}
            disabled={isDuplicateEmail}
            submitIcon={<Save className="h-4 w-4" />}
            className="sticky bottom-0 bg-[#1a2332]"
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
