# Vorstand-Test UX-Verbesserungen - Implementierungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vier konkrete UX-Verbesserungen implementieren: Dashboard-Cockpit, Schnelleingabe-Modus, Mitglied-Wizard, Demo-Modus.

**Architecture:** Inkrementelle Verbesserungen auf bestehender Architektur aufbauend. Neue Komponenten neben bestehenden platzieren, existierende Server Actions erweitern.

**Tech Stack:** Next.js 16.2, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, react-hook-form, zod, InsForge SDK

---

## Datei-Struktur

### Neue Dateien
- `src/features/dashboard/components/attention-widget.tsx` – Rollenspezifische Aufmerksamkeits-Widgets
- `src/features/dashboard/components/attention-card.tsx` – Einzelne Aufmerksamkeits-Karte
- `src/features/members/components/member-wizard.tsx` – 3-Schritte-Wizard fuer Neumitglieder
- `src/features/members/components/member-wizard-step.tsx` – Wizard-Schritt-Wrapper
- `src/app/dashboard/tournaments/[id]/quick-entry/page.tsx` – Mobile Schnelleingabe-Route
- `src/app/(marketing)/demo/page.tsx` – Oeffentliche Demo-Seite
- `src/components/marketing/demo-manager.tsx` – Interaktiver Demo-Walkthrough

### Modifizierte Dateien
- `src/features/audit/actions.ts` – Neue rollenspezifische Queries
- `src/app/dashboard/page.tsx` – AttentionWidget in alle Dashboards einbinden
- `src/features/dashboard/pages/vorstand-dashboard.tsx`
- `src/features/dashboard/pages/kassenwart-dashboard.tsx`
- `src/features/dashboard/pages/spielleiter-dashboard.tsx`
- `src/features/tournaments/components/matrix-result-entry.tsx` – Touch-Optimierung + Offline-Support
- `src/app/dashboard/tournaments/[id]/page.tsx` – Schnelleingabe-Tab hinzufuegen
- `src/app/dashboard/members/new/page.tsx` – Wizard statt MemberForm

---

## Phase 1: Dashboard-Cockpit

### Task 1: Erweiterte Dashboard-Queries

**Files:**
- Modify: `src/features/audit/actions.ts`

- [ ] **Step 1: Neue Typ-Definitionen hinzufuegen**

Fuege am Anfang der Datei (nach den Imports) hinzu:

```typescript
export interface AttentionItem {
  id: string;
  label: string;
  count: number;
  href: string;
  urgency: 'critical' | 'warning' | 'ok';
  icon: string;
  actionLabel: string;
}
```

- [ ] **Step 2: Query fuer Kassenwart-Aufgaben**

Fuege nach `getDashboardStats()` hinzu:

```typescript
export async function getKassenwartAttentionItems(clubId: string): Promise<AttentionItem[]> {
  const client = createServiceClient();
  const items: AttentionItem[] = [];

  const { count: overdueCount } = await client
    .from('payments')
    .select('id', { count: 'exact' })
    .eq('club_id', clubId)
    .eq('status', 'overdue');

  if (overdueCount && overdueCount > 0) {
    items.push({
      id: 'overdue-payments',
      label: 'Ueberfaellige Zahlungen',
      count: Number(overdueCount),
      href: '/dashboard/finance',
      urgency: 'critical',
      icon: 'AlertCircle',
      actionLabel: 'Jetzt pruefen',
    });
  }

  const { count: pendingCount } = await client
    .from('payments')
    .select('id', { count: 'exact' })
    .eq('club_id', clubId)
    .eq('status', 'pending');

  if (pendingCount && pendingCount > 0) {
    items.push({
      id: 'pending-payments',
      label: 'Ausstehende Zahlungen',
      count: Number(pendingCount),
      href: '/dashboard/finance',
      urgency: 'warning',
      icon: 'Wallet',
      actionLabel: 'Anzeigen',
    });
  }

  return items;
}
```

- [ ] **Step 3: Query fuer Spielleiter-Aufgaben**

