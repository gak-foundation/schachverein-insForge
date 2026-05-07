# Mitmachen bei schach.studio

Danke, dass du dich für schach.studio interessierst! Dieses Projekt lebt von der Community, und jede Hilfe ist willkommen — egal ob du Code schreibst, Bugs meldest, Designs vorschlägst oder einfach nur Feedback gibst.

## Wie kann ich helfen?

### 🐛 Bugs melden

Fehler gefunden? Super, hilf uns sie zu finden!

1. Prüfe erst, ob der Bug bereits gemeldet wurde: [Issues durchsuchen](../../issues)
2. Wenn nicht, erstelle ein [neues Issue](../../issues/new?labels=bug&template=bug_report.md) mit:
   - Was hast du gemacht? (Schritt-für-Schritt)
   - Was ist passiert? (Fehlermeldung, Screenshots)
   - Was hättest du erwartet?
   - Browser/OS Version
   - Verein (optional, hilft bei Reproduktion)

### 💡 Features vorschlagen

Du hast eine Idee, wie schach.studio besser werden kann?

1. Prüfe, ob das Feature bereits gewünscht wurde: [Issues durchsuchen](../../issues)
2. Erstelle ein [neues Issue](../../issues/new?labels=enhancement&template=feature_request.md) mit:
   - Was soll das Feature tun?
   - Warum ist es nützlich? (Welches Problem löst es?)
   - Wie könnte es aussehen? (Mockups, Textbeschreibung)

### 🔧 Code beisteuern

Du möchtest direkt Code beisteuern? Fantastisch!

#### Voraussetzungen
- Node.js 20.x
- npm oder bun
- Ein InsForge-Account (für lokale Entwicklung)

#### Setup

1. **Fork & Clone**
   ```bash
   git clone https://github.com/DEIN-USERNAME/schachverein-insForge.git
   cd schachverein-insForge
   ```

2. **Branch erstellen**
   ```bash
   git checkout -b feature/deine-feature-beschreibung
   # oder
   git checkout -b fix/bug-beschreibung
   ```

3. **Umgebung einrichten**
   ```bash
   npm install
   cp .env.example .env.local
   # Fülle .env.local mit deinen InsForge-Daten
   ```

4. **Entwickeln & Testen**
   ```bash
   npm run dev
   ```

5. **Vor dem Commit**
   ```bash
   npm run build    # Muss fehlerfrei durchlaufen
   npm run lint     # Keine Linting-Fehler
   ```

6. **Pull Request erstellen**
   - Beschreibe klar, was dein PR macht
   - Verlinke relevante Issues
   - Füge Screenshots bei UI-Änderungen

#### Code-Stil

- Wir verwenden **TypeScript** streng
- **Tailwind CSS** für Styling (keine Inline-Styles)
- **Zod** für Validierung
- **Server Components** wo möglich, **Client Components** nur wenn nötig
- Deutsche Texte für UI, Englisch für Code-Kommentare

### 🎨 Design & UX

Nicht jeder ist Entwickler — Design-Feedback ist genauso wertvoll!

- Screenshots von Problemen mit Anmerkungen
- Wireframes für neue Features (Figma, Excalidraw, Papier)
- Barrierefreiheit-Feedback (Kontraste, Tastatur-Navigation)
- Textvorschläge für bessere Verständlichkeit

### 🧪 Testen

Hilf uns, schach.studio stabiler zu machen:

- Neue Features ausprobieren und Feedback geben
- Edge Cases testen (z.B. leere Daten, sehr lange Namen)
- Verschiedene Browser testen (Chrome, Firefox, Safari, Edge)
- Mobile Geräte testen (Smartphones, Tablets)

## Co-Maintainer werden

Wir suchen aktiv nach einem Co-Maintainer! Wenn du:

- Regelmäßig Zeit hast (ca. 2-5h/Woche)
- Erfahrung mit Next.js/React hast
- Langfristig mitgestalten möchtest
- Spaß an Open Source hast

Dann schreib uns:
- Öffne ein Issue mit dem Titel "Co-Maintainer Interest"
- Oder schreib eine E-Mail an kontakt@schach.studio
- Erzähle kurz von dir und deiner Erfahrung

## Community

- **GitHub Discussions**: Für Fragen, Ideen und allgemeine Diskussionen
- **Issues**: Für Bugs und konkrete Feature-Requests
- **E-Mail**: kontakt@schach.studio für sensible Anliegen

## Wichtige Grundsätze

- **Sei respektvoll** — Wir sind alle Ehrenamtliche
- **Frage statt annehmen** — Wenn du unsicher bist, frag nach
- **Kleine Schritte** — Lieber ein kleiner PR als ein riesiger
- **Dokumentation** — Neue Features brauchen kurze Erklärungen
- **Barrierefreiheit** — Alle UI-Änderungen müssen WCAG 2.2 AA erfüllen

## Vielen Dank!

Jeder Beitrag zählt — egal wie klein. Du hilfst damit, Schachvereine in ganz Deutschland, Österreich und der Schweiz zu unterstützen. ♟️
