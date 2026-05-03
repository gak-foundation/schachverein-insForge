# Admin-Verbesserungen — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate the top 10 admin pain points across members, tournaments, calendar, finance, communication, CMS, dashboard, and super-admin tools over 6 phases.

**Architecture:** Server Actions + Route Handlers on top of InsForge SDK (PostgREST). No new npm dependencies. All new data stored in InsForge PostgreSQL via `createServiceClient()`. Client components use React Server Components for data fetching, Client Components with `useState`/`useTransition` for interactivity.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, InsForge SDK, Tailwind CSS 4, shadcn/ui, Zustand, Framer Motion

---

## File Structure Map

```
src/
├── app/
│   ├── dashboard/
│   │   ├── calendar/
│   │   │   └── ical/route.ts          [NEW] iCal download endpoint
│   │   ├── kommunikation/
│   │   │   ├── mail-form.tsx           [MODIFY] template selector + attachment
│   │   │   └── page.tsx                [MODIFY] WhatsApp toggle
│   │   ├── members/
│   │   │   └── page.tsx                [MODIFY] bulk action bar state
│   │   ├── tournaments/[id]/
│   │   │   └── page.tsx                [MODIFY] matrix entry tab
│   │   └── finance/
│   │       └── export/route.ts         [NEW] DATEV export endpoint
│   ├── super-admin/
│   │   └── page.tsx                    [MODIFY] impersonation + feature flags
│   ├── clubs/[slug]/
│   │   └── page.tsx                    [MODIFY] announcement banner
│   ├── api/
│   │   ├── auth/
│   │   │   ├── impersonate/route.ts    [NEW] impersonation start
│   │   │   └── unimpersonate/route.ts  [NEW] impersonation end
│   │   ├── admin/
│   │   │   └── feature-flags/route.ts  [NEW] feature flag CRUD
│   │   └── webhooks/
│   │       └── whatsapp/route.ts       [NEW] WhatsApp status webhook
├── features/
│   ├── calendar/
│   │   └── components/
│   │       └── CalendarGrid.tsx        [MODIFY] iCal button
│   ├── cms/components/editor/
│   │   ├── editor-shell.tsx            [MODIFY] split-view preview
│   │   ├── block-renderer.tsx          [MODIFY] announcement block type
│   │   └── blocks/
│   │       └── announcement-banner.tsx [NEW] announcement block
│   │   └── navigation-editor.tsx       [NEW] menu editor
│   ├── kommunikation/
│   │   └── components/
│   │       └── template-selector.tsx   [NEW] email template selector
│   ├── members/components/
│   │   ├── members-table.tsx           [MODIFY] checkbox column
│   │   └── bulk-action-bar.tsx         [NEW] bulk actions UI
│   ├── tournaments/components/
│   │   ├── matrix-result-entry.tsx     [NEW] matrix game input
│   │   └── tournament-template-dialog.tsx [NEW] template dialog
│   ├── dashboard/
│   │   ├── components/
│   │   │   ├── quick-actions-bar.tsx   [NEW] role-specific actions
│   │   │   ├── inline-availability.tsx [NEW] availability toggle
│   │   │   └── announcement-bar.tsx    [NEW] admin announcement bar
│   │   └── pages/
│   │       ├── kassenwart-dashboard.tsx [MODIFY] revenue forecast card
│   │       ├── mitglied-dashboard.tsx   [MODIFY] inline availability
│   │       └── eltern-dashboard.tsx     [MODIFY] "my children" widget
│   ├── admin/components/
│   │   ├── impersonate-button.tsx      [NEW] impersonation trigger
│   │   └── impersonation-banner.tsx    [NEW] impersonation indicator
│   └── finance/components/
│       └── payments-overview.tsx       [MODIFY] export + dunning button
├── lib/
│   ├── ical/
│   │   └── generator.ts               [NEW] iCal string generator
│   ├── email/
│   │   ├── templates.ts               [MODIFY] new templates
│   │   └── placeholder-replacer.ts    [NEW] placeholder substitution
│   ├── export/
│   │   └── datev-csv.ts               [NEW] DATEV CSV generator
│   ├── messaging/
│   │   └── whatsapp.ts                 [NEW] WhatsApp Cloud API
│   ├── feature-flags.ts               [NEW] feature flag system
│   ├── actions/
│   │   ├── bulk-members.ts           [NEW] bulk member operations
│   │   ├── announcements.ts          [NEW] announcement CRUD
│   │   └── navigation.ts             [NEW] menu nav CRUD
│   ├── jobs/
│   │   └── payment-reminders.ts      [NEW] dunning cron logic
│   ├── queries/
│   │   └── revenue-forecast.ts       [NEW] revenue calculation
│   ├── auth/
│   │   └── session.ts               [MODIFY] impersonation support
│   ├── store/
│   │   └── editor-store.ts           [MODIFY] announcement block type
│   └── validations/
│       ├── announcements.ts          [NEW] announcement schema
│       └── tournaments.ts            [MODIFY] matrix result schema
└── proxy.ts                           [MODIFY] impersonation cookies
```

---

## Phase 1 — "Erste Hilfe" (Wochen 1–3, ~35h)

### Task 1.1: iCal Generator Utility

**Files:**
- Create: `src/lib/ical/generator.ts`

- [ ] **Step 1: Create the iCal generator**

```typescript
// src/lib/ical/generator.ts
export interface ICalEvent {
  uid: string;
  dtstart: string; // ISO 8601 date string
  dtend: string;
  summary: string;
  description?: string;
  location?: string;
}

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function formatDate(dateStr: string): string {
  // Converts ISO 8601 to iCal DTSTART/DTEND format: YYYYMMDDTHHMMSS
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export function generateSingleEvent(event: ICalEvent): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Schachverein//DE",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTART:${formatDate(event.dtstart)}`,
    `DTEND:${formatDate(event.dtend)}`,
    `SUMMARY:${escapeText(event.summary)}`,
  ];
  if (event.description) {
    lines.push(`DESCRIPTION:${escapeText(event.description)}`);
  }
  if (event.location) {
    lines.push(`LOCATION:${escapeText(event.location)}`);
  }
  lines.push("END:VEVENT", "END:VCALENDAR");
  return lines.join("\r\n");
}

export function generateCalendarFeed(
  events: ICalEvent[],
  calendarName: string
): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Schachverein//DE",
    "CALSCALE:GREGORIAN",
    `X-WR-CALNAME:${escapeText(calendarName)}`,
    "X-WR-CALDESC:Schachverein Eventkalender",
  ];
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTART:${formatDate(event.dtstart)}`,
      `DTEND:${formatDate(event.dtend)}`,
      `SUMMARY:${escapeText(event.summary)}`,
      event.description ? `DESCRIPTION:${escapeText(event.description)}` : null,
      event.location ? `LOCATION:${escapeText(event.location)}` : null,
      "END:VEVENT"
    );
  }
  lines.push("END:VCALENDAR");
  return lines.filter(Boolean).join("\r\n");
}
```

- [ ] **Step 2: Verify the file was created**

Run: `powershell -Command "Test-Path src/lib/ical/generator.ts"`

- [ ] **Step 3: Commit**

```bash
git add src/lib/ical/generator.ts
git commit -m "feat: add iCal generator utility for RFC 5545 calendar export"
```

---

### Task 1.2: iCal Route Handler (Single Event Download)

**Files:**
- Create: `src/app/dashboard/calendar/ical/route.ts`

- [ ] **Step 1: Ensure directory exists**

```bash
mkdir -p src/app/dashboard/calendar/ical
```

- [ ] **Step 2: Create the route handler**

```typescript
// src/app/dashboard/calendar/ical/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getEventById, getCalendarEvents } from "@/features/calendar/actions";
import { generateSingleEvent, generateCalendarFeed } from "@/lib/ical/generator";
import { startOfYear, endOfYear } from "date-fns";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  if (eventId) {
    const event = await getEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const ical = generateSingleEvent({
      uid: `${event.id}@schachverein`,
      dtstart: event.startDate ?? event.start_date,
      dtend: event.endDate ?? event.end_date ?? event.startDate ?? event.start_date,
      summary: event.title,
      description: event.description ?? "",
      location: event.location ?? "",
    });

    const filename = `${event.title.replace(/[^a-zA-Z0-9\u00C0-\u024F]/g, "_")}.ics`;
    return new NextResponse(ical, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  // Full calendar feed
  const now = new Date();
  const start = startOfYear(now);
  const end = endOfYear(now);
  const events = await getCalendarEvents(start, end);

  const ical = generateCalendarFeed(
    events.map((e: any) => ({
      uid: `${e.id}@schachverein`,
      dtstart: e.start?.toISOString() ?? e.startDate ?? e.start_date,
      dtend: e.end?.toISOString() ?? e.endDate ?? e.end_date ?? e.start?.toISOString() ?? e.startDate ?? e.start_date,
      summary: e.title,
      description: e.description ?? "",
      location: e.location ?? "",
    })),
    "Schachverein Kalender"
  );

  return new NextResponse(ical, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="schachverein.ics"',
    },
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/calendar/ical/route.ts
git commit -m "feat: add iCal route handler for single event download and full calendar feed"
```

---

### Task 1.3: iCal Button in CalendarGrid

**Files:**
- Modify: `src/features/calendar/components/CalendarGrid.tsx:1-12` (imports), after line 158 (return end)

- [ ] **Step 1: Read current CalendarGrid full file to see header area**

Read the section that renders the month navigation header (around lines 59-80 of the file).

- [ ] **Step 2: Add iCal imports and button**

Insert at top imports (line 7, add `CalendarPlus, Download` to the lucide-react import):

```typescript
// Change existing import from:
import { ChevronLeft, ChevronRight, Plus, Repeat } from "lucide-react";
// To:
import { CalendarPlus, ChevronLeft, ChevronRight, Download, Plus, Repeat } from "lucide-react";
```

- [ ] **Step 3: Add iCal button next to the month navigation**

After the header area that renders `prevMonth`/`nextMonth` buttons and the month/year display, add the iCal controls. Find the closing of the header flex container and add before it:

```tsx
{/* After the header navigation row, add iCal controls */}
<div className="flex items-center gap-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => {
      const url = `/dashboard/calendar/ical`;
      window.open(url, "_blank");
    }}
    title="Gesamten Kalender abonnieren"
  >
    <CalendarPlus className="h-4 w-4 mr-1" />
    Abonnieren
  </Button>
</div>
```

- [ ] **Step 4: Verify the file saves correctly**

Run: `powershell -Command "npx tsc --noEmit --pretty" 2>&1 | Select-Object -First 20`

- [ ] **Step 5: Commit**

```bash
git add src/features/calendar/components/CalendarGrid.tsx
git commit -m "feat: add iCal subscribe button to calendar grid"
```

---

### Task 1.4: Placeholder Replacer Utility

**Files:**
- Create: `src/lib/email/placeholder-replacer.ts`

- [ ] **Step 1: Create the placeholder replacer**

```typescript
// src/lib/email/placeholder-replacer.ts

export interface MemberPlaceholders {
  vorname: string;
  nachname: string;
  dwz: string;
  team: string;
  rolle: string;
}

export function replacePlaceholders(
  template: string,
  placeholders: Partial<MemberPlaceholders>
): string {
  let result = template;
  result = result.replace(/\{\{Vorname\}\}/g, placeholders.vorname ?? "");
  result = result.replace(/\{\{Nachname\}\}/g, placeholders.nachname ?? "");
  result = result.replace(/\{\{DWZ\}\}/g, placeholders.dwz ?? "—");
  result = result.replace(/\{\{Team\}\}/g, placeholders.team ?? "");
  result = result.replace(/\{\{Rolle\}\}/g, placeholders.rolle ?? "");
  return result;
}

export function hasValidPlaceholders(template: string): boolean {
  return /\{\{(Vorname|Nachname|DWZ|Team|Rolle)\}\}/.test(template);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/placeholder-replacer.ts
git commit -m "feat: add email placeholder replacer for member personalization"
```

---

### Task 1.5: Email Templates for Admin Communication

**Files:**
- Modify: `src/lib/email/templates.ts`

- [ ] **Step 1: Add communication templates at the end of the file**

After the last existing template function, append:

```typescript
export function welcomeTemplate(clubName: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Willkommen im ${clubName}!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Willkommen im ${clubName}!</h2>
        <p>Hallo {{Vorname}},</p>
        <p>wir freuen uns, dich als neues Mitglied in unserem Schachverein begruessen zu duerfen.</p>
        <p>Hier sind ein paar erste Schritte:</p>
        <ul>
          <li>Schau dir unseren <a href="#">Terminkalender</a> an</li>
          <li>Tritt einer <a href="#">Mannschaft</a> bei</li>
          <li>Nimm an unserem naechsten <a href="#">Training</a> teil</li>
        </ul>
        <p>Bei Fragen melde dich einfach bei deinem Vorstand.</p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde automatisch generiert.</p>
      </div>
    `,
    text: `Willkommen im ${clubName}!\n\nHallo {{Vorname}},\n\nwir freuen uns, dich als neues Mitglied zu begruessen.`,
  };
}

export function paymentReminderTemplate(): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Erinnerung: Mitgliedsbeitrag faellig",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">Zahlungserinnerung</h2>
        <p>Hallo {{Vorname}} {{Nachname}},</p>
        <p>dein Mitgliedsbeitrag ist noch offen. Bitte ueberweise den ausstehenden Betrag zeitnah.</p>
        <p>Bei Fragen zur Zahlung wende dich bitte an den Kassenwart.</p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde automatisch generiert.</p>
      </div>
    `,
    text: `Zahlungserinnerung\n\nHallo {{Vorname}} {{Nachname}},\n\ndein Mitgliedsbeitrag ist noch offen.`,
  };
}

export function tournamentInviteTemplate(tournamentName: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: `Einladung: ${tournamentName}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a1a;">${tournamentName}</h2>
        <p>Hallo {{Vorname}},</p>
        <p>du bist herzlich zum Turnier "${tournamentName}" eingeladen.</p>
        <p>Deine aktuelle DWZ: {{DWZ}}</p>
        <p>Weitere Infos findest du auf der Vereinswebsite.</p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde automatisch generiert.</p>
      </div>
    `,
    text: `Einladung: ${tournamentName}\n\nHallo {{Vorname}},\n\ndu bist herzlich zum Turnier "${tournamentName}" eingeladen.`,
  };
}

export function genericAnnouncementTemplate(): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hallo {{Vorname}},</p>
        <p><!-- Nachricht hier einfuegen --></p>
        <p style="color: #999; font-size: 12px;">Diese E-Mail wurde vom Schachverein versendet.</p>
      </div>
    `,
    text: `Hallo {{Vorname}},\n\n<!-- Nachricht hier einfuegen -->`,
  };
}

export const ADMIN_EMAIL_TEMPLATES = [
  { id: "welcome", label: "Willkommensmail", generator: welcomeTemplate },
  { id: "payment_reminder", label: "Beitragserinnerung", generator: paymentReminderTemplate },
  { id: "tournament_invite", label: "Turniereinladung", generator: tournamentInviteTemplate },
  { id: "generic", label: "Allgemeine Mitteilung", generator: genericAnnouncementTemplate },
] as const;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/templates.ts
git commit -m "feat: add admin communication email templates with placeholders"
```

---

### Task 1.6: Template Selector Component

**Files:**
- Create: `src/features/kommunikation/components/template-selector.tsx`

- [ ] **Step 1: Ensure directory exists**

```bash
mkdir -p src/features/kommunikation/components
```

- [ ] **Step 2: Create the component**

```typescript
// src/features/kommunikation/components/template-selector.tsx
"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Template {
  id: string;
  label: string;
  getSubject: () => string;
  getBody: () => string;
}

interface TemplateSelectorProps {
  value: string | null;
  onChange: (subject: string, body: string) => void;
  templates: Template[];
}

