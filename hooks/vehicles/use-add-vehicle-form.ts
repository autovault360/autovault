"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  buildAddVehicleDefaults,
  computeTotalInvested,
} from "@/lib/vehicles/actions/add-vehicle/defaults";
import {
  addVehicleSchema,
  type AddVehicleFormValues,
} from "@/lib/vehicles/actions/add-vehicle/schemas";
import {
  getAddVehicleSuccessMessage,
} from "@/lib/vehicles/actions/add-vehicle/submit";
import { addVehicle } from "@/lib/vehicles/server/add-vehicle";
import { checkVinUniqueness } from "@/lib/vehicles/server/utils";
import { decodeVin } from "@/lib/vehicles/actions/vin-decoder";
import { validateFile } from "@/lib/vehicles/actions/utils";

export function useAddVehicleForm(open: boolean, onSuccess: () => void) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isDuplicateVin, setIsDuplicateVin] = useState(false);
  const [shake, setShake] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const form = useForm<AddVehicleFormValues>({
    resolver: zodResolver(addVehicleSchema) as Resolver<AddVehicleFormValues>,
    defaultValues: buildAddVehicleDefaults(),
    mode: "onBlur",
  });

  const acquisitionCost = form.watch("acquisitionCost");
  const registrationFees = form.watch("registrationFees");
  const auctionFees = form.watch("auctionFees");
  const reconditioningCost = form.watch("reconditioningCost");
  const photos = form.watch("photos");
  const make = form.watch("make");
  const vin = form.watch("vin");

  const totalInvested = useMemo(
    () => computeTotalInvested(acquisitionCost, registrationFees, auctionFees, reconditioningCost),
    [acquisitionCost, registrationFees, auctionFees, reconditioningCost],
  );

  useEffect(() => {
    if (open) {
      form.reset(buildAddVehicleDefaults());
      setPhotoUrls([]);
    }
  }, [open, form]);

  useEffect(() => {
    return () => {
      photoUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [photoUrls]);

  useEffect(() => {
    if (vin.length !== 17) {
      form.clearErrors("vin");
      setIsDuplicateVin(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { isDuplicate } = await checkVinUniqueness(vin);
        setIsDuplicateVin(isDuplicate);
        if (isDuplicate) {
          form.setError("vin", { message: "A vehicle with this VIN already exists" });
        } else {
          form.clearErrors("vin");
        }
      } catch {
        // Server action catches duplicates on submit
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [vin, form]);

  const syncPhotoUrls = useCallback((files: File[]) => {
    setPhotoUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return files.map((file) => URL.createObjectURL(file));
    });
  }, []);

  const addPhotos = useCallback(
    (files: File[]) => {
      const current = form.getValues("photos");
      const remaining = 20 - current.length;
      if (remaining <= 0) {
        toast.error("Maximum 20 photos allowed");
        return;
      }

      const valid: File[] = [];
      for (const file of files.slice(0, remaining)) {
        const error = validateFile(file, {
          maxSizeMB: 10,
          allowedTypes: ["image/jpeg", "image/png"],
        });
        if (error) {
          toast.error(error);
          continue;
        }
        valid.push(file);
      }

      if (!valid.length) return;
      const next = [...current, ...valid];
      form.setValue("photos", next, { shouldDirty: true });
      syncPhotoUrls(next);
    },
    [form, syncPhotoUrls],
  );

  const removePhoto = useCallback(
    (index: number) => {
      const current = form.getValues("photos");
      const next = current.filter((_, i) => i !== index);
      form.setValue("photos", next, { shouldDirty: true });
      syncPhotoUrls(next);
    },
    [form, syncPhotoUrls],
  );

  const reorderPhotos = useCallback(
    (fromIndex: number, toIndex: number) => {
      const current = form.getValues("photos");
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      form.setValue("photos", next, { shouldDirty: true });
      syncPhotoUrls(next);
    },
    [form, syncPhotoUrls],
  );

  const scanVin = useCallback(async () => {
    const vin = form.getValues("vin");
    if (vin.length !== 17) {
      toast.error("Enter a valid 17-character VIN to scan");
      return;
    }

    setIsScanning(true);
    try {
      const decoded = await decodeVin(vin);

      if (decoded.year) form.setValue("year", decoded.year, { shouldDirty: true });
      if (decoded.make) form.setValue("make", decoded.make, { shouldDirty: true });
      if (decoded.trim) form.setValue("trim", decoded.trim, { shouldDirty: true });
      if (decoded.bodyStyle) form.setValue("bodyStyle", decoded.bodyStyle, { shouldDirty: true });
      if (decoded.driveType) form.setValue("driveType", decoded.driveType, { shouldDirty: true });
      if (decoded.fuelType) form.setValue("fuelType", decoded.fuelType, { shouldDirty: true });

      // Defer model so the Select options derived from make are rendered first
      setTimeout(() => {
        if (decoded.model) form.setValue("model", decoded.model, { shouldDirty: true });
      }, 0);

      toast.success("VIN decoded successfully");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to decode VIN");
    } finally {
      setIsScanning(false);
    }
  }, [form]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      NProgress.start();
      setIsSubmitting(true);
      try {
        const payload = {
          vin: values.vin,
          year: Number(values.year),
          make: values.make,
          model: values.model,
          trim: values.trim ?? "",
          bodyStyle: values.bodyStyle ?? "",
          mileage: values.mileage ?? 0,
          exteriorColor: values.exteriorColor ?? "",
          interiorColor: values.interiorColor ?? "",
          driveType: values.driveType ?? "",
          fuelType: values.fuelType ?? "",
          stockNumber: values.stockNumber,
          lotLocation: values.lotLocation,
          acquisitionDate: values.acquisitionDate ?? "",
          titleReceived: values.titleReceived,
          licensePlate: values.licensePlate ?? "",
          state: values.state ?? "",
          expirationDate: values.expirationDate ?? "",
          sellerAuction: values.sellerAuction ?? "",
          purchaseType: values.purchaseType ?? "",
          acquisitionCost: values.acquisitionCost,
          registrationFees: values.registrationFees,
          auctionFees: values.auctionFees,
          askingPrice: values.askingPrice,
          marketValue: values.marketValue,
          wholesalePrice: values.wholesalePrice,
          reconditioningCost: values.reconditioningCost,
          odometerStatus: values.odometerStatus ?? "",
          notes: values.notes ?? "",
        };

        const formData = new FormData();
        formData.set("payload", JSON.stringify(payload));
        for (const file of values.photos) {
          formData.append("photos", file);
        }

        const result = await addVehicle(formData);

        if (result.success) {
          toast.success(getAddVehicleSuccessMessage(values.addAnother));
          startTransition(() => {
            router.refresh();
          });
          if (values.addAnother) {
            form.reset(buildAddVehicleDefaults());
            setPhotoUrls([]);
          } else {
            onSuccess();
          }
        } else {
          toast.error(result.error ?? "Failed to save vehicle");
        }
      } finally {
        setIsSubmitting(false);
        NProgress.done();
      }
    },
    (errors) => {
      setShake(true);
      setTimeout(() => setShake(false), 300);
      const firstError = Object.keys(errors)[0];
      if (firstError) form.setFocus(firstError as keyof AddVehicleFormValues);
    },
  );

  return {
    form,
    onSubmit,
    isSubmitting,
    isScanning,
    isDuplicateVin,
    shake,
    totalInvested,
    photoUrls,
    photos,
    make,
    addPhotos,
    removePhoto,
    reorderPhotos,
    scanVin,
  };
}
