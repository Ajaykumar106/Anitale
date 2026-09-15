import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Anitale',
    short_name: 'Anitale',
    description: 'Discover, track, and review your favorite movies, series, and anime.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    categories: ['entertainment', 'social'],
    shortcuts: [
      {
        name: 'My Watchlist',
        short_name: 'Watchlist',
        description: 'View your saved media',
        url: '/watchlist',
      },
      {
        name: 'Search',
        short_name: 'Search',
        description: 'Find anime and movies',
        url: '/search',
      }
    ]
  };
}
