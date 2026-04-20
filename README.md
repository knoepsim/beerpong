# Beerpong Tournament Manager

Eine moderne Full-Stack Monorepo-Anwendung zur Verwaltung von Beerpong-Turnieren. Das System unterstützt den gesamten Turnier-Lebenszyklus von der Planung über die Gruppenphase bis hin zum KO-Baum, inklusive einer interaktiven Becher-Visualisierung für die Ergebnismeldung.

## 🏗 Architektur

Dieses Projekt ist als **Turborepo Monorepo** strukturiert, um eine saubere Trennung der Verantwortlichkeiten zu gewährleisten und gleichzeitig Code (wie Datenbank-Entitäten) zu teilen.

### Komponenten:
- **`apps/web` (Next.js):** Das Frontend der Anwendung. Nutzt **Next.js 16 (Turbopack)**, **Tailwind CSS** und **Shadcn UI**. Die Authentifizierung erfolgt über **NextAuth.js**.
- **`apps/api` (NestJS):** Das Backend für die Turnierlogik. Nutzt **NestJS 11** für REST-Endpoints und ist für zukünftige Hardware-Integrationen (WebSockets) vorbereitet.
- **`packages/db` (Shared):** Ein geteiltes Paket, das die Datenbank-Logik mittels **MikroORM 6** kapselt. Es nutzt das `EntitySchema`-Muster für maximale Kompatibilität mit dem Next.js-Build-Prozess.

## 🚀 Tech Stack

- **Monorepo Tooling:** [Turborepo](https://turbo.build/), pnpm Workspaces
- **Frontend:** Next.js 16 (React 19), Tailwind CSS, Lucide Icons, Radix UI
- **Backend:** NestJS 11, MikroORM 6
- **Datenbank:** PostgreSQL
- **Authentifizierung:** NextAuth.js (Social Login & Magic Links)

## ✨ Features

- **Turnier-Lifecycle:** Planung -> Check-in -> Gruppenphase -> KO-Phase.
- **Team-Management:** Erstellung von Teams, Beitritt via Link und Check-in System.
- **Automatisierung:** Automatische Generierung von Gruppen-Matches und KO-Bäumen.
- **Echtzeit-Tabellen:** Live-Berechnung von Punkten und Becher-Differenzen.
- **Interaktive Ergebnismeldung:** Einzigartige visuelle Erfassung des Spielstands über ein klickbares 10er-Becher-Dreieck.
- **Hybrid Data Approach:** CRUD für schnellen Zugriff kombiniert mit einem Audit-Log für volle Revisionssicherheit.

## 🛠 Setup & Start

### 1. Voraussetzungen
- Node.js >= 20
- pnpm >= 9
- Eine laufende PostgreSQL Instanz

### 2. Installation
```bash
# Abhängigkeiten installieren
pnpm install
```

### 3. Konfiguration
Erstelle eine `.env` Datei im Root oder in den entsprechenden Apps (siehe `.env.example` in `apps/web`):

```env
DATABASE_URL="postgresql://user:pass@localhost:5432/beerpong"
NEXTAUTH_SECRET="your-secret"
# ... weitere Provider-Secrets
```

### 4. Datenbank Migration
Da MikroORM genutzt wird, müssen die Tabellen initial erstellt werden:
```bash
pnpm --filter @beerpong/db db:migrate
```

### 5. Entwicklung
Starte alle Anwendungen gleichzeitig im Watch-Modus:
```bash
pnpm dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001`

### 6. Build
Erstelle produktionsbereite Builds für alle Pakete:
```bash
pnpm build
```

## 📜 Lizenz
MIT
