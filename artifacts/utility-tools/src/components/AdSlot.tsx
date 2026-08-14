import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { AD_CONTAINER_ID, loadAdScript } from '@/lib/adsterra';

interface AdSlotProps {
  className?: string;
  id?: string;
}

export function AdSlot({ className, id = 'ad-slot' }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Create the exact required container synchronously after mount so it's present
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const existing = document.getElementById(AD_CONTAINER_ID);
    if (!existing && wrapperRef.current) {
      const adDiv = document.createElement('div');
      adDiv.id = AD_CONTAINER_ID;
      adDiv.style.width = '100%';
      adDiv.style.minHeight = '100px';
      adDiv.className = 'w-full';
      wrapperRef.current.appendChild(adDiv);
    }
  }, []);

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

    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // When visible, load the ad script (only after container exists)
  useEffect(() => {
    if (!isVisible || typeof document === 'undefined') return;

    const container = document.getElementById(AD_CONTAINER_ID);
    if (!container) {
      console.error('Ad container is missing from DOM:', AD_CONTAINER_ID);
      if (wrapperRef.current) wrapperRef.current.setAttribute('data-ad-status', 'missing-container');
      return;
    }

    loadAdScript()
      .then(() => {
        if (wrapperRef.current) wrapperRef.current.setAttribute('data-ad-status', 'loaded');
      })
      .catch((err) => {
        console.error('Ad script failed to load:', err);
        if (wrapperRef.current) wrapperRef.current.setAttribute('data-ad-status', 'script-load-failed');
      });
  }, [isVisible]);

  return (
    <div
      ref={wrapperRef}
      className={cn("bg-card/50 border border-border/50 rounded-lg flex items-center justify-center min-h-[100px] text-muted-foreground text-sm uppercase tracking-widest my-8", className)}
      id={id}
    >
      {!isVisible ? 'Advertisement' : null}
    </div>
  );
}
