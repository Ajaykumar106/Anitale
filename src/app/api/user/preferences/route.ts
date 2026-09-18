import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const prefs = await prisma.userPreference.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id }
  });

  const notifPrefs = await prisma.notificationPreference.findUnique({
    where: { userId: session.user.id }
  });

  return NextResponse.json({ ...prefs, emailNotifications: notifPrefs?.emailNotifications ?? true });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    
    // We only allow updating these specific fields
    const updateData: any = {};
    if (typeof body.language === 'string') updateData.language = body.language;
    if (typeof body.includeAdult === 'boolean') updateData.includeAdult = body.includeAdult;
    if (Array.isArray(body.mutedGenres)) {
      updateData.mutedGenres = JSON.stringify(body.mutedGenres);
    }

    // Now update notification preferences if passed
    if (typeof body.emailNotifications === 'boolean') {
      await prisma.notificationPreference.upsert({
        where: { userId: session.user.id },
        update: { emailNotifications: body.emailNotifications },
        create: { userId: session.user.id, emailNotifications: body.emailNotifications }
      });
    }

    const prefs = await prisma.userPreference.upsert({
      where: { userId: session.user.id },
      update: updateData,
      create: { userId: session.user.id, ...updateData }
    });

    // Invalidate caches
    // @ts-ignore
    revalidateTag(`trending-${session.user.id}`);
    // @ts-ignore
    revalidateTag(`might-like-${session.user.id}`);
    // @ts-ignore
    revalidateTag(`hidden-gems-${session.user.id}`);

    return NextResponse.json(prefs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
