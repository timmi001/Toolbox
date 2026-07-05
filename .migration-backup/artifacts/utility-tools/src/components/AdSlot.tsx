import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  className?: string;
  id?: string;
}

export function AdSlot({ className, id = 'ad-slot' }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={cn("bg-card/50 border border-border/50 rounded-lg flex items-center justify-center min-h-[100px] text-muted-foreground text-sm uppercase tracking-widest my-8", className)}
      id={id}
    >
      {isVisible ? 'Advertisement' : ''}
    </div>
  );
}
