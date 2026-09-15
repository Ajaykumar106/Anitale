# Architecture Decision Records (ADRs)

## ADR 001: Framework Selection
*   **Status:** Accepted
*   **Date:** 2026-09-07
*   **Decision:** We will use Next.js (App Router) with TypeScript.
*   **Rationale:** Provides strong type safety, built-in SEO capabilities through SSR, and a unified full-stack architecture (API and UI in one repo), which is ideal for a fast-paced discovery platform.

## ADR 002: Database & ORM
*   **Status:** Accepted
*   **Date:** 2026-09-07
*   **Decision:** We will use PostgreSQL managed by Prisma ORM.
*   **Rationale:** Relational data model fits perfectly for Users, Media, Collections, and Reviews. Prisma provides excellent type safety and auto-generated migrations.

## ADR 003: UI Styling & Components
*   **Status:** Accepted
*   **Date:** 2026-09-07
*   **Decision:** We will use Tailwind CSS with shadcn/ui.
*   **Rationale:** Enables rapid styling without context switching. shadcn/ui provides highly accessible, copy-pasteable components that we can fully own and customize, avoiding the bloat of traditional component libraries.
