# Anitale API Contracts

This document outlines the internal API routes, Server Actions, and External Provider interfaces.

## 1. Internal Server Actions
Instead of exposing `/api/` endpoints for internal mutations, Next.js Server Actions will be preferred for form submissions and data mutations.

### User Actions
*   `updateProfile(data: ProfileUpdateInput) -> Result<Profile>`
*   `deleteAccount() -> Result<void>`

### Media Actions
*   `addToWatchlist(mediaId: string, type: MediaType) -> Result<void>`
*   `removeFromWatchlist(mediaId: string) -> Result<void>`
*   `updateWatchProgress(mediaId: string, progress: ProgressInput) -> Result<void>`

### Review Actions
*   `createReview(data: ReviewInput) -> Result<Review>`
*   `updateReview(reviewId: string, data: ReviewInput) -> Result<Review>`

## 2. Internal API Routes (Route Handlers)
Used for client-side data fetching where Server Components are not viable (e.g., infinite scrolling, client-side search).

*   `GET /api/search?q={query}&type={movie|series|anime}&page={num}`
    *   Response: `{ results: MediaItem[], totalPages: number, page: number }`
*   `GET /api/media/[id]/providers?region={code}`
    *   Response: `{ stream: Provider[], rent: Provider[], buy: Provider[] }`

## 3. External Provider Interfaces
Adapters must implement these generic interfaces to abstract the underlying API.

```typescript
interface MediaProvider {
  search(query: string, options?: SearchOptions): Promise<MediaResult[]>;
  getDetails(id: string): Promise<MediaDetails>;
  getTrending(): Promise<MediaResult[]>;
  getRecommendations(id: string): Promise<MediaResult[]>;
  getProviders(id: string, region: string): Promise<Availability>;
}

// Example Implementations:
// class TMDBProvider implements MediaProvider { ... }
// class AniListProvider implements MediaProvider { ... }
```

## 4. Error Handling
All internal APIs and Server Actions should return a standardized generic `Result` type.

```typescript
type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; details?: any } };
```
