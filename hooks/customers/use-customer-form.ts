"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  customerFormSchema,
  type CustomerFormValues,
} from "@/lib/customers/actions/schemas";
import { phoneRegex } from "@/lib/shared/phone";
import {
  createCustomer,
  updateCustomer,
} from "@/lib/customers/server/create-customer";
import { checkPhoneUniqueness } from "@/lib/customers/server/utils";
import { uploadCustomerImage } from "@/lib/customers/server/upload-customer-image";
import { formatPhoneNumber, validateFile } from "@/lib/vehicles/actions/utils";
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
      dateOfBirth: edit.dateOfBirth ? edit.dateOfBirth.split("T")[0] : "",
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
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [isDuplicatePhone, setIsDuplicatePhone] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const isEdit = !!editCustomer;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema) as Resolver<CustomerFormValues>,
    defaultValues: buildDefaults(editCustomer),
    mode: "onBlur",
  });

  const phone = form.watch("phone");

  useEffect(() => {
    if (open) {
      form.reset(buildDefaults(editCustomer));
      setImageFile(null);
      setIsDuplicatePhone(false);
    }
  }, [open, editCustomer, form]);

  useEffect(() => {
    if (!phoneRegex.test(phone)) {
      form.clearErrors("phone");
      setIsDuplicatePhone(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { isDuplicate } = await checkPhoneUniqueness(
          phone,
          editCustomer?.id,
        );
        setIsDuplicatePhone(isDuplicate);
        if (isDuplicate) {
          form.setError("phone", {
            message: "A customer with this phone number already exists",
          });
        } else {
          form.clearErrors("phone");
        }
      } catch {
        // Server validates on submit
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [phone, form, editCustomer?.id]);

  const handlePhoneChange = (value: string) => {
    form.setValue("phone", formatPhoneNumber(value), {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleImageChange = (file: File | null) => {
    if (!file) {
      setImageFile(null);
      return;
    }
    const error = validateFile(file, {
      maxSizeMB: 5,
      allowedTypes: ["image/jpeg", "image/png"],
    });
    if (error) {
      toast.error(error);
      return;
    }
    setImageFile(file);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    if (isDuplicatePhone) {
      toast.error("A customer with this phone number already exists");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = isEdit
        ? await updateCustomer(editCustomer!.id, values)
        : await createCustomer(values);

      if (result.success) {
        if (imageFile) {
          const uploadResult = await uploadCustomerImage(result.customerId, imageFile);
          if (!uploadResult.success) {
            toast.error("Customer saved but image upload failed: " + uploadResult.error);
            router.refresh();
            onSuccess();
            return;
          }
        }
        toast.success(isEdit ? "Customer updated" : "Customer added");
        router.refresh();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }, (errors) => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
    const firstError = Object.keys(errors)[0];
    if (firstError) form.setFocus(firstError as Parameters<typeof form.setFocus>[0]);
  });

  return {
    form,
    onSubmit,
    isSubmitting,
    isEdit,
    isDuplicatePhone,
    shake,
    imageFile,
    setImageFile: handleImageChange,
    handlePhoneChange,
  };
}
