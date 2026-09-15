import { CalendarView } from '@/components/releases/CalendarView';

export const metadata = {
  title: 'Release Calendar | Anitale',
};

export default function CalendarPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Release Calendar</h1>
      <p className="text-muted-foreground mb-8">Keep track of upcoming episode and movie releases.</p>
      <CalendarView />
    </div>
  );
}
