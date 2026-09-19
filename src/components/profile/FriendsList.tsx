'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface FriendUser {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface Friendship {
  id: string;
  myId: string;
  userId: string;
  status: 'PENDING' | 'ACCEPTED';
  friend: FriendUser;
}

export function FriendsList() {
  const [friends, setFriends] = useState<Friendship[]>([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends');
      if (res.ok) {
        const data = await res.json();
        setFriends(data.friends || []);
      }
    } catch (e) {
      console.error('Failed to fetch friends', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const addFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) return;

    try {
      const res = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add friend');
        return;
      }
      
      setEmail('');
      fetchFriends();
    } catch (e) {
      setError('An error occurred');
    }
  };

  const acceptFriend = async (id: string) => {
    try {
      const res = await fetch(`/api/friends/${id}`, {
        method: 'PUT',
      });
      if (res.ok) {
        fetchFriends();
      }
    } catch (e) {
      console.error('Failed to accept friend', e);
    }
  };

  if (loading) {
    return <div>Loading friends...</div>;
  }

  return (
    <div className="pt-6 border-t mt-6">
      <h3 className="font-medium text-lg mb-4">Friends</h3>
      
      <form onSubmit={addFriend} className="flex gap-2 mb-6">
        <Input
          type="email"
          placeholder="Add friend by email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="max-w-xs"
        />
        <Button type="submit">Add Friend</Button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-4">
        {friends.length === 0 ? (
          <p className="text-muted-foreground text-sm">No friends yet.</p>
        ) : (
          friends.map((f) => {
            const isPending = f.status === 'PENDING';
            const iSentRequest = f.userId === f.myId;

            return (
              <div key={f.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold">
                    {f.friend.name?.charAt(0) || f.friend.email?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium">{f.friend.name || 'Anonymous User'}</p>
                    <p className="text-sm text-muted-foreground">{f.friend.email}</p>
                  </div>
                </div>
                <div>
                  {isPending ? (
                    iSentRequest ? (
                      <span className="text-sm text-muted-foreground px-3 py-1 bg-muted rounded-full">Request Sent</span>
                    ) : (
                      <Button size="sm" onClick={() => acceptFriend(f.id)}>Accept Request</Button>
                    )
                  ) : (
                    <span className="text-sm text-green-600 px-3 py-1 bg-green-100 rounded-full font-medium">Friend</span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
