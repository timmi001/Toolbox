import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  className?: string;
  id?: string;
}

const AD_SCRIPT_SRC = 'https://pl30830724.effectivecpmnetwork.com/099cc095f7fdeaf8637557f3351d8834/invoke.js';
const AD_CONTAINER_ID = 'container-099cc095f7fdeaf8637557f3351d8834';

let __ad_script_promise: Promise<void> | null = null;
function loadAdScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (__ad_script_promise) return __ad_script_promise;

  __ad_script_promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`);
    if (existing) {
      const s = existing as HTMLScriptElement;
      if ((s as any).loaded) return resolve();
      s.addEventListener('load', () => resolve());
      s.addEventListener('error', (e) => reject(new Error('Ad script failed to load')));
      // fallback resolve in 3s in case script ran but didn't fire
      setTimeout(() => resolve(), 3000);
      return;
    }

    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = AD_SCRIPT_SRC;
    s.addEventListener('load', () => {
      (s as any).loaded = true;
      resolve();
    });
    s.addEventListener('error', (ev) => reject(new Error('Ad script failed to load (network/CSP)')));
    document.head.appendChild(s);
  });

  return __ad_script_promise;
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
        // script loaded — provider usually auto-scans the DOM; mark success
        if (wrapperRef.current) wrapperRef.current.setAttribute('data-ad-status', 'loaded');
      })
      .catch((err) => {
        console.error('Ad script failed to load:', err);
        if (wrapperRef.current) wrapperRef.current.setAttribute('data-ad-status', 'script-load-failed');
        // If CSP blocked it, browsers usually emit an error; surface a hint
      });
  }, [isVisible]);

  return (
    <div
      ref={wrapperRef}
      className={cn("bg-card/50 border border-border/50 rounded-lg flex items-center justify-center min-h-[100px] text-muted-foreground text-sm uppercase tracking-widest my-8", className)}
      id={id}
    >
      {/* placeholder text only until visible */}
      {!isVisible ? 'Advertisement' : null}
    </div>
  );
}
