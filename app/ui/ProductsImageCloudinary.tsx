'use client'
import { CldImage } from 'next-cloudinary'

export function ProductsImgCoudinary({ public_id, name, clas, }: { public_id: string, name: string, clas:string }) {
    return (
    <CldImage
      src={public_id}
      fill
      className={clas}
      quality="auto:best"
      sizes="100vw"
      alt={name}
    />
  )
}