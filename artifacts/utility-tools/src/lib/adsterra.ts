export const AD_SCRIPT_SRC = 'https://pl30830724.effectivecpmnetwork.com/099cc095f7fdeaf8637557f3351d8834/invoke.js';
export const AD_CONTAINER_ID = 'container-099cc095f7fdeaf8637557f3351d8834';

let __ad_script_promise: Promise<void> | null = null;
export function loadAdScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (__ad_script_promise) return __ad_script_promise;

  __ad_script_promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${AD_SCRIPT_SRC}"]`);
    if (existing) {
      const s = existing as HTMLScriptElement;
      if ((s as any).loaded) return resolve();
      s.addEventListener('load', () => resolve());
      s.addEventListener('error', () => reject(new Error('Ad script failed to load')));
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
    s.addEventListener('error', () => reject(new Error('Ad script failed to load (network/CSP)')));
    document.head.appendChild(s);
  });

  return __ad_script_promise;
}
