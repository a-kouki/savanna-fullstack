import { NextRequest, NextResponse } from 'next/server'
import { loginRateLimit, redis } from '@/app/utils/redis'
import { createClient } from '@/app/utils/supabase/server'

const KNOWN_IP_TTL      = 60 * 60 * 24 * 30
const MAX_FAILED        = 3           // tentativas erradas antes de bloquear
const FAILED_WINDOW     = 60 * 15     // janela de 15 min para contar erros
const BLOCK_DURATION    = 60 * 60 * 6 // bloqueia por 6h após esgotar tentativas

const ADMIN_EMAIL = process.env.ADMIN_EMAIL 
const ME_EMAIL = process.env.NEXT_PUBLIC_ME_EMAIL

export async function POST(req: NextRequest) {
  const { email, password, honeypot } = await req.json()
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? '127.0.0.1'

  // ── 1. Honeypot ──────────────────────────────────────────────
  if (honeypot) {
    await redis.set(`blacklist:${ip}`, 'bot', { ex: 86400 })
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  // ── 2. Blacklist ─────────────────────────────────────────────
  // Já há no proxy
  if (await redis.get(`blacklist:${ip}`)) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }
  
  // ── 3. Rate limit por janela de tempo ────────────────────────
  const { success } = await loginRateLimit.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })
  }

  if (email !== ADMIN_EMAIL && email !== ME_EMAIL) {
    return NextResponse.json({ error: 'Erro ao Logar' }, { status: 401 })
  }

  // ── 4. Valida credenciais (sem setar cookie ainda) ───────────
  const supabaseCheck = await createClient()

  const { error: signInError } = await supabaseCheck.auth.signInWithPassword({
    email,
    password,
  })

  // ── 5. Senha errada → incrementa contador de falhas ──────────
  if (signInError) {
    const failKey      = `failed_attempts:${ip}`
    const attempts     = await redis.incr(failKey)

    if (attempts === 1) {
      await redis.expire(failKey, FAILED_WINDOW)
    }

    if (attempts >= MAX_FAILED) {
      await redis.set(`blacklist:${ip}`, 'failed_attempts', { ex: BLOCK_DURATION })
      await redis.del(failKey)
      return NextResponse.json(
        { error: 'Acesso bloqueado' },
        { status: 403 }
      )
    }

    const remaining = MAX_FAILED - attempts
    return NextResponse.json(
      { error: `Erro ao Logar` },
      { status: 401 }
    )
  }

  // ── 6. Senha correta → zera contador de falhas ───────────────
  await redis.del(`failed_attempts:${ip}`)

  // ── 7. Verifica IP conhecido ──────────────────────────────────
  const knownIpsKey = `known_ips:${email}`
  const isKnownIp   = await redis.sismember(knownIpsKey, ip)

  if (!isKnownIp) {
    return NextResponse.json({ mustUseMagicLink: true }, { status: 403 })
  }

  // ── 8. IP conhecido → seta sessão e libera ───────────────────
  await redis.sadd(knownIpsKey, ip)
  await redis.expire(knownIpsKey, KNOWN_IP_TTL)

  const response = NextResponse.json({ success: true })

  return response
}