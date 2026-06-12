"use client";

import { Plus } from "lucide-react";
import { Button, ButtonIcon } from "@/components/ui/button";

export default function AddMissingTitleTrigger({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <Button type="button" size="action" onClick={onClick}>
      <ButtonIcon tone="success">
        <Plus />
      </ButtonIcon>
      Add Missing Title Record
    </Button>
  );
}
