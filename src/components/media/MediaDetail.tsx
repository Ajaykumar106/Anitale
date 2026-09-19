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
    <div className="container py-8 flex flex-col space-y-12">
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

      {/* Hero Section */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-[200px] sm:w-[250px] md:w-[300px] shrink-0 mx-auto md:mx-0">
          <PosterImage
            src={media.posterPath}
            alt={media.title}
            priority
            className="w-full rounded-lg shadow-lg"
          />
        </div>
        
        <div className="flex-1 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
              {media.title}
            </h1>
            <p className="text-muted-foreground text-lg">
              {year} • {media.runtime ? `${media.runtime} min` : 'Unknown runtime'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {media.genres.map((g: any) => {
              const genreName = typeof g === 'string' ? g : g.genre?.name;
              if (!genreName) return null;
              return <Badge key={genreName} variant="secondary">{genreName}</Badge>;
            })}
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
          </div>
        </div>
      </div>

      {/* Cast & Crew Placeholder */}
      <section>
        <SectionHeader title="Cast & Crew" />
        <div className="text-muted-foreground italic">Cast data will appear here...</div>
      </section>

      {/* Availability Section */}
      <section>
        <SectionHeader title="Where to Watch" />
        {media.availability && media.availability.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {media.availability.map((provider: any, idx: number) => (
              <div key={`${provider.providerExternalId}-${idx}`} className="flex items-center space-x-3 p-3 bg-card border rounded-md shadow-sm">
                {provider.logoPath && (
                  <img src={`https://image.tmdb.org/t/p/w45${provider.logoPath}`} alt={provider.providerName} className="w-8 h-8 rounded-md" />
                )}
                <div className="flex-1 font-semibold text-sm">{provider.providerName}</div>
                <Badge variant="outline" className="shrink-0">{provider.type}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground italic">No availability data found.</div>
        )}
      </section>

      {/* Trailer */}
      {media.trailerUrl && (
        <section>
          <SectionHeader title="Trailer" />
          <div className="w-full max-w-4xl mx-auto aspect-video">
            <iframe
              src={media.trailerUrl}
              className="w-full h-full border-0 rounded-lg shadow-lg ring-1 ring-white/10"
              allowFullScreen
              allow="autoplay; encrypted-media"
            />
          </div>
        </section>
      )}

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
    </div>
    </div>
  );
}
