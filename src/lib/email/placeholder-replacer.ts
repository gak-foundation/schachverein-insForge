// src/lib/email/placeholder-replacer.ts

export interface MemberPlaceholders {
  vorname: string;
  nachname: string;
  dwz: string;
  team: string;
  rolle: string;
}

export function replacePlaceholders(
  template: string,
  placeholders: Partial<MemberPlaceholders>
): string {
  let result = template;
  result = result.replace(/\{\{Vorname\}\}/g, placeholders.vorname ?? "");
  result = result.replace(/\{\{Nachname\}\}/g, placeholders.nachname ?? "");
  result = result.replace(/\{\{DWZ\}\}/g, placeholders.dwz ?? "—");
  result = result.replace(/\{\{Team\}\}/g, placeholders.team ?? "");
  result = result.replace(/\{\{Rolle\}\}/g, placeholders.rolle ?? "");
  return result;
}

export function hasValidPlaceholders(template: string): boolean {
  return /\{\{(Vorname|Nachname|DWZ|Team|Rolle)\}\}/.test(template);
}
