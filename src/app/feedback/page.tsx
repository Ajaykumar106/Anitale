'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';

export default function FeedbackPage() {
  const [category, setCategory] = useState('BUG');
  const [severity, setSeverity] = useState('LOW');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [steps, setSteps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          severity,
          expectedBehavior: expected,
          actualBehavior: actual,
          stepsToReproduce: steps
        }),
      });
      if (res.ok) setSubmitted(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container py-20 max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold">Thank You!</h1>
        <p className="text-muted-foreground">Your feedback has been submitted to the team.</p>
        <Button onClick={() => router.push('/')}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="container py-12 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Beta Feedback</h1>
        <p className="text-muted-foreground mt-2">Help us improve Anitale during the private beta by reporting issues or suggesting features.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 rounded-lg border shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <select 
              value={category} 
              onChange={e => setCategory(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="BUG">Bug Report</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="CONTENT_ISSUE">Content Issue (Metadata/Video)</option>
              <option value="UX_ISSUE">UX/Navigation Issue</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <Label>Severity</Label>
            <select 
              value={severity} 
              onChange={e => setSeverity(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="LOW">Low (Minor annoyance)</option>
              <option value="MEDIUM">Medium (Degraded experience)</option>
              <option value="HIGH">High (Feature broken)</option>
              <option value="CRITICAL">Critical (App crashed / Unusable)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Expected Behavior <span className="text-red-500">*</span></Label>
          <textarea 
            required
            value={expected}
            onChange={e => setExpected(e.target.value)}
            placeholder="What did you expect to happen?"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <Label>Actual Behavior <span className="text-red-500">*</span></Label>
          <textarea 
            required
            value={actual}
            onChange={e => setActual(e.target.value)}
            placeholder="What actually happened?"
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <Label>Steps to Reproduce (Optional)</Label>
          <textarea 
            value={steps}
            onChange={e => setSteps(e.target.value)}
            placeholder="1. Go to...\n2. Click on...\n3. See error..."
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </form>
    </div>
  );
}
