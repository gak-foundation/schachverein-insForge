# Blog-Feature Design

## Überblick
Platform-weite Blog-Funktion für die schach.studio Marketing-Seite. Dient der Projekt-Werbung durch Blogartikel über Schachvereins-Verwaltung, Produkt-Updates und Branchennews. Verwaltet durch den Superadmin.

## Datenbank: Tabelle `blog_posts`

| Spalte | Typ | Beschreibung |
|--------|-----|-------------|
| `id` | `uuid PK default gen_random_uuid()` | Primärschlüssel |
| `title` | `text NOT NULL` | Artikeltitel |
| `slug` | `text NOT NULL UNIQUE` | URL-Slug (auto-generiert) |
| `excerpt` | `text` | Kurzbeschreibung für Teaser-Karten |
| `content` | `text` | Markdown-Content |
| `cover_image` | `text` | Cover-Bild URL |
| `author_name` | `text NOT NULL` | Anzeigename des Autors |
| `status` | `text NOT NULL DEFAULT 'draft'` | `draft` / `published` |
| `published_at` | `timestamptz` | Zeitpunkt der Veröffentlichung |
| `created_at` | `timestamptz DEFAULT now()` | Erstellungsdatum |
| `updated_at` | `timestamptz DEFAULT now()` | Letzte Änderung |

## Seiten & Routen

### Frontend (Öffentlich)

1. **Startseite** – `BlogSection` zwischen FAQ und finalem CTA:
   - Überschrift "Neueste aus dem Blog"
   - 3 Karten (Cover, Titel, Excerpt, Datum) → `/blog/[slug]`
   - "Alle Beiträge" Link → `/blog`

2. **`/blog`** – Archivseite:
   - Paginierte Liste aller veröffentlichten Artikel
   - Grid-Layout mit BlogCard-Komponenten
   - Empty State: "Noch keine Blogartikel"

3. **`/blog/[slug]`** – Einzelartikel:
   - Cover-Bild (Hero)
   - Metadaten: Autor, Datum
   - Gerenderter Markdown-Content
   - 404 bei ungültigem Slug

### Admin (Superadmin, unter `/admin/blog`)

1. **`/admin/blog`** – BlogAdminList:
   - Tabelle: Titel, Status (Badge: Entwurf/Veröffentlicht), Datum, Aktionen
   - "Neuer Artikel" Button
   - Edit/Delete per Icon-Button

2. **`/admin/blog/new`** – BlogCreateForm:
   - Titel (Input)
   - Slug (Input, auto-filled aus Titel)
   - Excerpt (Textarea)
   - Cover Image URL (Input)
   - Author Name (Input)
   - Content (Textarea + Live Markdown Preview)
   - Status (Select: draft/published)
   - Published At (Date picker)

3. **`/admin/blog/[id]/edit`** – Gleiches Formular, pre-populated

## Markdown Editor
- **Editieren**: Einfache Textarea
- **Preview**: Live-Vorschau per `react-markdown` + `remark-gfm` + `rehype-sanitize`
- Toggle zwischen Edit/Preview-Modus

## Server Actions

- `createBlogPost(data)` – Zod-Validierung → Service Client INSERT
- `updateBlogPost(id, data)` – Zod-Validierung → Service Client UPDATE
- `deleteBlogPost(id)` – Service Client DELETE
- `getBlogPosts(status?, page?)` – Admin: paginierte Liste aller Posts
- `getPublishedBlogPosts(limit?)` – Frontend: nur published, nach published_at sortiert
- `getBlogPostBySlug(slug)` – Frontend: einzelner published Post
- `getBlogPostById(id)` – Admin: einzelner Post zum Editieren

## Datenfluss

```
Admin (Aktion) → Server Action → Zod Validation → createServiceClient() → PostgreSQL
Public (Anfrage) → Server Component → DB Query → React-Komponente
```

## Abhängigkeiten (neu)
- `react-markdown`
- `rehype-sanitize`
- `remark-gfm`

## Navigation
- Admin-Nav: "Blog" Eintrag in `(admin)/layout.tsx` NavItems
- Marketing-Navbar: optional "Blog" Link

## States
- **Loading**: Skeleton-Karten in BlogSection und BlogList
- **Empty**: "Noch keine Blogartikel" mit EmptyState-Komponente
- **Error**: Standard-Fehlermeldung
- **404**: Eigene Not-Found-Seite für ungültige Slugs

## Ordnerstruktur

```
src/
  app/
    (marketing)/
      page.tsx                          # + BlogSection
      blog/
        page.tsx                        # Blog-Archiv
        [slug]/
          page.tsx                      # Blog-Artikel
    (admin)/
      admin/
        blog/
          page.tsx                      # Admin Blog-Liste
          new/
            page.tsx                    # Admin Create
          [id]/
            edit/
              page.tsx                  # Admin Edit
  features/
    blog/
      actions.ts                        # Server Actions
      components/
        blog-section.tsx                # Homepage-Bereich
        blog-card.tsx                   # Teaser-Karte
        blog-article.tsx                # Artikel-Rendering
        blog-admin-list.tsx             # Admin-Tabelle
        blog-editor.tsx                 # Markdown-Editor
  lib/
    db/
      schema/
        blog.ts                         # TypeScript Typen
      queries/
        blog.ts                         # Query-Helfer
    validations/
      blog.ts                           # Zod-Schemas
```
