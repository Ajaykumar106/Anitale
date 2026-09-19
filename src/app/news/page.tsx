import { SectionHeader } from '@/components/media/SectionHeader';
import Link from 'next/link';

export const metadata = {
  title: 'News - Anitale',
  description: 'Latest movies, series, and anime news around the world.',
};

export default function NewsPage() {
  const newsItems = [
    {
      id: 1,
      title: 'Global Anime Streaming Hits Record Highs in 2024',
      date: 'September 19, 2024',
      category: 'Anime',
      snippet: 'Streaming platforms report a 35% increase in anime viewership worldwide, driven by simulcasts and global licensing expansions.',
      imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&q=80',
    },
    {
      id: 2,
      title: 'Upcoming Sci-Fi Epic "Stellar Horizon" Gets First Trailer',
      date: 'September 18, 2024',
      category: 'Movies',
      snippet: 'The highly anticipated sci-fi movie from acclaimed director Jane Doe finally drops its first teaser, showing breathtaking visual effects.',
      imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
    },
    {
      id: 3,
      title: 'Hit Series "Mystery of the Deep" Renewed for Season 3',
      date: 'September 17, 2024',
      category: 'Series',
      snippet: 'Fans rejoice as the network confirms another season of the thrilling mystery drama, set to start production next month.',
      imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80',
    },
    {
      id: 4,
      title: 'Top 10 Most Anticipated Fall Anime Releases',
      date: 'September 16, 2024',
      category: 'Anime',
      snippet: 'As the autumn season approaches, here is our definitive list of the anime series you absolutely cannot miss.',
      imageUrl: 'https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=800&q=80',
    },
  ];

  return (
    <div className="container py-8">
      <SectionHeader title="Latest News" className="mb-8" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {newsItems.map((item) => (
          <div key={item.id} className="border rounded-xl overflow-hidden bg-card transition-colors hover:bg-accent/50 flex flex-col md:flex-row h-full">
            <div className="md:w-1/3 h-48 md:h-auto shrink-0 bg-muted">
              <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-semibold px-2 py-1 bg-primary/20 text-primary rounded-full uppercase tracking-wider">
                  {item.category}
                </span>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
              <h2 className="text-xl font-bold mb-2 leading-tight">{item.title}</h2>
              <p className="text-muted-foreground text-sm flex-grow mb-4">{item.snippet}</p>
              <div className="mt-auto">
                <Link href="#" className="text-sm font-medium text-primary hover:underline">
                  Read more &rarr;
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
