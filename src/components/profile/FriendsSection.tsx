'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function FriendsSection() {
  const [friends, setFriends] = useState<any[]>([]);
  const [friendEmail, setFriendEmail] = useState('');
  
  useEffect(() => {
    fetch('/api/friends').then(res => res.json()).then(data => {
      setFriends(data.friends || []);
    });
  }, []);

  const sendRequest = async () => {
    if (!friendEmail) return;
    const res = await fetch('/api/friends', {
      method: 'POST',
      body: JSON.stringify({ email: friendEmail })
    });
    if (res.ok) {
      setFriendEmail('');
      alert('Request sent!');
      fetch('/api/friends').then(res => res.json()).then(data => setFriends(data.friends || []));
    } else {
      const { error } = await res.json();
      alert(`Failed: ${error}`);
    }
  };

  const acceptRequest = async (id: string) => {
    await fetch(`/api/friends/${id}`, { method: 'PUT' });
    fetch('/api/friends').then(res => res.json()).then(data => setFriends(data.friends || []));
  };

  return (
    <div className="pt-6 border-t space-y-4">
      <h3 className="font-medium text-lg">Friends</h3>
      <div className="flex gap-2">
        <Input placeholder="Friend's email" value={friendEmail} onChange={e => setFriendEmail(e.target.value)} />
        <Button onClick={sendRequest}>Send Request</Button>
      </div>
      <div className="space-y-2 mt-4">
        {friends.length === 0 && <p className="text-sm text-muted-foreground">No friends yet.</p>}
        {friends.map((f: any) => (
          <div key={f.id} className="flex justify-between items-center border p-3 rounded-lg bg-card">
            <div>
              <p className="font-medium">{f.friend.name || f.friend.email}</p>
              <p className="text-xs text-muted-foreground">Status: {f.status}</p>
            </div>
            {f.status === 'PENDING' && f.userId !== f.myId && (
              <Button size="sm" onClick={() => acceptRequest(f.id)}>Accept</Button>
            )}
            {f.status === 'PENDING' && f.userId === f.myId && (
              <Button size="sm" variant="secondary" disabled>Pending</Button>
            )}
            {f.status === 'ACCEPTED' && (
              <Button size="sm" variant="outline" disabled>Friends</Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
