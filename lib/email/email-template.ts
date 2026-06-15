type SalesRepWelcomeParams = {
  fullName: string;
  email: string;
  tempPassword: string;
  role: string;
  userId: string;
  authUserId: string;
  dealershipId: string;
  loginUrl: string;
};

export function salesRepWelcomeEmail(p: SalesRepWelcomeParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0b1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1120;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#111b2e;border-radius:12px;border:1px solid #1e293b;">
          <tr>
            <td align="center" style="padding:36px 32px 20px;">
              <span style="font-size:22px;font-weight:700;color:#e2e8f0;letter-spacing:0.05em;">AUTOVAULT<span style="color:#3b82f6;">360</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 12px;text-align:center;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#f1f5f9;">Welcome to AutoVault360</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;line-height:1.5;">Your account has been created. Sign in with the credentials below.</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a1222;border-radius:8px;border:1px solid #1e293b;">
                <tr><td style="padding:20px 24px;">
                  <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;"><strong style="color:#e2e8f0;">Name:</strong> ${p.fullName}</p>
                  <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;"><strong style="color:#e2e8f0;">Email:</strong> ${p.email}</p>
                  <p style="margin:0 0 16px;font-size:13px;color:#94a3b8;"><strong style="color:#e2e8f0;">Role:</strong> ${p.role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}</p>
                  <p style="margin:0;font-size:13px;color:#94a3b8;"><strong style="color:#e2e8f0;">Temporary Password:</strong> <span style="font-family:'SFMono-Regular',Consolas,monospace;color:#fbbf24;font-weight:600;">${p.tempPassword}</span></p>
                </td></tr>
              </table>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:8px 32px 28px;">
              <a href="${p.loginUrl}" style="display:inline-block;padding:14px 40px;border-radius:8px;background-color:#3b82f6;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;">Sign In to AutoVault360</a>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 20px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#475569;line-height:1.5;">For security, please change your password after first login.<br/>This is an automated message — do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

type DocumentSendParams = {
  senderName: string;
  message: string;
  documentCount: number;
  documentNames: string[];
};

export function documentSendEmail(p: DocumentSendParams): string {
  const docsList = p.documentNames
    .map((name) => `<li style="margin:4px 0;font-size:13px;color:#cbd5e1;">📎 ${name}</li>`)
    .join("");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#0b1120;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1120;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="background-color:#111b2e;border-radius:12px;border:1px solid #1e293b;">
          <tr>
            <td align="center" style="padding:36px 32px 20px;">
              <span style="font-size:22px;font-weight:700;color:#e2e8f0;letter-spacing:0.05em;">AUTOVAULT<span style="color:#3b82f6;">360</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 12px;">
              <h1 style="margin:0;font-size:20px;font-weight:600;color:#f1f5f9;">Documents Shared With You</h1>
              <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;line-height:1.5;"><strong style="color:#e2e8f0;">${p.senderName}</strong> has shared <strong style="color:#e2e8f0;">${p.documentCount}</strong> document${p.documentCount === 1 ? "" : "s"} with you.</p>
            </td>
          </tr>
          ${p.message ? `
          <tr>
            <td style="padding:8px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a1222;border-radius:8px;border:1px solid #1e293b;">
                <tr><td style="padding:16px 20px;">
                  <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;font-style:italic;">"${p.message}"</p>
                </td></tr>
              </table>
            </td>
          </tr>` : ""}
          ${p.documentNames.length > 0 ? `
          <tr>
            <td style="padding:16px 32px 8px;">
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#e2e8f0;">Documents:</p>
              <ul style="margin:0;padding-left:8px;list-style:none;">${docsList}</ul>
            </td>
          </tr>` : ""}
          <tr>
            <td style="padding:24px 32px 28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#475569;line-height:1.5;">Sign in to your AutoVault360 account to view and download these documents.<br/>This is an automated message — do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
