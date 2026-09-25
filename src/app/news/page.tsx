import { SectionHeader } from '@/components/media/SectionHeader';
import Parser from 'rss-parser';

export const metadata = {
  title: 'News - Anitale',
  description: 'Latest movies, series, and anime news around the world.',
};

export const revalidate = 3600; // 1 hour

// Initialize RSS Parser
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['content:encoded', 'contentEncoded']
    ]
  }
});

async function fetchRss(url: string) {
  try {
    const feed = await parser.parseURL(url);
    return feed.items || [];
  } catch (err) {
    console.error('RSS Fetch Error for', url, err);
    return [];
  }
}

export default async function NewsPage() {
  const [moviesNews, seriesNews, animeNews] = await Promise.all([
    fetchRss('https://screenrant.com/feed/category/movie-news/'),
    fetchRss('https://screenrant.com/feed/category/tv-news/'),
    fetchRss('https://comicbook.com/anime/feed/'),
  ]);

  const renderSection = (title: string, items: any[], category: string) => {
    if (!items || items.length === 0) return null;
    return (
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-8 w-2 bg-primary rounded-full"></div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {items.slice(0, 6).map((item, idx) => {
            
            // Extract image from various possible XML tags
            let imageUrl = 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80';
            
            // Try to extract from contentEncoded (ScreenRant often puts <img> there)
            if (item.contentEncoded) {
              const match = item.contentEncoded.match(/<img[^>]+src="([^">]+)"/);
              if (match) imageUrl = match[1];
            }
            // Try mediaContent
            if (item.mediaContent && item.mediaContent['$'] && item.mediaContent['$'].url) {
              imageUrl = item.mediaContent['$'].url;
            }
            // Try AnimeNewsNetwork description 
            if (item.content) {
               const match = item.content.match(/<img[^>]+src="([^">]+)"/);
               if (match) imageUrl = match[1];
            }

            const date = new Date(item.pubDate || new Date()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            // Clean up description HTML
            const rawText = (item.contentSnippet || item.content || '').replace(/<[^>]+>/g, ' ');
            const cleanSnippet = rawText.trim().replace(/\s+/g, ' ').slice(0, 150) + '...';
            
            return (
              <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="group flex flex-col border border-white/5 rounded-3xl overflow-hidden bg-zinc-950/40 hover:bg-zinc-900/80 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 backdrop-blur-sm">
                <div className="relative h-64 md:h-72 w-full overflow-hidden bg-muted">
                  <img src={imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5">
                    <span className="text-[10px] font-bold px-3 py-1 bg-primary text-primary-foreground rounded-full uppercase tracking-widest mb-3 inline-block shadow-lg">
                      {category}
                    </span>
                    <h3 className="text-xl font-bold text-white leading-tight line-clamp-3 group-hover:text-primary transition-colors duration-300 drop-shadow-md">{item.title}</h3>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="text-xs text-muted-foreground mb-4 flex items-center gap-2 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                    {date}
                  </div>
                  <p className="text-muted-foreground/90 text-sm flex-grow mb-6 leading-relaxed line-clamp-3">
                    {cleanSnippet}
                  </p>
                  <div className="mt-auto flex items-center text-sm font-bold text-primary group-hover:text-primary/80 transition-colors uppercase tracking-wide">
                    Read Article <span className="ml-2 group-hover:translate-x-1.5 transition-transform duration-300">&rarr;</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="w-full py-12 px-4 md:px-8 lg:px-12 xl:px-16 mx-auto max-w-[1600px]">
      <div className="mb-16 text-left space-y-6 max-w-3xl">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">Daily News</h1>
        <p className="text-lg md:text-xl text-muted-foreground/80 leading-relaxed">Stay up to date with the latest breaking stories and insights from the world of movies, television, and anime.</p>
      </div>
      
      {renderSection("Movie News", moviesNews, "Movies")}
      {renderSection("Television News", seriesNews, "Series")}
      {renderSection("Anime News", animeNews, "Anime")}
    </div>
  );
}
