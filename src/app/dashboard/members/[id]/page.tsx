import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getMemberById, getDWZHistory, getMemberStatusHistory } from "@/lib/actions/members";
import { hasPermission } from "@/lib/auth/permissions";
import { PERMISSIONS } from "@/lib/auth/permissions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { deleteMember } from "@/lib/actions/members";
import { LichessSyncButton } from "@/components/clubs/lichess-sync-button";
import { LichessGamesList } from "@/components/members/lichess-games-list";
import { fetchLichessGames } from "@/lib/lichess";
import { cn, calculateAge } from "@/lib/utils";
import { ChevronLeft, Edit, Trash2, Calendar, Mail, Phone, User, Award, ShieldCheck, History } from "lucide-react";
import { Member } from "@/types";

export const metadata = {
  title: "Mitglied Details | CheckMate Manager",
};

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const { id } = await params;
  const member = await getMemberById(id);

  if (!member) {
    notFound();
  }

  const canEdit = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.MEMBERS_WRITE,
    session.user.isSuperAdmin
  );

  const canDelete = hasPermission(
    session.user.role ?? "mitglied",
    session.user.permissions ?? [],
    PERMISSIONS.MEMBERS_DELETE,
    session.user.isSuperAdmin
  );

  const dwzHistory = await getDWZHistory(id);
  const statusHistory = await getMemberStatusHistory(id);
  
  const lichessGames = member.lichessUsername 
    ? await fetchLichessGames(member.lichessUsername, 5) 
    : [];

  const statusLabels: Record<string, string> = {
    active: "Aktiv",
    inactive: "Inaktiv",
    resigned: "Ausgetreten",
    honorary: "Ehrenmitglied",
  };

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-900 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
    inactive: "bg-slate-100 text-slate-900 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
    resigned: "bg-red-100 text-red-900 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
    honorary: "bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50",
  };

  const age = calculateAge(member.dateOfBirth);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/members"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 hover:border-primary hover:text-primary transition-all dark:border-slate-800 dark:bg-slate-950"
            title="Zurück zur Mitgliederliste"
          >
            <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {member.firstName} {member.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="px-2.5 py-0.5 font-semibold uppercase tracking-wider text-[10px]">
                {member.role}
              </Badge>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold border shadow-sm",
                  statusColors[member.status] ?? "bg-slate-100"
                )}
              >
                {statusLabels[member.status] ?? member.status}
              </span>
              {age !== null && (
                <Badge variant="outline" className="border-slate-200 dark:border-slate-800">
                  {age} Jahre
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Link href={`/dashboard/members/${id}/edit`}>
              <Button variant="outline" className="h-10 px-4 font-semibold">
                <Edit className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            </Link>
          )}
          {canDelete && (
            <form action={deleteMember.bind(null, id)}>
              <Button variant="destructive" type="submit" className="h-10 px-4 font-semibold">
                <Trash2 className="mr-2 h-4 w-4" />
                Löschen
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kontakt & Basis-Info */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Stammdaten & Kontakt
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <Mail className="h-3.5 w-3.5" /> E-Mail
                </dt>
                <dd className="text-base font-medium text-slate-900 dark:text-slate-100">{member.email}</dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <Phone className="h-3.5 w-3.5" /> Telefon
                </dt>
                <dd className="text-base font-medium text-slate-900 dark:text-slate-100">{member.phone || "—"}</dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <Calendar className="h-3.5 w-3.5" /> Geburtsdatum
                </dt>
                <dd className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {member.dateOfBirth
                    ? new Date(member.dateOfBirth).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })
                    : "—"}
                  {age !== null && <span className="ml-2 text-slate-400 font-normal">({age} Jahre)</span>}
                </dd>
              </div>
              <div className="space-y-1">
                <dt className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  <ShieldCheck className="h-3.5 w-3.5" /> Eintrittsdatum
                </dt>
                <dd className="text-base font-medium text-slate-900 dark:text-slate-100">
                  {member.joinedAt
                    ? new Date(member.joinedAt).toLocaleDateString("de-DE", { day: '2-digit', month: 'long', year: 'numeric' })
                    : "—"}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Schach-Ratings */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-5 w-5" />
              Leistungszahlen
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 text-center">
                <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">DWZ</dt>
                <dd className="text-3xl font-black text-primary tabular-nums">{member.dwz ?? "—"}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-slate-900 p-4 border border-slate-100 dark:border-slate-800 text-center">
                <dt className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Elo</dt>
                <dd className="text-3xl font-black text-slate-700 dark:text-slate-200 tabular-nums">{member.elo ?? "—"}</dd>
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-500 uppercase tracking-tight">DWZ-ID</span>
                <span className="font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">{member.dwzId ?? "—"}</span>
              </div>
              {member.lichessUsername && (
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 uppercase tracking-tight">Lichess</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{member.lichessUsername}</span>
                    {canEdit && <LichessSyncButton memberId={id} />}
                  </div>
                </div>
              )}
              {member.chesscomUsername && (
                <div className="flex items-center justify-between text-sm py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-500 uppercase tracking-tight">Chess.com</span>
                  <span className="font-bold text-[#81b64c]">{member.chesscomUsername}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Einwilligungen & Rechtliches */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg">Einwilligungen (DSGVO)</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium">Foto-Einwilligung (Website/Presse)</span>
                <Badge variant={member.photoConsent ? "default" : "destructive"} className="px-3">
                  {member.photoConsent ? "ERTEILT" : "NICHT ERTEILT"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium">Newsletter / Vereinsnachrichten</span>
                <Badge variant={member.newsletterConsent ? "default" : "destructive"} className="px-3">
                  {member.newsletterConsent ? "ERTEILT" : "NICHT ERTEILT"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <span className="text-sm font-medium">Ergebnis-Veröffentlichung online</span>
                <Badge variant={member.resultPublicationConsent ? "default" : "destructive"} className="px-3">
                  {member.resultPublicationConsent ? "ERTEILT" : "NICHT ERTEILT"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Familie & Verknüpfungen */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg">Familie & Kontakte</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-2">Gesetzlicher Vertreter / Elternteil</dt>
                <dd className="mt-1">
                  {member.parent ? (
                    <Link href={`/dashboard/members/${member.parent.id}`} className="inline-flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-semibold hover:underline">
                      <User className="h-4 w-4" />
                      {member.parent.firstName} {member.parent.lastName}
                    </Link>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Keine Verknüpfung hinterlegt</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase text-slate-500 tracking-widest mb-2">Verknüpfte Kinder / Familienmitglieder</dt>
                <dd className="mt-1">
                  {member.children && member.children.length > 0 ? (
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {member.children.map((child: Pick<Member, "id" | "firstName" | "lastName">) => (
                        <li key={child.id}>
                          <Link href={`/dashboard/members/${child.id}`} className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium hover:border-primary transition-colors">
                            <User className="h-3 w-3 text-slate-400" />
                            {child.firstName} {child.lastName}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-slate-400 italic">Keine Verknüpfungen hinterlegt</span>
                  )}
                </dd>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Historie & Notizen */}
      <div className="grid gap-6 lg:grid-cols-2">
        {dwzHistory.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <History className="h-5 w-5 text-slate-500" />
                DWZ-Verlauf
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="pl-6">Datum</TableHead>
                    <TableHead className="text-right">DWZ</TableHead>
                    <TableHead className="text-right pr-6">Elo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dwzHistory.slice(0, 10).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="pl-6 font-medium text-slate-600 dark:text-slate-400">
                        {new Date(entry.recordedAt).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-bold text-slate-900 dark:text-slate-100">
                        {entry.dwz}
                      </TableCell>
                      <TableCell className="text-right tabular-nums pr-6 text-slate-500">
                        {entry.elo ?? "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {dwzHistory.length > 10 && (
                <div className="p-4 text-center">
                  <Button variant="ghost" size="sm" className="text-xs text-slate-500">Gesamte Historie anzeigen</Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {statusHistory.length > 0 && (
          <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="h-5 w-5 text-slate-500" />
                Status-Historie
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 px-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/30">
                    <TableHead className="pl-6">Datum</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pr-6">Grund</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statusHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="pl-6 whitespace-nowrap text-slate-600 dark:text-slate-400">
                        {new Date(entry.changedAt).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("font-bold text-[10px]", statusColors[entry.newStatus] ?? "")}>
                          {statusLabels[entry.newStatus] ?? entry.newStatus}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-400 pr-6 italic">
                        {entry.reason || "Statusänderung"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {member.lichessUsername && (
          <div className="lg:col-span-2">
            <LichessGamesList games={lichessGames} username={member.lichessUsername} />
          </div>
        )}
      </div>

      {member.notes && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-lg">Interne Notizen</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="rounded-lg bg-yellow-50/50 dark:bg-yellow-900/10 p-4 border border-yellow-100 dark:border-yellow-900/30">
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {member.notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}