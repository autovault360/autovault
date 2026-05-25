"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import AddVehicleModal from "./add-vehicle-modal";

export default function AddVehicleTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-[12.5px] font-semibold text-white transition hover:bg-blue-500"
      >
        <Plus className="h-4 w-4" />
        Add Vehicle
      </button>
      <AddVehicleModal open={open} onOpenChange={setOpen} />
    </>
  );
}
