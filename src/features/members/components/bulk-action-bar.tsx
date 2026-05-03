"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, ChevronDown, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  updateMemberStatusBulkAction,
  assignContributionRateBulkAction,
} from "@/lib/actions/bulk-members";

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  contributionRates: { id: string; name: string }[];
  disabled?: boolean;
}

export function BulkActionBar({
  selectedIds,
  onClear,
  contributionRates,
  disabled = false,
}: BulkActionBarProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<{
    action: string;
    label: string;
  } | null>(null);

  if (selectedIds.length === 0) return null;

  const statusOptions = [
    { value: "active", label: "Aktiv" },
    { value: "inactive", label: "Inaktiv" },
    { value: "honorary", label: "Ehrenmitglied" },
    { value: "resigned", label: "Ausgetreten" },
  ];

  function handleStatusChange(newStatus: string) {
    const label = statusOptions.find((o) => o.value === newStatus)?.label ?? newStatus;
    setConfirmAction({ action: `status:${newStatus}`, label });
  }

  function executeBulkAction() {
    if (!confirmAction) return;
    const [actionType, ...rest] = confirmAction.action.split(":");

    startTransition(async () => {
      try {
        if (actionType === "status") {
          const result = await updateMemberStatusBulkAction(selectedIds, rest.join(":"));
          toast({ title: "Erfolg", description: `${result.updated} Mitglieder aktualisiert.` });
        } else if (actionType === "rate") {
          const result = await assignContributionRateBulkAction(selectedIds, rest.join(":"));
          toast({ title: "Erfolg", description: `${result.updated} Mitglieder aktualisiert.` });
        }
        onClear();
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: error.message || "Aktion fehlgeschlagen",
          variant: "destructive",
        });
      }
      setConfirmAction(null);
    });
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {selectedIds.length} ausgewaehlt
          </Badge>
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="h-4 w-4 mr-1" />
            Abbrechen
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled || isPending}>
                Status aendern
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {statusOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => handleStatusChange(opt.value)}
                >
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={disabled || isPending}>
                Tarif zuweisen
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {contributionRates.map((rate) => (
                <DropdownMenuItem
                  key={rate.id}
                  onClick={() => setConfirmAction({
                    action: `rate:${rate.id}`,
                    label: rate.name,
                  })}
                >
                  {rate.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktion bestaetigen</AlertDialogTitle>
            <AlertDialogDescription>
              Moechtest du wirklich {selectedIds.length} Mitglieder auf
              {" "}&quot;{confirmAction?.label}&quot; setzen?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={executeBulkAction} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Bestaetigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
