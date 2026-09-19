'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, MessageSquare } from 'lucide-react';


export function LiveDiscussion() {
  const [messages, setMessages] = useState([
    { id: 1, user: 'AnimeFan99', text: 'This episode was insane!', time: '2m ago' },
    { id: 2, user: 'Cinephile', text: 'The cinematography here is top notch.', time: '1m ago' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'Guest',
        text: newMessage,
        time: 'Just now'
      }
    ]);
    setNewMessage('');
  };

  return (
    <div className="mt-12 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 p-4 bg-muted/30">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Live Discussion</h3>
        <span className="ml-auto text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {Math.floor(Math.random() * 50) + 12} watching
        </span>
      </div>
      
      <div className="h-[300px] overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex h-8 w-8 mt-0.5 shrink-0 items-center justify-center rounded-full bg-muted">
              <span className="text-xs">{msg.user.substring(0, 2).toUpperCase()}</span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold">{msg.user}</span>
                <span className="text-[10px] text-muted-foreground">{msg.time}</span>
              </div>
              <p className="text-sm mt-0.5 text-card-foreground/90">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-muted/10 flex gap-2">
        <Input 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Share your thoughts..." 
          className="bg-background"
        />
        <Button type="submit" size="icon" disabled={!newMessage.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
