"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ExternalLink,
  MoreHorizontal,
  Search,
  Shield,
  ShieldAlert,
  Power,
  PowerOff,
  Mail,
  Plus,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { impersonateClubAction, toggleClubStatusAction, createClubAsSuperAdminAction } from "@/lib/clubs/actions";
import { CreateClubForm } from "@/features/clubs/components/create-club-form";
import { toast } from "@/components/ui/use-toast";

interface Club {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  isActive: boolean;
  subscriptionStatus: string | null;
  subscriptionExpiresAt: Date | null;
  createdAt: Date;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  memberCount: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  createdAt: Date;
  lastLoginAt: Date | null;
}

interface SuperAdminDashboardProps {
  clubs: Club[];
  users: User[];
  stats: {
    totalUsers: number;
    totalClubs: number;
  };
}

const planColors: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-700",
  past_due: "bg-red-100 text-red-700",
  canceled: "bg-red-100 text-red-700",
  trialing: "bg-yellow-100 text-yellow-700",
};

const getPlanColor = (plan: string) => planColors[plan] || "bg-slate-100 text-slate-700";
const getStatusColor = (status: string | null) => status ? (statusColors[status] || "bg-slate-100 text-slate-700") : "bg-slate-100 text-slate-700";

export function SuperAdminDashboard({ clubs, users, stats }: SuperAdminDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleImpersonate(clubId: string) {
    setImpersonating(clubId);
    try {
      await impersonateClubAction(clubId);
      toast({ title: "Impersonation erfolgreich", description: "Sie sind nun als Admin eingeloggt." });
      router.push("/dashboard");
    } catch {
      toast({ variant: "destructive", title: "Fehler", description: "Impersonation fehlgeschlagen." });
    } finally {
      setImpersonating(null);
    }
  }

  async function handleToggleStatus(clubId: string, currentStatus: boolean) {
    startTransition(async () => {
      try {
        await toggleClubStatusAction(clubId, !currentStatus);
        toast({ title: "Status aktualisiert", description: `Verein wurde ${!currentStatus ? "aktiviert" : "deaktiviert"}.` });
      } catch {
        toast({ variant: "destructive", title: "Fehler", description: "Status-Update fehlgeschlagen." });
      }
    });
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground mt-1 text-lg">
            Plattform-weite Verwaltung und Metriken
          </p>
        </div>
        <div className="flex items-center gap-2 bg-card border rounded-lg p-1">
             <Badge variant="outline" className="px-3 py-1 text-sm border-primary/20 bg-primary/5 text-primary">
                v1.2.0-stable
             </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtvereine</CardTitle>
            <Building2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalClubs}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-green-500 font-medium flex items-center mr-1">
                <TrendingUp className="h-3 w-3 mr-0.5" />
                +12%
              </span>
              seit letztem Monat
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalClubs > 0 ? Math.round((stats.totalUsers / stats.totalClubs) * 10) / 10 : 0} User pro Verein ø
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <CreditCard className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">Free</div>
            <p className="text-xs text-muted-foreground mt-1">
               Plattform ist 100% kostenfrei
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wachstum</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
                Aktiv
            </div>
            <p className="text-xs text-muted-foreground mt-1">
                Open Source & Community
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="clubs" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid w-full sm:w-[400px] grid-cols-2">
            <TabsTrigger value="clubs">Vereine ({clubs.length})</TabsTrigger>
            <TabsTrigger value="users">Benutzer ({users.length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Verein erstellen
            </Button>
          </div>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Neuen Verein erstellen</DialogTitle>
              <DialogDescription>
                Erstellen Sie einen neuen Verein als Systemadministrator.
              </DialogDescription>
            </DialogHeader>
            <CreateClubForm
              action={createClubAsSuperAdminAction}
              onSuccess={() => {
                setCreateDialogOpen(false);
                router.refresh();
                toast({ title: "Verein erstellt", description: "Der neue Verein wurde erfolgreich angelegt." });
              }}
            />
          </DialogContent>
        </Dialog>

        <TabsContent value="clubs" className="animate-in fade-in duration-300">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Vereinsverwaltung</CardTitle>
              <CardDescription>
                Globale Liste aller registrierten Schachvereine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Verein</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Mitglieder</TableHead>
                    <TableHead className="font-bold">Erstellt am</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClubs.map((club) => (
                    <TableRow key={club.id} className={!club.isActive ? "opacity-60 bg-muted/20" : ""}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-base">{club.name}</span>
                          <code className="text-[10px] text-muted-foreground bg-muted px-1 w-fit rounded">
                            {club.slug}
                          </code>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                            {club.isActive ? (
                                <Badge className="bg-green-500/10 text-green-600 border-green-200 hover:bg-green-500/20">
                                    Aktiv
                                </Badge>
                            ) : (
                                <Badge variant="destructive" className="bg-red-500/10 text-red-600 border-red-200 hover:bg-red-500/20">
                                    Inaktiv
                                </Badge>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 font-medium">
                            <Users className="h-3 w-3 text-muted-foreground" />
                            {club.memberCount}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(club.createdAt).toLocaleDateString("de-DE", { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Aktionen für {club.name}</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleImpersonate(club.id)}
                              disabled={impersonating === club.id}
                              className="cursor-pointer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4 text-blue-500" />
                              Als Admin einloggen
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleStatus(club.id, club.isActive)}
                              disabled={isPending}
                              className="cursor-pointer"
                            >
                              {club.isActive ? (
                                  <>
                                    <PowerOff className="mr-2 h-4 w-4 text-red-500" />
                                    Verein deaktivieren
                                  </>
                              ) : (
                                  <>
                                    <Power className="mr-2 h-4 w-4 text-green-500" />
                                    Verein aktivieren
                                  </>
                              )}
                            </DropdownMenuItem>
                            {club.stripeCustomerId && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => window.open(`https://dashboard.stripe.com/customers/${club.stripeCustomerId}`, "_blank")}
                                  className="cursor-pointer"
                                >
                                  <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
                                  Stripe Kundenkonto
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="animate-in fade-in duration-300">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Benutzerverwaltung</CardTitle>
              <CardDescription>
                Systemweite Liste aller registrierten Accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-bold">Benutzer</TableHead>
                    <TableHead className="font-bold">E-Mail</TableHead>
                    <TableHead className="font-bold">Rolle</TableHead>
                    <TableHead className="font-bold">Sicherheit</TableHead>
                    <TableHead className="font-bold">Registriert am</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                                {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-1.5">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize text-[11px]">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.isSuperAdmin ? (
                          <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
                            <ShieldAlert className="h-3 w-3 mr-1" />
                            Super Admin
                          </Badge>
                        ) : (
                          <Badge variant="ghost" className="text-muted-foreground">
                            <Shield className="h-3 w-3 mr-1" />
                            Standard
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString("de-DE")}
                      </TableCell>
                      <TableCell>
                         <Button variant="ghost" size="icon" className="h-8 w-8">
                             <MoreHorizontal className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
