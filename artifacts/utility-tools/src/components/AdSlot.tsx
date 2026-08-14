import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface AdSlotProps {
  className?: string;
  id?: string;
}

const AD_SCRIPT_SRC = 'https://pl30830724.effectivecpmnetwork.com/099cc095f7fdeaf8637557f3351d8834/invoke.js';
const AD_KEY = '099cc095f7fdeaf8637557f3351d8834';

let __ecpn_script_promise: Promise<void> | null = null;
function loadEcpnScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (__ecpn_script_promise) return __ecpn_script_promise;

  __ecpn_script_promise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`);
    if (existing) {
      (existing as HTMLScriptElement).addEventListener('load', () => resolve());
      setTimeout(() => resolve(), 1000);
      return;
    }

    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = AD_SCRIPT_SRC;
    s.addEventListener('load', () => resolve());
    document.head.appendChild(s);
  });

  return __ecpn_script_promise;
}

export function AdSlot({ className, id = 'ad-slot' }: AdSlotProps) {
  const [isVisible, setIsVisible] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const adContainerIdRef = useRef<string | null>(null);

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

    if (wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || typeof document === 'undefined') return;

    loadEcpnScript().then(() => {
      if (!wrapperRef.current) return;

      if (adContainerIdRef.current) return;

      const unique = Math.random().toString(36).slice(2, 9);
      const containerId = `container-${AD_KEY}-${unique}`;
      adContainerIdRef.current = containerId;

      const adDiv = document.createElement('div');
      adDiv.id = containerId;
      adDiv.style.width = '100%';
      adDiv.style.minHeight = '100px';
      adDiv.className = 'w-full';

      adDiv.setAttribute('data-ecpn-ad', AD_KEY);

      wrapperRef.current.appendChild(adDiv);

      try {
        // @ts-ignore
        if (window?.ecpn && typeof window.ecpn.render === 'function') {
          // @ts-ignore
          window.ecpn.render(containerId);
        }
      } catch (e) {
        // ignore
      }
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
