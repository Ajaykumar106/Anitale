import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const myId = session.user.id;
  const friendships = await db.friendship.findMany({
    where: {
      OR: [
        { userId: myId },
        { friendId: myId }
      ]
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true }
      },
      friend: {
        select: { id: true, name: true, email: true, image: true }
      }
    }
  });

  const friends = friendships.map(f => {
    const isSender = f.userId === myId;
    return {
      id: f.id,
      myId,
      userId: f.userId,
      status: f.status,
      friend: isSender ? f.friend : f.user
    };
  });

  return NextResponse.json({ friends });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { email } = await req.json();
  const friendUser = await db.user.findUnique({ where: { email } });
  
  if (!friendUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (friendUser.id === session.user.id) return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });

  const existing = await db.friendship.findFirst({
    where: {
      OR: [
        { userId: session.user.id, friendId: friendUser.id },
        { userId: friendUser.id, friendId: session.user.id }
      ]
    }
  });

  if (existing) return NextResponse.json({ error: 'Already friends or pending' }, { status: 400 });

  const friendship = await db.friendship.create({
    data: {
      userId: session.user.id,
      friendId: friendUser.id
    }
  });

  return NextResponse.json({ friendship });
}