export function TemplateSelector({
  value,
  onChange,
  templates,
}: TemplateSelectorProps) {
  const handleChange = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      onChange(template.getSubject(), template.getBody());
    }
  };

  return (
    <div className="space-y-2">
      <Label>Vorlage (optional)</Label>
      <Select value={value ?? ""} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Keine Vorlage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Keine Vorlage</SelectItem>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Du kannst Platzhalter wie {"{{Vorname}}"}, {"{{Nachname}}"}, {"{{DWZ}}"} verwenden.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/kommunikation/components/template-selector.tsx
git commit -m "feat: add email template selector component"
```

---

### Task 1.7: Integrate Template Selector into MailForm

**Files:**
- Modify: `src/app/dashboard/kommunikation/mail-form.tsx`
- Modify: `src/app/dashboard/kommunikation/page.tsx`

- [ ] **Step 1: Build template definitions in the page component**

Read `src/app/dashboard/kommunikation/page.tsx` (lines 1-33) and modify to pass templates:

```typescript
// src/app/dashboard/kommunikation/page.tsx
import { Metadata } from "next";
import { getMailingLists } from "@/features/kommunikation/actions";
import { getSession } from "@/lib/auth/session";
import { getClubById } from "@/lib/clubs/queries";
import { MailForm } from "./mail-form";
import { Mail } from "lucide-react";
import {
  welcomeTemplate,
  paymentReminderTemplate,
  tournamentInviteTemplate,
  ADMIN_EMAIL_TEMPLATES,
} from "@/lib/email/templates";

export const metadata: Metadata = {
  title: "Kommunikation",
  description: "Rundmails und Newsletter an Vereinsmitglieder senden",
};

export default async function KommunikationPage() {
  const lists = await getMailingLists();
  const session = await getSession();

  const clubName = "dein Verein"; // fallback

  const templateDefinitions = [
    {
      id: "welcome",
      label: "Willkommensmail",
      getSubject: () => welcomeTemplate(clubName).subject,
      getBody: () => welcomeTemplate(clubName).html,
    },
    {
      id: "payment_reminder",
      label: "Beitragserinnerung",
      getSubject: () => paymentReminderTemplate().subject,
      getBody: () => paymentReminderTemplate().html,
    },
    {
      id: "tournament_invite",
      label: "Turniereinladung",
      getSubject: () => tournamentInviteTemplate("").subject,
      getBody: () => tournamentInviteTemplate("").html,
    },
    {
      id: "generic",
      label: "Allgemeine Mitteilung",
      getSubject: () => "",
      getBody: () => "<p>Hallo {{Vorname}},</p><p></p>",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="h-8 w-8 text-primary" />
            Kommunikation
          </h1>
          <p className="text-muted-foreground mt-1">
            Sende E-Mails an verschiedene Gruppen oder Mannschaften deines Vereins.
          </p>
        </div>
      </div>

      <div className="max-w-3xl">
        <MailForm lists={lists} templates={templateDefinitions} />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify MailForm to accept and use templates**

In `src/app/dashboard/kommunikation/mail-form.tsx`:

Add import at top:
```typescript
import { TemplateSelector } from "@/features/kommunikation/components/template-selector";
```

Update interface `MailFormProps`:
```typescript
interface MailFormProps {
  lists: {
    roles: { id: string; label: string }[];
    teams: { id: string; name: string }[];
  };
  templates: {
    id: string;
    label: string;
    getSubject: () => string;
    getBody: () => string;
  }[];
}
```

Update the component signature:
```typescript
export function MailForm({ lists, templates }: MailFormProps) {
```

Add template-related state after existing state declarations (after the `targetId` state):
```typescript
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [subjectValue, setSubjectValue] = useState("");
  const [bodyValue, setBodyValue] = useState("");
```

Add the TemplateSelector above the Subject field in the JSX (before the Subject Input):
```tsx
          <TemplateSelector
            value={selectedTemplate}
            onChange={(subject, body) => {
              setSubjectValue(subject);
              setBodyValue(body);
              setSelectedTemplate(selectedTemplate);
            }}
            templates={templates}
          />

          <div className="space-y-2">
            <Label htmlFor="subject">Betreff</Label>
            <Input
              id="subject"
              name="subject"
              placeholder="Betreff der E-Mail"
              required
              value={subjectValue}
              onChange={(e) => setSubjectValue(e.target.value)}
            />
          </div>
```

Update the body Textarea similarly:
```tsx
          <div className="space-y-2">
            <Label htmlFor="bodyHtml">Inhalt (HTML unterstützt)</Label>
            <Textarea
              id="bodyHtml"
              name="bodyHtml"
              rows={12}
              placeholder="E-Mail Inhalt..."
              required
              value={bodyValue}
              onChange={(e) => setBodyValue(e.target.value)}
            />
          </div>
```

After the Textarea, add the recipient count preview. Find the CardFooter and insert before it:
```tsx
          <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
            Diese E-Mail wird an <strong>{getRecipientCount()}</strong> Empfaenger gesendet.
            {hasPlaceholders() && (
              <span className="block mt-1 text-amber-600">
                Platzhalter werden beim Senden durch die tatsaechlichen Werte ersetzt.
              </span>
            )}
          </div>
```

Add helper functions inside the component before the return:
```typescript
  function getRecipientCount(): number {
    if (targetType === "all") return lists.roles[0] ? -1 : 0; // "Alle Mitglieder" doesn't have a count upfront
    return 0; // count is determined server-side
  }

  function hasPlaceholders(): boolean {
    return /\{\{(Vorname|Nachname|DWZ|Team|Rolle)\}\}/.test(subjectValue + bodyValue);
  }
```

- [ ] **Step 3: Modify sendRundmailAction to handle placeholders**

In `src/features/kommunikation/actions.ts`, update `sendRundmailAction` to import and use the placeholder replacer:

Add import at top:
```typescript
import { replacePlaceholders } from "@/lib/email/placeholder-replacer";
```

After the recipient collection section (after `emails = [...new Set(emails)];`), add a section to fetch member details for personalization:

```typescript
  // Fetch member details for placeholder replacement
  const memberDetailsMap = new Map<string, any>();
  if (/\{\{(Vorname|Nachname|DWZ|Team|Rolle)\}\}/.test(subject + bodyHtml)) {
    const { data: members } = await client
      .from('members')
      .select('id, first_name, last_name, dwz')
      .in('email', emails);
    
    (members || []).forEach((m: any) => {
      memberDetailsMap.set(m.id, { 
        vorname: m.first_name, 
        nachname: m.last_name, 
        dwz: String(m.dwz ?? "—") 
      });
    });
  }
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/kommunikation/mail-form.tsx src/app/dashboard/kommunikation/page.tsx src/features/kommunikation/actions.ts
git commit -m "feat: integrate email template selector and placeholder support into mail form"
```

---

### Task 1.8: Bulk Action Bar Component

**Files:**
- Create: `src/features/members/components/bulk-action-bar.tsx`

- [ ] **Step 1: Create the BulkActionBar component**

```typescript
// src/features/members/components/bulk-action-bar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { X, ChevronDown } from "lucide-react";
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
import { Loader2 } from "lucide-react";

interface BulkActionBarProps {
  selectedIds: string[];
  onClear: () => void;
  contributionRates: { id: string; name: string }[];
  /** Phase 1: set to true to disable action buttons */
  disabled?: boolean;
}

export function BulkActionBar({
  selectedIds,
  onClear,
  contributionRates,
  disabled = true,
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
```

- [ ] **Step 3: Commit**

```bash
git add src/features/members/components/bulk-action-bar.tsx
git commit -m "feat: add bulk action bar component for member operations (UI only in Phase 1)"
```

---

### Task 1.9: Bulk Actions Server Functions (Stub)

**Files:**
- Create: `src/lib/actions/bulk-members.ts`

- [ ] **Step 1: Create stub bulk action server functions**

```typescript
// src/lib/actions/bulk-members.ts
"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function updateMemberStatusBulkAction(
  memberIds: string[],
  newStatus: string
) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  const validStatuses = ["active", "inactive", "resigned", "honorary"];
  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Ungueltiger Status: ${newStatus}`);
  }

  let updated = 0;
  for (const memberId of memberIds) {
    const { error } = await client
      .from("club_memberships")
      .update({ status: newStatus })
      .eq("member_id", memberId)
      .eq("club_id", session.user.clubId);

    if (error) {
      console.error(`Failed to update member ${memberId}:`, error);
      continue;
    }
    updated++;
  }

  revalidatePath("/dashboard/members");
  return { updated, total: memberIds.length };
}

export async function assignContributionRateBulkAction(
  memberIds: string[],
  rateId: string
) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  let updated = 0;
  for (const memberId of memberIds) {
    const { error } = await client
      .from("members")
      .update({ contribution_rate_id: rateId })
      .eq("id", memberId);

    if (error) {
      console.error(`Failed to update member ${memberId}:`, error);
      continue;
    }
    updated++;
  }

  revalidatePath("/dashboard/members");
  return { updated, total: memberIds.length };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/bulk-members.ts
git commit -m "feat: add bulk member status and rate assignment server actions"
```

---

### Task 1.10: Checkbox Column in MembersTable

**Files:**
- Modify: `src/features/members/components/members-table.tsx`

- [ ] **Step 1: Add checkbox props to MembersTable interface**

Update the `MembersTableProps` interface (around line 33):
```typescript
interface MembersTableProps {
  // ... existing props ...
  selectedIds: Set<string>;
  onSelectionChange: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  hasWritePermission: boolean;
}
```

- [ ] **Step 2: Update component signature to accept new props**

```typescript
export function MembersTable({
  members,
  totalCount,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  getSortIcon,
  buildSortLink,
  buildMembersLink,
  statusColors,
  statusLabels,
  hasWritePermission,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  allSelected,
}: MembersTableProps) {
```

- [ ] **Step 3: Add checkbox to table header**

After the opening `<TableHeader>` line, add a checkbox column header before the "Name" column:

```tsx
<TableHead className="w-10">
  {hasWritePermission && (
    <input
      type="checkbox"
      className="h-4 w-4 rounded border-gray-300"
      checked={allSelected}
      onChange={(e) => onSelectAll(e.target.checked)}
      aria-label="Alle auswaehlen"
    />
  )}
</TableHead>
```

- [ ] **Step 4: Add checkbox to each table row**

In the `members.map` callback, add a checkbox cell before the name cell:
```tsx
{members.map((member) => (
  <TableRow key={member.id} className="...">
    {hasWritePermission && (
      <TableCell>
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300"
          checked={selectedIds.has(member.id)}
          onChange={(e) => onSelectionChange(member.id, e.target.checked)}
          onClick={(e) => e.stopPropagation()}
          aria-label={`${member.firstName} ${member.lastName} auswaehlen`}
        />
      </TableCell>
    )}
    <TableCell className="font-semibold ...">
      {/* existing name cell */}
    </TableCell>
    {/* ... rest of existing cells ... */}
  </TableRow>
))}
```

- [ ] **Step 5: Commit**

```bash
git add src/features/members/components/members-table.tsx
git commit -m "feat: add checkbox selection column to members table"
```

---

### Task 1.11: Wire Bulk Selection State on Members Page

**Files:**
- Modify: `src/app/dashboard/members/page.tsx`

- [ ] **Step 1: Convert to client component wrapper for selection state**

The Members page is a server component. We need to either make it a client component or extract the selection state to a client wrapper component. Since it uses `getSession()` and server-side data fetching, we'll create a client wrapper component for the interactive parts.

Create `src/app/dashboard/members/members-page-client.tsx`:

```typescript
// src/app/dashboard/members/members-page-client.tsx
"use client";

import { useState, useCallback } from "react";
import { MembersFilters } from "@/features/members/components/members-filters";
import { MembersTable } from "@/features/members/components/members-table";
import { BulkActionBar } from "@/features/members/components/bulk-action-bar";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Upload } from "lucide-react";
import Link from "next/link";
import { PrintButton } from "@/components/print-button";
import { DwzSyncButton } from "@/features/clubs/components/dwz-sync-button";

interface MembersPageClientProps {
  members: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  sortBy: string;
  sortOrder: string;
  filters: any;
  buildSortLink: (field: string) => string;
  buildMembersLink: (overrides: Record<string, string | undefined>) => string;
  getSortIcon: (field: string) => React.ReactNode;
  statusColors: Record<string, string>;
  statusLabels: Record<string, string>;
  hasWritePermission: boolean;
  hasDwzSyncPermission: boolean;
  contributionRates: { id: string; name: string }[];
}

export function MembersPageClient({
  members,
  totalCount,
  totalPages,
  currentPage,
  sortBy,
  sortOrder,
  filters,
  buildSortLink,
  buildMembersLink,
  getSortIcon,
  statusColors,
  statusLabels,
  hasWritePermission,
  hasDwzSyncPermission,
  contributionRates,
}: MembersPageClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectionChange = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(members.map((m) => m.id)));
    } else {
      setSelectedIds(new Set());
    }
  }, [members]);

  const allSelected = members.length > 0 && selectedIds.size === members.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mitglieder</h1>
          <p className="text-sm text-gray-500">{totalCount} Mitglieder insgesamt</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasWritePermission && (
            <>
              <Link href="/dashboard/members/import">
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import/Export
                </Button>
              </Link>
              <PrintButton />
              <Link href="/dashboard/members/new">
                <Button size="sm">
                  <span className="mr-2">+</span> Neues Mitglied
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      <BulkActionBar
        selectedIds={Array.from(selectedIds)}
        onClear={() => setSelectedIds(new Set())}
        contributionRates={contributionRates}
        disabled={false} // Phase 1 finale - enable bulk ops
      />

      <MembersFilters filters={filters} buildMembersLink={buildMembersLink} />

      <MembersTable
        members={members}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        getSortIcon={getSortIcon}
        buildSortLink={buildSortLink}
        buildMembersLink={buildMembersLink}
        statusColors={statusColors}
        statusLabels={statusLabels}
        hasWritePermission={hasWritePermission}
        selectedIds={selectedIds}
        onSelectionChange={handleSelectionChange}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
      />
    </div>
  );
}
```

- [ ] **Step 2: Modify the server page to use the client wrapper**

Update `src/app/dashboard/members/page.tsx` to import and render the client component at the bottom of the component, replacing the JSX after all the `if (!hasPermission(...))` guard:

```typescript
// Replace the bottom return block (from line 117 onward) with:
import { MembersPageClient } from "./members-page-client";
import { getContributionRates } from "@/features/finance/actions";

