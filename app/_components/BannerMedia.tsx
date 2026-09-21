import Image from 'next/image';
import { ProductsImgCoudinary } from '../ui/ProductsImageCloudinary';
import { getBannerMediaType } from '@/lib/utils';
import type { Banner } from '@/lib/types/banners';

interface BannerMediaProps {
  banner: Banner | null;
  className?: string;
  priority?: boolean; 
}

export function BannerMedia({ banner, className = 'object-cover', priority = false }: BannerMediaProps) {
  if (!banner?.image_url) return null;

  if (getBannerMediaType(banner.image_url) === 'video') {
    return (
      <video
        src={banner.image_url}
        className={`absolute inset-0 w-full h-full ${className}`}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }

  if (banner.image_public_id) {
    return (
      <ProductsImgCoudinary
        public_id={banner.image_public_id}
        name={banner.title ?? ''}
        clas={className}
      />
    );
  }

  return (
    <Image
      src={banner.image_url}
      alt={banner.title ?? ''}
      fill
      priority={priority}
      className={className}
    />
  );
}