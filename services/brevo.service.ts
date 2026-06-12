import { BrevoClient } from "@getbrevo/brevo";

const apiKey = process.env.NEXT_PUBLIC_BREVO_API_KEY;
const brevoDomain = "noumandevs.online";

function getClient(): BrevoClient {
  if (!apiKey) {
    throw new Error("NEXT_PUBLIC_BREVO_API_KEY is not configured");
  }
  return new BrevoClient({ apiKey });
}

function defaultSender() {
  return {
    email: process.env.NEXT_PUBLIC_BREVO_SENDER_EMAIL || `noreply@${brevoDomain}`,
    name: "AutoVault360",
  };
}

function defaultReplyTo() {
  return {
    email: process.env.NEXT_PUBLIC_BREVO_REPLY_TO_EMAIL || `support@${brevoDomain}`,
    name: "AutoVault360 Support",
  };
}

export type BrevoEmailRecipient = {
  email: string;
  name?: string;
};

export type BrevoEmailAttachment = {
  name: string;
  content: string;
};

export type BrevoSendEmailParams = {
  to: BrevoEmailRecipient[];
  subject: string;
  htmlContent: string;
  sender?: BrevoEmailRecipient;
  replyTo?: BrevoEmailRecipient;
  attachment?: BrevoEmailAttachment[];
};

export async function sendTransactionalEmail(
  params: BrevoSendEmailParams,
): Promise<{ success: true; messageId?: string } | { success: false; error: string }> {
  try {
    const client = getClient();

    const response = await client.transactionalEmails.sendTransacEmail({
      to: params.to.map((r) => ({ email: r.email, name: r.name })),
      subject: params.subject,
      htmlContent: params.htmlContent,
      sender: params.sender ?? defaultSender(),
      replyTo: params.replyTo ?? defaultReplyTo(),
      attachment: params.attachment,
    });

    return { success: true, messageId: (response as any).messageId };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to send email";
    return { success: false, error: message };
  }
}
