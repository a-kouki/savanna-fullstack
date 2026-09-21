// app/api/search/products/route.ts
import { getProducts } from '@/app/lib/queries'

export async function GET() {
  const productsMap = await getProducts() 
  const products = Object.values(productsMap)

  const minimal = products.map((p) => ({
    id: p.id,
    name: p.name,
    src: p.src,
    price: p.price,
    images: p.images,
  }))

  return Response.json(minimal)
}