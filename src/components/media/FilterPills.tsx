import { ChevronDown } from 'lucide-react';

export function FilterPills() {
  return (
    <div className="flex w-full items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-4 md:px-6">
      <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors">
        Genre
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors">
        Year
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors">
        Popular
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors">
        Provider
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
      <button className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary/50 px-4 py-1.5 text-sm font-medium hover:bg-secondary/80 transition-colors">
        Country
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    </div>
  );
}
