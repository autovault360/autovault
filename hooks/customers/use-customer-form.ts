"use client";

import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/lib/customers/actions/schemas";
import {
  createCustomer,
  updateCustomer,
} from "@/lib/customers/server/create-customer";
import type { CustomerDetail } from "@/lib/customers/types";

function buildDefaults(edit?: CustomerDetail | null): CustomerFormValues {
  if (edit) {
    return {
      name: edit.name,
      phone: edit.phone,
      email: edit.email,
      type: edit.type,
      status: edit.status,
      salesRepId: edit.salesRepId ?? "",
      source: edit.source ?? "",
      address: edit.address,
      address2: edit.address2,
      city: edit.city,
      state: edit.state,
      zip: edit.zip,
      dateOfBirth: edit.dateOfBirth ?? "",
      driversLicenseNumber: edit.driversLicenseNumber ?? "",
    };
  }
  return {
    name: "",
    phone: "",
    email: "",
    type: "individual",
    status: "lead",
    salesRepId: "",
    source: "",
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    dateOfBirth: "",
    driversLicenseNumber: "",
  };
}

export function useCustomerForm(
  open: boolean,
  onSuccess: () => void,
  editCustomer?: CustomerDetail | null,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEdit = !!editCustomer;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema) as Resolver<CustomerFormValues>,
    defaultValues: buildDefaults(editCustomer),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaults(editCustomer));
    }
  }, [open, editCustomer, form]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateCustomer(editCustomer!.id, values)
        : await createCustomer(values);

      if (result.success) {
        toast.success(isEdit ? "Customer updated" : "Customer added");
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  });

  return { form, onSubmit, isSubmitting, isEdit };
}
