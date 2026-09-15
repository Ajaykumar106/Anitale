import Image from 'next/image';
import { cn } from '@/lib/utils';
import { ImageIcon } from 'lucide-react';

interface PosterImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

export function PosterImage({ src, alt, className = '', priority = false, sizes = "(max-width: 768px) 33vw, (max-width: 1200px) 20vw, 15vw" }: PosterImageProps) {
  if (!src) {
    return (
      <div className={cn("bg-muted flex flex-col items-center justify-center text-muted-foreground w-full h-full min-h-[150px] aspect-[2/3]", className)}>
        <ImageIcon className="w-8 h-8 opacity-50 mb-2" />
        <span className="text-xs text-center px-2 line-clamp-2">{alt}</span>
      </div>
    );
  }

  // Handle TMDB paths
  const imgUrl = src.startsWith('/') ? `https://image.tmdb.org/t/p/w500${src}` : src;

  // Single pixel transparent base64 for fast blur placeholder without client state overhead
  const blurDataURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  return (
    <div className={cn("relative overflow-hidden aspect-[2/3] w-full bg-muted/20", className)}>
      <Image
        src={imgUrl}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? undefined : "lazy"}
        placeholder="blur"
        blurDataURL={blurDataURL}
        className="object-cover"
      />
    </div>
  );
}
