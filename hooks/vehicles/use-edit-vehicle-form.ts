"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { PhotoGalleryItem } from "@/components/vehicles/add/photo-gallery-upload";
import { computeTotalInvested } from "@/lib/vehicles/actions/add-vehicle/defaults";
import { validateFile } from "@/lib/vehicles/actions/utils";
import { updateVehicle } from "@/lib/vehicles/server/update-vehicle";
import { checkVinUniqueness } from "@/lib/vehicles/server/utils";
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
  titleReceived: z.boolean(),
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
  odometerStatus: z.string().optional(),
  fuelType: z.string().optional(),
  notes: z.string().max(500, "Notes must be 500 characters or less").optional(),
});

type EditVehicleFormValues = z.infer<typeof editVehicleSchema>;

type GalleryItem =
  | { id: string; kind: "existing"; storagePath: string; url: string }
  | { id: string; kind: "new"; file: File; url: string };

function buildInitialGallery(vehicle: VehicleDetail): GalleryItem[] {
  return vehicle.imageStoragePaths.map((path, i) => ({
    id: path,
    kind: "existing" as const,
    storagePath: path,
    url: vehicle.images[i] ?? "",
  }));
}

function revokeNewGalleryUrls(items: GalleryItem[]) {
  for (const item of items) {
    if (item.kind === "new") URL.revokeObjectURL(item.url);
  }
}

async function fetchVehicleDetail(id: string): Promise<VehicleDetail | null> {
  try {
    const res = await fetch(`/api/vehicles/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as VehicleDetail;
  } catch {
    return null;
  }
}

export function useEditVehicleForm(
  vehicle: VehicleDetail,
  open: boolean,
  onSuccess: (updatedVehicle?: VehicleDetail) => void,
) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDuplicateVin, setIsDuplicateVin] = useState(false);
  const [shake, setShake] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>(() => buildInitialGallery(vehicle));
  const galleryRef = useRef(gallery);
  galleryRef.current = gallery;

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
    titleReceived: vehicle.titleReceived,
    licensePlate: vehicle.licensePlate || "",
    state: vehicle.state || "",
    expirationDate: vehicle.expirationDate || "",
    sellerAuction: vehicle.sellerAuction || "",
    purchaseType: vehicle.purchaseType || "",
    acquisitionCost: vehicle.cost,
    askingPrice: vehicle.price,
    marketValue: vehicle.marketValue,
    wholesalePrice: vehicle.wholesalePrice ?? 0,
    reconditioningCost: vehicle.totalReconditioning,
    odometerStatus: vehicle.odometerStatus || "",
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
      setGallery(buildInitialGallery(vehicle));
    } else {
      revokeNewGalleryUrls(galleryRef.current);
      setGallery([]);
    }
  }, [open, form, buildDefaults, vehicle]);

  const acquisitionCost = form.watch("acquisitionCost");
  const reconditioningCost = form.watch("reconditioningCost");
  const make = form.watch("make");
  const vin = form.watch("vin");

  const totalInvested = useMemo(
    () => computeTotalInvested(acquisitionCost ?? 0, reconditioningCost ?? 0),
    [acquisitionCost, reconditioningCost],
  );

  const galleryItems: PhotoGalleryItem[] = useMemo(
    () => gallery.map(({ id, url }) => ({ id, url })),
    [gallery],
  );

  const addPhotos = useCallback((files: File[]) => {
    const remaining = 20 - galleryRef.current.length;
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

    const newItems: GalleryItem[] = valid.map((file) => ({
      id: `new-${crypto.randomUUID()}`,
      kind: "new",
      file,
      url: URL.createObjectURL(file),
    }));
    setGallery((prev) => [...prev, ...newItems]);
  }, []);

  const removePhoto = useCallback((index: number) => {
    setGallery((prev) => {
      const item = prev[index];
      if (item?.kind === "new") URL.revokeObjectURL(item.url);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const reorderPhotos = useCallback((fromIndex: number, toIndex: number) => {
    setGallery((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }, []);

  useEffect(() => {
    if (vin.length !== 17) {
      form.clearErrors("vin");
      setIsDuplicateVin(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const { isDuplicate } = await checkVinUniqueness(vin, vehicle.id);
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
  }, [vin, form, vehicle.id]);

  const onSubmit = form.handleSubmit(
    async (values) => {
      NProgress.start();
      setIsSubmitting(true);
      try {
        const currentGallery = galleryRef.current;
        const removedImages = vehicle.imageStoragePaths.filter(
          (path) => !currentGallery.some(
            (item) => item.kind === "existing" && item.storagePath === path,
          ),
        );
        const imageOrder = currentGallery.map((item) =>
          item.kind === "existing"
            ? { type: "existing" as const, path: item.storagePath }
            : { type: "new" as const },
        );
        const newPhotos = currentGallery
          .filter((item): item is Extract<GalleryItem, { kind: "new" }> => item.kind === "new")
          .map((item) => item.file);

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
          titleReceived: values.titleReceived,
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
          odometerStatus: values.odometerStatus ?? "",
          notes: values.notes ?? "",
          removedImages,
          imageOrder,
        };

        const formData = new FormData();
        formData.set("payload", JSON.stringify(payload));
        for (const file of newPhotos) {
          formData.append("photos", file);
        }

        const result = await updateVehicle(formData);

        if (result.success) {
          toast.success("Vehicle updated successfully");
          const updatedVehicle = await fetchVehicleDetail(vehicle.id);
          router.refresh();
          onSuccess(updatedVehicle ?? undefined);
        } else {
          toast.error(result.error ?? "Failed to update vehicle");
        }
      } finally {
        setIsSubmitting(false);
        NProgress.done();
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
    isDuplicateVin,
    shake,
    totalInvested,
    make,
    galleryItems,
    addPhotos,
    removePhoto,
    reorderPhotos,
  };
}
