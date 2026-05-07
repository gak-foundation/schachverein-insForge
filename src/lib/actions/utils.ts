import { getSession } from "@/lib/auth/session";

/**
 * Holt die aktuelle Club-ID aus der Session, falls vorhanden.
 * Gibt null zurÃ¼ck, wenn keine Session oder keine Club-ID vorhanden ist.
 */
export async function getCurrentClubId() {
  const session = await getSession();
  return session?.user?.clubId || null;
}

/**
 * Erfordert eine aktive Session und eine zugeordnete Club-ID.
 * Wirft einen Fehler, wenn die Bedingungen nicht erfÃ¼llt sind.
 */
export async function requireClubId() {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  
  const clubId = session.user.clubId;
  
  if (!clubId) {
    if (session.user.role === "admin") {
      // Admins without club context are redirected in the page/layout,
      // but if an action is called, we need to throw a specific error.
      throw new Error("ADMIN_NO_CLUB_CONTEXT");
    }
    throw new Error("Kein Verein zugeordnet");
  }
  return clubId;
}
