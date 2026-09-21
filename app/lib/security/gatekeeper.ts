// app/lib/security/gatekeeper.ts
import { NextResponse } from 'next/server'
import { redis } from '@/app/utils/redis'
import type { Ratelimit } from '@upstash/ratelimit'

type GatekeeperOptions = {
  ip: string | null
  honeypot?: unknown
  limiter: Ratelimit
}

export async function gatekeeper({ ip, honeypot, limiter }: GatekeeperOptions) {
  if (!ip) {
    return NextResponse.json({ error: 'Usuário não identificado.' }, { status: 400 })
  }

  if (honeypot) {
    await redis.set(`blacklist:${ip}`, 'bot', { ex: 86400 })
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  if (await redis.get(`blacklist:${ip}`)) {
    return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 })
  }

  const { success } = await limiter.limit(ip)
  if (!success) {
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })
  }

  return null
}