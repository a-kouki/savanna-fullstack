// app/_components/Header.tsx (Server Component)
import { getAllBanners, getBannersFor } from "@/lib/data/banners";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const allBanners = await getAllBanners();
  const heroBanner = getBannersFor(allBanners, 'home', 'hero')[0] ?? null;
  return <HeaderClient heroBanner={heroBanner} />;
}