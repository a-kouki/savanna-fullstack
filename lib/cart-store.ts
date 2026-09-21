// lib/cart-store.ts
import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  price: number
  size: string
  availableSizes: string[]   
  qty: number
  image?: string
  public_id?: string
}

export type AppliedCoupon = {
  coupon_id: string
  code: string
  type: 'percentage' | 'fixed' | 'free_shipping'
  scope: 'all' | 'products' | 'categories'
  discount_amount: number
  free_shipping: boolean
  eligible_product_ids: number[]
  eligible_subtotal: number
}

type CartStore = {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "qty">) => void
  removeItem: (id: string, size: string) => void
  updateQty: (id: string, size: string, qty: number) => void
  updateSize: (id: string, oldSize: string, newSize: string) => void
  clear: () => void
  total: () => number

  appliedCoupon: AppliedCoupon | null
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void
  clearCoupon: () => void
  discountedTotal: () => number
  itemDiscount: (item: CartItem) => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,

      addItem: (item) => {
        set((s) => {
          const existing = s.items.find(
            (i) => i.id === item.id && i.size === item.size
          )
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === item.id && i.size === item.size
                  ? { ...i, qty: i.qty + 1 }
                  : i
              ),
            }
          }
          return { items: [...s.items, { ...item, qty: 1 }] }
        })
      },

      removeItem: (id, size) => {
        set((s) => ({
          items: s.items.filter((i) => !(i.id === id && i.size === size)),
        }))
      },

      updateQty: (id, size, qty) => {
        if (qty < 1) return
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id && i.size === size ? { ...i, qty } : i
          ),
        }))
      },

      updateSize: (id, oldSize, newSize) => {
        set((s) => {
          const target = s.items.find((i) => i.id === id && i.size === oldSize)
          if (!target) return s
          const conflict = s.items.find((i) => i.id === id && i.size === newSize)
          if (conflict) {
            return {
              items: s.items
                .filter((i) => !(i.id === id && i.size === oldSize))
                .map((i) =>
                  i.id === id && i.size === newSize
                    ? { ...i, qty: i.qty + target.qty }
                    : i
                ),
            }
          }
          return {
            items: s.items.map((i) =>
              i.id === id && i.size === oldSize ? { ...i, size: newSize } : i
            ),
          }
        })
      },

      clear: () => set({ items: [], appliedCoupon: null }),

      total: () => get().items.reduce((acc, i) => acc + i.price * i.qty, 0),

      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),

      clearCoupon: () => set({ appliedCoupon: null }),

      discountedTotal: () => {
        const { items, appliedCoupon } = get()
        const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0)
        if (!appliedCoupon) return subtotal
        return Math.max(0, subtotal - appliedCoupon.discount_amount)
      },

      itemDiscount: (item) => {
        const { appliedCoupon } = get()
        if (!appliedCoupon) return 0
        if (appliedCoupon.free_shipping) return 0
        if (!appliedCoupon.eligible_product_ids.includes(Number(item.id))) return 0
        if (appliedCoupon.eligible_subtotal <= 0) return 0

        const itemSubtotal = item.price * item.qty
        const share = itemSubtotal / appliedCoupon.eligible_subtotal
        const raw = appliedCoupon.discount_amount * share

        return Math.round(raw * 100) / 100
      },
    }),
    { name: "savanna-cart" }
  )
)