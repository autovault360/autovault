"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import AddVehicleModal from "./add-vehicle-modal";
import { Button } from "@/components/ui/button";

export default function AddVehicleTrigger({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    window.history.replaceState(null, "", next ? pathname + "?add=true" : pathname);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => handleOpenChange(true)}
        className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white"
      >
        <Plus className="h-4 w-4" />
        Add Vehicle
      </Button>
      <AddVehicleModal open={open} onOpenChange={handleOpenChange} />
    </>
  );
}
