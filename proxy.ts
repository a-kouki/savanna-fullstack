import { type NextFetchEvent, type NextRequest, NextResponse } from "next/server";
import { redis, ratelimit, adminActionRateLimit } from "./app/utils/redis";
import { createClient } from "./app/utils/supabase/server";

const blacklistCache = new Map<string, number>(); // ip -> timestamp de expiração
const CACHE_TTL_MS = 30_000;

function isCachedBlacklisted(ip: string): boolean {
  const expiresAt = blacklistCache.get(ip);
  if (!expiresAt) return false;
  if (Date.now() > expiresAt) {
    blacklistCache.delete(ip);
    return false;
  }
  return true;
}

function cacheBlacklist(ip: string) {
  blacklistCache.set(ip, Date.now() + CACHE_TTL_MS);
}

export default async function proxy(
  request: NextRequest,
  context: NextFetchEvent
): Promise<Response> {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/api/auth') || pathname === '/blocked') {
    return NextResponse.next();
  }

  if (
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/admin") &&
    !pathname.startsWith("/login")
  ) {
    return NextResponse.next();
  }

  const isAdminApiRoute = pathname.startsWith('/api/admin');
  const isAdminPageRoute = pathname.startsWith('/admin');
  const isLoginRoute = pathname === '/login';
  const needsSession = isAdminApiRoute || isAdminPageRoute || isLoginRoute;

  // ── 1. IP + validação (grátis, em memória) ──
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip");

  if (!ip) return handleBlock(request, "IP não identificado.");

  const isValidIp =
    /^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip) || /^[0-9a-fA-F:]+$/.test(ip);
  if (!isValidIp) return handleBlock(request, "IP inválido.");

  // ── 2. Cache local (grátis, em memória) ──
  if (isCachedBlacklisted(ip)) return handleBlock(request, "Acesso negado.");

  // ── 3. Blacklist no Redis (1 round-trip, barato) ──
  const isBlacklisted = await redis.get(`blacklist:${ip}`);
  if (isBlacklisted) {
    cacheBlacklist(ip);
    return handleBlock(request, "Acesso negado.");
  }

  // ── 4. getUser() só quando a rota realmente exige sessão ──
  let session = null;
  if (needsSession) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    session = user;

    if ((isAdminApiRoute || isAdminPageRoute) && !session) {
      return isAdminApiRoute
        ? NextResponse.json({ error: 'Não autorizado.' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
    }
    if (isLoginRoute && session) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // ── 5. CSRF (grátis, só header) ──
  if (
    isAdminApiRoute &&
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method) &&
    request.headers.get('sec-fetch-site') !== 'same-origin'
  ) {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 });
  }

  // ── 6. Rate limit (1 round-trip) ──
  const limiter = isAdminApiRoute && session ? adminActionRateLimit : ratelimit;
  const limiterKey = isAdminApiRoute && session ? session.id : ip;

  const { success, limit, remaining, pending } = await limiter.limit(limiterKey);
  context.waitUntil(pending);

  if (!success) {
    if (!isAdminApiRoute) {
      const violations = await redis.incr(`violations:${ip}`);
      await redis.expire(`violations:${ip}`, 3600);
      if (violations >= 10) await redis.set(`blacklist:${ip}`, true, { ex: 86400 });
    }
    return handleBlock(request, "Too Many Requests", 429);
  }

  const res = NextResponse.next();
  res.headers.set("X-RateLimit-Limit", limit.toString());
  res.headers.set("X-RateLimit-Remaining", remaining.toString());
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains");

  return res;
}

function handleBlock(
  request: NextRequest,
  message: string,
  status: number = 403
) {
  const isApi = request.nextUrl.pathname.startsWith("/api");

  if (isApi) {
    return NextResponse.json({ error: message }, { status });
  }

  const url = new URL("/blocked", request.url);
  url.searchParams.set("reason", message);

  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/login/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|woff2?)).*)",
  ],
};