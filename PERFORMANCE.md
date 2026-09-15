# Performance Optimizations (Phase 22)

## 1. Non-Blocking Server Render (Suspense)
The Homepage (`src/app/page.tsx`) previously used a top-level `await Promise.all` to fetch trending media from TMDB/Postgres. This blocked the entire page render until the API responded. 
*Fix:* We extracted this logic into a separate Server Component (`TrendingSections.tsx`) and wrapped it in a `<Suspense>` boundary with a skeleton loader. The initial HTML now streams to the client instantly.

## 2. Recommendation Caching
The `getHomeRecommendations` engine runs a complex scoring algorithm combining user history, genres, and recency.
*Fix:* We implemented a 30-minute Edge Cache using `unstable_cache` per user to ensure the heavy ranking computation isn't running on every page load.

## 3. Database Query Pagination Limits
*Issue:* `getHistory`, `getWatchlist`, and `getCollections` queries were performing unbound `findMany()` calls, which would scale linearly with a user's usage and eventually cause Out-Of-Memory (OOM) crashes.
*Fix:* Applied strict `take: 50` and `take: 100` limits to prevent DB lockups.

## 4. Query Deduplication (React.cache)
*Issue:* The `getMediaDetails` function was called twice per Media Page load: once in `generateMetadata()` for SEO tags, and once in the page component itself. Next.js natively deduplicates `fetch()`, but it does NOT deduplicate Prisma calls, meaning the DB was queried twice.
*Fix:* Wrapped `getMediaDetails` in `React.cache()`, which memoizes the function execution for the lifetime of a single server request, cutting database load on media pages exactly in half.

## 5. Skeleton Fallbacks for Client Data
*Issue:* `PersonalizedHomeFeeds` previously returned `null` while fetching data client-side, causing layout shift.
*Fix:* Implemented `MediaRowSkeleton` as a loading fallback.
