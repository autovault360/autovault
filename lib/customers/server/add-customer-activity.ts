"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  customerCommunicationSchema,
  customerNoteSchema,
  type CustomerCommunicationFormValues,
  type CustomerNoteFormValues,
} from "../actions/schemas";
import type { CommunicationType } from "../types";
import { authenticateUser } from "./utils";

export type CustomerActionResult =
  | { success: true }
  | { success: false; error: string };

export async function addCustomerNote(
  values: CustomerNoteFormValues,
): Promise<CustomerActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const data = customerNoteSchema.parse(values);
    const supabase = await createClient();

    const { error } = await supabase.from("customer_notes").insert({
      customer_id: data.customerId,
      dealership_id: auth.user.dealershipId,
      body: data.body,
      created_by: auth.user.userId,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function addCustomerCommunication(
  values: CustomerCommunicationFormValues,
): Promise<CustomerActionResult> {
  try {
    const auth = await authenticateUser();
    if (!auth.ok) return { success: false, error: auth.error };

    const data = customerCommunicationSchema.parse(values);
    const supabase = await createClient();

    const { error } = await supabase.from("customer_communications").insert({
      customer_id: data.customerId,
      dealership_id: auth.user.dealershipId,
      type: data.type as CommunicationType,
      subject: data.subject || null,
      body: data.body,
      occurred_at: data.occurredAt || new Date().toISOString(),
      created_by: auth.user.userId,
    });

    if (error) throw new Error(error.message);

    revalidatePath("/dashboard/customers");
    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