```typescript
export async function getSpielleiterAttentionItems(clubId: string): Promise<AttentionItem[]> {
  const client = createServiceClient();
  const items: AttentionItem[] = [];

  const { data: activeTournaments } = await client
    .from('tournaments')
    .select('id, name, current_round')
    .eq('club_id', clubId)
    .eq('is_completed', false);

  let missingResultsCount = 0;
  for (const tournament of activeTournaments || []) {
    const { count } = await client
      .from('games')
      .select('id', { count: 'exact' })
      .eq('tournament_id', tournament.id)
      .eq('round', tournament.current_round || 1)
      .is('result', null);
    missingResultsCount += Number(count || 0);
  }

  if (missingResultsCount > 0) {
    items.push({
      id: 'missing-results',
      label: 'Fehlende Ergebnisse',
      count: missingResultsCount,
      href: '/dashboard/tournaments',
      urgency: 'critical',
      icon: 'Trophy',
      actionLabel: 'Ergebnisse eintragen',
    });
  }

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const { count: upcomingTournamentCount } = await client
    .from('tournaments')
    .select('id', { count: 'exact' })
    .eq('club_id', clubId)
    .eq('is_completed', false)
    .lte('start_date', nextWeek.toISOString());

  if (upcomingTournamentCount && upcomingTournamentCount > 0) {
    items.push({
      id: 'upcoming-tournaments',
      label: 'Bald startende Turniere',
      count: Number(upcomingTournamentCount),
      href: '/dashboard/tournaments',
      urgency: 'warning',
      icon: 'Calendar',
      actionLabel: 'Vorbereiten',
    });
  }

  return items;
}
```

- [ ] **Step 4: Query fuer Vorstand-Aufgaben**

```typescript
export async function getVorstandAttentionItems(clubId: string): Promise<AttentionItem[]> {
  const client = createServiceClient();
  const items: AttentionItem[] = [];

  const { count: pendingInvitations } = await client
    .from('invitations')
    .select('id', { count: 'exact' })
    .eq('club_id', clubId)
    .eq('status', 'pending');

  if (pendingInvitations && pendingInvitations > 0) {
    items.push({
      id: 'pending-invitations',
      label: 'Offene Einladungen',
      count: Number(pendingInvitations),
      href: '/dashboard/einladungen',
      urgency: 'warning',
      icon: 'Mail',
      actionLabel: 'Einladungen verwalten',
    });
  }

  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const { count: membersWithoutPayment } = await client
    .from('payments')
    .select('id', { count: 'exact' })
    .eq('club_id', clubId)
    .eq('status', 'overdue')
    .lt('due_date', ninetyDaysAgo.toISOString());

  if (membersWithoutPayment && membersWithoutPayment > 0) {
    items.push({
      id: 'members-without-payment',
      label: 'Mitglieder ohne Zahlung > 90 Tage',
      count: Number(membersWithoutPayment),
      href: '/dashboard/finance',
      urgency: 'critical',
      icon: 'Users',
      actionLabel: 'Anmahnen',
    });
  }

  return items;
}
```

- [ ] **Step 5: Wrapper-Funktion**

```typescript
export async function getDashboardDataWithAttention(role: string, clubId: string) {
  const stats = await getDashboardStats();
  let attentionItems: AttentionItem[] = [];

  switch (role) {
    case 'kassenwart':
      attentionItems = await getKassenwartAttentionItems(clubId);
      break;
    case 'spielleiter':
      attentionItems = await getSpielleiterAttentionItems(clubId);
      break;
    case 'admin':
    case 'vorstand':
      attentionItems = await getVorstandAttentionItems(clubId);
      break;
  }

  return { stats, attentionItems };
}
```

- [ ] **Step 6: Commit**

```bash
git add src/features/audit/actions.ts
git commit -m "feat: add role-specific attention queries for dashboard cockpit"
```

---

### Task 2: AttentionWidget Komponente

**Files:**
- Create: `src/features/dashboard/components/attention-card.tsx`
- Create: `src/features/dashboard/components/attention-widget.tsx`

- [ ] **Step 1: AttentionCard erstellen**

```tsx
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AlertCircle, Wallet, Trophy, Calendar, Mail, Users, type LucideIcon } from 'lucide-react';
import type { AttentionItem } from '@/features/audit/actions';

const iconMap: Record<string, LucideIcon> = {
  AlertCircle, Wallet, Trophy, Calendar, Mail, Users
};

const urgencyStyles = {
  critical: { card: 'border-red-200 bg-red-50/50 hover:border-red-300', badge: 'bg-red-100 text-red-700', icon: 'text-red-600' },
  warning: { card: 'border-amber-200 bg-amber-50/50 hover:border-amber-300', badge: 'bg-amber-100 text-amber-700', icon: 'text-amber-600' },
  ok: { card: 'border-emerald-200 bg-emerald-50/50 hover:border-emerald-300', badge: 'bg-emerald-100 text-emerald-700', icon: 'text-emerald-600' },
};

export function AttentionCard({ item }: { item: AttentionItem }) {
  const Icon = iconMap[item.icon] || AlertCircle;
  const styles = urgencyStyles[item.urgency] || urgencyStyles.warning;

  return (
    <Link href={item.href} className={cn('group block rounded-xl border p-5 transition-all hover:shadow-md', styles.card)}>
      <div className='flex items-start justify-between'>
        <div className='flex-1'>
          <div className='flex items-center gap-2 mb-2'>
            <span className={cn('inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-bold', styles.badge)}>
              {item.count}
            </span>
            <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
              {item.label}
            </span>
          </div>
          <p className='text-sm font-semibold text-foreground group-hover:text-primary transition-colors'>
            {item.actionLabel}
          </p>
        </div>
        <div className={cn('rounded-lg p-2', styles.icon)}>
          <Icon className='h-5 w-5' />
        </div>
      </div>
    </Link>
  );
}
```

