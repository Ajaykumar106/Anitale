import { prisma } from '@/lib/prisma';
import { Media, MediaType } from '@prisma/client';
import { TMDBAdapter } from '@/providers/tmdb/adapter';

const tmdb = new TMDBAdapter(process.env.TMDB_API_KEY || '');

export interface SearchQuery {
  q: string;
  genre?: string;
  language?: string;
  year?: string;
  type?: MediaType;
}

export interface RankedSearchResult {
  media: Media;
  score: number;
}

export class SearchIndexer {
  // Indexes external provider results into our local DB
  static async indexExternalResults(externalMediaList: any[]): Promise<Media[]> {
    const indexed = [];
    for (const em of externalMediaList) {
      try {
        const media = await prisma.media.upsert({
          where: { externalId_type: { externalId: em.externalId, type: em.type } },
          update: {
            title: em.title,
            posterPath: em.posterPath,
            backdropPath: em.backdropPath,
            overview: em.overview,
            releaseDate: em.releaseDate ? new Date(em.releaseDate) : null,
          },
          create: {
            externalId: em.externalId,
            title: em.title,
            type: em.type,
            posterPath: em.posterPath,
            backdropPath: em.backdropPath,
            overview: em.overview,
            releaseDate: em.releaseDate ? new Date(em.releaseDate) : null,
          }
        });
        indexed.push(media);
      } catch (e) {
        // Skip on error
      }
    }
    return indexed;
  }
}

export class SearchRankingService {
  static rank(query: string, candidates: Media[]): RankedSearchResult[] {
    const lowerQuery = query.toLowerCase().trim();
    
    const scored = candidates.map(candidate => {
      let score = 0;
      const titleLower = candidate.title.toLowerCase();
      const originalLower = candidate.originalTitle?.toLowerCase() || '';

      // Exact match
      if (titleLower === lowerQuery || originalLower === lowerQuery) {
        score += 100;
      } 
      // Starts with
      else if (titleLower.startsWith(lowerQuery)) {
        score += 80;
      }
      // Partial match
      else if (titleLower.includes(lowerQuery) || originalLower.includes(lowerQuery)) {
        score += 50;
      }

      // Typo tolerance / fuzzy matching (simple Levenshtein distance proxy or word overlap)
      const queryWords = lowerQuery.split(' ').filter(Boolean);
      const titleWords = titleLower.split(' ').filter(Boolean);
      
      let wordMatches = 0;
      for (const qw of queryWords) {
        if (titleWords.some(tw => tw.includes(qw) || qw.includes(tw))) {
          wordMatches++;
        }
      }
      score += wordMatches * 10;

      // Boost newer or more popular media (assuming updatedAt proxy)
      if (candidate.releaseDate) {
        const yearsOld = new Date().getFullYear() - candidate.releaseDate.getFullYear();
        if (yearsOld <= 2) score += 5;
      }

      return { media: candidate, score };
    });

    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score);
  }
}

export class SearchService {
  static async search(queryParams: SearchQuery): Promise<RankedSearchResult[]> {
    const { q, type, genre, year } = queryParams;
    
    if (!q || q.trim().length === 0) return [];

    // 1. Search local DB with a broad `contains`
    const localCandidates = await prisma.media.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { originalTitle: { contains: q, mode: 'insensitive' } }
        ],
        ...(type && { type }),
        ...(year && { releaseDate: { gte: new Date(`${year}-01-01`), lte: new Date(`${year}-12-31`) } }),
      },
      take: 50,
      include: { genres: { include: { genre: true } } }
    });

    // 2. Fetch external if not enough local results
    let allCandidates = [...localCandidates];
    if (localCandidates.length < 10) {
      try {
        const external = await tmdb.search(q, { type });
        // 3. Index external results
        const indexed = await SearchIndexer.indexExternalResults(external);
        
        // Merge and deduplicate
        const existingIds = new Set(allCandidates.map(c => c.id));
        for (const ind of indexed) {
          if (!existingIds.has(ind.id)) {
            allCandidates.push(ind as any);
          }
        }
      } catch (e) {
        console.error("TMDB search failed, falling back to local DB only");
      }
    }

    // 4. Apply Genre Filters if needed (in memory since TMDB doesn't return full genre slugs easily here)
    if (genre) {
      const lowerGenre = genre.toLowerCase();
      allCandidates = allCandidates.filter((c: any) => 
        c.genres?.some((g: any) => g.genre.slug === lowerGenre || g.genre.name.toLowerCase() === lowerGenre)
      );
    }

    // 5. Rank
    return SearchRankingService.rank(q, allCandidates);
  }
}
