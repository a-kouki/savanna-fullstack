// app/_components/Section.tsx

import { FeaturedProducts } from "./Featuredproducts"
import { AllProducts } from "./Allproducts "
import { CategorySection } from "./CategorySection"
import { FullwidthBanner } from "./Fullwidthbanner"
import { AboutSection } from "./Aboutsection"
import { CTABanner } from "./Ctabanner"
import { PromoSection } from "./Promosection"

import { getProducts, getCategoriesPreview } from '@/app/lib/queries'

export async function Section() {
  const productsMap = await getProducts()
  //entender melhor
  const products = Object.values(productsMap)

  const categories = await getCategoriesPreview(4)

  return (
    <>
      {/* 1. Grid de destaques — 4 colunas */}
      <FeaturedProducts products={products} />
      {/* 2. Uma seção por categoria, com preview limitado + link "ver tudo" */}
      {categories.slice(0, 2).map((category) => (
        <CategorySection
          key={category.id}
          title={category.name}
          slug={category.slug}
          products={category.products}
        />
      ))}
      {/* 3. Grid completo (sem filtro de categoria) + botão "mais" */}
      <AllProducts products={products} />
      {/* 4. Banner fullwidth com texto sobreposto */}
      <FullwidthBanner />
      {/* 5. Split: texto + links | imagem produto */}
      <AboutSection />
      {/* 6. Split vermelho | amarelo — CTA de alto contraste */}
      <CTABanner />
      {/* 7. Split amarelo | imagem — seção promo */}
      <PromoSection />
    </>
  )
}