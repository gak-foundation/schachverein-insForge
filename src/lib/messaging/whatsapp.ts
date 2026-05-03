const WHATSAPP_API = "https://graph.facebook.com/v21.0";

interface WhatsAppTemplateMessage {
  to: string;
  templateName: string;
  languageCode?: string;
  params: string[];
}

export async function sendWhatsAppBroadcast(
  messages: WhatsAppTemplateMessage[]
): Promise<{ sent: number; errors: string[] }> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneId || !token) {
    return { sent: 0, errors: ["WhatsApp nicht konfiguriert (WHATSAPP_PHONE_ID/WHATSAPP_TOKEN)"] };
  }

  let sent = 0;
  const errors: string[] = [];

  for (const msg of messages) {
    try {
      const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: msg.to,
          type: "template",
          template: {
            name: msg.templateName,
            language: { code: msg.languageCode || "de" },
            components: [
              {
                type: "body",
                parameters: msg.params.map((text) => ({ type: "text", text })),
              },
            ],
          },
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        const errBody = await res.text();
        errors.push(`${msg.to}: ${errBody}`);
      }
    } catch (err: any) {
      errors.push(`${msg.to}: ${err.message}`);
    }
  }

  return { sent, errors };
}

export const WHATSAPP_TEMPLATES = [
  { id: "verein_ankuendigung", label: "Vereinsankuendigung", params: 3 },
  { id: "turnier_erinnerung", label: "Turniererinnerung", params: 3 },
  { id: "training_ausfall", label: "Trainingsausfall", params: 3 },
];
