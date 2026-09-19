import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
  className?: string;
}

export function SectionHeader({ title, href, linkText = 'Explore all', className }: SectionHeaderProps) {
  return (
    <div className={`flex items-end justify-between py-2 md:py-4 px-4 md:px-12 lg:px-16 ${className || ''}`}>
      <h2 className="text-lg font-bold tracking-tight md:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          {linkText} <span aria-hidden="true">&rarr;</span>
        </Link>
      )}
    </div>
  );
}