- [ ] **Step 2: AttentionWidget erstellen**

```tsx
'use client';

import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { AttentionCard } from './attention-card';
import type { AttentionItem } from '@/features/audit/actions';

export function AttentionWidget({ items, roleLabel }: { items: AttentionItem[]; roleLabel: string }) {
  if (items.length === 0) {
    return (
      <div className='rounded-xl border border-emerald-200 bg-emerald-50/30 p-5'>
        <p className='text-sm text-emerald-700 font-medium'>
          Alles erledigt! Keine dringenden Aufgaben fuer {roleLabel}.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-baseline justify-between'>
        <div>
          <h2 className='text-xl font-heading tracking-tight text-foreground'>Aufmerksamkeit erforderlich</h2>
          <p className='text-muted-foreground text-sm mt-1'>Dringende Aufgaben fuer {roleLabel}</p>
        </div>
      </div>
      <ScrollArea className='w-full whitespace-nowrap'>
        <div className='flex w-max space-x-4 pb-4'>
          {items.map((item) => (
            <div key={item.id} className='w-[280px] shrink-0'>
              <AttentionCard item={item} />
            </div>
          ))}
        </div>
        <ScrollBar orientation='horizontal' />
      </ScrollArea>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/features/dashboard/components/
git commit -m "feat: add AttentionWidget and AttentionCard components"
```

---

### Task 3: Dashboard-Integration

**Files:**
- Modify: `src/app/dashboard/page.tsx`
- Modify: `src/features/dashboard/pages/vorstand-dashboard.tsx`
- Modify: `src/features/dashboard/pages/kassenwart-dashboard.tsx`
- Modify: `src/features/dashboard/pages/spielleiter-dashboard.tsx`

- [ ] **Step 1: DashboardPage erweitern**

Ersetze in `src/app/dashboard/page.tsx`:
- Import: `import { getDashboardDataWithAttention } from '@/features/audit/actions';`
- Stats-Abruf durch `const { stats, attentionItems } = await getDashboardDataWithAttention(role, clubId);` ersetzen
- `attentionItems` an `dashboardData` uebergeben

- [ ] **Step 2: AttentionWidget in Vorstand-Dashboard einbinden**

In `vorstand-dashboard.tsx`:
- Import: `import { AttentionWidget } from '../components/attention-widget';`
- Nach `<WelcomeHeader />` einfuegen: `<AttentionWidget items={attentionItems || []} roleLabel="Vorstand" />`

- [ ] **Step 3: Gleiches fuer Kassenwart und Spielleiter**

- [ ] **Step 4: Commit**

```bash
git add src/app/dashboard/page.tsx src/features/dashboard/pages/
git commit -m "feat: integrate AttentionWidget into role dashboards"
```

---

## Phase 2: Schnelleingabe-Modus

### Task 4: MatrixResultEntry erweitern

**Files:**
- Modify: `src/features/tournaments/components/matrix-result-entry.tsx`

- [ ] **Step 1: Touch-Optimierung und Offline-Support**

Erweitere die Komponente um:
- Online/Offline-Status-Anzeige mit `navigator.onLine`
- `localStorage`-Persistenz mit Key `tournament-results-${tournamentId}-${round}`
- Groessere Touch-Ziele (min-h-[44px] min-w-[44px])
- Keyboard-Navigation (Enter/Space zum Umschalten)
- ARIA-Labels fuer Screenreader

- [ ] **Step 2: Commit**

```bash
git add src/features/tournaments/components/matrix-result-entry.tsx
git commit -m "feat: add touch optimization and offline support to matrix result entry"
```

---

### Task 5: Schnelleingabe-Route

**Files:**
- Create: `src/app/dashboard/tournaments/[id]/quick-entry/page.tsx`

