import { Skeleton } from '@/components/ui/skeleton';

export function MediaRowSkeleton() {
  return (
    <div className="flex space-x-4 overflow-hidden py-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="w-[140px] sm:w-[160px] md:w-[180px] lg:w-[200px] flex-none space-y-3">
          <Skeleton className="h-[210px] sm:h-[240px] md:h-[270px] lg:h-[300px] w-full rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
