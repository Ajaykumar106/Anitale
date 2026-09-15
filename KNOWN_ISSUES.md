# Anitale Known Issues

This document tracks unresolved issues, technical debt, and areas requiring future attention.

## Current Issues

| ID | Issue Description | Component | Severity | Workaround/Status |
| :--- | :--- | :--- | :--- | :--- |
| 001 | In-Memory rate limiting resets on deploy and doesn't sync across multi-node distributed deployments. | `rate-limit.ts` | P2 | Integrate Redis for production distributed deployments. |
| 002 | Analytics and Logging providers are not strictly hooked up (currently using console.log/error). | Infrastructure | P2 | Hook up Datadog, Sentry, or Posthog. |
| 003 | Lack of automated DMCA / Copyright automated takedown queue for User reviews. | Admin / Moderation | P3 | Manually moderate via `/admin/moderation`. |
| 004 | Search does not use fuzzy-matching / typo-tolerance since it relies on native Prisma/PostgreSQL `contains`. | `search.ts` | P3 | Implement Meilisearch or Algolia as outlined in Phase 4 plans. |

*(All P0 and P1 blocking issues have been resolved for MVP)*
