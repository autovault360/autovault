"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import AddVehicleModal from "./add-vehicle-modal";
import { Button } from "@/components/ui/button";

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
        onClick={() => handleOpenChange(true)}
        className={
          buttonClassName ??
          "flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white"
        }
      >
        <Plus className="h-4 w-4" />
        Add Vehicle
      </Button>
      <AddVehicleModal open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
