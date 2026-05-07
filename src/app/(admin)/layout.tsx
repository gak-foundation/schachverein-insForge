import { redirect } from "next/navigation";
import { getSessionWithClub } from "@/lib/auth/session";
import Link from "next/link";

const adminNavItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/clubs", label: "Vereine" },
  { href: "/admin/blog", label: "Blog" },
  { href: "/admin/einladungen", label: "Einladungen" },
  { href: "/admin/billing", label: "Billing" },
  { href: "/admin/audit", label: "Audit Logs" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionWithClub();

  if (session?.user.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/admin" className="text-lg font-bold tracking-tight">
                Super Admin
              </Link>
              <div className="flex gap-1">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {session.user.email}
              </span>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Zur App
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-8 py-10">
        {children}
      </main>
    </div>
  );
}
