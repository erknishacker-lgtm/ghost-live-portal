import { RateLimiterMemory } from 'rate-limiter-flexible';

// In-memory limiters — fine for a single-container deployment (v1). If this
// ever runs multiple replicas, swap the `RateLimiterMemory` for a Redis-backed
// limiter from the same library without changing call sites.
const activateByIp = new RateLimiterMemory({ points: 10, duration: 60 });
const activateByPair = new RateLimiterMemory({ points: 5, duration: 60 });
const loginByIp = new RateLimiterMemory({ points: 10, duration: 60 });
const loginByEmail = new RateLimiterMemory({ points: 5, duration: 60 });

export async function consumeOrThrow(limiter: RateLimiterMemory, key: string) {
  try {
    await limiter.consume(key);
  } catch {
    const error = new Error('RATE_LIMITED');
    (error as Error & { code: string }).code = 'RATE_LIMITED';
    throw error;
  }
}

export const rateLimiters = { activateByIp, activateByPair, loginByIp, loginByEmail };

export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
