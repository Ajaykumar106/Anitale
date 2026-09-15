import Link from 'next/link';
import { MediaType } from '@prisma/client';
import { PosterImage } from './PosterImage';

export interface MediaCardProps {
  id: string; // Database ID or external ID
  title: string;
  type: MediaType;
  posterPath?: string | null;
  year?: number;
  rating?: number;
  priority?: boolean;
}

export function MediaCard({ id, title, type, posterPath, year, rating, priority }: MediaCardProps) {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const route = type === MediaType.MOVIE ? `/movie/${slug}-${id}` : type === MediaType.SERIES ? `/show/${slug}-${id}` : `/anime/${slug}-${id}`;

  return (
    <Link href={route} className="group relative flex flex-col space-y-2 rounded-md transition-all hover:scale-105 active:scale-95">
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md shadow-sm">
        <PosterImage
          src={posterPath}
          alt={title}
          priority={priority}
          className="h-full w-full object-cover"
        />
        {rating !== undefined && (
          <div className="absolute top-2 right-2 rounded bg-black/70 px-1.5 py-0.5 text-xs font-bold text-white backdrop-blur-md">
            ★ {rating.toFixed(1)}
          </div>
        )}
      </div>
      <div className="flex flex-col space-y-0.5">
        <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground">
          {year || 'Unknown Year'} • {type === MediaType.MOVIE ? 'Movie' : type === MediaType.SERIES ? 'TV Series' : 'Anime'}
        </p>
      </div>
    </Link>
  );
}
