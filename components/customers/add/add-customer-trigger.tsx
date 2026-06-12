"use client";

import { Plus } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";

export default function AddCustomerTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button type="button" size="action" onClick={onClick}>
      <ButtonIcon tone="accent">
        <Plus />
      </ButtonIcon>
      Add Customer
    </Button>
  );
}
