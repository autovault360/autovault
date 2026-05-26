"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AddSalesRepTrigger({
  onClick,
}: {
  onClick?: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="h-9 gap-1.5 bg-blue-600 text-[12px] hover:bg-blue-500"
    >
      <Plus className="h-4 w-4" />
      Add Sales Rep
    </Button>
  );
}
