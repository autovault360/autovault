"use client";

import { Plus } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";

export default function AddSalesRepTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button type="button" size="action" onClick={onClick}>
      <ButtonIcon tone="default">
        <Plus />
      </ButtonIcon>
      Add Sales Rep
    </Button>
  );
}
