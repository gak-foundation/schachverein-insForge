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
  bcc,
  subject,
  html,
  text,
}: {
  to?: string;
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  // Skip sending in development if no SMTP configured
  if (!process.env.SMTP_HOST) {
    console.log("Email would be sent (SMTP not configured):", { to, bcc, subject });
    return { success: true, messageId: "dev-mode" };
  }

  try {
    const result = await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@schachverein.de",
      to: to || undefined,
      bcc,
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
  bcc,
  subject,
  html,
  text,
}: {
  to?: string;
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
}) {
  // In production, this would queue to a job system like BullMQ
  // For now, send directly
  return sendEmail({ to, bcc, subject, html, text });
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
  const subject = `♟️ Einladung zum ${clubName} auf Schachverein.de`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        .body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; padding: 40px 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: #1a1a1a; padding: 40px; text-align: center; color: white; }
        .content { padding: 40px; line-height: 1.6; }
        .footer { padding: 20px 40px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #eee; }
        .button { display: inline-block; padding: 14px 28px; background-color: #3b82f6; color: white !important; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 24px 0; }
        .badge { background: #f0f7ff; color: #3b82f6; padding: 4px 12px; border-radius: 99px; font-size: 14px; font-weight: 500; display: inline-block; margin-bottom: 16px; }
        h1 { margin: 0; font-size: 24px; letter-spacing: -0.5px; }
        .chess-icon { font-size: 40px; margin-bottom: 16px; display: block; }
      </style>
    </head>
    <body class="body">
      <div class="container">
        <div class="header">
          <span class="chess-icon">♔</span>
          <h1>Willkommen bei ${clubName}</h1>
        </div>
        <div class="content">
          <span class="badge">Einladung erhalten</span>
          <p>Hallo,</p>
          <p>Schluss mit Zettelwirtschaft! <strong>${invitedByName || "Dein Verein"}</strong> hat dich eingeladen, Teil des neuen digitalen Vereinsheims auf <strong>Schachverein.de</strong> zu werden.</p>
          
          <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; font-weight: 500;">Was dich erwartet:</p>
            <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #475569;">
              <li>Einfache Terminzusage für Vereinsabende</li>
              <li>Einblick in DWZ & Elo-Statistiken</li>
              <li>Interaktive Turniere & Mannschaftsplanung</li>
            </ul>
          </div>

          <p>Klicke auf den Button, um dein Profil zu aktivieren und dem Verein beizutreten:</p>
          
          <div style="text-align: center;">
            <a href="${invitationUrl}" class="button">Einladung annehmen</a>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 24px;">
            Der Link ist 7 Tage gültig. Falls der Button nicht funktioniert, kopiere diesen Link in deinen Browser: <br>
            <span style="color: #3b82f6; word-break: break-all;">${invitationUrl}</span>
          </p>
        </div>
        <div class="footer">
          <p>Diese Einladung wurde automatisch gesendet. Bei Fragen wende dich bitte direkt an deinen Vereinsvorstand.</p>
          <p>&copy; ${new Date().getFullYear()} Schachverein.de - Die Plattform für Vereine</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `Einladung zum ${clubName}\n\nHallo,\n\n${invitedByName || "Dein Verein"} hat dich eingeladen, dem neuen digitalen Vereinsheim auf Schachverein.de beizutreten.\n\nWas dich erwartet:\n- Terminzusagen\n- DWZ/Elo Statistiken\n- Turnierplanung\n\nNimm die Einladung hier an:\n${invitationUrl}\n\nDer Link ist 7 Tage gültig.`;

  return sendEmail({ to: email, subject, html, text });
}

// Direct email sending without queueing
export async function sendEmailDirect(
  to: string | undefined,
  subject: string,
  html: string,
  text?: string,
  bcc?: string | string[]
) {
  return sendEmail({ to, bcc, subject, html, text });
}
