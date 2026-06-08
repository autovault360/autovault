export type PayrollAuditAction =
  | "view_employee"
  | "edit_payroll"
  | "add_bonus"
  | "add_deduction"
  | "upload_document"
  | "sync_cpa"
  | "export"
  | "run_payroll";

export type PayrollAuditPayload = {
  entity: "employee_payroll";
  employeeId: string;
  action: PayrollAuditAction;
  timestamp: string;
  metadata?: Record<string, unknown>;
};

/** TODO(cpa-sync): wire to /cpa/dashboard payroll summary when API lands */
export function logPayrollAudit(payload: PayrollAuditPayload) {
  if (process.env.NODE_ENV === "development") {
    console.debug("[payroll-audit]", payload);
  }
}
