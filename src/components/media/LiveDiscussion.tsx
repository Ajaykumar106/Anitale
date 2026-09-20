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

  const handleEmojiReact = (emoji: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: 'Guest',
        text: `Reacted with ${emoji}`,
        time: 'Just now'
      }
    ]);
  };

  return (
    <div className="mt-12 rounded-xl border border-white/10 bg-zinc-900/50 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-2 border-b border-white/5 p-4 bg-zinc-900">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-white">Watch Party Reactions</h3>
        <span className="ml-auto text-xs font-medium bg-red-500/10 text-red-500 px-2 py-1 rounded-full flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          {Math.floor(Math.random() * 50) + 12} watching live
        </span>
      </div>
      
      <div className="h-[250px] overflow-y-auto p-4 space-y-4 flex flex-col-reverse">
        {/* We reverse so newest messages show at bottom visually if we mapped backwards, 
            but for now just standard rendering */}
        <div className="space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex h-8 w-8 mt-0.5 shrink-0 items-center justify-center rounded-full bg-zinc-800 border border-white/10">
                <span className="text-xs font-bold text-white/70">{msg.user.substring(0, 2).toUpperCase()}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-white/90">{msg.user}</span>
                  <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                </div>
                <p className="text-lg mt-0.5">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emoji Reaction Bar (No Text Intervention) */}
      <div className="p-4 border-t border-white/5 bg-zinc-900 flex justify-center gap-4">
        {['😂', '😱', '🔥', '👏', '💔'].map(emoji => (
          <button 
            key={emoji}
            onClick={() => handleEmojiReact(emoji)}
            className="text-3xl hover:scale-125 hover:-translate-y-2 transition-all duration-300 active:scale-95"
            title={`Send ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
