# Anitale Database Schema

The database uses PostgreSQL and is managed via Prisma.

## Core Models (Conceptual)

### 1. User & Authentication
*   **User:** id, name, email, emailVerified, image, role (USER, ADMIN), createdAt, updatedAt
*   **Account:** (OAuth links - standard NextAuth schema)
*   **Session:** (Session management - standard NextAuth schema)
*   **Profile:** userId (unique), bio, avatarUrl, location, website

### 2. Media Metadata (Cached/Local)
*While much of the media data comes from external APIs, we cache essential info locally for performance, relations, and search.*
*   **Media:** id (internal), externalId (e.g., TMDB ID), type (MOVIE, SERIES, ANIME), title, originalTitle, posterPath, backdropPath, releaseDate, status, createdAt, updatedAt
*   **Genre:** id, name, type
*   **MediaGenre:** mediaId, genreId (Many-to-Many)

### 3. User Tracking & Social
*   **Watchlist:** userId, mediaId, createdAt
*   **Collection:** id, userId, name, description, isPublic, createdAt
*   **CollectionItem:** collectionId, mediaId, order
*   **WatchHistory:** userId, mediaId, episodeId (optional), watchedAt
*   **WatchProgress:** userId, mediaId, seasonNumber, episodeNumber, progressSeconds, isCompleted
*   **Review:** id, userId, mediaId, rating (1-10), content, hasSpoilers, createdAt, updatedAt
*   **Follow:** followerId, followingId, createdAt

## Indexing Strategy
*   `User.email`: Unique index
*   `Media.externalId` + `Media.type`: Unique composite index
*   `Watchlist.userId`: Index for fast lookups by user
*   `Watchlist.mediaId`: Index for fast lookups by media (e.g., "how many users wishlisted this?")
*   `Review.mediaId`: Index for retrieving reviews for a specific movie/show.

*Detailed Prisma schema will be defined in Phase 2.*
