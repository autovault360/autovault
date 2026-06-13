"use client";

import type { ReactNode } from "react";
import { AdminQuickActionsProvider } from "@/lib/portal/admin-quick-actions-context";
import AdminQuickActionsHost from "./admin-quick-actions-host";

export default function AdminPortalShell({ children }: { children: ReactNode }) {
  return (
    <AdminQuickActionsProvider>
      {children}
      <AdminQuickActionsHost />
    </AdminQuickActionsProvider>
  );
}