// ... inside the component, after all the filter/sort helpers, add:

  const contributionRatesResult = await getContributionRates().catch(() => []);
  const contributionRates = Array.isArray(contributionRatesResult) 
    ? (contributionRatesResult as any[])
    : [];

  return (
    <MembersPageClient
      members={members}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={currentPage}
      sortBy={sortBy}
      sortOrder={sortOrder}
      filters={filters}
      buildSortLink={buildSortLink as any}
      buildMembersLink={buildMembersLink}
      getSortIcon={getSortIcon}
      statusColors={statusColors}
      statusLabels={statusLabels}
      hasWritePermission={hasWritePermission}
      hasDwzSyncPermission={hasPermission(session.user.role ?? "mitglied", session.user.permissions ?? [], PERMISSIONS.DWZ_SYNC, session.user.isSuperAdmin)}
      contributionRates={contributionRates}
    />
  );
```

Remove the existing JSX return block (the `<div className="space-y-6">` through `</div>` at the end of the function).

- [ ] **Step 3: Check if getContributionRates exists**

Search for `getContributionRates`:
```bash
grep -r "getContributionRates" src/features/finance/ --include="*.ts" --include="*.tsx"
```

If it doesn't exist, add it to `src/features/finance/actions.ts`:
```typescript
export async function getContributionRates() {
  const clubId = await requireClubId();
  const client = createServiceClient();
  const { data } = await client
    .from("contribution_rates")
    .select("id, name, amount")
    .eq("club_id", clubId);
  return (data || []) as { id: string; name: string; amount: number }[];
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/members/page.tsx src/app/dashboard/members/members-page-client.tsx src/features/members/components/members-table.tsx
git commit -m "feat: wire bulk selection state into members page with client wrapper"
```

---

This completes Phase 1.

---

## Phase 2 — "Turnier-Revolution" (Wochen 4–7, ~50h)

### Task 2.1: Matrix Result Entry Component

**Files:**
- Create: `src/features/tournaments/components/matrix-result-entry.tsx`

- [ ] **Step 1: Ensure directory exists**

```bash
mkdir -p src/features/tournaments/components
```

- [ ] **Step 2: Create the matrix entry component**

```typescript
// src/features/tournaments/components/matrix-result-entry.tsx
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { saveAllRoundResults } from "@/features/tournaments/actions";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type GameResult = "1-0" | "0-1" | "½-½" | null;
const RESULTS: GameResult[] = [null, "1-0", "½-½", "0-1"];
const RESULT_LABELS: Record<string, string> = {
  "1-0": "1-0",
  "0-1": "0-1",
  "½-½": "½-½",
};
const RESULT_COLORS: Record<string, string> = {
  "1-0": "bg-green-100 text-green-800 border-green-300",
  "0-1": "bg-red-100 text-red-800 border-red-300",
  "½-½": "bg-gray-100 text-gray-800 border-gray-300",
};

interface Player {
  memberId: string;
  firstName: string;
  lastName: string;
  dwz: number | null;
}

interface MatrixResultEntryProps {
  tournamentId: string;
  participants: Player[];
  round: number;
  existingPairings?: { whiteId: string; blackId: string; result?: string }[];
}

interface Cell {
  whiteId: string;
  blackId: string;
  result: GameResult;
}

export function MatrixResultEntry({
  tournamentId,
  participants,
  round,
  existingPairings = [],
}: MatrixResultEntryProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [cells, setCells] = useState<Cell[]>(() => {
    return existingPairings.map((p) => ({
      whiteId: p.whiteId,
      blackId: p.blackId,
      result: (p.result as GameResult) ?? null,
    }));
  });

  function getCell(whiteId: string, blackId: string): Cell | undefined {
    return cells.find((c) => c.whiteId === whiteId && c.blackId === blackId);
  }

  function toggleCell(whiteId: string, blackId: string) {
    if (whiteId === blackId) return;
    setCells((prev) => {
      const existing = prev.find((c) => c.whiteId === whiteId && c.blackId === blackId);
      if (!existing) {
        return [...prev, { whiteId, blackId, result: "1-0" }];
      }
      const idx = RESULTS.indexOf(existing.result);
      const next = RESULTS[(idx + 1) % RESULTS.length];
      if (next === null) {
        return prev.filter((c) => c !== existing);
      }
      return prev.map((c) =>
        c.whiteId === whiteId && c.blackId === blackId ? { ...c, result: next } : c
      );
    });
  }

  function handleSave() {
    startTransition(async () => {
      try {
        const results = cells
          .filter((c) => c.result !== null)
          .map((c) => ({
            whiteId: c.whiteId,
            blackId: c.blackId,
            result: c.result as string,
            round,
            boardNumber: 0,
          }));

        await saveAllRoundResults(tournamentId, results);
        toast({ title: "Gespeichert", description: `${results.length} Ergebnisse gespeichert.` });
      } catch (error: any) {
        toast({
          title: "Fehler",
          description: error.message || "Speichern fehlgeschlagen",
          variant: "destructive",
        });
      }
    });
  }

  const sorted = [...participants].sort((a, b) => (b.dwz ?? 0) - (a.dwz ?? 0));

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="sticky left-0 bg-white border p-2 min-w-[120px] text-left">
                Weiß ↓ / Schwarz →
              </th>
              {sorted.map((p) => (
                <th key={p.memberId} className="border p-2 text-center min-w-[80px] text-xs bg-slate-50">
                  <div>{p.lastName}</div>
                  <div className="text-gray-400">{p.dwz ?? "—"}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((white) => (
              <tr key={white.memberId}>
                <td className="sticky left-0 bg-white border p-2 font-medium text-xs bg-slate-50">
                  {white.lastName}, {white.firstName}
                  <span className="text-gray-400 ml-1">{white.dwz ?? "—"}</span>
                </td>
                {sorted.map((black) => {
                  const cell = getCell(white.memberId, black.memberId);
                  const isSelf = white.memberId === black.memberId;
                  return (
                    <td
                      key={black.memberId}
                      className={`border p-1 text-center cursor-pointer select-none transition-colors ${
                        isSelf
                          ? "bg-slate-100 cursor-default"
                          : cell?.result
                          ? RESULT_COLORS[cell.result]
                          : "hover:bg-blue-50"
                      }`}
                      onClick={() => !isSelf && toggleCell(white.memberId, black.memberId)}
                    >
                      {isSelf ? (
                        <span className="text-gray-300">—</span>
                      ) : cell?.result ? (
                        <span className="font-mono text-xs font-bold">
                          {RESULT_LABELS[cell.result]}
                        </span>
                      ) : (
                        <span className="text-gray-300">·</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Klick auf eine Zelle zum Durchschalten: Leer → 1-0 → ½-½ → 0-1 → Leer
        </p>
        <Button onClick={handleSave} disabled={isPending || cells.length === 0}>
          {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {cells.filter((c) => c.result).length} Ergebnisse speichern
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Add saveAllRoundResults server action**

Append to `src/features/tournaments/actions.ts`:

```typescript
export async function saveAllRoundResults(
  tournamentId: string,
  results: { whiteId: string; blackId: string; result: string; round: number; boardNumber: number }[]
) {
  const clubId = await requireClubId();
  const client = createServiceClient();

  const inserts = results.map((r, i) => ({
    tournament_id: tournamentId,
    club_id: clubId,
    white_id: r.whiteId,
    black_id: r.blackId,
    result: r.result,
    round: r.round,
    board_number: r.boardNumber || i + 1,
  }));

  const { error } = await client.from("games").insert(inserts);
  if (error) throw new Error("Fehler beim Speichern der Ergebnisse: " + error.message);

  revalidatePath(`/dashboard/tournaments/${tournamentId}`);
  return { saved: inserts.length };
}
```

- [ ] **Step 4: Commit**

```bash
git add src/features/tournaments/components/matrix-result-entry.tsx src/features/tournaments/actions.ts
git commit -m "feat: add matrix result entry component and saveAllRoundResults action for tournaments"
```

---

### Task 2.2: Add Matrix Tab to Tournament Detail Page

**Files:**
- Modify: `src/app/dashboard/tournaments/[id]/page.tsx`

- [ ] **Step 1: Add import for MatrixResultEntry**

At top of the file, add:
```typescript
import { MatrixResultEntry } from "@/features/tournaments/components/matrix-result-entry";
```

- [ ] **Step 2: Add "Schnelleingabe" tab**

In the TabsList (around line 301), after the "Teilnehmer" tab trigger, add:
```tsx
<TabsTrigger value="quick-entry" className="flex items-center gap-1 rounded-full border bg-white px-4 py-2">
  <Zap className="h-4 w-4" />
  Schnelleingabe
</TabsTrigger>
```

Add `Zap` to the lucide-react import.

- [ ] **Step 3: Add tab content for quick entry**

After `</TabsContent>` for participants (around line 547), before `</Tabs>`:
```tsx
<TabsContent value="quick-entry">
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-yellow-500" />
        Schnelleingabe
      </CardTitle>
      <CardDescription>
        Trage alle Ergebnisse einer Runde in der Matrix ein.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {participants.length < 2 ? (
        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-gray-500">
          <p>Mindestens 2 Teilnehmer erforderlich.</p>
        </div>
      ) : (
        <MatrixResultEntry
          tournamentId={id}
          participants={participants.map((p: any) => ({
            memberId: p.memberId,
            firstName: p.member.firstName,
            lastName: p.member.lastName,
            dwz: p.member.dwz ?? null,
          }))}
          round={allGames.length > 0 ? Math.max(...allGames.map((g: any) => g.round || 1)) + 1 : 1}
          existingPairings={allGames.map((g: any) => ({
            whiteId: g.whiteId,
            blackId: g.blackId,
            result: g.result,
          }))}
        />
      )}
    </CardContent>
  </Card>
</TabsContent>
```

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/tournaments/[id]/page.tsx
git commit -m "feat: add matrix quick-entry tab to tournament detail page"
```

---

### Task 2.3: Tournament Templates

**Files:**
- Create: `src/lib/data/tournament-templates.ts`
- Create: `src/features/tournaments/components/tournament-template-dialog.tsx`
- Modify: `src/app/dashboard/tournaments/new/page.tsx`

- [ ] **Step 1: Create template data**

```typescript
// src/lib/data/tournament-templates.ts
export interface TournamentTemplate {
  id: string;
  name: string;
  type: string;
  numberOfRounds: number;
  timeControl: string;
  description: string;
}

export const TOURNAMENT_TEMPLATES: TournamentTemplate[] = [
  {
    id: "vereinsmeisterschaft",
    name: "Vereinsmeisterschaft",
    type: "swiss",
    numberOfRounds: 7,
    timeControl: "90min+30s",
    description: "Jährliche Vereinsmeisterschaft im Schweizer System mit 7 Runden.",
  },
  {
    id: "blitz",
    name: "Blitz-Turnier",
    type: "blitz",
    numberOfRounds: 13,
    timeControl: "3min+2s",
    description: "Schnelles Blitzturnier mit 3 Minuten + 2 Sekunden pro Zug.",
  },
  {
    id: "schnellschach",
    name: "Schnellschach-Open",
    type: "rapid",
    numberOfRounds: 5,
    timeControl: "15min+10s",
    description: "Offenes Schnellschachturnier — jeder ist willkommen.",
  },
];
```

- [ ] **Step 2: Create template dialog**

```typescript
// src/features/tournaments/components/tournament-template-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TOURNAMENT_TEMPLATES, type TournamentTemplate } from "@/lib/data/tournament-templates";
import { Clock, Hash, Trophy } from "lucide-react";
import { useState } from "react";

interface TemplateDialogProps {
  onSelect: (template: TournamentTemplate) => void;
}

export function TournamentTemplateDialog({ onSelect }: TemplateDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Trophy className="h-4 w-4 mr-2" />
          Aus Vorlage erstellen
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Turnier-Vorlage waehlen</DialogTitle>
          <DialogDescription>
            Starte mit einer vorkonfigurierten Vorlage.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-4">
          {TOURNAMENT_TEMPLATES.map((t) => (
            <button
              key={t.id}
              className="flex items-start gap-4 rounded-lg border p-4 text-left hover:bg-muted transition-colors"
              onClick={() => {
                onSelect(t);
                setOpen(false);
              }}
            >
              <Trophy className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1">
                <div className="font-semibold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.description}</div>
                <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Hash className="h-3 w-3" /> {t.numberOfRounds} Runden
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {t.timeControl}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Integrate template dialog into new tournament page**

In `src/app/dashboard/tournaments/new/page.tsx`, add import:
```typescript
import { TournamentTemplateDialog } from "@/features/tournaments/components/tournament-template-dialog";
```

Inside the form, add the template button above the form fields. The page likely has a form — add the button and wire up a `useState` + `useEffect` to populate form fields when a template is selected.

- [ ] **Step 4: Commit**

```bash
git add src/lib/data/tournament-templates.ts src/features/tournaments/components/tournament-template-dialog.tsx src/app/dashboard/tournaments/new/page.tsx
git commit -m "feat: add tournament templates with selector dialog"
```

---

### Task 2.4: Revenue Forecast Query

**Files:**
- Create: `src/lib/queries/revenue-forecast.ts`
- Modify: `src/features/dashboard/pages/kassenwart-dashboard.tsx`

- [ ] **Step 1: Create revenue forecast query**

```typescript
// src/lib/queries/revenue-forecast.ts
import { createServiceClient } from "@/lib/insforge";

export async function getRevenueForecast(clubId: string): Promise<{
  yearlyTotal: number;
  monthlyAmount: number;
  memberCount: number;
}> {
  const client = createServiceClient();

  const { data: rates } = await client
    .from("contribution_rates")
    .select("id, name, amount, frequency")
    .eq("club_id", clubId);

  if (!rates || rates.length === 0) {
    return { yearlyTotal: 0, monthlyAmount: 0, memberCount: 0 };
  }

  const { data: memberships } = await client
    .from("club_memberships")
    .select("member_id")
    .eq("club_id", clubId)
    .eq("status", "active");

  const memberIds = (memberships || []).map((m: any) => m.member_id);

  const { data: members } = await client
    .from("members")
    .select("id, contribution_rate_id")
    .in("id", memberIds);

  const memberCount = members?.length ?? 0;

  let yearlyTotal = 0;
  (members || []).forEach((m: any) => {
    const rate = rates.find((r: any) => r.id === m.contribution_rate_id);
    if (!rate) return;
    const amount = Number(rate.amount) || 0;
    if (rate.frequency === "yearly") yearlyTotal += amount;
    else if (rate.frequency === "quarterly") yearlyTotal += amount * 4;
    else yearlyTotal += amount * 12; // monthly
  });

  return {
    yearlyTotal: Math.round(yearlyTotal * 100) / 100,
    monthlyAmount: Math.round((yearlyTotal / 12) * 100) / 100,
    memberCount,
  };
}
```

- [ ] **Step 2: Add revenue card to kassenwart dashboard**

In `src/features/dashboard/pages/kassenwart-dashboard.tsx`, import:
```typescript
import { getRevenueForecast } from "@/lib/queries/revenue-forecast";
```

Add a new stats card before the existing grid:
```tsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
  {/* ... existing cards ... */}
  <StatsCard label="Jahreseinnahmen" value={forecast.yearlyTotal} desc={`${forecast.memberCount} Mitglieder`} icon={Euro} href="/dashboard/finance" />
</div>
```

Where `forecast` comes from a server-level data fetch added to the page's `DashboardData` type and data fetching. The page that renders `KassenwartDashboard` needs to pass this data.

- [ ] **Step 3: Commit**

```bash
git add src/lib/queries/revenue-forecast.ts src/features/dashboard/pages/kassenwart-dashboard.tsx
git commit -m "feat: add revenue forecast query and card to kassenwart dashboard"
```

---

## Phase 3 — "Dashboard wird Cockpit" (Wochen 8–10, ~35h)

### Task 3.1: Quick Actions Bar Component

**Files:**
- Create: `src/features/dashboard/components/quick-actions-bar.tsx`
- Modify: `src/features/dashboard/index.ts` (if exists, else the page component that renders dashboards)

- [ ] **Step 1: Create QuickActionsBar**

```typescript
// src/features/dashboard/components/quick-actions-bar.tsx
"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { RefreshCw, TrendingUp, Users, Calendar, Mail, Shield } from "lucide-react";

interface QuickAction {
  label: string;
  icon?: React.ElementType;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
}

export function QuickActionsBar({ actions }: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => {
        const Icon = action.icon;
        if (action.href) {
          return (
            <Button key={i} variant="outline" size="sm" asChild>
              <Link href={action.href}>
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {action.label}
              </Link>
            </Button>
          );
        }
        return (
          <Button key={i} variant="outline" size="sm" onClick={action.onClick}>
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Add actions to each role dashboard**

For each dashboard component (`mitglied-dashboard.tsx`, `trainer-dashboard.tsx`, etc.), import `QuickActionsBar` and add role-specific actions:

**Mitglied-Dashboard** actions:
```tsx
<QuickActionsBar actions={[
  { label: "Verfügbarkeit melden", icon: Calendar, href: "/dashboard/teams" },
  { label: "Nächstes Spiel", icon: Shield, href: "/dashboard/calendar" },
  { label: "Turniere ansehen", icon: Trophy, href: "/dashboard/tournaments" },
]} />
```

**Kassenwart-Dashboard** actions:
```tsx
<QuickActionsBar actions={[
  { label: "Offene anmahnen", icon: TrendingUp, href: "/dashboard/finance" },
  { label: "Zahlung erfassen", icon: Euro, href: "/dashboard/finance" },
  { label: "SEPA-Export", icon: FileText, href: "/dashboard/finance" },
]} />
```

**Trainer-Dashboard** actions:
```tsx
<QuickActionsBar actions={[
  { label: "Training anlegen", icon: Calendar, href: "/dashboard/calendar/new" },
  { label: "Analysieren", icon: Monitor, href: "/dashboard/games/analysis" },
  { label: "Mitgliederliste", icon: Users, href: "/dashboard/members" },
]} />
```

**Vorstand-Dashboard** actions:
```tsx
<QuickActionsBar actions={[
  { label: "Mitteilung senden", icon: Mail, href: "/dashboard/kommunikation" },
  { label: "Neue Veranstaltung", icon: Calendar, href: "/dashboard/calendar/new" },
  { label: "Mitglieder verwalten", icon: Users, href: "/dashboard/members" },
]} />
```

Similar for Sportwart, Jugendwart, Eltern dashboards.

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/quick-actions-bar.tsx
git add src/features/dashboard/pages/*.tsx
git commit -m "feat: add role-specific quick action buttons to all dashboards"
```

---

### Task 3.2: Announcement Banner System

**Files:**
- Create: `src/lib/actions/announcements.ts`
- Create: `src/features/dashboard/components/announcement-bar.tsx`
- Create: `src/features/cms/components/editor/blocks/announcement-banner.tsx` (new block type)
- Modify: `src/app/clubs/[slug]/page.tsx`
- Modify: `src/lib/store/editor-store.ts:7` (add `announcement` to BlockType)

- [ ] **Step 1: Create the announcements table via SQL**

Use the InsForge `run-raw-sql` MCP tool:
```sql
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id UUID NOT NULL REFERENCES clubs(id),
  title TEXT NOT NULL,
  content TEXT,
  type TEXT DEFAULT 'info',
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT now(),
  valid_until TIMESTAMPTZ,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

- [ ] **Step 2: Create announcement server actions**

```typescript
// src/lib/actions/announcements.ts
"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function createAnnouncement(formData: FormData) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  const { error } = await client.from("announcements").insert({
    club_id: session.user.clubId,
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    type: (formData.get("type") as string) || "info",
    valid_until: formData.get("validUntil") || null,
  });

  if (error) throw new Error("Fehler beim Erstellen der Ankündigung");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getActiveAnnouncements(clubId: string) {
  const client = createServiceClient();
  const { data } = await client
    .from("announcements")
    .select("*")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .gte("valid_until", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(5);

  return (data || []) as any[];
}

export async function deactivateAnnouncement(id: string) {
  const session = await requireClubAuth();
  const client = createServiceClient();
  const { error } = await client
    .from("announcements")
    .update({ is_active: false })
    .eq("id", id);

  if (error) throw new Error("Fehler beim Deaktivieren");
  revalidatePath("/dashboard");
  return { success: true };
}
```

- [ ] **Step 3: Create announcement bar component**

```typescript
// src/features/dashboard/components/announcement-bar.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { deactivateAnnouncement } from "@/lib/actions/announcements";

const TYPE_STYLES: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

export function AnnouncementBar({ announcement }: { announcement: any }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 mb-6 ${
        TYPE_STYLES[announcement.type] || TYPE_STYLES.info
      }`}
    >
      <div>
        <span className="font-semibold">{announcement.title}</span>
        {announcement.content && (
          <span className="ml-2 text-sm opacity-80">{announcement.content}</span>
        )}
      </div>
      <button
        onClick={() => {
          setDismissed(true);
          deactivateAnnouncement(announcement.id);
        }}
        className="shrink-0 p-1 rounded hover:bg-black/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Add block type to editor store**

In `src/lib/store/editor-store.ts`, extend `BlockType`:
```typescript
export type BlockType = 
  | "text" 
  | "image" 
  | "button" 
  | "hero" 
  | "columns" 
  | "divider" 
  | "contactForm" 
  | "tournamentCard"
  | "announcement"; // ADD THIS
```

- [ ] **Step 5: Render announcements on public club page**

In `src/app/clubs/[slug]/page.tsx`, before the hero section, fetch and render announcements:
```typescript
import { getActiveAnnouncements } from "@/lib/actions/announcements";

// in the component, before hero:
const announcements = rawClub ? await getActiveAnnouncements(rawClub.id) : [];
```

Then at the top of the return:
```tsx
{announcements.map((a: any) => (
  <AnnouncementBar key={a.id} announcement={a} />
))}
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/actions/announcements.ts src/features/dashboard/components/announcement-bar.tsx src/lib/store/editor-store.ts src/app/clubs/[slug]/page.tsx
git commit -m "feat: add announcement banner system with create/deactivate/render"
```

---

### Task 3.3: CMS Live Preview — Split View Layout

**Files:**
- Modify: `src/features/cms/components/editor/editor-shell.tsx`
- Create: `src/features/cms/components/editor/preview-panel.tsx`

- [ ] **Step 1: Create preview panel component**

```typescript
// src/features/cms/components/editor/preview-panel.tsx
"use client";

import { useEditorStore, type Block } from "@/lib/store/editor-store";
import { BlockRenderer } from "./block-renderer";
import { Button } from "@/components/ui/button";
import { RefreshCw, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

export function PreviewPanel() {
  const blocks = useEditorStore((s) => s.blocks);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [renderKey, setRenderKey] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-xs font-medium text-muted-foreground">Vorschau</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode("desktop")}
            data-active={viewMode === "desktop"}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode("mobile")}
            data-active={viewMode === "mobile"}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setRenderKey((k) => k + 1)}
            title="Vorschau aktualisieren"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div
          className={viewMode === "mobile" ? "max-w-[375px] mx-auto" : "max-w-4xl mx-auto"}
          key={renderKey}
        >
          {blocks.map((block: Block) => (
            <BlockRenderer key={block.id} block={block} preview />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Modify editor-shell to use split layout**

In `src/features/cms/components/editor/editor-shell.tsx`, after the `<BlockList />` inside the Canvas area, add the right panel. Replace the existing return JSX structure (the outer div) with a split layout:

After line 158 (closing `</div>` of the main content area), change:
```tsx
{/* Replace the existing "Right Sidebar: Inspector" section */}
<div className="w-80 border-l bg-background overflow-y-auto shrink-0">
  <BlockInspector />
</div>
```

To:
```tsx
{/* Right: Preview Panel replaced Inspector in split mode */}
<div className="flex-1 border-l bg-background overflow-hidden shrink-0 hidden xl:block">
  <PreviewPanel />
</div>
{/* Inspector as slide-over instead */}
<Sheet>
  <SheetTrigger asChild>
    <Button variant="ghost" size="sm" className="xl:hidden fixed right-4 top-20 z-50">
      <Settings className="h-4 w-4" />
    </Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-80">
    <BlockInspector />
  </SheetContent>
</Sheet>
```

Add imports at top:
```typescript
import { PreviewPanel } from "./preview-panel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Settings } from "lucide-react";
```

- [ ] **Step 3: Commit**

```bash
git add src/features/cms/components/editor/preview-panel.tsx src/features/cms/components/editor/editor-shell.tsx
git commit -m "feat: add CMS live preview panel with desktop/mobile toggle"
```

---

## Phase 4 — "Finanz-Finish" (Wochen 11–14, ~45h)

### Task 4.1: DATEV CSV Export

**Files:**
- Create: `src/lib/export/datev-csv.ts`
- Create: `src/app/dashboard/finance/export/route.ts`
- Modify: `src/features/finance/components/payments-overview.tsx`

- [ ] **Step 1: Create DATEV CSV generator**

```typescript
// src/lib/export/datev-csv.ts
export interface DatevLine {
  umsatz: string;
  sollkonto: string;
  habenkonto: string;
  betrag: string;
  buchungstext: string;
  belegdatum: string;
  gegenkonto?: string;
  kost1?: string;
  kost2?: string;
}

function csvEscape(value: string): string {
  if (value.includes(";") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

const HEADERS = [
  "Umsatz", "Sollkonto", "Habenkonto", "Betrag", "Buchungstext",
  "Belegdatum", "Gegenkonto", "KOST1", "KOST2"
];

export function generateDatevCSV(lines: DatevLine[]): string {
  const rows = lines.map((l) =>
    [
      csvEscape(l.umsatz),
      csvEscape(l.sollkonto),
      csvEscape(l.habenkonto),
      csvEscape(l.betrag),
      csvEscape(l.buchungstext),
      csvEscape(l.belegdatum),
      csvEscape(l.gegenkonto || ""),
      csvEscape(l.kost1 || ""),
      csvEscape(l.kost2 || ""),
    ].join(";")
  );

  return [HEADERS.join(";"), ...rows].join("\r\n");
}
```

- [ ] **Step 2: Create export route handler**

```typescript
// src/app/dashboard/finance/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/insforge";
import { generateDatevCSV, type DatevLine } from "@/lib/export/datev-csv";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user.clubId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { paymentIds } = await request.json();
  if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
    return NextResponse.json({ error: "Keine Zahlungen ausgewaehlt" }, { status: 400 });
  }

  const client = createServiceClient();
  const { data: payments, error } = await client
    .from("payments")
    .select("*, member:members!member_id(first_name, last_name)")
    .in("id", paymentIds);

  if (error) {
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  const lines: DatevLine[] = (payments || []).map((p: any) => ({
    umsatz: p.status === "paid" ? "Einnahme" : "offen",
    sollkonto: "1200", // Standard DATEV Sachkonto
    habenkonto: "8400",
    betrag: String(p.amount || 0),
    buchungstext: `${p.description || "Beitrag"} - ${p.member?.first_name || ""} ${p.member?.last_name || ""}`,
    belegdatum: p.due_date || new Date().toISOString().split("T")[0],
    gegenkonto: "1000",
  }));

  const csv = generateDatevCSV(lines);
  const filename = `DATEV_Export_${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
```

- [ ] **Step 3: Add export button to payments overview**

In `src/features/finance/components/payments-overview.tsx`, add a "DATEV Export" button near the existing export controls:
```tsx
<Button
  variant="outline"
  size="sm"
  onClick={async () => {
    const selectedIds = payments.map((p: any) => p.id); // or use checkbox selection
    const res = await fetch("/dashboard/finance/export", {
      method: "POST",
      body: JSON.stringify({ paymentIds: selectedIds }),
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Export failed");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "DATEV_Export.csv";
    a.click();
  }}
>
  <Download className="h-4 w-4 mr-2" />
  DATEV Export
</Button>
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/export/datev-csv.ts src/app/dashboard/finance/export/route.ts src/features/finance/components/payments-overview.tsx
git commit -m "feat: add DATEV CSV export for payments"
```

---

### Task 4.2: Automatic Payment Reminders

**Files:**
- Create: `src/lib/jobs/payment-reminders.ts`
- Modify: `src/features/finance/components/payments-overview.tsx`
- Modify: `src/features/finance/actions.ts`

- [ ] **Step 1: Create payment reminder logic**

```typescript
// src/lib/jobs/payment-reminders.ts
"use server";

import { createServiceClient } from "@/lib/insforge";
import { sendEmailDirect } from "@/lib/auth/email";
import { replacePlaceholders } from "@/lib/email/placeholder-replacer";
import { paymentReminderTemplate } from "@/lib/email/templates";

export async function sendPaymentReminders(clubId: string): Promise<{
  sent: number;
  errors: string[];
}> {
  const client = createServiceClient();

  // Find overdue payments without dunning sent
  const { data: overdue, error } = await client
    .from("payments")
    .select("id, member_id, amount, description, member:members!member_id(email, first_name, last_name)")
    .eq("club_id", clubId)
    .eq("status", "overdue")
    .is("dunning_sent_at", null);

  if (error || !overdue) return { sent: 0, errors: [error?.message ?? "Keine Daten"] };

  const template = paymentReminderTemplate();
  let sent = 0;
  const errors: string[] = [];

  for (const payment of overdue) {
    const member = (payment as any).member;
    if (!member?.email) continue;

    try {
      const body = replacePlaceholders(template.html, {
        vorname: member.first_name ?? "",
        nachname: member.last_name ?? "",
      });

      await sendEmailDirect(undefined, template.subject, body, "", [member.email]);

      // Mark as sent
      await client
        .from("payments")
        .update({ dunning_sent_at: new Date().toISOString() })
        .eq("id", (payment as any).id);

      sent++;
    } catch (err: any) {
      errors.push(`${member.email}: ${err.message}`);
    }
  }

  return { sent, errors };
}
```

- [ ] **Step 2: Add "dunning_sent_at" column via SQL**

Use the InsForge `run-raw-sql` MCP tool:

```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS dunning_sent_at TIMESTAMPTZ;
```

- [ ] **Step 3: Add dunning button to payments overview**

In `src/features/finance/components/payments-overview.tsx`, add after existing buttons:
```tsx
<form action={async () => {
  const result = await sendPaymentReminders(session.user.clubId!);
  toast({ title: "Erinnerungen gesendet", description: `${result.sent} Emails verschickt.` });
}}>
  <Button variant="outline" size="sm" type="submit">
    <Send className="h-4 w-4 mr-2" />
    Ueberfaellige anmahnen
  </Button>
</form>
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/jobs/payment-reminders.ts src/features/finance/components/payments-overview.tsx
git commit -m "feat: add automatic payment reminder with dunning tracking"
```

---

### Task 4.3: CMS Navigation Editor

**Files:**
- Create: `src/features/cms/components/navigation-editor.tsx`
- Create: `src/lib/actions/navigation.ts`
- Modify: `src/components/public/Navbar.tsx`

- [ ] **Step 1: Create navigation server actions**

```typescript
// src/lib/actions/navigation.ts
"use server";

import { createServiceClient } from "@/lib/insforge";
import { requireClubAuth } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function saveNavigation(pageIds: string[]) {
  const session = await requireClubAuth();
  const client = createServiceClient();

  const { error } = await client
    .from("clubs")
    .update({ navigation_pages: pageIds })
    .eq("id", session.user.clubId);

  if (error) throw new Error("Fehler beim Speichern der Navigation");
  revalidatePath("/dashboard/pages");
}

export async function getNavigation(clubId: string): Promise<string[]> {
  const client = createServiceClient();
  const { data } = await client
    .from("clubs")
    .select("navigation_pages")
    .eq("id", clubId)
    .maybeSingle();

  return (data as any)?.navigation_pages ?? [];
}
```

- [ ] **Step 2: Create navigation editor component**

```typescript
// src/features/cms/components/navigation-editor.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveNavigation } from "@/lib/actions/navigation";
import { useToast } from "@/components/ui/use-toast";
import { GripVertical, X, Loader2 } from "lucide-react";

interface Page { id: string; title: string; slug: string; }

export function NavigationEditor({ pages }: { pages: Page[] }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const togglePage = (pageId: string) => {
    setSelected((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  };

  const available = pages.filter((p) => !selected.includes(p.id));
  const ordered = selected.map((id) => pages.find((p) => p.id === id)).filter(Boolean) as Page[];

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...selected];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSelected(next);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNavigation(selected);
      toast({ title: "Navigation gespeichert" });
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {available.map((p) => (
          <Button key={p.id} variant="outline" size="sm" onClick={() => togglePage(p.id)}>
            + {p.title}
          </Button>
        ))}
      </div>
      <div className="border rounded-lg divide-y">
        {ordered.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="flex-1 font-medium">{p.title}</span>
            <span className="text-xs text-gray-400">/{p.slug}</span>
            <Button variant="ghost" size="icon" onClick={() => moveUp(i)}>↑</Button>
            <Button variant="ghost" size="icon" onClick={() => togglePage(p.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {ordered.length === 0 && (
          <p className="p-4 text-sm text-gray-400">Keine Seiten im Menue</p>
        )}
      </div>
      <Button onClick={handleSave} disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Speichern
      </Button>
    </div>
  );
}
```

- [ ] **Step 3: Integrate into public Navbar**

In `src/components/public/Navbar.tsx`, replace hardcoded navigation links with dynamic data. Use `getNavigation()` to filter and order pages. The Navbar should accept `navigationPages: Page[]` as a prop, and the page component calls `getNavigation(clubId)` to pass them.

- [ ] **Step 4: Commit**

```bash
git add src/lib/actions/navigation.ts src/features/cms/components/navigation-editor.tsx src/components/public/Navbar.tsx
git commit -m "feat: add CMS navigation editor for public club menu"
```

---

## Phase 5 — "Kommunikation & Admin-Tools" (Wochen 15–18, ~50h)

### Task 5.1: Email Attachments in MailForm

**Files:**
- Modify: `src/app/dashboard/kommunikation/mail-form.tsx`
- Modify: `src/features/kommunikation/actions.ts`

- [ ] **Step 1: Add file upload input to MailForm**

In `mail-form.tsx`, add after the Textarea:
```tsx
<div className="space-y-2">
  <Label htmlFor="attachments">Anhaenge (optional, max 10 MB)</Label>
  <Input
    id="attachments"
    name="attachments"
    type="file"
    multiple
    accept=".pdf,.png,.jpg,.jpeg,.gif,.doc,.docx"
  />
  <p className="text-xs text-muted-foreground">
    Maximale Dateigroesse: 10 MB pro Datei. Erlaubte Formate: PDF, Bilder, Word.
  </p>
</div>
```

- [ ] **Step 2: Upload attachments in server action**

In `src/features/kommunikation/actions.ts`, update `sendRundmailAction`:

```typescript
import { uploadFile } from "@/lib/storage";

// Inside sendRundmailAction, add attachment handling before the sendEmailDirect call:
const attachmentUrls: string[] = [];
const attachmentFiles = formData.getAll("attachments") as File[];

for (const file of attachmentFiles) {
  if (file instanceof File && file.size > 0) {
    const result = await uploadFile(
      `mail-attachments/${session.user.clubId}/${Date.now()}_${file.name}`,
      file
    );
    if (result.url) attachmentUrls.push(result.url);
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/kommunikation/mail-form.tsx src/features/kommunikation/actions.ts
git commit -m "feat: add email attachment support to communication module"
```

---

### Task 5.2: Impersonation Mode

**Files:**
- Create: `src/app/api/auth/impersonate/route.ts`
- Create: `src/app/api/auth/unimpersonate/route.ts`
- Create: `src/features/admin/components/impersonation-banner.tsx`
- Modify: `src/lib/auth/session.ts`
- Modify: `src/proxy.ts` (middleware)
- Modify: `src/app/super-admin/super-admin-dashboard.tsx`

- [ ] **Step 1: Create impersonation API routes**

```typescript
// src/app/api/auth/impersonate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId } = await request.json();
  if (!clubId) {
    return NextResponse.json({ error: "clubId required" }, { status: 400 });
  }

  const payload = JSON.stringify({
    adminId: session.user.id,
    targetClubId: clubId,
    ts: Date.now(),
  });

  // Sign with env secret for tamper-proofing
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.IMPERSONATION_SECRET || process.env.NEXT_PUBLIC_ROOT_DOMAIN),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = Array.from(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload)))
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const response = NextResponse.redirect(new URL("/dashboard", request.url));
  response.cookies.set("impersonation_payload", payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 3600, // 1 hour
  });
  response.cookies.set("impersonation_sig", sig, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 3600,
  });

  return response;
}
```

```typescript
// src/app/api/auth/unimpersonate/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/super-admin", request.url));
  response.cookies.delete("impersonation_payload");
  response.cookies.delete("impersonation_sig");
  return response;
}
```

- [ ] **Step 2: Modify session.ts to support impersonation**

In `src/lib/auth/session.ts`, add a function at the end:

```typescript
import { cookies } from "next/headers";

export async function getImpersonationTarget(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = cookieStore.get("impersonation_payload")?.value;
  const sig = cookieStore.get("impersonation_sig")?.value;
  if (!payload || !sig) return null;

  // Verify signature
  const secret = process.env.IMPERSONATION_SECRET || process.env.NEXT_PUBLIC_ROOT_DOMAIN || "fallback";
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]
  );
  const expectedSig = Array.from(new Uint8Array(await crypto.subtle.sign("HMAC", key, encoder.encode(payload))))
    .map((b) => b.toString(16).padStart(2, "0")).join("");

  if (sig !== expectedSig) return null;

  const data = JSON.parse(payload);
  if (Date.now() - data.ts > 3600000) return null; // expired

  return data.targetClubId;
}
```

- [ ] **Step 3: Create impersonation banner component**

```typescript
// src/features/admin/components/impersonation-banner.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export function ImpersonationBanner({ clubName }: { clubName?: string }) {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-white px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        <span className="text-sm font-medium">
          Sie sind eingeloggt als {clubName || "Verein"}. (Impersonation-Modus)
        </span>
      </div>
      <form action="/api/auth/unimpersonate" method="POST">
        <Button size="sm" variant="secondary" type="submit">
          Zurueck zum Admin
        </Button>
      </form>
    </div>
  );
}
```

- [ ] **Step 4: Add impersonate button to super-admin dashboard**

In the super-admin dashboard table (clubs list), add a button per row:
```tsx
<form action="/api/auth/impersonate" method="POST">
  <input type="hidden" name="clubId" value={club.id} />
  <Button type="submit" size="sm" variant="ghost">
    Als Verein einloggen
  </Button>
</form>
```

Update the impersonate route to accept `formData` instead of JSON (POST from form).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/auth/impersonate/route.ts src/app/api/auth/unimpersonate/route.ts src/features/admin/components/impersonation-banner.tsx src/lib/auth/session.ts
git commit -m "feat: add impersonation mode for super admins"
```

---

### Task 5.2b: WhatsApp Cloud API Integration

**Files:**
- Create: `src/lib/messaging/whatsapp.ts`
- Modify: `src/app/dashboard/kommunikation/mail-form.tsx`
- Modify: `src/features/kommunikation/actions.ts`

- [ ] **Step 1: Create WhatsApp API client**

```typescript
// src/lib/messaging/whatsapp.ts

const WHATSAPP_API = "https://graph.facebook.com/v21.0";

interface WhatsAppTemplateMessage {
  to: string; // phone number
  templateName: string;
  languageCode?: string;
  params: string[]; // {{1}}, {{2}}, etc.
}

export async function sendWhatsAppBroadcast(
  messages: WhatsAppTemplateMessage[]
): Promise<{ sent: number; errors: string[] }> {
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  const token = process.env.WHATSAPP_TOKEN;

  if (!phoneId || !token) {
    return { sent: 0, errors: ["WhatsApp nicht konfiguriert (WHATSAPP_PHONE_ID/WHATSAPP_TOKEN)"] };
  }

  let sent = 0;
  const errors: string[] = [];

  for (const msg of messages) {
    try {
      const res = await fetch(`${WHATSAPP_API}/${phoneId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: msg.to,
          type: "template",
          template: {
            name: msg.templateName,
            language: { code: msg.languageCode || "de" },
            components: [
              {
                type: "body",
                parameters: msg.params.map((text) => ({ type: "text", text })),
              },
            ],
          },
        }),
      });

      if (res.ok) {
        sent++;
      } else {
        const errBody = await res.text();
        errors.push(`${msg.to}: ${errBody}`);
      }
    } catch (err: any) {
      errors.push(`${msg.to}: ${err.message}`);
    }
  }

  return { sent, errors };
}

export const WHATSAPP_TEMPLATES = [
  { id: "verein_ankuendigung", label: "Vereinsankündigung", params: 3 },
  { id: "turnier_erinnerung", label: "Turniererinnerung", params: 3 },
  { id: "training_ausfall", label: "Trainingsausfall", params: 3 },
];
```

- [ ] **Step 2: Add WhatsApp toggle to MailForm**

In `src/app/dashboard/kommunikation/mail-form.tsx`, add after the target type selection:
```tsx
<div className="flex items-center gap-2">
  <input
    type="checkbox"
    id="sendWhatsApp"
    name="sendWhatsApp"
    className="h-4 w-4 rounded border-gray-300"
    disabled={!process.env.NEXT_PUBLIC_WHATSAPP_ENABLED}
  />
  <Label htmlFor="sendWhatsApp" className="cursor-pointer">
    Auch per WhatsApp senden
  </Label>
</div>
```

- [ ] **Step 3: Wire WhatsApp dispatch in server action**

In `src/features/kommunikation/actions.ts`, after the email send section, add:
```typescript
import { sendWhatsAppBroadcast } from "@/lib/messaging/whatsapp";
import { isFeatureEnabled } from "@/lib/feature-flags";

// Inside sendRundmailAction, after email sending:
const sendWhatsApp = formData.get("sendWhatsApp") === "on";
const whatsAppEnabled = await isFeatureEnabled("whatsapp_integration", clubId);

if (sendWhatsApp && whatsAppEnabled) {
  const phoneNumbers: string[] = [];
  // Fetch phone numbers for recipients
  const { data: phones } = await client
    .from("members")
    .select("id, phone")
    .in("email", emails);

  const messages = (phones || []).filter((p: any) => p.phone).map((p: any) => ({
    to: p.phone,
    templateName: "verein_ankuendigung",
    params: [memberDetailsMap.get(p.id)?.vorname ?? "", clubName, subject],
  }));

  const waResult = await sendWhatsAppBroadcast(messages);
  console.log(`WhatsApp: ${waResult.sent} sent, ${waResult.errors.length} errors`);
}
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/messaging/whatsapp.ts src/app/dashboard/kommunikation/mail-form.tsx src/features/kommunikation/actions.ts
git commit -m "feat: add WhatsApp Cloud API broadcast integration"
```

---

### Task 5.3: Feature Flag System

**Files:**
- Create: `src/lib/feature-flags.ts`
- Create: `src/app/api/admin/feature-flags/route.ts`
- Modify: `src/app/super-admin/super-admin-dashboard.tsx`

- [ ] **Step 1: Create feature flags module**

```typescript
// src/lib/feature-flags.ts
import { createServiceClient } from "@/lib/insforge";

export type FeatureFlag =
  | "whatsapp_integration"
  | "matrix_tournament_input"
  | "bulk_member_operations"
  | "datev_export"
  | "live_tournament_ticker";

export const ALL_FLAGS: { key: FeatureFlag; label: string; default: boolean }[] = [
  { key: "whatsapp_integration", label: "WhatsApp Integration", default: false },
  { key: "matrix_tournament_input", label: "Matrix-Ergebniseingabe", default: true },
  { key: "bulk_member_operations", label: "Bulk-Mitglieder-Operationen", default: true },
  { key: "datev_export", label: "DATEV-Export", default: true },
  { key: "live_tournament_ticker", label: "Live-Turnier-Ticker", default: false },
];

export async function isFeatureEnabled(
  flag: FeatureFlag,
  clubId: string
): Promise<boolean> {
  const client = createServiceClient();
  const { data } = await client
    .from("clubs")
    .select("feature_flags")
    .eq("id", clubId)
    .maybeSingle();

  const defaultVal = ALL_FLAGS.find((f) => f.key === flag)?.default ?? false;
  const flags = (data as any)?.feature_flags ?? {};
  return flags[flag] ?? defaultVal;
}

export async function setFeatureFlag(
  clubId: string,
  flag: FeatureFlag,
  enabled: boolean
) {
  const client = createServiceClient();
  const { data: current } = await client
    .from("clubs")
    .select("feature_flags")
    .eq("id", clubId)
    .maybeSingle();

  const flags = (current as any)?.feature_flags ?? {};
  flags[flag] = enabled;

  await client
    .from("clubs")
    .update({ feature_flags: flags })
    .eq("id", clubId);
}
```

- [ ] **Step 2: Create feature flags API route**

```typescript
// src/app/api/admin/feature-flags/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { setFeatureFlag, ALL_FLAGS } from "@/lib/feature-flags";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user.isSuperAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { clubId, flag, enabled } = await request.json();
  await setFeatureFlag(clubId, flag, enabled);
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json(ALL_FLAGS);
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/feature-flags.ts src/app/api/admin/feature-flags/route.ts
git commit -m "feat: add feature flag system with club-level toggles"
```

---

## Phase 6 — Polishing (Wochen 19–20, ~25h)

### Task 6.1: CSV Import Duplicate Check

**Files:**
- Modify: `src/lib/csv/members.ts` (or wherever CSV import logic lives)

- [ ] Add duplicate detection before insert: hash from `firstName + lastName + dateOfBirth`, warn if match found. Show confirmation dialog listing potential duplicates.

### Task 6.2: DWZ Average per Board in Team Detail

**Files:**
- Modify: `src/app/dashboard/teams/[id]/page.tsx`

- [ ] Add query to compute `AVG(dwz)` grouped by `boardNumber` for team members, display alongside board order.

### Task 6.3: Tournament Pairing Print View

**Files:**
- Modify: `src/app/dashboard/tournaments/[id]/page.tsx`

- [ ] Add `@media print` CSS styles for the Standings/Rankings table. Add print button.

### Task 6.4: "Today" Button in Calendar

**Files:**
- Modify: `src/features/calendar/components/CalendarGrid.tsx`

- [ ] Add a `<Button variant="outline" size="sm" onClick={() => setCurrentMonth(new Date())}>Heute</Button>` between the prev/next month buttons.

### Task 6.5: "My Children" Widget for Parents

**Files:**
- Modify: `src/features/dashboard/pages/eltern-dashboard.tsx`

- [ ] Query `members` where `parent_id = session.user.memberId`, list with status, next event link per child.

### Task 6.6: E2E Tests

- [ ] Create: `e2e/bulk-operations.spec.ts` — test selecting 3 members and changing status
- [ ] Create: `e2e/matrix-input.spec.ts` — test clicking cells in matrix and saving
- [ ] Create: `e2e/impersonation.spec.ts` — test super admin impersonates a club

```typescript
// e2e/bulk-operations.spec.ts
import { test, expect } from "@playwright/test";

test("bulk status change", async ({ page }) => {
  // Login as admin with write permission
  await page.goto("/auth/login");
  await page.fill('[name="email"]', "admin@test.de");
  await page.fill('[name="password"]', "password123");
  await page.click('button[type="submit"]');

  // Navigate to members
  await page.goto("/dashboard/members");
  await page.waitForSelector('[aria-label*="auswaehlen"]');

  // Select 2 members
  const checkboxes = page.locator('[aria-label*="auswaehlen"]');
  await checkboxes.nth(0).click();
  await checkboxes.nth(1).click();

  // Expect bulk bar to appear
  await expect(page.getByText("2 ausgewaehlt")).toBeVisible();

  // Open status dropdown
  await page.getByText("Status aendern").click();
  await page.getByText("Inaktiv").click();

  // Confirm
  await page.getByText("Bestaetigen").click();

  // Expect success toast
  await expect(page.getByText("Mitglieder aktualisiert")).toBeVisible();
});
```

- [ ] **Commit all Phase 6 changes**

```bash
git add src/lib/csv/members.ts src/app/dashboard/teams/[id]/page.tsx src/features/calendar/components/CalendarGrid.tsx src/features/dashboard/pages/eltern-dashboard.tsx e2e/
git commit -m "fix: add audit polish — duplicate check, DWZ board avg, print view, today button, parent widget, e2e tests"
```

---

## Plan Completion Checklist

- [x] Phase 1: iCal + Email Templates + Bulk Operations (11 tasks)
- [x] Phase 2: Matrix Entry + Templates + Revenue Forecast (4 tasks)
- [x] Phase 3: Quick Actions + Announcement Banner + CMS Live Preview (3 tasks)
- [x] Phase 4: DATEV Export + Payment Reminders + CMS Navigation (3 tasks)
- [x] Phase 5: Email Attachments + Impersonation + WhatsApp + Feature Flags (5 tasks)
- [x] Phase 6: Polishing + E2E Tests (6 tasks)

**Total: ~32 tasks over 20 weeks, ~240 hours**
