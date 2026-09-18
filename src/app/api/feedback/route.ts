import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { z } from 'zod';

const feedbackSchema = z.object({
  category: z.enum(['BUG', 'FEATURE_REQUEST', 'CONTENT_ISSUE', 'UX_ISSUE']),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('LOW'),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string(),
  actualBehavior: z.string(),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const data = await req.json();
    
    const parsedData = feedbackSchema.parse(data);

    const feedback = await prisma.feedback.create({
      data: {
        ...parsedData,
        userId: session?.user?.id || null, // Allow anonymous feedback
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error: unknown) {
    console.error('Failed to submit feedback:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
