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
    genre: media.genres,
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
            {media.genres.map(g => (
              <Badge key={g} variant="secondary">{g}</Badge>
            ))}
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Synopsis</h3>
            <p className="leading-relaxed text-muted-foreground max-w-3xl">
              {media.overview || 'No synopsis available.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link href={`/watch/${media.externalId}`}>
              <Button size="lg">Watch Now</Button>
            </Link>
            <WatchlistButton externalId={media.externalId} type={media.type as MediaType} />
            {/* Only render if we have a valid internal DB id, since FollowReleaseButton requires it */}
            {(media as any).id && (
              <FollowReleaseButton mediaId={(media as any).id} />
            )}
            <Button size="lg" variant="outline">Rate</Button>
          </div>
        </div>
      </div>

      {/* Cast & Crew Placeholder */}
      <section>
        <SectionHeader title="Cast & Crew" />
        <div className="text-muted-foreground italic">Cast data will appear here...</div>
      </section>

      {/* Availability Placeholder */}
      <section>
        <SectionHeader title="Where to Watch" />
        <div className="text-muted-foreground italic">Provider data will appear here...</div>
      </section>

      {/* Reviews Placeholder */}
      <section className="space-y-6">
        <SectionHeader title="User Reviews" />
        <ReviewForm mediaId={media.externalId} type={media.type} />
        <div className="text-muted-foreground italic">Past reviews will appear here...</div>
      </section>
    </div>
    </div>
  );
}
