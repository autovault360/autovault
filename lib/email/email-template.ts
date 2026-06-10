export type SalesRepWelcomeData = {
  fullName: string;
  email: string;
  tempPassword: string;
  role: string;
  userId: string;
  authUserId: string;
  dealershipId: string;
  loginUrl: string;
};

function baseWrapper(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>AutoVault360</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" style="max-width:600px;background-color:#1e293b;border-radius:12px;overflow:hidden;border:1px solid #334155;">
          <tr>
            <td style="padding:32px 40px 24px;text-align:center;background:linear-gradient(135deg,#1e3a5f 0%,#0f172a 100%);border-bottom:3px solid #3b82f6;">
              <h1 style="margin:0;font-size:24px;font-weight:700;color:#f8fafc;letter-spacing:-0.5px;">
                ⚡ AutoVault360
              </h1>
              <p style="margin:6px 0 0;font-size:13px;color:#94a3b8;">Dealership Operating System</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;color:#e2e8f0;font-size:14px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:24px 40px;text-align:center;border-top:1px solid #334155;">
              <p style="margin:0 0 4px;font-size:12px;color:#64748b;">
                &copy; ${new Date().getFullYear()} AutoVault360. All rights reserved.
              </p>
              <p style="margin:0;font-size:11px;color:#475569;">
                This is an automated message. Please do not reply directly.
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

export function salesRepWelcomeEmail(data: SalesRepWelcomeData): string {
  const roleDisplay = data.role === "manager" ? "Manager" : "Sales Representative";

  const body = `
    <h2 style="color:#f8fafc;font-size:20px;font-weight:600;margin:0 0 16px;">
      Welcome to AutoVault360, ${data.fullName}! 🚗
    </h2>
    <p style="margin:0 0 20px;color:#cbd5e1;">
      Your account has been created. Below are your credentials and account details.
      Please sign in and change your password on first login.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;border-radius:8px;border:1px solid #334155;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <h3 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:0.5px;">
            Sign-In Credentials
          </h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#94a3b8;width:120px;">Email</td>
              <td style="padding:4px 0;font-size:13px;color:#f8fafc;font-weight:500;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#94a3b8;width:120px;">Temporary Password</td>
              <td style="padding:4px 0;font-size:13px;color:#facc15;font-weight:600;font-family:monospace;">${data.tempPassword}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#94a3b8;width:120px;">Role</td>
              <td style="padding:4px 0;font-size:13px;color:#f8fafc;font-weight:500;">${roleDisplay}</td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding:0 20px 16px;">
          <h3 style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3b82f6;text-transform:uppercase;letter-spacing:0.5px;">
            Account Details
          </h3>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#94a3b8;width:120px;">User ID</td>
              <td style="padding:4px 0;font-size:13px;color:#f8fafc;font-family:monospace;">${data.userId}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#94a3b8;width:120px;">Auth User ID</td>
              <td style="padding:4px 0;font-size:13px;color:#f8fafc;font-family:monospace;">${data.authUserId}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#94a3b8;width:120px;">Dealership ID</td>
              <td style="padding:4px 0;font-size:13px;color:#f8fafc;font-family:monospace;">${data.dealershipId}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:0 0 16px;">
          <a href="${data.loginUrl}"
             style="display:inline-block;padding:12px 32px;background-color:#2563eb;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;border-radius:8px;">
            Sign In to AutoVault360
          </a>
        </td>
      </tr>
    </table>

    <p style="margin:16px 0 0;font-size:12px;color:#64748b;">
      ⚠️ For security, please change your password after signing in.
      This password was generated by your dealership administrator.
    </p>
  `;

  return baseWrapper(body);
}
