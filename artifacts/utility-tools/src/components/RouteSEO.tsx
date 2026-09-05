import { useLocation } from 'wouter';
import { getRouteSeo } from '@/lib/seo-config';
import { useSEO } from '@/hooks/useSEO';

export function RouteSEO() {
  const [location] = useLocation();
  const metadata = getRouteSeo(location);
  useSEO(metadata);
  return null;
}
