import nodemailer, { type SendMailOptions, type Transporter } from "nodemailer";
import config from "./config";
import { getSiteSettings, type SiteSettingsData } from "./settings";

/**
 * Normalizes host/port/service configuration based on settings or fallback env.
 */
export function resolveTransportOptions(settings?: Partial<SiteSettingsData> | null) {
  let host = settings?.smtpHost?.trim() || "";
  const user = settings?.smtpUser?.trim() || config.smtp_user || "";
  const pass = settings?.smtpPass?.trim() || config.smtp_pass || "";
  const port = Number(settings?.smtpPort) || 587;
  const secure = Boolean(settings?.smtpSecure);

  // If host contains an email address (e.g. user entered their Gmail/email into "SMTP Host")
  if (host.includes("@")) {
    if (host.toLowerCase().includes("gmail")) {
      host = "smtp.gmail.com";
    } else {
      const parts = host.split("@");
      host = `mail.${parts[1] || parts[0]}`;
    }
  }

  // Detect Gmail (by host or by user email ending in @gmail.com)
  const isGmail =
    host.toLowerCase() === "smtp.gmail.com" ||
    host.toLowerCase() === "gmail" ||
    (!host && user.toLowerCase().endsWith("@gmail.com")) ||
    user.toLowerCase().endsWith("@gmail.com");

  if (isGmail && user && pass) {
    return {
      service: "gmail",
      auth: { user, pass },
    };
  }

  if (host && user && pass) {
    return {
      host,
      port,
      secure: secure || port === 465,
      auth: { user, pass },
    };
  }

  // Fallback to process.env credentials
  if (config.smtp_user && config.smtp_pass) {
    return {
      service: "gmail",
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    };
  }

  return null;
}

/**
 * Creates an active nodemailer transporter using DB settings,
 * falling back to process.env / config.
 */
export async function getTransporter(): Promise<Transporter> {
  try {
    const settings = await getSiteSettings();
    const options = resolveTransportOptions(settings);
    if (options) {
      return nodemailer.createTransport(options as any);
    }
  } catch (err) {
    console.warn("Failed to load SMTP settings from DB, falling back to env:", err);
  }

  // Fallback to process.env credentials
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: config.smtp_user,
      pass: config.smtp_pass,
    },
  });
}

/**
 * Creates a dedicated env fallback transporter.
 */
function getEnvFallbackTransporter(): Transporter | null {
  if (config.smtp_user && config.smtp_pass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.smtp_user,
        pass: config.smtp_pass,
      },
    });
  }
  return null;
}

/**
 * Formats a valid "from" sender string.
 */
function resolveSender(optionsFrom?: string | any, settings?: Partial<SiteSettingsData> | null): string {
  // If options.from was passed (e.g. config.email_sender)
  if (optionsFrom && typeof optionsFrom === "string") {
    // If it's a plain email address and site settings has a sender name, format as "Name <email>"
    if (!optionsFrom.includes("<") && settings?.mailFromName) {
      return `"${settings.mailFromName}" <${optionsFrom}>`;
    }
    return optionsFrom;
  }

  // If no options.from, build from settings or env
  const fallbackEmail = config.email_sender || config.smtp_user || "noreply@rentsheba.com";
  const fromEmail = settings?.mailFromEmail || fallbackEmail;
  const fromName = settings?.mailFromName || settings?.siteName || "RentSheba";

  return `"${fromName}" <${fromEmail}>`;
}

/**
 * Send an email using dynamic site settings.
 */
export async function sendAppEmail(options: {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}) {
  return transporter.sendMail(options);
}

/**
 * Default transporter for backwards compatibility.
 * Works seamlessly with existing `await transporter.sendMail({ from, to, subject, html })`.
 * If dynamic DB transport encounters an error, automatically falls back to process.env credentials.
 */
export const transporter = {
  async sendMail(options: SendMailOptions) {
    let settings: SiteSettingsData | null = null;
    try {
      settings = await getSiteSettings();
    } catch {
      // Ignore settings fetch failure
    }

    const from = resolveSender(options.from, settings);
    const mailOptions: SendMailOptions = {
      ...options,
      from,
    };

    const primaryTransporter = await getTransporter();

    try {
      return await primaryTransporter.sendMail(mailOptions);
    } catch (primaryErr) {
      console.warn(
        "Sending email via dynamic transporter failed. Attempting fallback to env credentials...",
        primaryErr,
      );

      const fallbackTransporter = getEnvFallbackTransporter();
      if (fallbackTransporter) {
        const envFrom =
          options.from ||
          (config.email_sender
            ? `"${settings?.mailFromName || 'RentSheba'}" <${config.email_sender}>`
            : undefined);

        return await fallbackTransporter.sendMail({
          ...options,
          from: envFrom || from,
        });
      }

      // If no env fallback exists, re-throw the original error
      throw primaryErr;
    }
  },

  verify(callback?: (err: Error | null, success: true) => void) {
    getTransporter()
      .then((t) => t.verify(callback as any))
      .catch((err) => callback?.(err, true as any));
  },
};