- [ ] **Step 1: Quick-Entry Seite erstellen**

Erstelle eine Vollbild-Seite mit:
- Turnier- und Teilnehmerladung via Server Component
- `MatrixResultEntry` mit `saveAllRoundResults` Server Action
- Sticky Header mit Turniername und Runde
- Mobile-optimiertes Layout

- [ ] **Step 2: Schnelleingabe-Tab in Turnier-Detailseite**

In `src/app/dashboard/tournaments/[id]/page.tsx`:
- Neuen Tab ">Schnelleingabe>" hinzufuegen
- Link zu `/dashboard/tournaments/${id}/quick-entry`

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/tournaments/
git commit -m "feat: add quick-entry page and tab for tournament result input"
```

---

## Phase 3: Mitglied-Wizard

### Task 6: Wizard-Komponente

**Files:**
- Create: `src/features/members/components/member-wizard-step.tsx`
- Create: `src/features/members/components/member-wizard.tsx`

- [ ] **Step 1: Wizard-Schritt-Wrapper**

Erstelle `member-wizard-step.tsx` mit:
- `WizardProgress`: Fortschrittsbalken mit 3 Schritten
- `MemberWizardStep`: Animierter Schritt-Wrapper (fade-in + slide)

- [ ] **Step 2: Haupt-Wizard**

Erstelle `member-wizard.tsx` mit:
- `react-hook-form` + `zodResolver`
- 3 Schritte: Stammdaten (6 Felder), Status & Beitrag (4 Felder), Zusammenfassung
- `sessionStorage`-Zwischenspeicherung (Key: `member-wizard-draft`)
- Entwurf-Wiederherstellungs-Prompt
- Validierung pro Schritt
- Inline-Bearbeitung in Zusammenfassung

- [ ] **Step 3: Commit**

```bash
git add src/features/members/components/
git commit -m "feat: add 3-step member wizard with draft persistence"
```

---

### Task 7: Neue-Mitglied-Seite umstellen

**Files:**
- Modify: `src/app/dashboard/members/new/page.tsx`

- [ ] **Step 1: Seite mit Wizard ersetzen**

- Lade `contributionRates` via Server Component
- Verwende `<MemberWizard contributionRates={...} />` statt `<MemberForm />`
- Aktualisiere `metadata`

- [ ] **Step 2: Commit**

```bash
git add src/app/dashboard/members/new/page.tsx
git commit -m "feat: replace member form with wizard on new member page"
```

---

## Phase 4: Demo-Modus

### Task 8: Demo-Manager

**Files:**
- Create: `src/components/marketing/demo-manager.tsx`
- Create: `src/app/(marketing)/demo/page.tsx`

- [ ] **Step 1: Demo-Manager erstellen**

Erstelle `demo-manager.tsx` mit:
- 4 Tabs: Dashboard, Mitglieder, Turniere, Finanzen
- Statische Demo-Daten (SC Musterhausen)
- Interaktive Elemente mit Tooltips
- `localStorage`-Tracking (`demoCompleted`)
- CTA-Button zur Registrierung

- [ ] **Step 2: Demo-Seite erstellen**

Erstelle `src/app/(marketing)/demo/page.tsx`:
- Marketing-Layout
- `<DemoManager />` einbinden
- SEO-Metadaten

- [ ] **Step 3: MiniManager erweitern**

In `mini-manager.tsx`: Link zur Demo-Seite hinzufuegen

- [ ] **Step 4: Commit**

```bash
git add src/components/marketing/demo-manager.tsx src/app/(marketing)/demo/page.tsx
git commit -m "feat: add interactive demo mode for marketing website"
```

---

## Test-Checkliste

### Dashboard-Cockpit
- [ ] Kassenwart sieht ueberfaellige Zahlungen
- [ ] Spielleiter sieht fehlende Ergebnisse
- [ ] Vorstand sieht offene Einladungen
- [ ] Mobile: Horizontales Scrollen funktioniert

### Schnelleingabe
- [ ] Touch-Ziele >= 44x44px
- [ ] Offline: Daten bleiben nach Browser-Schliessen erhalten
- [ ] Automatische Synchronisierung bei Netzwerk

### Mitglied-Wizard
- [ ] Maximal 6 Felder pro Schritt
- [ ] Kein Datenverlust bei Browser-Schliessen
- [ ] Validierung pro Schritt blockiert "Weiter"

### Demo-Modus
- [ ] Kein Login erforderlich
- [ ] Alle Tabs navigierbar
- [ ] Tastatur-navigierbar
- [ ] CTA fuehrt zu Registrierung
