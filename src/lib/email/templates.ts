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

export function invoiceEmailTemplate(data: {
  memberName: string;
  clubName: string;
  amount: string;
  description: string;
  dueDate: string;
  invoiceNumber: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Rechnung ${data.invoiceNumber} — ${data.clubName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Neue Rechnung</h2>
        <p>Hallo ${data.memberName},</p>
        <p>für Ihre Mitgliedschaft im <strong>${data.clubName}</strong> wurde eine neue Rechnung erstellt.</p>
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Rechnungsnummer:</strong> ${data.invoiceNumber}</p>
          <p style="margin: 4px 0;"><strong>Beschreibung:</strong> ${data.description}</p>
          <p style="margin: 4px 0;"><strong>Betrag:</strong> ${data.amount} EUR</p>
          <p style="margin: 4px 0;"><strong>Fällig am:</strong> ${data.dueDate}</p>
        </div>
        <p>Bitte begleichen Sie den Betrag bis zum angegebenen Fälligkeitsdatum.</p>
        <p style="color: #666; font-size: 14px;">Sie finden Ihre Rechnung auch in Ihrem Mitgliederbereich auf unserer Plattform.</p>
        <p style="color: #999; font-size: 12px;">Dies ist eine automatisch generierte E-Mail. Bei Fragen wenden Sie sich bitte an den Vorstand.</p>
      </div>
    `,
    text: `Rechnung ${data.invoiceNumber}\n\nHallo ${data.memberName},\n\nfür Ihre Mitgliedschaft im ${data.clubName} wurde eine neue Rechnung erstellt.\n\nRechnungsnummer: ${data.invoiceNumber}\nBeschreibung: ${data.description}\nBetrag: ${data.amount} EUR\nFällig am: ${data.dueDate}\n\nBitte begleichen Sie den Betrag bis zum fälligen Datum.`,
  };
}

export function dunningEmailTemplate(data: {
  memberName: string;
  clubName: string;
  amount: string;
  description: string;
  dueDate: string;
  dunningLevel: number;
  invoiceNumber: string;
}): {
  subject: string;
  html: string;
  text: string;
} {
  const levelText = data.dunningLevel === 1 ? "Zahlungserinnerung" : `${data.dunningLevel}. Mahnung`;
  const subjectPrefix = data.dunningLevel === 1 ? "Erinnerung" : "WICHTIG: Mahnung";

  return {
    subject: `${subjectPrefix}: Rechnung ${data.invoiceNumber} — ${data.clubName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${data.dunningLevel > 1 ? "#dc2626" : "#1a1a1a"};">${levelText}</h2>
        <p>Hallo ${data.memberName},</p>
        <p>wir konnten für die Rechnung <strong>${data.invoiceNumber}</strong> bisher keinen Zahlungseingang feststellen.</p>
        <div style="background-color: #fef2f2; padding: 16px; border-radius: 8px; margin: 20px 0; border: 1px solid #fee2e2;">
          <p style="margin: 4px 0;"><strong>Beschreibung:</strong> ${data.description}</p>
          <p style="margin: 4px 0;"><strong>Offener Betrag:</strong> ${data.amount} EUR</p>
          <p style="margin: 4px 0;"><strong>Ursprünglich fällig am:</strong> ${data.dueDate}</p>
        </div>
        <p>Bitte überweisen Sie den fälligen Betrag umgehend auf unser Vereinskonto.</p>
        <p>Falls Sie die Zahlung bereits geleistet haben, betrachten Sie dieses Schreiben bitte als gegenstandslos.</p>
        <p style="color: #999; font-size: 12px;">Dies ist eine automatisch generierte E-Mail. Mahnungstufe: ${data.dunningLevel}</p>
      </div>
    `,
    text: `${levelText}\n\nHallo ${data.memberName},\n\nwir konnten für die Rechnung ${data.invoiceNumber} bisher keinen Zahlungseingang feststellen.\n\nBeschreibung: ${data.description}\nOffener Betrag: ${data.amount} EUR\nUrsprünglich fällig am: ${data.dueDate}\n\nBitte überweisen Sie den fälligen Betrag umgehend.\n\nFalls Sie bereits gezahlt haben, ignorieren Sie diese E-Mail.`,
  };
}

export function welcomeTemplate(clubName: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Willkommen im ${clubName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Willkommen im ${clubName}!</h2>
        <p>Hallo {{Vorname}},</p>
        <p>wir freuen uns, dich als neues Mitglied in unserem Schachverein begruessen zu duerfen.</p>
        <p>Hier sind ein paar erste Schritte:</p>
        <ul>
          <li>Schau dir unseren <a href="#">Terminkalender</a> an</li>
          <li>Tritt einer <a href="#">Mannschaft</a> bei</li>
          <li>Nimm an unserem naechsten <a href="#">Training</a> teil</li>
        </ul>
        <p>Bei Fragen melde dich einfach bei deinem Vorstand.</p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde automatisch generiert.</p>
      </div>
    `,
    text: `Willkommen im ${clubName}!\n\nHallo {{Vorname}},\n\nwir freuen uns, dich als neues Mitglied zu begruessen.`,
  };
}

export function paymentReminderTemplate(): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Erinnerung: Mitgliedsbeitrag faellig",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Zahlungserinnerung</h2>
        <p>Hallo {{Vorname}} {{Nachname}},</p>
        <p>dein Mitgliedsbeitrag ist noch offen. Bitte ueberweise den ausstehenden Betrag zeitnah.</p>
        <p>Bei Fragen zur Zahlung wende dich bitte an den Kassenwart.</p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde automatisch generiert.</p>
      </div>
    `,
    text: `Zahlungserinnerung\n\nHallo {{Vorname}} {{Nachname}},\n\ndein Mitgliedsbeitrag ist noch offen.`,
  };
}

export function tournamentInviteTemplate(tournamentName: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Einladung: ${tournamentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${tournamentName}</h2>
        <p>Hallo {{Vorname}},</p>
        <p>du bist herzlich zum Turnier "${tournamentName}" eingeladen.</p>
        <p>Deine aktuelle DWZ: {{DWZ}}</p>
        <p>Weitere Infos findest du auf der Vereinswebsite.</p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde automatisch generiert.</p>
      </div>
    `,
    text: `Einladung: ${tournamentName}\n\nHallo {{Vorname}},\n\ndu bist herzlich zum Turnier "${tournamentName}" eingeladen.`,
  };
}

export function genericAnnouncementTemplate(): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hallo {{Vorname}},</p>
        <p><!-- Nachricht hier einfuegen --></p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde vom Schachverein versendet.</p>
      </div>
    `,
    text: `Hallo {{Vorname}},\n\n<!-- Nachricht hier einfuegen -->`,
  };
}

export const ADMIN_EMAIL_TEMPLATES = [
  { id: "welcome", label: "Willkommensmail", generator: welcomeTemplate },
  { id: "payment_reminder", label: "Beitragserinnerung", generator: paymentReminderTemplate },
  { id: "tournament_invite", label: "Turniereinladung", generator: tournamentInviteTemplate },
  { id: "generic", label: "Allgemeine Mitteilung", generator: genericAnnouncementTemplate },
] as const;
