# 🏗️ Technische Architektur: Vercel + Supabase

Diese Architektur nutzt **Vercel** für das Hosting der Next.js Anwendung mit globalem CDN und automatischem Edge-Caching. Datenbank, Authentifizierung und Storage werden über **Supabase (EU-Region Frankfurt)** verwaltet.

## Komponenten im Vercel-Setup

| Komponente | Technologie | Aufgabe |
|------------|-------------|---------|
| **Frontend & API** | Next.js auf Vercel | Server-Side Rendering, API-Routen, UI, Edge Functions |
| **Backend-as-a-Service** | Supabase | Auth, PostgreSQL Datenbank, S3 Storage (EU-Frankfurt) |
| **Turnier-Engine** | bbpPairings | FIDE-konforme Schweizer-System Auslosungen via TRF |
| **CDN** | Vercel Edge Network | Globales Caching und optimale Latenz |

## Vorteile

1. **Globales CDN:** Automatisches Edge-Caching weltweit für beste Performance.
2. **Automatisches Skalieren:** Keine Server-Verwaltung, automatische Skalierung bei Lastspitzen.
3. **Zero-Config Deployments:** Git-basiertes Deployment ohne manuelle Server-Konfiguration.
4. **Vereinfachte Infrastruktur:** Durch den Wegfall von Server-Management und Docker.
5. **DSGVO-Konformität:** Supabase EU-Region (Frankfurt) mit Vercel's DSGVO-Compliance.

## Deployment-Ablauf

1. Code wird auf GitHub gepusht
2. Vercel baut die Anwendung automatisch
3. Preview-Deployment für Pull Requests
4. Production-Deployment für den `main` Branch

## Wichtige Konfigurationen

### vercel.json

Das Projekt enthält bereits eine `vercel.json` für:
- Header-Konfiguration (Security Headers)
- Rewrites für Clean URLs
- ISR Einstellungen

### Next.js Konfiguration

- `output: 'standalone'` ist konfiguriert für optimale Serverless-Performance
- Bilder werden über Vercel's Image Optimization CDN ausgeliefert

---

**Siehe auch:**
- [Vercel Deployment Guide](../../README.md#deployment)
- [Supabase Integration](../features/platform-overview.md)
