import { z } from "zod";
import { validateFile } from "../utils";

const currencyField = z.coerce.number().min(0, "Must be 0 or greater");

export const addVehicleSchema = z
  .object({
    vin: z
      .string()
      .min(17, "VIN must be 17 characters")
      .max(17, "VIN must be 17 characters"),
    year: z.string().min(1, "Year is required"),
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    trim: z.string().optional(),
    bodyStyle: z.string().optional(),
    mileage: z.coerce.number().min(0).optional().or(z.literal(0)),
    exteriorColor: z.string().optional(),
    interiorColor: z.string().optional(),
    driveType: z.string().optional(),
    photos: z.array(z.instanceof(File)).max(20, "Maximum 20 photos"),
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
    addAnother: z.boolean(),
  })
  .superRefine((data, ctx) => {
    data.photos.forEach((file, index) => {
      const error = validateFile(file, {
        maxSizeMB: 10,
        allowedTypes: ["image/jpeg", "image/png"],
      });
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
          path: ["photos", index],
        });
      }
    });
  });

export type AddVehicleFormValues = z.infer<typeof addVehicleSchema>;
