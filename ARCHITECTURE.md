# Anitale Architecture

## 1. High-Level Architecture
The application uses a modern full-stack Next.js architecture with the App Router, providing Server-Side Rendering (SSR) and React Server Components (RSC).

### Layers
1.  **UI Layer:** React Server and Client Components using Tailwind CSS and accessible primitives (shadcn/ui). Client components are minimized and used only for interactivity.
2.  **Application Layer:** Next.js Server Actions and Route Handlers for mutating data and serving internal API requests.
3.  **Domain/Service Layer:** Business logic for managing users, media, watchlists, etc.
4.  **Data Access Layer (DAL):** Prisma ORM for interacting with the PostgreSQL database.
5.  **External Providers Layer:** Isolated adapters for communicating with third-party APIs (TMDB, AniList).

## 2. Folder Structure

```
d:\Anitale\
├── src/
│   ├── app/                # Next.js App Router (pages, layouts, route handlers)
│   ├── components/         # Reusable React components
│   │   ├── ui/             # Base UI primitives (buttons, inputs)
│   │   ├── layout/         # Header, Footer, Navigation
│   │   ├── media/          # Media cards, details, carousels
│   │   └── ...
│   ├── lib/                # Shared utilities and configurations
│   │   ├── prisma.ts       # Prisma client instantiation
│   │   ├── utils.ts        # Helper functions
│   │   └── ...
│   ├── services/           # Domain logic and business rules
│   │   ├── auth/
│   │   ├── user/
│   │   ├── media/
│   │   └── search/
│   ├── providers/          # Adapters for external APIs
│   │   ├── tmdb/
│   │   ├── anilist/
│   │   └── image/
│   ├── db/                 # Database schema and migrations (Prisma)
│   │   └── schema.prisma
│   └── types/              # Global TypeScript definitions
├── tests/                  # Test suites
│   ├── unit/               # Unit tests for services and utilities (Vitest)
│   ├── components/         # Component tests
│   └── e2e/                # End-to-end tests (Playwright)
├── public/                 # Static assets
└── ... (config files)
```

## 3. External API Strategy
All external API calls must pass through a provider adapter.
*   **No Direct Calls from UI:** UI components must call internal server actions or services.
*   **Resiliency:** Adapters must implement timeouts, retries, and return standardized error objects.
*   **Caching:** Responses from external providers should be cached aggressively using Next.js `fetch` cache or a dedicated caching layer (Redis if needed) to avoid rate limits and improve performance.
