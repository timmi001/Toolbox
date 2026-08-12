import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const AD_ZONE = '11563289';
const AD_SCRIPT_SRC = 'https://nap5k.com/tag.min.js';

interface AdSlotProps {
  className?: string;
  id?: string;
}

export function AdSlot({ className, id = 'ad-slot' }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const loadAd = () => {
      setIsVisible(true);

      // Keep the ad script scoped to this existing placement. The data
      // attribute makes rerenders and StrictMode effect replays idempotent.
      if (container.querySelector(`script[data-toolboxx-ad-zone="${AD_ZONE}"]`)) {
        return;
      }

      const script = document.createElement('script');
      script.dataset.zone = AD_ZONE;
      script.dataset.toolboxxAdZone = AD_ZONE;
      script.src = AD_SCRIPT_SRC;
      script.async = true;
      script.onerror = () => {
        // A third-party ad failure must never affect the tool UI.
        script.remove();
      };
      container.appendChild(script);
    };

    if (typeof IntersectionObserver === 'undefined') {
      loadAd();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          loadAd();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(container);

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
