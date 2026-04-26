import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { getMemberById, getContributionRatesForMemberSelect } from "@/lib/actions/members";
import Link from "next/link";
import { MemberForm } from "@/features/members/components/member-form";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Mitglied bearbeiten | schach.studio",
  description: "Aktualisieren Sie die Daten eines Vereinsmitglieds.",
};

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const [member, contributionRates] = await Promise.all([
    getMemberById(id),
    getContributionRatesForMemberSelect(),
  ]);

  if (!member) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <div className="flex flex-col gap-2">
        <Link
          href={`/dashboard/members/${id}`}
          className="group flex w-fit items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Zurück zu den Details
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {member.firstName} {member.lastName}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Profil bearbeiten und Daten aktualisieren.
          </p>
        </div>
      </div>

      <MemberForm member={member} mode="edit" contributionRates={contributionRates} />
    </div>
  );
}
