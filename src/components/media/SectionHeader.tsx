import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  href?: string;
  linkText?: string;
}

export function SectionHeader({ title, href, linkText = 'Explore all' }: SectionHeaderProps) {
  return (
    <div className="flex items-end justify-between py-4">
      <h2 className="text-xl font-bold tracking-tight md:text-2xl">{title}</h2>
      {href && (
        <Link href={href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
          {linkText} <span aria-hidden="true">&rarr;</span>
        </Link>
      )}
    </div>
  );
}
