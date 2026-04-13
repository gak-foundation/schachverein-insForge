"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  CreditCard,
  TrendingUp,
  ExternalLink,
  MoreHorizontal,
  Search,
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
import { impersonateClubAction } from "@/lib/clubs/actions";

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

interface SuperAdminDashboardProps {
  clubs: Club[];
  stats: {
    totalUsers: number;
    totalClubs: number;
    activeSubscriptions: number;
    proClubs: number;
    enterpriseClubs: number;
  };
}

const planColors: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  past_due: "bg-yellow-100 text-yellow-700",
  canceled: "bg-red-100 text-red-700",
  trialing: "bg-blue-100 text-blue-700",
};

export function SuperAdminDashboard({ clubs, stats }: SuperAdminDashboardProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [impersonating, setImpersonating] = useState<string | null>(null);

  const filteredClubs = clubs.filter(
    (club) =>
      club.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      club.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  async function handleImpersonate(clubId: string) {
    setImpersonating(clubId);
    try {
      await impersonateClubAction(clubId);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Failed to impersonate club:", error);
    } finally {
      setImpersonating(null);
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Verwaltung aller Vereine auf der Plattform
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gesamtvereine</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClubs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubscriptions} mit aktivem Abo
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benutzer</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registrierte Accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pro Vereine</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.proClubs}</div>
            <p className="text-xs text-muted-foreground">
              €{stats.proClubs * 29}/Monat Umsatz
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enterprise</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enterpriseClubs}</div>
            <p className="text-xs text-muted-foreground">
              Enterprise-Kunden
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Clubs Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alle Vereine</CardTitle>
              <CardDescription>
                Verwalten und impersonieren Sie Vereine
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Vereine suchen..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Verein</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Mitglieder</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClubs.map((club) => (
                <TableRow key={club.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{club.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {club.slug}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={planColors[club.plan]}
                    >
                      {club.plan.charAt(0).toUpperCase() + club.plan.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {club.subscriptionStatus ? (
                      <Badge
                        variant="secondary"
                        className={statusColors[club.subscriptionStatus] || ""}
                      >
                        {club.subscriptionStatus}
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Free</Badge>
                    )}
                  </TableCell>
                  <TableCell>{club.memberCount}</TableCell>
                  <TableCell>
                    {new Date(club.createdAt).toLocaleDateString("de-DE")}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aktionen</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleImpersonate(club.id)}
                          disabled={impersonating === club.id}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          {impersonating === club.id
                            ? "Laden..."
                            : "Als Admin einloggen"}
                        </DropdownMenuItem>
                        {club.stripeCustomerId && (
                          <DropdownMenuItem
                            onClick={() =>
                              window.open(
                                `https://dashboard.stripe.com/customers/${club.stripeCustomerId}`,
                                "_blank"
                              )
                            }
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            In Stripe ansehen
                          </DropdownMenuItem>
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
    </div>
  );
}
