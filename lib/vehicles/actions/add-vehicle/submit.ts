import type { AddVehiclePayload } from "./types";

const MIN_DELAY_MS = 300;

export async function submitAddVehicle(
  payload: AddVehiclePayload,
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, MIN_DELAY_MS));

  if (process.env.NODE_ENV === "development") {
    console.log("[submitAddVehicle]", payload);
  }

  return { success: true };
}

export function getAddVehicleSuccessMessage(addAnother: boolean): string {
  return addAnother
    ? "Vehicle saved. You can add another vehicle."
    : "Vehicle saved successfully.";
}
