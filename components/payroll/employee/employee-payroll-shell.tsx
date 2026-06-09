"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import AdminHeader from "@/components/layout/AdminHeader";
import type { EmployeePayrollProfile, EmployeePayrollTab } from "@/lib/payroll/types";
import type { PortalModuleOptions } from "@/lib/portal/module-options";
import { resolvePortalModuleOptions } from "@/lib/portal/module-options";
import { logPayrollAudit } from "@/lib/payroll/audit";
import PayrollToolbarActions from "../payroll-toolbar-actions";
import EmployeePayrollBreadcrumb from "./employee-payroll-breadcrumb";
import EmployeePayrollBanner from "./employee-payroll-banner";
import EmployeePayrollTabs from "./employee-payroll-tabs";
import EmployeePayrollOverviewTab from "./employee-payroll-overview-tab";
import EmployeePayrollCalendarTab from "./employee-payroll-calendar-tab";
import PayrollNotesCard from "./payroll-notes-card";

export default function EmployeePayrollShell({
  profile: initialProfile,
  readOnly,
  showAdminHeader,
  basePath,
}: PortalModuleOptions & {
  profile: EmployeePayrollProfile;
}) {
  const { readOnly: isReadOnly, showAdminHeader: showHeader, basePath: portalBasePath } =
    resolvePortalModuleOptions({ readOnly, showAdminHeader, basePath });
  const [profile, setProfile] = useState(initialProfile);
  const [activeTab, setActiveTab] = useState<EmployeePayrollTab>("overview");

  useEffect(() => {
    setProfile(initialProfile);
    logPayrollAudit({
      entity: "employee_payroll",
      employeeId: initialProfile.id,
      action: "view_employee",
      timestamp: new Date().toISOString(),
    });
  }, [initialProfile]);

  return (
    <div className="relative pb-8">
      {showHeader && <AdminHeader />}

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <EmployeePayrollBreadcrumb payrollBasePath={`${portalBasePath}/payroll`} />
        {!isReadOnly && (
          <PayrollToolbarActions periodLabel={profile.periodLabel} />
        )}
      </div>

      <EmployeePayrollBanner profile={profile} />
      <EmployeePayrollTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === "overview" ? (
        <>
          <EmployeePayrollOverviewTab profile={profile} />
          {!isReadOnly && (
            <PayrollNotesCard
              note={profile.adminNote}
              updatedAt={profile.adminNoteUpdatedAt}
              onSave={(note) => setProfile((p) => ({ ...p, adminNote: note }))}
            />
          )}
        </>
      ) : (
        <EmployeePayrollCalendarTab profile={profile} />
      )}

      <footer className="mt-6 flex items-center justify-center gap-1.5 text-[13px] text-slate-500">
        <Lock className="h-3 w-3 shrink-0" />
        Payroll data is securely synced with the CPA Dashboard and Sales Tax Center.
      </footer>
    </div>
  );
}
