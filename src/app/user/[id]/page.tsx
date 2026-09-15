import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { ReviewCard } from '@/components/community/ReviewCard';
import { MediaCard } from '@/components/media/MediaCard';
import { SectionHeader } from '@/components/media/SectionHeader';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { UserPlus, UserMinus } from 'lucide-react';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    select: { name: true, image: true, profile: { select: { bio: true } } }
  });

  if (!user) return { title: 'User Not Found' };

  return {
    title: `${user.name || 'User'} - Anitale Profile`,
    description: user.profile?.bio || `Check out ${user.name}'s anime and movie reviews on Anitale.`,
    openGraph: {
      title: `${user.name} on Anitale`,
      description: user.profile?.bio || `Check out ${user.name}'s anime and movie reviews on Anitale.`,
      images: user.image ? [{ url: user.image }] : [],
    }
  };
}

export default async function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await prisma.user.findUnique({
    where: { id: resolvedParams.id },
    include: {
      profile: true,
      _count: { select: { followers: true, following: true, reviews: true } }
    }
  });

  if (!user) notFound();

  const session = await auth();
  const isSelf = session?.user?.id === user.id;

  // Check if following
  let isFollowing = false;
  if (session?.user?.id && !isSelf) {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: user.id
        }
      }
    });
    isFollowing = !!follow;
  }

  // Fetch recent activity (reviews)
  const recentReviews = await prisma.review.findMany({
    where: { userId: user.id },
    include: {
      media: true,
      user: { select: { id: true, name: true, image: true } },
      _count: { select: { likes: true, comments: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Fetch public collections
  const publicCollections = await prisma.collection.findMany({
    where: { userId: user.id, isPublic: true },
    include: {
      _count: { select: { items: true } },
      items: {
        include: { media: true },
        take: 4,
        orderBy: { order: 'asc' }
      }
    }
  });

  return (
    <div className="container py-8 space-y-12 max-w-5xl mx-auto">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <div className="h-32 w-32 rounded-full overflow-hidden bg-muted">
          {user.image ? (
            <img src={user.image} alt={user.name || 'User'} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-primary/20 flex items-center justify-center text-4xl font-bold text-primary">
              {(user.name || 'A')[0]}
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{user.name || 'Anonymous User'}</h1>
              {user.profile?.bio && <p className="text-muted-foreground mt-2 max-w-xl">{user.profile.bio}</p>}
            </div>
            
            {!isSelf && session?.user && (
              <form action={async () => {
                'use server';
                if (isFollowing) {
                  await prisma.follow.delete({
                    where: { followerId_followingId: { followerId: session.user.id!, followingId: user.id } }
                  });
                } else {
                  await prisma.follow.create({
                    data: { followerId: session.user.id!, followingId: user.id }
                  });
                  // Trigger notification
                  await prisma.notification.create({
                    data: {
                      userId: user.id,
                      type: 'FOLLOW',
                      title: 'New Follower',
                      message: `${session.user.name || 'Someone'} started following you.`,
                      link: `/user/${session.user.id}`
                    }
                  });
                }
              }}>
                <Button variant={isFollowing ? 'outline' : 'default'} className="gap-2">
                  {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </Button>
              </form>
            )}
          </div>

          <div className="flex gap-6 justify-center md:justify-start">
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold">{user._count.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold">{user._count.following}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl font-bold">{user._count.reviews}</div>
              <div className="text-sm text-muted-foreground">Reviews</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs / Sections */}
      <div className="grid md:grid-cols-3 gap-12">
        {/* Left Column - Activity Feed */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <SectionHeader title="Recent Reviews" />
            {recentReviews.length > 0 ? (
              <div className="space-y-6">
                {recentReviews.map(review => (
                  <div key={review.id} className="space-y-2">
                    <div className="text-sm text-muted-foreground font-medium">
                      Reviewed <span className="text-foreground">{review.media.title}</span>
                    </div>
                    <ReviewCard review={review} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground italic bg-muted/50 p-6 rounded-lg text-center">
                This user hasn't posted any reviews yet.
              </div>
            )}
          </section>
        </div>

        {/* Right Column - Public Collections */}
        <div className="space-y-8">
          <section>
            <SectionHeader title="Public Collections" />
            {publicCollections.length > 0 ? (
              <div className="space-y-4">
                {publicCollections.map(collection => (
                  <div key={collection.id} className="border rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{collection.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{collection._count.items} items</p>
                    
                    <div className="flex -space-x-4 overflow-hidden">
                      {collection.items.map(item => (
                        <div key={item.id} className="inline-block h-16 w-12 rounded ring-2 ring-background overflow-hidden relative">
                          {item.media.posterPath ? (
                            <img 
                              src={`https://image.tmdb.org/t/p/w92${item.media.posterPath}`} 
                              alt={item.media.title}
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full bg-primary/20" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground italic text-sm">
                No public collections.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
