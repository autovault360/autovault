import type { VehicleActionType } from "./types";

const MIN_DELAY_MS = 300;

export async function submitVehicleAction<T>(
  action: VehicleActionType,
  vehicleId: string,
  payload: T,
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS));

  if (process.env.NODE_ENV === "development") {
    console.log(`[submitVehicleAction] ${action}`, { vehicleId, payload });
  }

  return { success: true };
}

export function buildFormData(
  payload: Record<string, unknown>,
  fileFields: string[] = [],
): FormData {
  const formData = new FormData();

  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;

    if (fileFields.includes(key)) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (Array.isArray(value)) {
        value.forEach((file, i) => {
          if (file instanceof File) {
            formData.append(`${key}[${i}]`, file);
          }
        });
      }
    } else if (typeof value === "object" && !(value instanceof File)) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}

export function getSuccessMessage(action: VehicleActionType): string {
  switch (action) {
    case "update-pricing":
      return "Vehicle pricing updated successfully.";
    case "add-repair-cost":
      return "Repair cost saved successfully.";
    case "mark-as-sold":
      return "Vehicle marked as sold successfully.";
    case "mark-as-loss":
      return "Vehicle marked as loss successfully.";
  }
}
