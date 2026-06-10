"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  salesRepFormSchema,
  type SalesRepFormValues,
} from "@/lib/sales-reps/actions/schemas";
import { phoneRegex } from "@/lib/shared/phone";
import { createSalesRep } from "@/lib/sales-reps/server/create-sales-rep";
import { checkEmailUniqueness } from "@/lib/sales-reps/server/utils";
import { uploadSalesRepImage } from "@/lib/sales-reps/server/upload-sales-rep-image";
import { formatPhoneNumber, validateFile } from "@/lib/vehicles/actions/utils";
import { DEFAULT_MONTHLY_GOAL, DEFAULT_COMMISSION_RATE } from "@/lib/sales-reps/actions/schemas";

function buildDefaults(): SalesRepFormValues {
  return {
    fullName: "",
    phone: "",
    email: "",
    role: "sales_rep",
    isActive: true,
    address: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    hireDate: new Date().toISOString().slice(0, 10),
    commissionRate: DEFAULT_COMMISSION_RATE,
    monthlyGoal: DEFAULT_MONTHLY_GOAL,
  };
}

export function useSalesRepForm(open: boolean, onSuccess: () => void) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [isDuplicateEmail, setIsDuplicateEmail] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const form = useForm<SalesRepFormValues>({
    resolver: zodResolver(salesRepFormSchema) as Resolver<SalesRepFormValues>,
    defaultValues: buildDefaults(),
    mode: "onBlur",
  });

  const email = form.watch("email");

  useEffect(() => {
    if (open) {
      form.reset(buildDefaults());
      setImageFile(null);
      setIsDuplicateEmail(false);
    }
  }, [open, form]);

  useEffect(() => {
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      form.clearErrors("email");
      setIsDuplicateEmail(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { isDuplicate } = await checkEmailUniqueness(trimmed);
        setIsDuplicateEmail(isDuplicate);
        if (isDuplicate) {
          form.setError("email", {
            message: "A sales rep with this email already exists",
          });
        } else {
          form.clearErrors("email");
        }
      } catch {
        // Server validates on submit
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email, form]);

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
    if (isDuplicateEmail) {
      toast.error("A sales rep with this email already exists");
      return;
    }

    if (!phoneRegex.test(values.phone)) {
      toast.error("Enter a valid phone number");
      return;
    }

    NProgress.start();
    setIsSubmitting(true);
    try {
      const result = await createSalesRep(values);

      if (result.success) {
        if (imageFile) {
          const uploadResult = await uploadSalesRepImage(result.userId, imageFile);
          if (!uploadResult.success) {
            toast.error(
              "Sales rep added but photo upload failed: " + uploadResult.error,
            );
            router.refresh();
            onSuccess();
            return;
          }
        }
        toast.success(
          "Sales rep added successfully. A welcome email with login instructions has been sent to their email.",
        );
        router.refresh();
        onSuccess();
      } else {
        toast.error(result.error);
      }
    } finally {
      setIsSubmitting(false);
      NProgress.done();
    }
  }, (errors) => {
    setShake(true);
    setTimeout(() => setShake(false), 300);
    const firstError = Object.keys(errors)[0];
    if (firstError) {
      form.setFocus(firstError as Parameters<typeof form.setFocus>[0]);
    }
  });

  return {
    form,
    onSubmit,
    isSubmitting,
    isDuplicateEmail,
    shake,
    imageFile,
    setImageFile: handleImageChange,
    handlePhoneChange,
  };
}
