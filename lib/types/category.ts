// lib/types/category.ts

import { ProductSummary } from "@/app/types/products";

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  total_products?: number;
  products?: ProductSummary[]; 
};

export type CategoryFormInput = {
  name: string;
};
