import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});

export const loginRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'ratelimit:login',
})

export const magicLinkRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '1h'),
  prefix: 'ratelimit:magic',  
})

export const resetPasswordRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '15 m'),
  analytics: true,
  prefix: 'ratelimit:resetPassword',
})


export const adminActionRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, '1 m'), 
  prefix: 'ratelimit:admin-action',
})

export const orderRateLimit  = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '15 m'),
  analytics: true,
  prefix: 'ratelimit:orderRateLimit',
})


export const validateRateLimit  = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, '15 m'),
  analytics: true,
  prefix: 'ratelimit:orderRateLimit',
})