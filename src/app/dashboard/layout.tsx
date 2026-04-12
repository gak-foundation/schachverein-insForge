import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = session.user;
  const role = user?.role as string ?? "mitglied";
  const permissions = (user?.permissions as string[]) ?? [];

  return (
    <div className="flex h-screen">
      <Sidebar role={role} permissions={permissions} />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
