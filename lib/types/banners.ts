export type BannerLinkType = 'none' | 'category' | 'url';
export type BannerPages = 'home' | 'products' | 'cart'

export interface Banner {
  id: string;
  title: string | null;
  description: string | null;
  image_url: string | null;
  image_public_id: string | null;
  link_type: BannerLinkType;
  category_id: string | null;
  custom_url: string | null;
  page: string | null;
  position: string | null;
  sort_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  category_name?: string | null;
}

export interface BannerFormInput {
  title?: string | null;
  description?: string | null;
  image_url: string | null;
  image_public_id: string | null;
  link_type: BannerLinkType;
  category_id?: string | null;
  custom_url?: string | null;
  page: string | null;
  position: string | null;
  sort_order?: number;
  active: boolean;
}

export const BANNER_PAGES: { value: string; label: string }[] = [
  { value: 'home', label: 'Página inicial' },
  { value: 'products', label: 'Produtos' },
  { value: 'category', label: 'Página de categoria' },
  { value: 'product', label: 'Página de produto' },
  { value: 'cart', label: 'Carrinho' },
];

export const BANNER_POSITIONS: { value: string; label: string }[] = [
  { value: 'hero', label: 'Hero (topo)' },
  { value: 'section_one', label: 'Seção 1' },
  { value: 'section_two', label: 'Seção 2' },
  { value: 'section_three', label: 'Seção 3' },
  { value: 'section_four', label: 'Seção 4' },
  { value: 'promo', label: 'Seção promo' },
  { value: 'footer', label: 'Rodapé' },
];