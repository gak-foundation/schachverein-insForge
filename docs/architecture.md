# Architektur & Tech Stack

## System-Übersicht

Die Schachvereins-Software ist als Multi-Tenant (Multi-Club) Anwendung konzipiert. Das bedeutet, dass eine Instanz der Software mehrere Vereine gleichzeitig verwalten kann, wobei die Daten strikt voneinander getrennt sind.

## Technologie-Stack

### Core Frameworks
| Komponente | Technologie |
|---|---|
| **Framework** | Next.js 16 (App Router, Server Components) |
| **Sprache** | TypeScript 5.8 (Strict) |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **Datenbank** | PostgreSQL 17 |
| **ORM** | Drizzle ORM |
| **Authentifizierung** | Better Auth 1.6 |
| **State Management** | Zustand 5.0 (Client-seitig) |

### Schach-spezifische Bibliotheken
- **chess.js**: Validierung von Zügen, FEN-Parsing.
- **react-chessboard**: Interaktives Frontend-Schachbrett.
- **bbpPairings**: Schweizer System Pairing Engine (via Docker/CLI).

### Infrastruktur
- **Redis**: Caching, Rate-Limiting und BullMQ-Backend.
- **BullMQ**: Queue für E-Mail-Versand und Hintergrundprozesse.
- **MinIO / S3**: Speicherung von Dokumenten und Protokollen.

## Projektstruktur

- src/app: Next.js App Router (Pages, Layouts)
- src/components: Wiederverwendbare UI-Komponenten (shadcn/ui)
- src/lib/actions/: Server Actions für Datenmutationen (nach Thema aufgeteilt, Einstieg `index.ts`)
- src/lib/db: Datenbank-Schema und Drizzle-Konfiguration
- src/lib/auth: Authentifizierungs-Konfiguration und RBAC-Logik
- src/lib/validations: Zod-Schemas für Formular-Validierung
- src/proxy.ts: Middleware für Routenschutz und Auth-Validierung