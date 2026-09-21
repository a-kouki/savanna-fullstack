// lib/cloudinary-images.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export { cloudinary }

const MAX_IMAGES = 6
const MAX_USAGE_GB = 2

export type IncomingImage =
  | { type: 'existing'; url: string; public_id: string }
  | { type: 'url'; url: string }
  | { type: 'new'; tempId: string }

export type ResolvedImage = { url: string; public_id: string | null }

export async function resolveImages(images: IncomingImage[], formData: FormData): Promise<ResolvedImage[]> {
  if (!Array.isArray(images) || images.length === 0) return []
  if (images.length > MAX_IMAGES) {
    throw new Error(`Máximo de ${MAX_IMAGES} imagens por produto`)
  }

  const hasNewFiles = images.some(img => img.type === 'new')
  if (hasNewFiles) {
    const usage = await cloudinary.api.usage()
    const usedGB = usage.storage.usage / (1024 * 1024 * 1024)
    if (usedGB >= MAX_USAGE_GB) {
      throw new Error(`Limite de ${MAX_USAGE_GB}GB atingido`)
    }
  }

  const resolved: ResolvedImage[] = []

  for (const img of images) {
    if (img.type === 'existing') {
      resolved.push({ url: img.url, public_id: img.public_id })
      continue
    }

    if (img.type === 'url') {
      resolved.push({ url: img.url, public_id: null })
      continue
    }

    const file = formData.get(`file_${img.tempId}`) as File | null
    if (!file) continue

    if (file.size > 10 * 1024 * 1024) {
      throw new Error(`Uma das imagens é muito grande. Máximo 10MB`)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'savanna',
          eager: [{ quality: 'auto:low', fetch_format: 'webp', width: 1200, crop: 'limit' }],
          eager_async: false,
          overwrite: true,
        },
        (error, result) => { if (error) reject(error); else resolve(result) }
      ).end(buffer)
    })

    resolved.push({ url: result.secure_url, public_id: result.public_id })
  }

  return resolved
}

export async function cleanupRemovedImages(oldImages: ResolvedImage[], newImages: ResolvedImage[]) {
  const keptPublicIds = new Set(newImages.map(i => i.public_id).filter(Boolean))
  const removed = oldImages.filter(i => i.public_id && !keptPublicIds.has(i.public_id))
  await Promise.all(
    removed.map(i => cloudinary.uploader.destroy(i.public_id as string).catch(() => {}))
  )
}