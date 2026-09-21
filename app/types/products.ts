// app/types/index.ts
export type ProductBase = {
  id: number
  name: string
  src: string
  price: number | null
  images: { url: string; public_id: string | null }[]
  description: string
  in_stock: boolean
  attributes: {
    sizes: string[]
    tags: string[]
    brand: string
    ratio: string
  }
}

//queries.ts
export type Product = ProductBase & {
  category_slug: string | null
}

//AdminContext.tsx
type ProductCategory = {
  id: string
  name: string
  slug: string
}
export type AdminProduct  = ProductBase & {
  category: ProductCategory | null
  category_id: string | null
}

//ProductForm.tsx
export type ProductFormData = ProductBase & {
  category_id: string | null
}
export type ProductFormState = Omit<Product, 'id'> & { id?: number }

//Categoryform.tsx
export type ProductSummary = Pick<ProductBase, 'id' | 'name' | 'images'>
