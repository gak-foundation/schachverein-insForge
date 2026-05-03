# Onboarding-Flow Vorstand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a new "Einladungen" step to the onboarding flow and make the event step optional.

**Architecture:** Single file modification — `src/app/onboarding/page.tsx`. The new step uses existing server actions (`clubCreateInvitationAction`) and UI patterns from `src/app/dashboard/einladungen/invite-form.tsx`.

**Tech Stack:** Next.js App Router, React, Tailwind CSS, shadcn/ui

---

### Task 1: Update types, step ordering, and state

**File:** Modify `src/app/onboarding/page.tsx:33-49`

- [ ] **Step 1: Update Step type and add state for invitations**

Change `Step` from:
```typescript
type Step = "welcome" | "club" | "members" | "event" | "finished";
```
to:
```typescript
type Step = "welcome" | "club" | "invitations" | "event" | "finished";
```

Add new state for invitations:
```typescript
const [sentInvitations, setSentInvitations] = useState<{email: string; role: string; url: string}[]>([]);
const [clubName, setClubName] = useState("");
```

Remove the old `members` step state. `clubId` and `clubName` already exist.

- [ ] **Step 2: Update step ordering and progress**

Change the useEffect step mapping:
```typescript
useEffect(() => {
    const steps: Step[] = ["welcome", "club", "invitations", "event", "finished"];
    const index = steps.indexOf(step);
    setProgress((index / (steps.length - 1)) * 100);
}, [step]);
```

- [ ] **Step 3: Update step counter display (line ~124)**

Change "Schritt" text for the new step order:
```typescript
 Schritt {step === "welcome" ? 1 : step === "club" ? 2 : step === "invitations" ? 3 : step === "event" ? 4 : 5} von 5
```

### Task 2: Replace members step with new invitations step

**File:** Modify `src/app/onboarding/page.tsx`

- [ ] **Step 4: Remove old `handleNextFromMembers` function and the members step JSX (lines ~77-79, ~219-255)**

Remove the `handleNextFromMembers` function entirely.

Replace the `step === "members"` JSX block (lines 219-255) with a new `step === "invitations"` block.

- [ ] **Step 5: Add invitations step JSX**

Insert the new invitations step UI. Replace the old "members" block:

```typescript
{step === "invitations" && (
  <Card className="border-primary/20 shadow-xl animate-in slide-in-from-right-4 duration-500">
    <CardHeader className="space-y-1">
      <CardTitle className="text-2xl flex items-center gap-2">
        <Users className="h-6 w-6 text-primary" />
        Vorstandskollegen einladen
      </CardTitle>
      <CardDescription>
        Lade andere Vorstandsmitglieder per E-Mail ein. Sie erhalten einen Link zur Registrierung.
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
      <div className="space-y-4">
        {inviteRows.map((row, index) => (
          <div key={index} className="flex items-end gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`invite-email-${index}`}>E-Mail</Label>
              <Input
                id={`invite-email-${index}`}
                type="email"
                placeholder="vorstand@beispiel.de"
                value={row.email}
                onChange={(e) => updateInviteRow(index, "email", e.target.value)}
                required
              />
            </div>
            <div className="w-44 space-y-2">
              <Label htmlFor={`invite-role-${index}`}>Rolle</Label>
              <select
                id={`invite-role-${index}`}
                value={row.role}
                onChange={(e) => updateInviteRow(index, "role", e.target.value)}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="vorstand">Vorstand</option>
                <option value="sportwart">Sportwart</option>
                <option value="jugendwart">Jugendwart</option>
                <option value="kassenwart">Kassenwart</option>
              </select>
            </div>
            {inviteRows.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mb-0.5"
                onClick={() => removeInviteRow(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInviteRow}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Weiteres Mitglied
        </Button>
      </div>

      {sentInvitations.length > 0 && (
        <div className="rounded-lg border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950 p-4 space-y-3">
          <p className="text-sm font-medium text-green-800 dark:text-green-200 flex items-center gap-2">
            <Check className="h-4 w-4" /> Einladungen versendet
          </p>
          {sentInvitations.map((inv, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
              <span className="flex-1 truncate">{inv.email}</span>
              <span className="text-xs bg-green-200 dark:bg-green-800 px-2 py-0.5 rounded">{inv.role}</span>
              <button
                onClick={() => navigator.clipboard.writeText(inv.url)}
                className="text-xs underline hover:no-underline shrink-0"
              >
                Link kopieren
              </button>
            </div>
          ))}
        </div>
      )}
    </CardContent>
    <CardFooter className="flex justify-between gap-4 pt-6">
      <Button type="button" variant="ghost" onClick={() => setStep("club")}>
        <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
      </Button>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setStep("event")}
        >
          Überspringen
        </Button>
        <Button
          type="button"
          size="lg"
          className="font-bold"
          disabled={isLoading || inviteRows.every(r => !r.email)}
          onClick={handleSendInvitations}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Einladungen senden
        </Button>
      </div>
    </CardFooter>
  </Card>
)}
```

Add these imports at the top:
```typescript
import { Plus, X, Send } from "lucide-react";
```

- [ ] **Step 6: Add invite row state and handlers**

