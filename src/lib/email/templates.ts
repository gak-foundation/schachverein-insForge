export function emailVerificationTemplate(verificationUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "E-Mail-Verifizierung — Schachverein",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">E-Mail-Verifizierung</h2>
        <p>Bitte bestätigen Sie Ihre E-Mail-Adresse, indem Sie auf den folgenden Link klicken:</p>
        <p>
          <a href="${verificationUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
            E-Mail bestätigen
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Wenn Sie den Button nicht sehen können, kopieren Sie diesen Link in Ihren Browser:<br/>
          <a href="${verificationUrl}">${verificationUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px;">Dieser Link ist 24 Stunden gültig. Wenn Sie sich nicht registriert haben, ignorieren Sie diese E-Mail.</p>
      </div>
    `,
    text: `E-Mail-Verifizierung\n\nBitte bestätigen Sie Ihre E-Mail-Adresse:\n${verificationUrl}\n\nDieser Link ist 24 Stunden gültig. Wenn Sie sich nicht registriert haben, ignorieren Sie diese E-Mail.`,
  };
}

export function passwordResetTemplate(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Passwort zurücksetzen — Schachverein",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Passwort zurücksetzen</h2>
        <p>Jemand hat einen Antrag auf Zurücksetzung Ihres Passworts gestellt. Klicken Sie auf den folgenden Link, um ein neues Passwort zu erstellen:</p>
        <p>
          <a href="${resetUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Passwort zurücksetzen
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Wenn Sie den Button nicht sehen können, kopieren Sie diesen Link in Ihren Browser:<br/>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px;">Dieser Link ist 1 Stunde gültig. Wenn Sie kein neues Passwort angefordert haben, ignorieren Sie diese E-Mail.</p>
        </div>
        `,
        text: `Passwort zurücksetzen\n\nKlicken Sie auf den folgenden Link, um Ihr Passwort zurückzusetzen:\n${resetUrl}\n\nDieser Link ist 1 Stunde gültig. Wenn Sie kein neues Passwort angefordert haben, ignorieren Sie diese E-Mail.`,
        };
        }

        export function clubInvitationTemplate(
        invitationUrl: string,
        clubName: string,
        invitedBy?: string
        ): {
        subject: string;
        html: string;
        text: string;
        } {
        const inviterText = invitedBy ? ` von ${invitedBy}` : "";
        return {
        subject: `Einladung zum Verein: ${clubName}`,
        html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Einladung zum Verein</h2>
        <p>Hallo,</p>
        <p>Sie wurden${inviterText} eingeladen, dem Schachverein <strong>${clubName}</strong> auf unserer digitalen Plattform beizutreten.</p>
        <p>Klicken Sie auf den folgenden Link, um die Einladung anzunehmen und Ihr Konto zu erstellen:</p>
        <p>
          <a href="${invitationUrl}"
             style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Einladung annehmen
          </a>
        </p>
        <p style="color: #666; font-size: 14px;">
          Wenn Sie den Button nicht sehen können, kopieren Sie diesen Link in Ihren Browser:<br/>
          <a href="${invitationUrl}">${invitationUrl}</a>
        </p>
        <p style="color: #999; font-size: 12px;">Dieser Link ist 7 Tage gültig. Wenn Sie diese Einladung nicht erwartet haben, können Sie diese E-Mail einfach ignorieren.</p>
        </div>
        `,
        text: `Einladung zum Verein\n\nHallo,\n\nSie wurden${inviterText} eingeladen, dem Schachverein ${clubName} beizutreten.\n\nKlicken Sie auf den folgenden Link, um die Einladung anzunehmen:\n${invitationUrl}\n\nDieser Link ist 7 Tage gültig.`,
        };
        }