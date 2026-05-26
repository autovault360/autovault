"use client";

import { User, Save } from "lucide-react";
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
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FieldLabel,
  ModalBody,
  ModalFooter,
  ModalHeader,
  VehicleActionDialog,
} from "@/components/vehicles/detail/modals/modal-primitives";
import { useCustomerForm } from "@/hooks/customers/use-customer-form";
import {
  CUSTOMER_SOURCES,
  CUSTOMER_STATUSES,
  CUSTOMER_TYPES,
  formatCustomerSource,
  formatCustomerStatus,
  formatCustomerType,
  type CustomerDetail,
  type SalesRepOption,
} from "@/lib/customers/types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesReps: SalesRepOption[];
  editCustomer?: CustomerDetail | null;
};

export default function AddCustomerModal({
  open,
  onOpenChange,
  salesReps,
  editCustomer,
}: Props) {
  const { form, onSubmit, isSubmitting, isEdit } = useCustomerForm(
    open,
    () => onOpenChange(false),
    editCustomer,
  );

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
        subtitle={
          isEdit
            ? "Update customer profile and CRM details."
            : "Add a new customer to your CRM."
        }
        onClose={() => onOpenChange(false)}
      />

      <Form {...form}>
        <form onSubmit={onSubmit}>
          <ModalBody className="space-y-4">
            <FormSection title="Basic Information" theme="dark">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="Full Name" required />
                    <FormControl>
                      <Input
                        {...field}
                        className="border-slate-700 bg-[#010d19] text-slate-200"
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
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Phone" />
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(555) 123-4567"
                          className="border-slate-700 bg-[#010d19] text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Email" />
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          className="border-slate-700 bg-[#010d19] text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Customer Type" />
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                          {CUSTOMER_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>
                              {formatCustomerType(t)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Status" />
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                          {CUSTOMER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {formatCustomerStatus(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Source" />
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger theme="dark">
                          <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent theme="dark">
                          <SelectItem value="">None</SelectItem>
                          {CUSTOMER_SOURCES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {formatCustomerSource(s)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </FormGrid>
              <FormField
                control={form.control}
                name="salesRepId"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="Sales Rep" />
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger theme="dark">
                        <SelectValue placeholder="Unassigned" />
                      </SelectTrigger>
                      <SelectContent theme="dark">
                        <SelectItem value="">Unassigned</SelectItem>
                        {salesReps.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.fullName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            <FormSection title="Address" theme="dark">
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="Street Address" />
                    <FormControl>
                      <Input
                        {...field}
                        className="border-slate-700 bg-[#010d19] text-slate-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                  <FormItem>
                    <FieldLabel label="Address Line 2" />
                    <FormControl>
                      <Input
                        {...field}
                        className="border-slate-700 bg-[#010d19] text-slate-200"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormGrid cols={3}>
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="City" />
                      <FormControl>
                        <Input
                          {...field}
                          className="border-slate-700 bg-[#010d19] text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="State" />
                      <FormControl>
                        <Input
                          {...field}
                          className="border-slate-700 bg-[#010d19] text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="ZIP" />
                      <FormControl>
                        <Input
                          {...field}
                          className="border-slate-700 bg-[#010d19] text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
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
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Date of Birth" />
                      <FormControl>
                        <Input
                          {...field}
                          type="date"
                          className="border-slate-700 bg-[#010d19] text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="driversLicenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FieldLabel label="Driver's License #" />
                      <FormControl>
                        <Input
                          {...field}
                          className="border-slate-700 bg-[#010d19] text-slate-200"
                        />
                      </FormControl>
                      <FormMessage />
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
            submitClassName="bg-purple-600 hover:bg-purple-500"
            isSubmitting={isSubmitting}
            submitIcon={<Save className="h-4 w-4" />}
          />
        </form>
      </Form>
    </VehicleActionDialog>
  );
}
