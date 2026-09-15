'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export function PreferencesForm({ genres }: { genres: { id: string, name: string }[] }) {
  const [mutedGenres, setMutedGenres] = useState<string[]>([]);
  const [includeAdult, setIncludeAdult] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch('/api/user/preferences')
      .then(r => r.json())
      .then(data => {
        setIncludeAdult(data.includeAdult || false);
        setEmailNotifications(data.emailNotifications ?? true);
        try {
          if (data.mutedGenres) setMutedGenres(JSON.parse(data.mutedGenres));
        } catch (e) {}
        setIsLoading(false);
      });
  }, []);

  const toggleGenre = (genreId: string) => {
    setMutedGenres(prev => 
      prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mutedGenres, includeAdult, emailNotifications })
    });
    alert('Preferences saved! Your recommendations have been updated.');
    setIsSaving(false);
  };

  if (isLoading) return <div>Loading preferences...</div>;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">Content Filtering & Notifications</h3>
        
        <label className="flex items-center space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={emailNotifications} 
            onChange={e => setEmailNotifications(e.target.checked)} 
            className="w-5 h-5 rounded border-input"
          />
          <span className="font-medium">Receive Email Notifications (New Episodes, Follows)</span>
        </label>

        <label className="flex items-center space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={includeAdult} 
            onChange={e => setIncludeAdult(e.target.checked)} 
            className="w-5 h-5 rounded border-input"
          />
          <span className="font-medium">Show Adult/18+ Content</span>
        </label>
      </section>

      <section className="space-y-4">
        <h3 className="text-xl font-semibold border-b pb-2">Muted Genres</h3>
        <p className="text-sm text-muted-foreground">
          Select genres you never want to see in your personalized recommendations.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {genres.map(g => (
            <label key={g.id} className={`flex items-center space-x-2 p-3 rounded-md border cursor-pointer transition-colors ${mutedGenres.includes(g.id) ? 'bg-destructive/10 border-destructive' : 'hover:bg-muted'}`}>
              <input 
                type="checkbox" 
                checked={mutedGenres.includes(g.id)}
                onChange={() => toggleGenre(g.id)}
                className="hidden"
              />
              <span className={`font-medium ${mutedGenres.includes(g.id) ? 'text-destructive' : 'text-foreground'}`}>
                {mutedGenres.includes(g.id) ? '🚫 ' : ''}{g.name}
              </span>
            </label>
          ))}
        </div>
      </section>

      <Button onClick={handleSave} disabled={isSaving} size="lg">
        {isSaving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </div>
  );
}
