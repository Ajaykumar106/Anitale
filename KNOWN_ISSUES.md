# Known Issues & Bug Tracker

This document tracks verified bugs and issues reported during the Private Beta.

## Open Issues

*(No open issues reported yet)*

## Closed Issues

| ID | Issue | Root Cause | Fix | Date |
|----|-------|------------|-----|------|
| #1 | Duplicate key error on Media Detail page | Prisma `include` mapped `media.genres` as an array of nested objects (`{ genre: { name: 'Action' } }`), but React mapped them assuming they were plain strings, causing `[object Object]` duplicate keys. | Coerced the mapping logic to extract the string conditionally (`typeof g === 'string' ? g : g.genre?.name`) for both React components and JSON-LD structured data. | 2026-09-15 |
| #2 | Cron job endpoint allowed unauthorized execution | The security check `if (process.env.CRON_SECRET && ...)` returned false if the secret was undefined, bypassing the `return 401` block. | Updated logic to fail closed: `if (!secret || authHeader !== ...)` | 2026-09-15 |
| #3 | Stored XSS vulnerability in Schema.org JSON-LD | TMDB summaries injected raw into `<script dangerouslySetInnerHTML>` could have contained `</script>` escapes. | Escaped `<` characters to `\u003c` in `MediaDetail.tsx`. | 2026-09-15 |
