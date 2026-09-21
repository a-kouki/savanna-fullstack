//app/lib/queries.ts

import { unstable_cache } from "next/cache";
import { supabasePublic } from "../utils/supabase/public";
import { Product } from "../types/products";

type ProductMap = Record<string, Product>

const PRODUCT_FIELDS = `
  id, name, src, price, description, images, in_stock, attributes,
  product_categories(category:categories(slug))
`;

export const getProducts = unstable_cache(
  async (): Promise<ProductMap> => {
    let { data: products, error } = await supabasePublic
      .from('products')
      .select(PRODUCT_FIELDS)
      .eq('user_id', process.env.USER_ID)

    if (error || !products) return {}

    const flattened = products.map((p: any) => {
      const { product_categories, ...rest } = p
      return {
        ...rest,
        category_slug: product_categories?.[0]?.category?.slug ?? null,
      }
    })

    return Object.fromEntries(
      flattened.map((p) => [p.src, p])
    )
  },
  ['products-list'],
  { revalidate: false, tags: ['products'] }
)

export async function getProductsBySrc(src: string): Promise<Product | null> {
  const productsMap = await getProducts()
  return productsMap[src] ?? null
}

// Lista de categorias, sem produtos, pro menu/tabs de navegação
export const getCategoriesList = unstable_cache(
  async () => {
    const { data, error } = await supabasePublic
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    if (error || !data) return [];
    return data;
  },
  ['categories-list'],
  { revalidate: 3600, tags: ['categories'] }
);

// Categorias com preview de produtos pra home
export const getCategoriesPreview = unstable_cache(
  async (limitPerCategory: number = 4) => {
    const { data: categories, error } = await supabasePublic
      .from('categories')
      .select(`id, name, slug, product_categories(product:products(${PRODUCT_FIELDS}))`)
      .order('name', { ascending: true })
      .limit(limitPerCategory, { foreignTable: 'product_categories' });

    if (error || !categories) return [];

    return categories
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        products: (c.product_categories ?? [])
          .map((pc: any) => pc.product)
          .filter(Boolean) as Product[],
      }))
      .filter((c) => c.products.length > 0); 
  },
  ['categories-preview'],
  { revalidate: 3600, tags: ['categories'] }
);

export const getCategoryWithProducts = (slug: string) =>
  unstable_cache(
    async (slug: string) => {
      const { data: category, error } = await supabasePublic
        .from('categories')
        .select(`id, name, slug, product_categories(product:products(${PRODUCT_FIELDS}))`)
        .eq('slug', slug)
        .single();

      if (error || !category) return null;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        products: (category.product_categories ?? [])
          .map((pc: any) => pc.product)
          .filter(Boolean) as Product[],
      };
    },
    ['category-with-products', slug],
    { tags: [`category-${slug}`], revalidate: 3600 },
  )(slug);


export async function getCategoryWithProductsSafe(slug: string) {
  const categories = await getCategoriesList(); 
  const exists = categories.some((c) => c.slug === slug);
  if (!exists) return null; 
  return getCategoryWithProducts(slug);
}