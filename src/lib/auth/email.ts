import nodemailer from "nodemailer";

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Send email wrapper
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // Skip sending in development if no SMTP configured
  if (!process.env.SMTP_HOST) {
    console.log("Email would be sent (SMTP not configured):", { to, subject });
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@schachverein.de",
      to,
      subject,
      html,
      text,
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw new Error("EMAIL_SEND_FAILED");
  }
}

// Queue email for async sending (simplified version)
export async function enqueueEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  // In production, this would queue to a job system like BullMQ
  // For now, send directly
  return sendEmail({ to, subject, html, text });
}

// Send password reset email
export async function sendPasswordResetEmail({
  email,
  resetUrl,
  userName,
}: {
  email: string;
  resetUrl: string;
  userName?: string;
}) {
  const subject = "Passwort zurücksetzen";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Passwort zurücksetzen</h2>
      <p>Hallo ${userName || ""},</p>
      <p>Sie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.</p>
      <p>Klicken Sie auf den folgenden Link, um ein neues Passwort zu erstellen:</p>
      <p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">
          Passwort zurücksetzen
        </a>
      </p>
      <p>Der Link ist 1 Stunde gültig.</p>
      <p>Wenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="color: #666; font-size: 12px;">
        Diese E-Mail wurde automatisch gesendet. Bitte antworten Sie nicht auf diese E-Mail.
      </p>
    </div>
  `;
  const text = `Passwort zurücksetzen\n\nHallo ${userName || ""},\n\nSie haben eine Anfrage zum Zurücksetzen Ihres Passworts gestellt.\n\nBesuchen Sie folgenden Link:\n${resetUrl}\n\nDer Link ist 1 Stunde gültig.\n\nWenn Sie diese Anfrage nicht gestellt haben, ignorieren Sie diese E-Mail.`;

  return sendEmail({ to: email, subject, html, text });
}

// Send email verification
export async function sendVerificationEmail({
  email,
  verificationUrl,
  userName,
}: {
  email: string;
  verificationUrl: string;
  userName?: string;
}) {
  const subject = "E-Mail-Adresse bestätigen";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Willkommen beim Schachverein!</h2>
      <p>Hallo ${userName || ""},</p>
      <p>vielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse:</p>
      <p>
        <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 4px;">
          E-Mail bestätigen
        </a>
      </p>
      <p>Der Link ist 24 Stunden gültig.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="color: #666; font-size: 12px;">
        Diese E-Mail wurde automatisch gesendet. Bitte antworten Sie nicht auf diese E-Mail.
      </p>
    </div>
  `;
  const text = `Willkommen beim Schachverein!\n\nHallo ${userName || ""},\n\nvielen Dank für Ihre Registrierung. Bitte bestätigen Sie Ihre E-Mail-Adresse:\n\n${verificationUrl}\n\nDer Link ist 24 Stunden gültig.`;

  return sendEmail({ to: email, subject, html, text });
}

// Send club invitation email
export async function sendClubInvitationEmail({
  email,
  invitationUrl,
  clubName,
  invitedByName,
}: {
  email: string;
  invitationUrl: string;
  clubName: string;
  invitedByName?: string;
}) {
  const subject = `Einladung zum ${clubName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Einladung zum ${clubName}</h2>
      <p>Hallo,</p>
      <p>Sie wurden ${invitedByName ? `von ${invitedByName} ` : ""}zum <strong>${clubName}</strong> eingeladen.</p>
      <p>Klicken Sie auf den folgenden Link, um die Einladung anzunehmen:</p>
      <p>
        <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 4px;">
          Einladung annehmen
        </a>
      </p>
      <p>Der Link ist 7 Tage gültig.</p>
      <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;" />
      <p style="color: #666; font-size: 12px;">
        Diese E-Mail wurde automatisch gesendet. Bitte antworten Sie nicht auf diese E-Mail.
      </p>
    </div>
  `;
  const text = `Einladung zum ${clubName}\n\nHallo,\n\nSie wurden ${invitedByName ? `von ${invitedByName} ` : ""}zum ${clubName} eingeladen.\n\nBesuchen Sie folgenden Link:\n${invitationUrl}\n\nDer Link ist 7 Tage gültig.`;

  return sendEmail({ to: email, subject, html, text });
}

// Direct email sending without queueing
export async function sendEmailDirect(
  to: string,
  subject: string,
  html: string,
  text?: string
) {
  return sendEmail({ to, subject, html, text });
}
