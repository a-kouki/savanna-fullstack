//  lib/types/coupon.ts

export type CouponType = 'percentage' | 'fixed' | 'free_shipping';

export type CouponScope = 'all' | 'products' | 'categories';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  type: CouponType;
  value: number | null;
  min_order_value: number | null;
  max_discount_value: number | null;
  usage_limit_total: number | null;
  usage_limit_per_customer: number | null;
  starts_at: string | null;
  expires_at: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  total_redemptions?: number;

  scope: CouponScope;
  products?: { id: number; name: string }[];
  categories?: { id: string; name: string }[];
}

export interface CouponFormInput {
  code: string;
  description?: string;
  type: CouponType;
  value?: number;
  min_order_value?: number;
  max_discount_value?: number;
  usage_limit_total?: number;
  usage_limit_per_customer?: number;
  starts_at?: string;
  expires_at?: string;
  active: boolean;

  scope: CouponScope;
  product_ids?: number[];   
  category_ids?: string[];  
}