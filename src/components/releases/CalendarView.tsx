'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ReleaseWithMedia = {
  id: string;
  releaseDate: string;
  type: string;
  media: { id: string; title: string; type: string };
  episode?: { episodeNumber: number; name: string } | null;
  season?: { seasonNumber: number; name: string } | null;
};

type CalendarFilter = 'Today' | 'Tomorrow' | 'This Week' | 'This Month';

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function isDateInCurrentWeek(target: Date, today: Date): boolean {
  const start = new Date(today);
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  start.setDate(diff);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return target >= start && target <= end;
}

export function CalendarView() {
  const [releases, setReleases] = useState<ReleaseWithMedia[]>([]);
  const [filter, setFilter] = useState<CalendarFilter>('This Week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        const res = await fetch(`/api/releases/calendar?start=${today.toISOString()}&end=${nextMonth.toISOString()}`);
        if (res.ok) {
          const data = await res.json();
          setReleases(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchReleases();
  }, []);

  const filteredReleases = releases.filter((release) => {
    const date = new Date(release.releaseDate);
    const today = new Date();

    if (filter === 'Today') {
      return isSameDay(date, today);
    }
    if (filter === 'Tomorrow') {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return isSameDay(date, tomorrow);
    }
    if (filter === 'This Week') {
      return isDateInCurrentWeek(date, today);
    }
    if (filter === 'This Month') {
      return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth();
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {(['Today', 'Tomorrow', 'This Week', 'This Month'] as CalendarFilter[]).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'default' : 'outline'}
            onClick={() => setFilter(f)}
          >
            {f}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      ) : filteredReleases.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
          <p className="text-muted-foreground">No releases found for {filter}.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReleases.map((release) => (
            <div key={release.id} className="p-4 border rounded-lg shadow-sm bg-card flex flex-col justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">
                  {new Date(release.releaseDate).toLocaleString(undefined, {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  })}
                </div>
                <Link href={`/${release.media.type.toLowerCase()}/${release.media.id}`} className="font-bold text-lg hover:underline">
                  {release.media.title}
                </Link>
                {release.type === 'Episode' && release.episode && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Episode {release.episode.episodeNumber}: {release.episode.name}
                  </div>
                )}
                {release.type === 'Season' && release.season && (
                  <div className="text-sm text-muted-foreground mt-1">
                    Season {release.season.seasonNumber}: {release.season.name}
                  </div>
                )}
                {release.type !== 'Episode' && release.type !== 'Season' && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {release.type} Release
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
