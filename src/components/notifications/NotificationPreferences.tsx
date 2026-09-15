'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function NotificationPreferences() {
  const [prefs, setPrefs] = useState({
    newEpisode: true,
    newSeason: true,
    releaseReminder: true,
    availabilityChange: true,
    recommendations: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/notifications/preferences')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setPrefs(data);
        setLoading(false);
      });
  }, []);

  const togglePref = async (key: keyof typeof prefs) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    
    await fetch('/api/notifications/preferences', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [key]: updated[key] })
    });
  };

  if (loading) return <div className="text-muted-foreground text-sm">Loading preferences...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Notification Preferences</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Episodes</Label>
            <p className="text-sm text-muted-foreground">Get alerted when a new episode airs for followed series.</p>
          </div>
          <Switch checked={prefs.newEpisode} onCheckedChange={() => togglePref('newEpisode')} />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>New Seasons</Label>
            <p className="text-sm text-muted-foreground">Get alerted when a new season is announced or airs.</p>
          </div>
          <Switch checked={prefs.newSeason} onCheckedChange={() => togglePref('newSeason')} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Release Reminders</Label>
            <p className="text-sm text-muted-foreground">Receive reminders for upcoming movies on your watchlist.</p>
          </div>
          <Switch checked={prefs.releaseReminder} onCheckedChange={() => togglePref('releaseReminder')} />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Availability Changes</Label>
            <p className="text-sm text-muted-foreground">Know when a title becomes available on your providers.</p>
          </div>
          <Switch checked={prefs.availabilityChange} onCheckedChange={() => togglePref('availabilityChange')} />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Recommendations</Label>
            <p className="text-sm text-muted-foreground">Receive personalized watch recommendations.</p>
          </div>
          <Switch checked={prefs.recommendations} onCheckedChange={() => togglePref('recommendations')} />
        </div>
      </div>
    </div>
  );
}
