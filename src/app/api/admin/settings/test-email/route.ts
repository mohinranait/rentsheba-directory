import { type NextRequest, NextResponse } from "next/server";
import nodemailer, { type Transporter } from "nodemailer";
import { getSiteSettings } from "@/lib/settings";
import { getSessionUser } from "@/utils/session";
import config from "@/lib/config";
import { resolveTransportOptions } from "@/lib/nodemailer";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const toEmail = body.to?.trim() || user.email;

    if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid recipient email address" },
        { status: 400 },
      );
    }

    const currentSettings = await getSiteSettings();

    const host = body.smtpHost?.trim() || currentSettings.smtpHost;
    const port = Number(body.smtpPort) || currentSettings.smtpPort || 587;
    const secure = typeof body.smtpSecure === "boolean" ? body.smtpSecure : Boolean(currentSettings.smtpSecure);
    const smtpUser = body.smtpUser?.trim() || currentSettings.smtpUser;
    
    let smtpPass = body.smtpPass?.trim();
    if (!smtpPass || smtpPass === "••••••••") {
      smtpPass = currentSettings.smtpPass || undefined;
    }

    const fromEmail =
      body.mailFromEmail?.trim() ||
      currentSettings.mailFromEmail ||
      config.email_sender ||
      "noreply@rentsheba.com";

    const fromName =
      body.mailFromName?.trim() ||
      currentSettings.mailFromName ||
      currentSettings.siteName ||
      "Rentsheba Directory";

    const options = resolveTransportOptions({
      smtpHost: host,
      smtpPort: port,
      smtpSecure: secure,
      smtpUser,
      smtpPass,
    });

    if (!options) {
      return NextResponse.json(
        {
          success: false,
          message:
            "No SMTP credentials configured. Please enter your SMTP Host, User, and Password.",
        },
        { status: 400 },
      );
    }

    const testTransporter = nodemailer.createTransport({
      ...options,
      connectionTimeout: 10000,
    } as any);

    // Verify SMTP connection
    await testTransporter.verify();

    // Send test email
    await testTransporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: toEmail,
      subject: `[Test Email] SMTP Configuration Verified — ${fromName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h2 style="color: #133f35; margin: 0; font-size: 22px;">SMTP Test Successful!</h2>
            <p style="color: #64748b; margin-top: 6px; font-size: 14px;">Your email configuration is working perfectly.</p>
          </div>
          <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px; color: #334155; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Sent From:</strong> ${fromName} &lt;${fromEmail}&gt;</p>
            <p style="margin: 4px 0;"><strong>Recipient:</strong> ${toEmail}</p>
            <p style="margin: 4px 0;"><strong>SMTP Host:</strong> ${host || "Gmail Service"}</p>
            <p style="margin: 4px 0;"><strong>SMTP Port:</strong> ${port}</p>
            <p style="margin: 4px 0;"><strong>Encryption:</strong> ${secure ? "SSL/TLS (Port 465)" : "STARTTLS / Standard"}</p>
            <p style="margin: 4px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          </div>
          <p style="color: #475569; font-size: 14px; line-height: 1.5;">
            This test email confirms that your outgoing mail server is properly connected and ready to send system emails, verification OTPs, and inquiries.
          </p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
            Sent automatically from ${fromName} Admin Settings Panel.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: `Test email successfully sent to ${toEmail}!`,
    });
  } catch (error) {
    console.error("Test email sending error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? `SMTP Error: ${error.message}`
            : "Failed to connect to SMTP server or send email.",
      },
      { status: 500 },
    );
  }
}
