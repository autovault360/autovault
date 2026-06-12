"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import AddVehicleModal from "./add-vehicle-modal";
import { Button, ButtonIcon } from "@/components/ui/button";

export default function AddVehicleTrigger({
  defaultOpen = false,
  buttonClassName,
  syncQueryParam = true,
}: {
  defaultOpen?: boolean;
  buttonClassName?: string;
  /** When false, opening the modal does not update the URL (for embedded dashboard sections). */
  syncQueryParam?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [, startTransition] = useTransition();

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (syncQueryParam) {
      window.history.replaceState(null, "", next ? `${pathname}?add=true` : pathname);
    }
    if (!next) {
      startTransition(() => {
        router.refresh();
      });
    }
  };

  return (
    <>
      <Button
        type="button"
        size="action"
        className={buttonClassName}
        onClick={() => handleOpenChange(true)}
      >
        <ButtonIcon tone="default">
          <Plus />
        </ButtonIcon>
        Add Vehicle
      </Button>
      <AddVehicleModal open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
