import { MediaType } from '@prisma/client';
import { getMediaDetails } from '@/services/media/details';
import { MediaDetail } from '@/components/media/MediaDetail';
import { notFound } from 'next/navigation';

import { Metadata } from 'next';
import { generateSEOMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const slugParts = resolvedParams.slug.split('-');
  const id = slugParts[slugParts.length - 1];

  try {
    const media = await getMediaDetails(id, MediaType.ANIME);
    if (!media) return {};

    return generateSEOMetadata({
      title: media.title,
      description: media.overview || `Discover details about ${media.title}`,
      url: `/anime/${resolvedParams.slug}`,
      image: media.posterPath ? `https://image.tmdb.org/t/p/w1280${media.backdropPath || media.posterPath}` : undefined,
      type: 'video.tv_show'
    });
  } catch {
    return {};
  }
}

export default async function AnimePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const slugParts = resolvedParams.slug.split('-');
  const id = slugParts[slugParts.length - 1];

  if (!id) notFound();

  let mappedMedia;

  try {
    const media = await getMediaDetails(id, MediaType.ANIME);
    if (!media) notFound();

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
      genres: media.genres.map(g => g.genre.name),
      alternativeTitles: media.alternativeTitles.map(a => ({ title: a.title, language: a.language || '' })),
    };
  } catch (error) {
    console.error(error);
    notFound();
  }

  return <MediaDetail media={mappedMedia as any} />;
}
