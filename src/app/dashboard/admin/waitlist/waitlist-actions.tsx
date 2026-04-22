"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateWaitlistApplicationStatus } from "@/lib/actions/waitlist";
import { MoreHorizontal, Check, X, Clock } from "lucide-react";
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

interface WaitlistActionsProps {
  id: string;
  currentStatus: "pending" | "approved" | "rejected" | "waitlisted";
}

export function WaitlistActions({ id, currentStatus }: WaitlistActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showConfirmDialog, setShowConfirmDialog] = useState<"pending" | "approved" | "rejected" | "waitlisted" | null>(null);

  function handleStatusChange(newStatus: "pending" | "approved" | "rejected" | "waitlisted") {
    setShowConfirmDialog(newStatus);
  }

  function confirmStatusChange() {
    if (!showConfirmDialog) return;

    startTransition(async () => {
      await updateWaitlistApplicationStatus(id, showConfirmDialog);
      router.refresh();
      setShowConfirmDialog(null);
    });
  }

  const statusLabels = {
    pending: "Ausstehend",
    approved: "Genehmigt",
    rejected: "Abgelehnt",
    waitlisted: "Auf Warteliste",
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {currentStatus !== "approved" && (
            <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
              <Check className="mr-2 h-4 w-4 text-green-600" />
              Genehmigen
            </DropdownMenuItem>
          )}
          {currentStatus !== "waitlisted" && (
            <DropdownMenuItem onClick={() => handleStatusChange("waitlisted")}>
              <Clock className="mr-2 h-4 w-4 text-blue-600" />
              Auf Warteliste
            </DropdownMenuItem>
          )}
          {currentStatus !== "rejected" && (
            <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
              <X className="mr-2 h-4 w-4 text-red-600" />
              Ablehnen
            </DropdownMenuItem>
          )}
          {currentStatus !== "pending" && (
            <DropdownMenuItem onClick={() => handleStatusChange("pending")}>
              <Clock className="mr-2 h-4 w-4 text-yellow-600" />
              Zurücksetzen
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={!!showConfirmDialog} onOpenChange={() => setShowConfirmDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Status ändern
            </AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diese Bewerbung als &quot;{statusLabels[showConfirmDialog!]}&quot; markieren?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange} disabled={isPending}>
              {isPending ? "Wird aktualisiert..." : "Bestätigen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}