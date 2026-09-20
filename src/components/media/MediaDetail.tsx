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
import { Play, Plus, Search, Star, Share } from 'lucide-react';
import { SimilarMedia } from './SimilarMedia';
import { VideoPlayerWrapper } from './VideoPlayerWrapper';
import { EpisodeSelector } from './EpisodeSelector';
import { DiscoveryRows } from './DiscoveryRows';

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

      {/* Video Player & Episode Selector */}
      {media.type !== 'MOVIE' && media.seasons && media.seasons.length > 0 ? (
        <EpisodeSelector mediaId={(media as any).id} tmdbId={media.externalId} type={media.type as 'SERIES' | 'ANIME'} seasons={media.seasons} />
      ) : (
        <VideoPlayerWrapper mediaId={(media as any).id} tmdbId={media.externalId} type={media.type as 'MOVIE' | 'SERIES' | 'ANIME'} />
      )}

      {/* Hero Section */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column: Poster & Quick Actions */}
        <div className="w-[200px] sm:w-[250px] md:w-[300px] shrink-0 mx-auto lg:mx-0 flex flex-col gap-4">
          <PosterImage
            src={media.posterPath}
            alt={media.title}
            priority
            className="w-full rounded-xl shadow-2xl"
          />
          <div className="flex flex-col gap-2">
            <WatchlistButton externalId={media.externalId} type={media.type as MediaType} />
            {/* Only render if we have a valid internal DB id */}
            {(media as any).id && (
              <FollowReleaseButton mediaId={(media as any).id} />
            )}
            <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer">
              <Button variant="default" className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20">
                Host Watch Party (Live 🍿)
              </Button>
            </a>
          </div>
        </div>
        
        {/* Middle Column: Title, Synopsis, Cast */}
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-2 drop-shadow-sm">
              {media.title}
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground font-medium text-lg mb-6">
              <span>{year}</span>
              <span>•</span>
              <span>{media.runtime ? `${Math.floor(media.runtime / 60)}h ${media.runtime % 60}m` : 'Unknown runtime'}</span>
              <span>•</span>
              <span className="border border-white/20 px-2 py-0.5 rounded text-sm tracking-widest text-white/80">{media.status === 'Released' ? 'R' : media.status || 'R'}</span>
              <span className="border border-white/20 px-2 py-0.5 rounded text-sm tracking-widest text-white/80">TC</span>
              {media.voteAverage && (
                <div className="flex items-center gap-1 text-yellow-500">
                  <Star className="w-4 h-4 fill-yellow-500" />
                  <span className="text-white/90 font-bold">{media.voteAverage.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {media.credits && media.credits.crew.find(c => c.job === 'Director') && (
              <div className="text-lg">
                <span className="text-muted-foreground">Director: </span>
                <span className="font-semibold text-white/90">{media.credits.crew.find(c => c.job === 'Director')?.name}</span>
              </div>
            )}
            <p className="leading-relaxed text-lg text-muted-foreground max-w-4xl">
              {media.overview || 'No synopsis available.'}
            </p>
          </div>

          {/* Styled Ratings Row */}
          <div className="flex flex-wrap items-center gap-6 py-4">
            {media.voteAverage ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="bg-[#f5c518] text-black font-extrabold px-2 py-0.5 rounded text-sm tracking-tighter">IMDb</span>
                  <span className="text-xl font-bold text-white">{(media.voteAverage).toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 font-extrabold text-xl">🍅</span>
                  <span className="text-xl font-bold text-white">{Math.round(media.voteAverage * 10)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-500 font-extrabold text-xl">🍿</span>
                  <span className="text-xl font-bold text-white">{Math.round(media.voteAverage * 10) - 15 > 0 ? Math.round(media.voteAverage * 10) - 15 : 60}%</span>
                </div>
                <span className="text-xl font-bold text-white">TC</span>
              </>
            ) : null}
          </div>

          {/* Glassmorphic Stats Card */}
          <div className="w-full max-w-xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Runtime</span>
              <span className="text-white/90 font-medium">{media.runtime ? `${Math.floor(media.runtime / 60)}h ${media.runtime % 60}m` : 'N/A'}</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Language</span>
              <span className="text-white/90 font-medium">EN</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Release Date</span>
              <span className="text-white/90 font-medium">
                {media.releaseDate ? new Date(media.releaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown'}
              </span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Budget</span>
              <span className="text-white/90 font-medium">{media.budget && media.budget > 0 ? `$${media.budget.toLocaleString()}` : 'N/A'}</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Revenue</span>
              <span className="text-white/90 font-medium">{media.revenue && media.revenue > 0 ? `$${media.revenue.toLocaleString()}` : 'N/A'}</span>
            </div>
          </div>

          {/* Cast Carousel */}
          {media.credits && (media.credits.cast.length > 0) && (
            <div className="pt-8">
              <h3 className="text-2xl font-bold text-white mb-6">Cast</h3>
              <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide snap-x">
                {media.credits.cast.slice(0, 10).map((person, idx) => (
                  <div key={`cast-${idx}`} className="flex flex-col items-center text-center space-y-3 w-[100px] flex-shrink-0 snap-start group cursor-pointer active:scale-95 transition-transform">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-900 shadow-xl border-2 border-transparent group-hover:border-primary/50 transition-colors duration-300">
                      {person.profilePath ? (
                        <img src={`https://image.tmdb.org/t/p/w185${person.profilePath}`} alt={person.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs bg-zinc-800">N/A</div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-sm leading-tight line-clamp-1 text-white/90 group-hover:text-primary transition-colors">{person.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2 leading-tight hidden">{person.character}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Availability Section */}
      <section>
        <SectionHeader title="Available on OTT Platforms" className="px-0 md:px-0 lg:px-0" />
        {media.availability && media.availability.length > 0 ? (
          <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            {media.availability.map((provider: any, idx: number) => (
              <div key={`${provider.providerExternalId}-${idx}`} className="flex flex-col items-center flex-shrink-0 w-24">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl md:rounded-3xl overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.1)] border border-white/10 bg-zinc-900 flex items-center justify-center p-0.5 hover:scale-105 transition-transform duration-300">
                  {provider.logoPath ? (
                    <img src={`https://image.tmdb.org/t/p/w154${provider.logoPath}`} alt={provider.providerName} className="w-full h-full object-cover rounded-xl md:rounded-[22px]" />
                  ) : (
                    <span className="text-xs text-center font-bold text-muted-foreground p-2">{provider.providerName}</span>
                  )}
                </div>
                <div className="mt-2 text-center">
                  <Badge variant="outline" className="text-[10px] uppercase tracking-wider bg-zinc-900/50 border-white/10">{provider.type}</Badge>
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
              <a href={`https://www.google.com/search?q=${encodeURIComponent('When is next season of ' + media.title + ' coming out')}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="gap-2 text-yellow-500 border-yellow-500/50 hover:bg-yellow-500 hover:text-white">
                  <Search className="w-4 h-4" /> Search Next Season / Part Info
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

      <Suspense fallback={<div className="animate-pulse h-48 bg-muted rounded-md" />}>
        <DiscoveryRows type={media.type as MediaType} />
      </Suspense>
    </div>
    </div>
  );
}
