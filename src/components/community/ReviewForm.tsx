'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function ReviewForm({ mediaId, type }: { mediaId: string, type: string }) {
  const [rating, setRating] = useState<number>(5);
  const [content, setContent] = useState('');
  const [hasSpoilers, setHasSpoilers] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    
    try {
      const res = await fetch('/api/community/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaId, type, rating, content, hasSpoilers })
      });
      
      if (!res.ok) throw new Error(await res.text());
      alert('Review posted successfully!');
      setContent('');
      setRating(5);
      setHasSpoilers(false);
    } catch (err: unknown) {
      alert(`Error: ${(err as Error).message}`);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-lg bg-card">
      <h3 className="font-semibold text-lg">Write a Review</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Rating (1-10)</label>
        <input 
          type="number" 
          min="1" max="10" 
          value={rating} 
          onChange={(e) => setRating(parseInt(e.target.value))}
          className="border rounded p-2 w-24 bg-background"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Review</label>
        <textarea 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What did you think?"
          className="border rounded p-2 w-full h-24 bg-background"
          maxLength={2000}
        />
      </div>

      <div className="flex items-center space-x-2">
        <input 
          type="checkbox" 
          id="spoilers" 
          checked={hasSpoilers} 
          onChange={(e) => setHasSpoilers(e.target.checked)} 
        />
        <label htmlFor="spoilers" className="text-sm font-medium text-destructive">
          Contains Spoilers
        </label>
      </div>

      <Button type="submit" disabled={isPending || content.trim().length === 0}>
        {isPending ? 'Posting...' : 'Post Review'}
      </Button>
    </form>
  );
}
