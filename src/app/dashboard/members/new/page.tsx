import Link from "next/link";
import { MemberForm } from "@/components/members/member-form";
import { ChevronLeft } from "lucide-react";

export const metadata = {
  title: "Neues Mitglied anlegen | CheckMate Manager",
  description: "Erfassen Sie ein neues Vereinsmitglied mit allen relevanten Schach- und Verwaltungsdaten.",
};

export default function NewMemberPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8 py-6">
      <div className="flex flex-col gap-2">
        <Link
          href="/dashboard/members"
          className="group flex w-fit items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors"
        >
          <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Zurück zur Übersicht
        </Link>
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Neues Mitglied
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Erstellen Sie ein neues Mitgliederprofil. Pflichtfelder sind mit einem Sternchen (*) markiert.
          </p>
        </div>
      </div>

      <MemberForm />
    </div>
  );
}
