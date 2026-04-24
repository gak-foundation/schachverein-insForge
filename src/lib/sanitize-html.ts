/**
 * Einfacher serverseitiger HTML-Sanitizer.
 * Entfernt alle Tags und Attribute, die nicht explizit erlaubt sind.
 * Diese Variante ist ausschließlich für Node.js/Server-Umgebungen geeignet.
 */

const ALLOWED_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s", "strike",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li",
  "a", "blockquote", "code", "pre",
  "span", "div",
  "table", "thead", "tbody", "tr", "td", "th",
]);

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ["href", "title", "target", "rel"],
  span: ["class"],
  div: ["class"],
  p: ["class"],
  table: ["class"],
  td: ["colspan", "rowspan"],
  th: ["colspan", "rowspan"],
};

const ALLOWED_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

function sanitizeUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url, "http://localhost");
    if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
      return "";
    }
    return url;
  } catch {
    return url;
  }
}

function escapeHtmlText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Serverseitige HTML-Sanitisierung.
 * Entfernt alle Tags außer der Whitelist und filtert Attribute.
 */
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // Schritt 1: <script> und <style> Tags samt Inhalt entfernen
  let cleaned = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  const allowedTagsArray = Array.from(ALLOWED_TAGS);

  // Schritt 2: Alle erlaubten Tags temporär markieren
  allowedTagsArray.forEach((tag) => {
    // Öffnende Tags mit Attributen
    cleaned = cleaned.replace(
      new RegExp(`<(${tag})\\b([^/>]*)>`, "gi"),
      `%%SAFE_${tag.toUpperCase()}_START%%$2%%SAFE_ATTR_END%%`
    );
    // Schließende Tags
    cleaned = cleaned.replace(
      new RegExp(`<\\/(${tag})>`, "gi"),
      `%%SAFE_${tag.toUpperCase()}_END%%`
    );
    // Self-closing Tags
    cleaned = cleaned.replace(
      new RegExp(`<(${tag})\\b([^/>]*)/>`, "gi"),
      `%%SAFE_${tag.toUpperCase()}_EMPTY%%$2%%SAFE_ATTR_END%%`
    );
  });

  // Schritt 3: Alle verbleibenden HTML-Tags entfernen
  cleaned = cleaned.replace(/<[^>]+>/g, "");

  // Schritt 4: Markierte Tags wiederherstellen und Attribute filtern
  allowedTagsArray.forEach((tag) => {
    const tagAttrs = ALLOWED_ATTRIBUTES[tag] || [];

    cleaned = cleaned.replace(
      new RegExp(
        `%%SAFE_${tag.toUpperCase()}_START%%([^%]*?)%%SAFE_ATTR_END%%`,
        "gi"
      ),
      (_match, attrs) => {
        const safeAttrs = parseAndFilterAttrs(attrs, tagAttrs, tag);
        return `<${tag}${safeAttrs}>`;
      }
    );
    cleaned = cleaned.replace(
      new RegExp(`%%SAFE_${tag.toUpperCase()}_END%%`, "gi"),
      `</${tag}>`
    );
    cleaned = cleaned.replace(
      new RegExp(
        `%%SAFE_${tag.toUpperCase()}_EMPTY%%([^%]*?)%%SAFE_ATTR_END%%`,
        "gi"
      ),
      (_match, attrs) => {
        const safeAttrs = parseAndFilterAttrs(attrs, tagAttrs, tag);
        return `<${tag}${safeAttrs} />`;
      }
    );
  });

  return cleaned;
}

function parseAndFilterAttrs(
  attrString: string,
  allowed: string[],
  _tagName: string
): string {
  if (!attrString.trim()) return "";

  const attrs: string[] = [];
  const attrRegex = /(\S+)=(["'])(.*?)\2|(\S+)=(\S+)/g;
  let match;

  while ((match = attrRegex.exec(attrString)) !== null) {
    const name = (match[1] || match[4]).toLowerCase();
    const value = match[3] ?? match[5] ?? "";

    if (!allowed.includes(name)) continue;

    if (name === "href") {
      const safe = sanitizeUrl(value);
      if (safe) attrs.push(`href="${escapeHtmlText(safe)}"`);
    } else if (name === "target" && value === "_blank") {
      attrs.push('target="_blank" rel="noopener noreferrer"');
    } else {
      attrs.push(`${name}="${escapeHtmlText(value)}"`);
    }
  }

  return attrs.length > 0 ? ` ${attrs.join(" ")}` : "";
}
