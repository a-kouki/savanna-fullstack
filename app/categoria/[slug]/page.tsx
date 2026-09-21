// app/categoria/[slug]/page.tsx

import { notFound } from "next/navigation"
import { CategoryPageClient } from "@/app/_components/CategoryPageClient"
import { getCategoryWithProducts, getCategoriesList, getCategoryWithProductsSafe } from "@/app/lib/queries"
import { HeaderCategories } from "@/app/_components/HeaderCategories"
import { Contact } from "@/app/_components/Contact"

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const category = await getCategoryWithProductsSafe(slug);
  const categories = await getCategoriesList()

  if (!category) notFound()

  return (
    <>
      <HeaderCategories slug={category.name} />
      <div className="bg-white min-h-screen">
        <CategoryPageClient
          currentSlug={slug}
          categoryName={category.name}
          categoryProducts={category.products}
          categories={categories}
        />
      </div>
      <Contact/>
    </>
  )
}