import { useEffect } from 'react';
import type { SeoMetadata } from '@/lib/seo-config';

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export function useSEO(metadata: SeoMetadata | null): void;
export function useSEO(title: string, description: string): void;
export function useSEO(metadataOrTitle: SeoMetadata | string | null, description?: string) {
  useEffect(() => {
    if (!metadataOrTitle) return;

    const metadata = typeof metadataOrTitle === 'string'
      ? { title: metadataOrTitle, description: description ?? '' }
      : metadataOrTitle;
    const url = window.location.href;

    document.title = metadata.title;
    upsertMeta('name', 'description', metadata.description);
    upsertMeta('property', 'og:type', 'website');
    upsertMeta('property', 'og:url', url);
    upsertMeta('property', 'og:title', metadata.title);
    upsertMeta('property', 'og:description', metadata.description);
    upsertMeta('name', 'twitter:card', 'summary_large_image');
    upsertMeta('name', 'twitter:title', metadata.title);
    upsertMeta('name', 'twitter:description', metadata.description);
  }, [metadataOrTitle, description]);
}
