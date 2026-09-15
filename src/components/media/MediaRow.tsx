'use client';

import { useRef } from 'react';

interface MediaRowProps {
  children: React.ReactNode;
}

export function MediaRow({ children }: MediaRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  // In a real implementation, you'd add left/right scroll buttons here
  return (
    <div className="relative group">
      <div 
        ref={rowRef}
        className="flex w-full overflow-x-auto gap-4 pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex flex-nowrap gap-4 px-4 sm:px-0">
          {children}
        </div>
      </div>
    </div>
  );
}
