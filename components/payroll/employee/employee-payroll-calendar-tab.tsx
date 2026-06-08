"use client";

import { useState } from "react";
import type { EmployeePayrollProfile, PayrollCycle } from "@/lib/payroll/types";
import PayrollCycleToggle from "./payroll-cycle-toggle";
import EmployeePayrollCalendarGrid from "./employee-payroll-calendar-grid";
import PaycheckDetailSheet from "./paycheck-detail-sheet";

export default function EmployeePayrollCalendarTab({
  profile,
}: {
  profile: EmployeePayrollProfile;
}) {
  const [cycle, setCycle] = useState<PayrollCycle>("biweekly");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedPaycheck, setSelectedPaycheck] = useState(profile.paycheckDetails["2026-05-28"] ?? null);

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    const paycheck = profile.paycheckDetails[dateStr] ?? profile.paycheckDetails["2026-05-28"] ?? null;
    if (paycheck) {
      setSelectedPaycheck({ ...paycheck, payDate: dateStr.replace(/-/g, " ").replace("2026 05 ", "May ") + ", 2026" });
      setSheetOpen(true);
    }
  };

  return (
    <div>
      <PayrollCycleToggle value={cycle} onChange={setCycle} />
      <EmployeePayrollCalendarGrid
        cycle={cycle}
        events={profile.calendarEvents}
        onDateClick={handleDateClick}
      />
      <PaycheckDetailSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        paycheck={selectedPaycheck}
        employeeId={profile.id}
        selectedDate={selectedDate}
      />
    </div>
  );
}
