"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import AddVehicleModal from "./add-vehicle-modal";
import { Button, ButtonIcon } from "@/components/ui/button";
import { useAdminQuickActionsOptional } from "@/lib/portal/admin-quick-actions-context";
import { useSalesRepQuickActionsOptional } from "@/lib/portal/sales-rep-quick-actions-context";

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
  const adminQuickActions = useAdminQuickActionsOptional();
  const salesRepQuickActions = useSalesRepQuickActionsOptional();
  const useGlobalModal = Boolean(adminQuickActions || salesRepQuickActions);
  const [open, setOpen] = useState(defaultOpen && !useGlobalModal);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (useGlobalModal) return;
    setOpen(defaultOpen);
  }, [defaultOpen, useGlobalModal]);

  useEffect(() => {
    if (!useGlobalModal || !defaultOpen) return;
    if (adminQuickActions) {
      adminQuickActions.triggerAddVehicle();
    } else {
      salesRepQuickActions?.triggerAddVehicle();
    }
    if (syncQueryParam) {
      window.history.replaceState(null, "", pathname);
    }
  }, [
    adminQuickActions,
    defaultOpen,
    pathname,
    salesRepQuickActions,
    syncQueryParam,
    useGlobalModal,
  ]);

  const openModal = () => {
    if (adminQuickActions) {
      adminQuickActions.triggerAddVehicle();
      return;
    }
    if (salesRepQuickActions) {
      salesRepQuickActions.triggerAddVehicle();
      return;
    }
    handleOpenChange(true);
  };

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
        onClick={openModal}
      >
        <ButtonIcon tone="default">
          <Plus />
        </ButtonIcon>
        Add Vehicle
      </Button>
      {!useGlobalModal && (
        <AddVehicleModal open={open} onOpenChange={handleOpenChange} />
      )}
    </>
  );
}
