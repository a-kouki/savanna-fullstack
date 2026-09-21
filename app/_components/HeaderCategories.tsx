// app/_components/HeaderCategories.tsx (Server Component)
import { getAllBanners, getBannersFor } from "@/lib/data/banners";
import { HeaderCategoriesClient } from "./HeaderCategoriesClient";

interface Slug{
  slug? : string 
}

export async function HeaderCategories({ slug }: Slug) {
  const allBanners = await getAllBanners();
  const heroBanner = getBannersFor(allBanners, 'products', 'hero')[0] ?? null;
  return <HeaderCategoriesClient heroBanner={heroBanner} slug={slug}/>;
}