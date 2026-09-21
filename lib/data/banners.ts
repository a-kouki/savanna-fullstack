import { unstable_cache } from 'next/cache';
import { supabasePublic } from '@/app/utils/supabase/public';
import type { Banner } from '@/lib/types/banners';

export const getAllBanners = unstable_cache(
  async (): Promise<Banner[]> => {

    const { data, error } = await supabasePublic
      .from('banners')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true });
    
    if (error) {
      console.error('Erro ao buscar banners:', error);
      return [];
    }
    return data ?? [];
  },
  ['all-banners'],
  { tags: ['banners'], revalidate: 300 },
);

//filtra em memória, sem nova query
export function getBannersFor(banners: Banner[], page: string, position: string): Banner[] {
  return banners.filter((b) => b.page === page && b.position === position);
}