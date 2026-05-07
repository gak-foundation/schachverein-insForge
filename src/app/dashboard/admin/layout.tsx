import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const isAdmin = session.user.role === "admin" || session.user.isSuperAdmin;

  if (!isAdmin) {
    redirect("/dashboard");
  }

  if (!session.user.isSuperAdmin && !session.user.clubId) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
