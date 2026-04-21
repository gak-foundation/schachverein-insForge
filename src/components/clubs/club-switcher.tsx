"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Plus, Building2, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useClub } from "@/lib/club-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreateClubForm } from "./create-club-form";

interface ClubSwitcherProps {
  minimal?: boolean;
}

const planLabels: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
};

const planColors: Record<string, string> = {
  free: "bg-slate-100 text-slate-700",
  pro: "bg-blue-100 text-blue-700",
  enterprise: "bg-purple-100 text-purple-700",
};

export function ClubSwitcher({ minimal = false }: ClubSwitcherProps) {
  const { activeClub, userClubs, switchClub, isLoading } = useClub();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  if (minimal) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <div className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-primary">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <span className="text-sm font-medium truncate max-w-[120px]">
          {activeClub?.name ?? "Kein Verein"}
        </span>
      </div>
    );
  }

  if (!activeClub) {
    return (
      <div className="px-3 py-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-2"
          onClick={() => router.push("/onboarding")}
        >
          <Plus className="h-4 w-4" />
          Verein erstellen
        </Button>
      </div>
    );
  }

  return (
      <div className="px-3 py-2">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          disabled={isLoading}
          className="group/button inline-flex w-full cursor-pointer items-center justify-start gap-3 rounded-lg border border-transparent bg-clip-padding px-2 py-3 text-sm font-medium whitespace-nowrap transition-all outline-none select-none hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 dark:hover:bg-muted/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary overflow-hidden">
            {activeClub.logoUrl ? (
              <Image
                src={activeClub.logoUrl}
                alt={activeClub.name}
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
            <span className="text-sm font-semibold truncate w-full text-left">
              {activeClub.name}
            </span>
            <Badge
              variant="secondary"
              className={cn("text-[10px] px-1.5 py-0", planColors[activeClub.plan])}
            >
              {planLabels[activeClub.plan]}
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[280px]">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Meine Vereine
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {userClubs.map((club) => (
            <DropdownMenuItem
              key={club.id}
              className="gap-3 py-2 cursor-pointer"
              onClick={() => {
                if (club.id !== activeClub.id) {
                  switchClub(club.id);
                  setOpen(false);
                }
              }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10 text-primary overflow-hidden">
                {club.logoUrl ? (
                  <Image
                    src={club.logoUrl}
                    alt={club.name}
                    width={32}
                    height={32}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Building2 className="h-4 w-4" />
                )}
              </div>
              <div className="flex flex-col items-start gap-0.5 flex-1 min-w-0">
                <span className="text-sm font-medium truncate w-full">
                  {club.name}
                </span>
                <Badge
                  variant="secondary"
                  className={cn("text-[10px] px-1 py-0", planColors[club.plan])}
                >
                  {planLabels[club.plan]}
                </Badge>
              </div>
              {club.id === activeClub.id && (
                <Check className="h-4 w-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link
              href="/dashboard/club/settings"
              className="flex items-center gap-3 py-2 w-full"
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span>Vereinseinstellungen</span>
            </Link>
          </DropdownMenuItem>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DropdownMenuItem
              className="gap-3 py-2 cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setCreateDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span>Neuen Verein erstellen</span>
            </DropdownMenuItem>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Neuen Verein erstellen</DialogTitle>
                <DialogDescription>
                  Erstellen Sie einen neuen Verein. Sie können später Mitglieder einladen.
                </DialogDescription>
              </DialogHeader>
              <CreateClubForm
                onSuccess={() => {
                  setCreateDialogOpen(false);
                  setOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function ClubSwitcherSkeleton() {
  return (
    <div className="px-3 py-2">
      <div className="flex items-center gap-3 h-14 px-2 rounded-md bg-muted/50 animate-pulse">
        <div className="h-10 w-10 rounded-lg bg-muted" />
        <div className="flex flex-col gap-1.5 flex-1">
          <div className="h-4 w-24 bg-muted rounded" />
          <div className="h-3 w-12 bg-muted rounded" />
        </div>
      </div>
    </div>
  );
}
