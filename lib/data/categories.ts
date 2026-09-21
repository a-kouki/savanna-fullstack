import { unstable_cache } from "next/cache"
import { supabasePublic } from '@/app/utils/supabase/public';

export const getCategoryWithProducts = (slug:string) => unstable_cache(
    async(slug: string) => {
        const { data: category, error } = await supabasePublic
            .from('categories')
            .select('*, product_categories(product:products(*))')
            .eq('slug', slug) 
            .single();
        
        return category;    
    },
    ['category-with-products', slug],
  { tags: [`category-${slug}`], revalidate: 3600  } 
)(slug)