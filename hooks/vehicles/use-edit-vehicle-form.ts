"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { computeTotalInvested } from "@/lib/vehicles/actions/add-vehicle/defaults";
import { validateFile } from "@/lib/vehicles/actions/utils";
import { updateVehicle } from "@/lib/vehicles/server/update-vehicle";
import type { VehicleDetail } from "@/lib/vehicles/detail-types";

const currencyField = z.coerce.number().min(0, "Must be 0 or greater");

const editVehicleSchema = z.object({
  vin: z.string().min(17, "VIN must be 17 characters").max(17, "VIN must be 17 characters"),
  year: z.string().min(1, "Year is required"),
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  trim: z.string().optional(),
  bodyStyle: z.string().optional(),
  mileage: z.coerce.number().min(0).optional().or(z.literal(0)),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
  driveType: z.string().optional(),
  stockNumber: z.string().min(1, "Stock number is required"),
  lotLocation: z.string().min(1, "Lot / location is required"),
  acquisitionDate: z.string().optional(),
  titleNumber: z.string().optional(),
  licensePlate: z.string().optional(),
  state: z.string().optional(),
  expirationDate: z.string().optional(),
  sellerAuction: z.string().optional(),
  purchaseType: z.string().optional(),
  acquisitionCost: currencyField.refine((v) => v > 0, "Acquisition cost is required"),
  askingPrice: currencyField.refine((v) => v > 0, "Asking price is required"),
  marketValue: currencyField,
  wholesalePrice: currencyField,
  reconditioningCost: currencyField,
  titleStatus: z.string().optional(),
  odometerStatus: z.string().optional(),
  fuelType: z.string().optional(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

type EditVehicleFormValues = z.infer<typeof editVehicleSchema>;

export function useEditVehicleForm(
  vehicle: VehicleDetail,
  open: boolean,
  onSuccess: () => void,
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const [newPhotoUrls, setNewPhotoUrls] = useState<string[]>([]);
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const removedPathsRef = useRef(removedPaths);
  removedPathsRef.current = removedPaths;

  const buildDefaults = useCallback((): EditVehicleFormValues => ({
    vin: vehicle.vin,
    year: String(vehicle.year),
    make: vehicle.make,
    model: vehicle.model,
    trim: vehicle.trim || "",
    bodyStyle: vehicle.bodyStyle || "",
    mileage: vehicle.mileage || 0,
    exteriorColor: vehicle.exteriorColor || "",
    interiorColor: vehicle.interiorColor || "",
    driveType: vehicle.drivetrain || "",
    stockNumber: vehicle.stockNumber || "",
    lotLocation: vehicle.location || "",
    acquisitionDate: vehicle.arrivalDate || "",
    titleNumber: "",
    licensePlate: "",
    state: "",
    expirationDate: "",
    sellerAuction: "",
    purchaseType: "",
    acquisitionCost: vehicle.cost,
    askingPrice: vehicle.price,
    marketValue: vehicle.marketValue,
    wholesalePrice: 0,
    reconditioningCost: vehicle.totalReconditioning,
    titleStatus: vehicle.titleStatus || "",
    odometerStatus: "",
    fuelType: vehicle.fuelType || "",
    notes: vehicle.notes || "",
  }), [vehicle]);

  const form = useForm<EditVehicleFormValues>({
    resolver: zodResolver(editVehicleSchema) as Resolver<EditVehicleFormValues>,
    defaultValues: buildDefaults(),
    mode: "onBlur",
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaults());
      setNewPhotos([]);
      setNewPhotoUrls([]);
      setRemovedPaths([]);
    }
  }, [open, form, buildDefaults]);

  const acquisitionCost = form.watch("acquisitionCost");
  const reconditioningCost = form.watch("reconditioningCost");
  const make = form.watch("make");

  const totalInvested = useMemo(
    () => computeTotalInvested(acquisitionCost ?? 0, reconditioningCost ?? 0),
    [acquisitionCost, reconditioningCost],
  );

  const syncPhotoUrls = useCallback((files: File[]) => {
    setNewPhotoUrls((prev) => {
      prev.forEach((url) => URL.revokeObjectURL(url));
      return files.map((file) => URL.createObjectURL(file));
    });
  }, []);

  const addPhotos = useCallback((files: File[]) => {
    const remaining = 20 - newPhotos.length;
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
      if (error) { toast.error(error); continue; }
      valid.push(file);
    }
    if (!valid.length) return;
    const next = [...newPhotos, ...valid];
    setNewPhotos(next);
    syncPhotoUrls(next);
  }, [newPhotos, syncPhotoUrls]);

  const removeNewPhoto = useCallback((index: number) => {
    const next = newPhotos.filter((_, i) => i !== index);
    setNewPhotos(next);
    syncPhotoUrls(next);
  }, [newPhotos, syncPhotoUrls]);

  const removeExistingImage = useCallback((storagePath: string) => {
    setRemovedPaths((prev) => [...prev, storagePath]);
  }, []);

  const remainingExisting = vehicle.imageStoragePaths.filter(
    (p) => !removedPaths.includes(p),
  );

  const onSubmit = form.handleSubmit(
    async (values) => {
      setIsSubmitting(true);
      try {
        const payload = {
          vehicleId: vehicle.id,
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
          titleNumber: values.titleNumber ?? "",
          licensePlate: values.licensePlate ?? "",
          state: values.state ?? "",
          expirationDate: values.expirationDate ?? "",
          sellerAuction: values.sellerAuction ?? "",
          purchaseType: values.purchaseType ?? "",
          acquisitionCost: values.acquisitionCost,
          askingPrice: values.askingPrice,
          marketValue: values.marketValue,
          wholesalePrice: values.wholesalePrice,
          reconditioningCost: values.reconditioningCost,
          titleStatus: values.titleStatus ?? "",
          odometerStatus: values.odometerStatus ?? "",
          notes: values.notes ?? "",
          removedImages: removedPathsRef.current,
        };

        const formData = new FormData();
        formData.set("payload", JSON.stringify(payload));
        for (const file of newPhotos) {
          formData.append("photos", file);
        }

        const result = await updateVehicle(formData);

        if (result.success) {
          toast.success("Vehicle updated successfully");
          onSuccess();
        } else {
          toast.error(result.error ?? "Failed to update vehicle");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    () => {
      setShake(true);
      setTimeout(() => setShake(false), 300);
    },
  );

  return {
    form,
    onSubmit,
    isSubmitting,
    shake,
    totalInvested,
    make,
    newPhotos,
    newPhotoUrls,
    existingImages: vehicle.images,
    existingPaths: vehicle.imageStoragePaths,
    remainingExisting,
    addPhotos,
    removeNewPhoto,
    removeExistingImage,
  };
}
