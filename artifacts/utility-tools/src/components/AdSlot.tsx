import { cn } from '@/lib/utils';

interface AdSlotProps {
  className?: string;
  id?: string;
}

export function AdSlot({ className, id = 'ad-slot' }: AdSlotProps) {
  return (
    <div
      className={cn(
        'bg-card/50 border border-border/50 rounded-lg flex items-center justify-center min-h-[100px] text-muted-foreground text-sm uppercase tracking-widest my-8',
        className,
      )}
      id={id}
      aria-label="Advertisement"
    >
      <span className="sr-only">Advertisement</span>
    </div>
  );
}
