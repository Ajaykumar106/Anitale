'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, User, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      await update({ name }); // Update next-auth session
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-12 px-4 animate-in fade-in zoom-in duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences and public profile.</p>
      </div>

      <div className="backdrop-blur-xl bg-black/5 dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2 relative group">
              <Label htmlFor="name" className="text-sm font-medium text-muted-foreground group-focus-within:text-foreground transition-colors">Display Name</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-foreground transition-colors z-10">
                  <User className="w-5 h-5" />
                </div>
                <Input
                  id="name"
                  placeholder="Enter your display name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-11 h-12 bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary rounded-xl transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground">This is your public display name. It can be your real name or a pseudonym.</p>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium animate-in slide-in-from-top-2">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-600 dark:text-green-400 font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5" />
              Profile updated successfully
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-black/10 dark:border-white/10">
            <Button 
              type="submit" 
              disabled={loading} 
              className="h-11 px-8 bg-foreground text-background hover:bg-foreground/90 rounded-xl font-semibold transition-all gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
