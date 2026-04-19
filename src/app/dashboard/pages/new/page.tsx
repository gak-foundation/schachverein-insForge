import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import { PageForm } from "@/components/cms/page-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Neue Seite erstellen",
};

export default async function NewPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  if (!hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.PAGES_WRITE)) {
    redirect("/dashboard/pages");
  }

  return (
    <div className="max-w-2xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle>Neue Seite erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <PageForm />
        </CardContent>
      </Card>
    </div>
  );
}
