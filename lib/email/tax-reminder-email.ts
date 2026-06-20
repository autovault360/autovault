import type { ReminderInfo } from "@/lib/state-tax/types";

export type TaxReminderEmailParams = {
  ownerName: string;
  ownerEmail: string;
  dealershipName: string;
  reminders: ReminderInfo[];
  dashboardUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function taxReminderEmail(p: TaxReminderEmailParams): string {
  const greeting = p.ownerName?.trim() ? escapeHtml(p.ownerName.trim()) : "Dealer";
  const overdue = p.reminders.filter((r) => r.daysUntilDue <= 0);
  const upcoming = p.reminders.filter((r) => r.daysUntilDue > 0);

  const overdueRows = overdue
    .map(
      (r) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#d32f2f;font-weight:600;">${escapeHtml(r.periodName)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#616161;">${r.vehicleCount}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#d32f2f;">Overdue</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#616161;">${new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
    </tr>`,
    )
    .join("");

  const upcomingRows = upcoming
    .map(
      (r) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#212121;font-weight:600;">${escapeHtml(r.periodName)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#616161;">${r.vehicleCount}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#1565C0;">${r.daysUntilDue} days</td>
      <td style="padding:10px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;color:#616161;">${new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
    </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sales Tax Filing Reminder</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a,#1e293b);padding:28px 32px;">
              <h1 style="margin:0;font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.04em;">SALES TAX FILING REMINDER</h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">${escapeHtml(p.dealershipName)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px 32px;">
              <p style="margin:0 0 16px;font-size:14px;color:#212121;">Hi ${greeting},</p>
              <p style="margin:0 0 20px;font-size:13px;color:#616161;">
                This is an automated reminder about your sales tax filing periods that need attention.
              </p>

              ${overdue.length > 0 ? `
              <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#d32f2f;">�š  Overdue Filing Periods</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                <thead>
                  <tr style="background-color:#fef2f2;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#991b1b;letter-spacing:0.05em;">Period</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#991b1b;letter-spacing:0.05em;">Vehicles</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#991b1b;letter-spacing:0.05em;">Status</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#991b1b;letter-spacing:0.05em;">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${overdueRows}
                </tbody>
              </table>
              ` : ""}

              ${upcoming.length > 0 ? `
              <h2 style="margin:0 0 12px;font-size:15px;font-weight:700;color:#1565C0;">��° Upcoming Deadlines</h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
                <thead>
                  <tr style="background-color:#eef2ff;">
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#1e40af;letter-spacing:0.05em;">Period</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#1e40af;letter-spacing:0.05em;">Vehicles</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#1e40af;letter-spacing:0.05em;">Due In</th>
                    <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;color:#1e40af;letter-spacing:0.05em;">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  ${upcomingRows}
                </tbody>
              </table>
              ` : ""}

              <p style="margin:0 0 20px;font-size:13px;color:#616161;">
                <a href="${escapeHtml(p.dashboardUrl)}" style="display:inline-block;padding:12px 24px;background-color:#0f172a;color:#ffffff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:600;">View Dashboard</a>
              </p>

              <hr style="border:none;border-top:1px solid #e0e0e0;margin:20px 0;" />
              <p style="margin:0;font-size:11px;color:#9e9e9e;">
                This is an automated message from AutoVault360. Tax amounts shown are based on dealer-entered values and have not been verified by AutoVault360.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
