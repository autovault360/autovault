"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authenticateUser } from "@/lib/vehicles/server/utils";
import { createEvent as createEventService } from "@/services/events.service";

const schema = z.object({
  event_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
});

export type CreateEventResult =
  | { success: true; id: string }
  | { success: false; error: string };

export async function createEvent(formData: FormData): Promise<CreateEventResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const raw = JSON.parse(formData.get("payload") as string);
    const data = schema.parse(raw);

    const event = await createEventService(auth.user.dealershipId, auth.user.userId, {
      event_date: data.event_date,
      title: data.title,
      description: data.description ?? null,
    });

    if (!event) {
      return { success: false, error: "Failed to create event" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/calendar");
    return { success: true, id: event.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
