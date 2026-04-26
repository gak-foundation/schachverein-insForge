import { getSession } from "@/lib/auth/session";

/**
 * Holt die aktuelle Club-ID aus der Session, falls vorhanden.
 * Gibt null zurück, wenn keine Session oder keine Club-ID vorhanden ist.
 */
export async function getCurrentClubId() {
  const session = await getSession();
  return session?.user?.clubId || null;
}

/**
 * Erfordert eine aktive Session und eine zugeordnete Club-ID.
 * Wirft einen Fehler, wenn die Bedingungen nicht erfüllt sind.
 */
export async function requireClubId() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  if (!session.user.clubId) {
    throw new Error("Kein Verein zugeordnet");
  }
  return session.user.clubId;
}
