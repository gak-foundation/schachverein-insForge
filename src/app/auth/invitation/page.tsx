import { getInvitationByToken } from "@/lib/clubs/queries";
import { getSession } from "@/lib/auth/session";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { InvitationContent } from "./invitation-content";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface InvitationPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function InvitationPage({ searchParams }: InvitationPageProps) {
  const { token } = await searchParams;
  const session = await getSession();

  if (!token) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Ungültiger Link</h2>
            <p className="text-slate-600 mb-6">Es wurde kein Einladungs-Token gefunden.</p>
            <Link href="/" className={cn(buttonVariants())}>
              Zur Startseite
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  const invitation = await getInvitationByToken(token);

  if (!invitation) {
    return (
      <AuthLayout>
        <AuthCard>
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Einladung abgelaufen</h2>
            <p className="text-slate-600 mb-6">
              Diese Einladung ist ungültig oder bereits abgelaufen.
            </p>
            <Link href="/" className={cn(buttonVariants())}>
              Zur Startseite
            </Link>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard>
        <AuthHeader
          title="Vereins-Einladung"
          subtitle="Treten Sie Ihrer Community bei"
        />
        <div className="mt-8">
          <InvitationContent
            token={token}
            clubName={invitation.club.name}
            isLoggedIn={!!session}
            userEmail={session?.user.email}
            invitationEmail={invitation.email}
          />
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
