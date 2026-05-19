import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// The default .env.example placeholder; treat it as "not configured".
const PLACEHOLDER_KEY = "re_123456789";

const isConfigured =
  Boolean(process.env.RESEND_API_KEY) &&
  process.env.RESEND_API_KEY !== PLACEHOLDER_KEY;

type EmailArgs = {
  to: string;
  subject: string;
  html: string;
  // Free-form tag used only for console logging when Resend is not configured.
  label?: string;
};

export async function sendEmail({ to, subject, html, label }: EmailArgs) {
  if (!isConfigured) {
    console.log(
      `[EMAIL ${label ?? "outbound"} -> ${to}] (Resend not configured; skipping send)\n${subject}`
    );
    return;
  }

  try {
    await resend.emails.send({
      from: "TimeTracker <onboarding@resend.dev>",
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error(`Failed to send ${label ?? "email"} via Resend:`, err);
  }
}

export function emailIsConfigured() {
  return isConfigured;
}
