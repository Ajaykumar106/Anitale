import { MediaType } from '@prisma/client';
import { getMediaDetails, getMediaAvailability } from '@/services/media/details';
import { MediaDetail } from '@/components/media/MediaDetail';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slugParts = resolvedParams.slug.split('-');
  const id = slugParts[slugParts.length - 1];

  try {
    const media = await getMediaDetails(id, MediaType.MOVIE);
    if (!media) return {};

    return generateSEOMetadata({
      title: `Watch ${media.title} Online - Anitale`,
      description: media.overview || `Watch ${media.title} on Anitale.`,
      url: `/movie/${resolvedParams.slug}`,
      image: media.posterPath ? `https://image.tmdb.org/t/p/w1280${media.backdropPath || media.posterPath}` : undefined,
      type: 'video.movie'
    });
  } catch {
    return {};
  }
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slugParts = resolvedParams.slug.split('-');
  const id = slugParts[slugParts.length - 1]; // We appended ID to the end of the slug

  if (!id) notFound();

  let mappedMedia;

  try {
    const media = await getMediaDetails(id, MediaType.MOVIE);
    
    if (!media) notFound();

    const availability = await getMediaAvailability(media.externalId, MediaType.MOVIE);

    mappedMedia = {
      id: (media as any).id,
      externalId: media.externalId,
      type: media.type,
      title: media.title,
      originalTitle: media.originalTitle || undefined,
      overview: media.overview || undefined,
      posterPath: media.posterPath || undefined,
      backdropPath: media.backdropPath || undefined,
      releaseDate: media.releaseDate || undefined,
      status: media.status || undefined,
      runtime: media.runtime || undefined,
      genres: (media as any).genres.map((g: any) => g.genre.name),
      alternativeTitles: (media as any).alternativeTitles.map((a: any) => ({ title: a.title, language: a.language || '' })),
      availability: availability,
      trailerUrl: undefined,
      credits: (media as any).credits,
      voteAverage: (media as any).voteAverage,
    };
  } catch (error) {
    console.error(error);
    notFound();
  }

  return <MediaDetail media={mappedMedia as any} />;

}
