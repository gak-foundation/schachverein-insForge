/**
 * Einfacher In-Memory Rate-Limiter für Auth-Endpunkte.
 *
 * Hinweis: In einer Serverless-Umgebung (Vercel) ist der Speicher
 * pro Funktions-Instance isoliert. Für produktive Last empfehlen wir
 * einen Redis-basierten Rate-Limiter (z.B. @upstash/ratelimit).
 *
 * Dieser Limiter dient als erste Verteidigungslinie gegen Brute-Force.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-Memory Store für Rate-Limits (IP-basiert)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Bereinigung alte Einträge alle 10 Minuten
const CLEANUP_INTERVAL = 10 * 60 * 1000;

function cleanup() {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key);
    }
  }
}

// Nur im Server-Kontext initialisieren
if (typeof window === "undefined") {
  setInterval(cleanup, CLEANUP_INTERVAL);
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Prüft ob eine IP das Request-Limit überschreitet.
 *
 * @param identifier IP-Adresse oder User-ID
 * @param maxRequests Maximale Anzahl Requests im Zeitraum
 * @param windowMs Zeitfenster in Millisekunden
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000 // 1 Minute
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt < now) {
    // Neues Fenster öffnen
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + windowMs,
    };
    rateLimitStore.set(key, newEntry);
    return {
      success: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      limit: maxRequests,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    success: true,
    limit: maxRequests,
    remaining: maxRequests - existing.count,
    resetAt: existing.resetAt,
  };
}

/**
 * Holt die Client-IP aus dem Request.
 * Berücksichtigt X-Forwarded-For Header.
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return "unknown";
}

/**
 * Prüft und blockiert bei Rate-Limit.
 * Wirft einen Error mit Status 429 wenn das Limit überschritten wird.
 */
export function enforceRateLimit(
  request: Request,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000
): void {
  const ip = getClientIP(request);
  const result = checkRateLimit(ip, maxRequests, windowMs);

  if (!result.success) {
    const error = new Error(
      `Zu viele Anfragen. Bitte versuchen Sie es in ${Math.ceil(
        (result.resetAt - Date.now()) / 1000
      )} Sekunden erneut.`
    );
    (error as any).status = 429;
    throw error;
  }
}
