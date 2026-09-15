import { NextResponse } from 'next/server';
import { dequeueJob, completeJob, failJob } from '@/services/jobs/queue';

// Prevent Next.js from caching this API route
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // 1. Verify cron authorization (e.g., Vercel Cron header or internal secret)
  const authHeader = req.headers.get('authorization');
  const secret = process.env.CRON_SECRET;
  
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Dequeue a job
  let processed = 0;
  try {
    // Process up to 5 jobs per cron tick to avoid lambda timeouts
    for (let i = 0; i < 5; i++) {
      const job = await dequeueJob();
      if (!job) break; // No more pending jobs

      try {
        // --- 3. EXECUTE JOB LOGIC BASED ON TYPE ---
        console.log(`Processing job ${job.id} of type ${job.type}`);
        
        if (job.type === 'SYNC_RELEASES') {
          // Dummy logic: In real app, call TMDB to sync releases
          await new Promise(resolve => setTimeout(resolve, 500)); 
        } else if (job.type === 'UPDATE_PROVIDER_AVAILABILITY') {
          // Dummy logic: Check provider endpoints
          await new Promise(resolve => setTimeout(resolve, 500)); 
        } else {
          throw new Error(`Unknown job type: ${job.type}`);
        }

        // 4. Complete job on success
        await completeJob(job.id);
        processed++;
      } catch (err: any) {
        // 5. Fail job with retry logic
        console.error(`Job ${job.id} failed:`, err);
        await failJob(job.id, err.message || 'Unknown error');
      }
    }

    return NextResponse.json({ status: 'ok', processed });
  } catch (error: any) {
    console.error('Job processor failed', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
