import { todayISO } from "@/lib/vehicles/actions/utils";

export type TitleReceivedDbFields = {
  title_received: boolean;
  title_status: "received" | "missing";
  title_missing_since: string | null;
};

export function resolveTitleReceivedFields(
  titleReceived: boolean,
  existingTitleMissingSince?: string | null,
): TitleReceivedDbFields {
  const titleStatus = titleReceived ? "received" : "missing";
  return {
    title_received: titleReceived,
    title_status: titleStatus,
    title_missing_since: titleReceived
      ? null
      : existingTitleMissingSince ?? todayISO(),
  };
}

export function mapDbTitleReceived(
  titleReceived: boolean | null | undefined,
  titleStatus?: string | null,
): boolean {
  if (typeof titleReceived === "boolean") return titleReceived;
  if (titleStatus === "missing" || titleStatus === "pending") return false;
  return true;
}
