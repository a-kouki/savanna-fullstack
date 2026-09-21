import { v2 as cloudinary } from 'cloudinary'
import { createClient } from '@/app/utils/supabase/server'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const MAX_USAGE_GB = 2

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Não autorizado' }, { status: 401 })

  const usage = await cloudinary.api.usage()
  const usedGB = usage.storage.usage / (1024 * 1024 * 1024)
  const usedMB = usage.storage.usage / (1024 * 1024)
  const availableGB = MAX_USAGE_GB - usedGB

  return Response.json({
    usedGB: usedGB.toFixed(3),
    usedMB: usedMB.toFixed(1),
    availableGB: availableGB.toFixed(3),
    maxGB: MAX_USAGE_GB,
    percentUsed: ((usedGB / MAX_USAGE_GB) * 100).toFixed(1),
  })
}