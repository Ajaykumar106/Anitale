import { ProviderMediaDetails } from '@/providers/types';
import { MediaType } from '@prisma/client';
import { PosterImage } from './PosterImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { SectionHeader } from './SectionHeader';
import { WatchlistButton } from './WatchlistButton';
import { FollowReleaseButton } from '@/components/releases/FollowReleaseButton';
import { ReviewForm } from '../community/ReviewForm';
import { MediaRow } from './MediaRow';
import { MediaReviews } from '../community/MediaReviews';
import { Suspense } from 'react';
import { ShareButton } from './ShareButton';
import { LiveDiscussion } from './LiveDiscussion';
import { Star, Search } from 'lucide-react';
import { SimilarMedia } from './SimilarMedia';
import { VideoPlayerWrapper } from './VideoPlayerWrapper';

interface MediaDetailProps {

  media: ProviderMediaDetails;
}

export function MediaDetail({ media }: MediaDetailProps) {
  const year = media.releaseDate ? new Date(media.releaseDate).getFullYear() : 'Unknown Year';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': media.type === 'MOVIE' ? 'Movie' : 'TVSeries',
    name: media.title,
    image: media.posterPath ? `https://image.tmdb.org/t/p/w500${media.posterPath}` : undefined,
    datePublished: media.releaseDate ? new Date(media.releaseDate).toISOString() : undefined,
    description: media.overview,
    genre: media.genres?.map((g: any) => typeof g === 'string' ? g : g.genre?.name).filter(Boolean),
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    <div className="w-full px-4 md:px-12 lg:px-16 py-8 flex flex-col space-y-12">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground flex items-center space-x-2">
        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
        <span>/</span>
        <Link 
          href={media.type === 'MOVIE' ? '/movie' : media.type === 'SERIES' ? '/show' : '/anime'} 
          className="hover:text-foreground transition-colors"
        >
          {media.type === 'MOVIE' ? 'Movies' : media.type === 'SERIES' ? 'Series' : 'Anime'}
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium" aria-current="page">{media.title}</span>
      </nav>

      {/* Video Player Wrapper (User will inject iframe here) */}
      <VideoPlayerWrapper tmdbId={media.externalId} type={media.type as 'MOVIE' | 'SERIES' | 'ANIME'} />

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-[200px] sm:w-[250px] md:w-[300px] shrink-0 mx-auto md:mx-0">
          <PosterImage
            src={media.posterPath}
            alt={media.title}
            priority
            className="w-full rounded-lg shadow-2xl"
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
              {media.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground text-lg mb-4">
              <span>{year}</span>
              <span>•</span>
              <span>{media.runtime ? `${media.runtime} min` : 'Unknown runtime'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {media.voteAverage !== undefined && (
              <Badge variant="default" className="bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 border-yellow-500/50 text-lg font-bold px-4 py-2 flex items-center gap-2">
                <Star className="w-6 h-6 fill-yellow-500 text-yellow-500" />
                {media.voteAverage.toFixed(1)} / 10
              </Badge>
            )}
            <div className="flex flex-wrap gap-2">
              {media.genres.map((g: any) => {
                const genreName = typeof g === 'string' ? g : g.genre?.name;
                if (!genreName) return null;
                return <Badge key={genreName} variant="secondary">{genreName}</Badge>;
              })}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Synopsis</h3>
            <p className="leading-relaxed text-muted-foreground max-w-3xl">
              {media.overview || 'No synopsis available.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <WatchlistButton externalId={media.externalId} type={media.type as MediaType} />
            {/* Only render if we have a valid internal DB id, since FollowReleaseButton requires it */}
            {(media as any).id && (
              <FollowReleaseButton mediaId={(media as any).id} />
            )}
            <Button size="lg" variant="outline">Rate</Button>
            <ShareButton 
              title={media.title} 
              text={`Check out ${media.title} on Anitale!`} 
              url={`/${media.type === 'MOVIE' ? 'movie' : media.type === 'SERIES' ? 'show' : 'anime'}/${media.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${media.externalId}`} 
            />
            <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer">
              <Button variant="default" className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                Host Watch Party (Google Meet)
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Cast & Crew Section */}
      {media.credits && (media.credits.cast.length > 0 || media.credits.crew.length > 0) && (
        <section className="space-y-4">
          <SectionHeader title="Cast & Crew" className="px-0 md:px-0 lg:px-0" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.credits.cast.map((person, idx) => (
              <div key={`cast-${idx}`} className="flex flex-col items-center text-center space-y-2">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted flex-shrink-0 shadow-md">
                  {person.profilePath ? (
                    <img src={`https://image.tmdb.org/t/p/w185${person.profilePath}`} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">N/A</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm leading-tight">{person.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{person.character}</div>
                </div>
              </div>
            ))}
            {media.credits.crew.map((person, idx) => (
              <div key={`crew-${idx}`} className="flex flex-col items-center text-center space-y-2">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-muted flex-shrink-0 shadow-md">
                  {person.profilePath ? (
                    <img src={`https://image.tmdb.org/t/p/w185${person.profilePath}`} alt={person.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">N/A</div>
                  )}
                </div>
                <div>
                  <div className="font-semibold text-sm leading-tight">{person.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{person.job}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Availability Section */}
      <section>
        <SectionHeader title="Where to Watch" className="px-0 md:px-0 lg:px-0" />
        {media.availability && media.availability.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.availability.map((provider: any, idx: number) => (
              <div key={`${provider.providerExternalId}-${idx}`} className="flex items-center space-x-4 p-4 bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors border border-white/5 rounded-xl shadow-sm">
                {provider.logoPath && (
                  <img src={`https://image.tmdb.org/t/p/w92${provider.logoPath}`} alt={provider.providerName} className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg shadow-sm" />
                )}
                <div className="flex flex-col">
                  <div className="font-bold text-base">{provider.providerName}</div>
                  <Badge variant="secondary" className="w-fit mt-1 text-[10px] uppercase tracking-wider">{provider.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <p className="text-muted-foreground italic">No official streaming platforms found. Search the web instead:</p>
            <div className="flex flex-wrap gap-4">
              <a href={`https://t.me/search?q=${encodeURIComponent(media.title + ' episodes')}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 border-[#0088cc] text-[#0088cc] hover:bg-[#0088cc] hover:text-white">
                  <Search className="w-4 h-4" /> Telegram Search
                </Button>
              </a>
              <a href={`https://duckduckgo.com/?q=${encodeURIComponent('Watch ' + media.title + ' free high quality streaming online')}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" /> Web Search
                </Button>
              </a>
              <a href={`https://www.google.com/search?q=${encodeURIComponent(media.title + ' cast and release info')}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2">
                  <Search className="w-4 h-4" /> Search Cast & Info
                </Button>
              </a>
            </div>
          </div>
        )}
      </section>

      {/* Live Discussion */}
      <section>
        <SectionHeader title="Live Discussion" />
        <LiveDiscussion />
      </section>

      {/* Reviews Section */}
      <section className="space-y-6">
        <SectionHeader title="User Reviews" />
        {/* Pass the internal database ID if it exists */}
        {(media as any).id && (
          <>
            <ReviewForm mediaId={(media as any).id} type={media.type} />
            <Suspense fallback={<div className="animate-pulse h-32 bg-muted rounded-md" />}>
              <MediaReviews mediaId={(media as any).id} />
            </Suspense>
          </>
        )}
        {!(media as any).id && (
          <div className="text-muted-foreground italic">Reviews are unavailable.</div>
        )}
      </section>

      {/* Trailers Section */}
      {media.trailerUrl && (
        <section className="space-y-4">
          <SectionHeader title="Trailers" />
          <div className="aspect-video w-full max-w-4xl rounded-xl overflow-hidden shadow-lg border border-white/10">
            <iframe 
              src={media.trailerUrl} 
              className="w-full h-full" 
              allowFullScreen 
              title={`${media.title} Trailer`}
            />
          </div>
        </section>
      )}

      {/* Similar & Recommended */}
      <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-md" />}>
        <SimilarMedia externalId={media.externalId} type={media.type as MediaType} />
      </Suspense>
    </div>
    </div>
  );
}
