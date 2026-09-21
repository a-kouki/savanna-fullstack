// app/api/admin/products/check-image-url/route.ts
export async function POST(req: Request) {
  const { url } = await req.json()
  if (!url) return Response.json({ valid: false, error: 'URL vazia' })

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'Mozilla/5.0', Referer: new URL(url).origin },
    })

    const contentType = res.headers.get('content-type') ?? ''

    if (!res.ok) {
      return Response.json({ valid: false, error: `Servidor retornou ${res.status}` })
    }
    if (!contentType.startsWith('image/')) {
      return Response.json({ valid: false, error: 'URL não aponta para uma imagem' })
    }

    return Response.json({ valid: true })
  } catch {
    return Response.json({ valid: false, error: 'Não foi possível acessar a URL' })
  }
}