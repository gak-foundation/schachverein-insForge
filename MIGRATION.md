# Migrationsplan: Drizzle ORM -> InsForge SDK

## Ziel
Komplette Migration von Drizzle ORM + direkter PostgreSQL-Verbindung auf InsForge SDK (PostgREST API) für alle Datenbankoperationen. Entfernung aller Drizzle-Abhängigkeiten.

## Architektur-Änderungen

### 1. Datenbank-Zugriff
- **Vorher**: `drizzle-orm` + `postgres-js` direkte Verbindung
- **Nachher**: Nur `@insforge/sdk` via `client.database.from('table')`

### 2. Auth
- **Vorher**: InsForge Auth + eigene `auth_user` Tabelle (Synchronisierung)
- **Nachher**: Nur InsForge Auth, keine eigene `auth_user` Tabelle mehr. Profildaten in `profiles` Tabelle oder direkt über InsForge Auth User Object.

### 3. Schema
- **Vorher**: Drizzle Schema-Definitionen (`pgTable`, `pgEnum`, etc.)
- **Nachher**: Reine TypeScript Interfaces/Typen für Typ-Sicherheit

### 4. Queries
- **Vorher**: Drizzle Query Builder (`db.select().from().where()`)
- **Nachher**: InsForge SDK (`client.from('table').select('*').eq('id', id)`)

## Umgebungsvariablen

### Entfernen:
- `DATABASE_URL`
- `DIRECT_URL`

### Beibehalten:
- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`
- `INSFORGE_SERVICE_ROLE_KEY`
- Alle anderen (SMTP, OAuth, etc.)

## Schritt-für-Schritt Umsetzung

### Phase 1: Infrastruktur (Sofort)
1. ✅ `AGENTS.md` aktualisieren
2. `package.json` - Drizzle-Abhängigkeiten entfernen
3. `drizzle.config.ts` löschen
4. `.env.example` - DB-Variablen entfernen
5. `src/lib/db/index.ts` - Umbauen zu InsForge-Client Export
6. `src/lib/db/schema/*` - In reine TypeScript-Typen umwandeln

### Phase 2: Queries (Priorität: Hoch)
7. `src/lib/db/queries/auth.ts` - Auf InsForge SDK umstellen
8. `src/lib/queries/*` - Alle Query-Dateien migrieren
9. `src/lib/clubs/queries.ts` - Migrieren
10. `src/lib/billing/queries.ts` - Migrieren

### Phase 3: Actions (Priorität: Hoch)
11. `src/lib/actions/*` - Alle Server Actions migrieren
12. `src/features/*/actions.ts` - Feature Actions migrieren
13. `src/features/auth/actions.ts` - Auth Actions vereinfachen
14. `src/features/auth/gdpr-actions.ts` - Migrieren

### Phase 4: Auth-System (Priorität: Hoch)
15. `src/lib/auth/session.ts` - InsForge Auth direkt nutzen
16. `src/lib/auth/client.ts` - Vereinfachen
17. `src/lib/auth/permissions.ts` - Beibehalten (kein DB-Zugriff)
18. `src/lib/db/schema/auth.ts` -> `src/types/auth.ts` (Typen)
19. Eigene `auth_user` Tabellen-Referenzen entfernen

### Phase 5: API Routes (Priorität: Mittel)
20. `src/app/api/*` - Alle API Routes auf InsForge SDK umstellen

### Phase 6: Aufräumen (Priorität: Mittel)
21. `scripts/` - DB-bezogene Scripts entfernen/ersetzen
22. `src/lib/db/migrate.ts` löschen
23. `src/lib/db/rls.ts` löschen (RLS über InsForge)
24. Tests aktualisieren
25. `npm install` ausführen
26. Build testen

## Code-Muster

### Vorher (Drizzle):
```typescript
import { db } from "@/lib/db";
import { members } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const [member] = await db.select().from(members).where(eq(members.id, id)).limit(1);
```

### Nachher (InsForge SDK):
```typescript
import { createServiceClient } from "@/lib/insforge";

const client = createServiceClient();
const { data, error } = await client
  .from('members')
  .select('*')
  .eq('id', id)
  .single();
  
if (error) throw error;
const member = data;
```

### Insert:
```typescript
const { data, error } = await client
  .from('members')
  .insert([{ name: 'Max', email: 'max@example.com' }])
  .select()
  .single();
```

### Update:
```typescript
const { data, error } = await client
  .from('members')
  .update({ name: 'Max Mustermann' })
  .eq('id', id)
  .select()
  .single();
```

### Delete:
```typescript
const { error } = await client
  .from('members')
  .delete()
  .eq('id', id);
```

### Joins:
```typescript
const { data } = await client
  .from('members')
  .select('*, clubs(*)')
  .eq('id', id)
  .single();
```

## Risiken & Mitigation

1. **Performance**: InsForge REST API ist langsamer als direkte DB-Verbindung
   - Mitigation: Service Role Client für Server-Side, Caching mit React Query
   
2. **RLS**: InsForge RLS Policies müssen korrekt konfiguriert sein
   - Mitigation: `run-raw-sql` für RLS-Setup, Tests für jede Tabelle
   
3. **TypeScript-Typen**: Keine automatische Typ-Inferenz mehr
   - Mitigation: Manuelle Interfaces in `src/types/`
   
4. **Migration der Daten**: Bestehende Daten müssen in InsForge bleiben
   - Mitigation: InsForge nutzt bereits dieselbe PostgreSQL-DB, nur Zugriffsweg ändert sich

## Abhängigkeiten

- `@insforge/sdk` muss installiert sein ✅
- InsForge Backend muss alle Tabellen haben ✅
- RLS Policies müssen korrekt sein -> Prüfen