Add state for invite rows after the existing state declarations:
```typescript
const [inviteRows, setInviteRows] = useState([{ email: "", role: "vorstand" }]);

function addInviteRow() {
  setInviteRows(prev => [...prev, { email: "", role: "vorstand" }]);
}

function removeInviteRow(index: number) {
  setInviteRows(prev => prev.filter((_, i) => i !== index));
}

function updateInviteRow(index: number, field: "email" | "role", value: string) {
  setInviteRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));
}
```

- [ ] **Step 7: Add handleSendInvitations function**

Add this function before the `handleCreateClub` function (keeping proper ordering):

```typescript
async function handleSendInvitations() {
  setIsLoading(true);
  const sent: {email: string; role: string; url: string}[] = [];

  try {
    for (const row of inviteRows) {
      if (!row.email) continue;
      const formData = new FormData();
      formData.append("email", row.email);
      formData.append("role", row.role);
      formData.append("sendEmail", "true");

      const result = await clubCreateInvitationAction(formData);
      sent.push({ email: row.email, role: row.role, url: (result as any).invitationUrl });
    }

    setSentInvitations(sent);
    toast({ title: "Einladungen versendet!", description: `${sent.length} Einladung(en) erfolgreich versendet.` });
  } catch (error) {
    toast({
      title: "Fehler",
      description: error instanceof Error ? error.message : "Einladungen konnten nicht versendet werden",
      variant: "destructive"
    });
  } finally {
    setIsLoading(false);
  }
}
```

Add import for `clubCreateInvitationAction`:
```typescript
import { createClubAction, completeOnboardingAction, clubCreateInvitationAction } from "@/lib/clubs/actions";
```

### Task 3: Update the event step to be clearly optional

- [ ] **Step 8: Update event step header**

Change the event step title and add an "Optional" badge:

In the `step === "event"` block, change the CardHeader to:
```typescript
<CardHeader className="space-y-1">
  <div className="flex items-center gap-3">
    <CardTitle className="text-2xl flex items-center gap-2">
      <Calendar className="h-6 w-6 text-primary" />
      Erster Vereinsabend
    </CardTitle>
    <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-0.5 text-xs font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
      Optional
    </span>
  </div>
  <CardDescription>
    Plane direkt deinen nächsten Termin, um deine Mitglieder zu informieren. Du kannst diesen Schritt auch überspringen.
  </CardDescription>
</CardHeader>
```

Make the "Überspringen" button more prominent — move it next to the submit button:
```typescript
<CardFooter className="flex flex-col gap-3 pt-6">
  <Button type="submit" size="lg" className="w-full font-bold" disabled={isLoading}>
    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
    Termin speichern & weiter
  </Button>
  <Button type="button" variant="outline" onClick={() => setStep("finished")} className="w-full">
    Diesen Schritt überspringen
  </Button>
</CardFooter>
```

- [ ] **Step 9: Update `handleCreateEvent` to navigate to finished correctly**

No changes needed — `handleCreateEvent` already calls `setStep("finished")` on success (line 89).

### Task 4: Update handles for new step order

- [ ] **Step 10: Fix handleNextFromMembers references**

Remove the `handleNextFromMembers` call. After sending invitations successfully, the user clicks "Weiter" to go to event step. The event step's navigation from the invitations step is handled by the "Weiter" button (not added yet — need to add it after invitations are sent).

Add a conditional in the invitations step footer: if invitations were sent, show a "Weiter" button instead of "Senden":

```typescript
{sentInvitations.length > 0 ? (
  <Button onClick={() => { setStep("event"); setSentInvitations([]); }} size="lg" className="font-bold">
    Weiter <ChevronRight className="ml-2 h-4 w-4" />
  </Button>
) : (
  ...
)}
```

Actually, let me simplify. After sending, the user can click "Weiter" at any time (either after sending or skip). The footer should show:
- If sentInvitations.length > 0: show "Weiter" button + "Erneut einladen" link
- Always show "Überspringen" button on the left

Let me revise the footer:

```typescript
<CardFooter className="flex justify-between gap-4 pt-6">
  <Button type="button" variant="ghost" onClick={() => setStep("club")}>
    <ChevronLeft className="mr-2 h-4 w-4" /> Zurück
  </Button>
  <div className="flex gap-3">
    {sentInvitations.length > 0 ? (
      <Button onClick={() => setStep("event")} size="lg" className="font-bold">
        Weiter <ChevronRight className="ml-2 h-4 w-4" />
      </Button>
    ) : (
      <>
        <Button type="button" variant="outline" onClick={() => setStep("event")}>
          Überspringen
        </Button>
        <Button type="button" size="lg" className="font-bold" disabled={isLoading || inviteRows.every(r => !r.email)} onClick={handleSendInvitations}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Einladungen senden
        </Button>
      </>
    )}
  </div>
</CardFooter>
```

And add a small "Weitere einladen" link when in sent state:
```typescript
{sentInvitations.length > 0 && (
  <p className="text-center text-sm text-muted-foreground">
    <button onClick={() => setSentInvitations([])} className="underline hover:no-underline">
      Weitere Einladungen hinzufügen
    </button>
  </p>
)}
```

### Task 5: Verify build

- [ ] **Step 11: Build check**

Run: `npm run build` or the project's typecheck command
Expected: No type errors or build failures

- [ ] **Step 12: Commit**

```bash
git add src/app/onboarding/page.tsx
git commit -m "feat: add invitation step to onboarding flow"
```
