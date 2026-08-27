/**
 * BISIKLAGU IN-MEMORY RATE LIMITER & BRUTE FORCE PROTECTION
 */

interface RateLimitStore {
  [key: string]: number[];
}

const rateLimitStore: RateLimitStore = {};

// Clean up expired IP entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const key in rateLimitStore) {
    rateLimitStore[key] = rateLimitStore[key].filter((time) => now - time < 60000);
    if (rateLimitStore[key].length === 0) {
      delete rateLimitStore[key];
    }
  }
}, 10 * 60 * 1000);

export function isRateLimited(
  ip: string,
  action: string,
  limit = 5,
  windowMs = 60000
): boolean {
  const key = `${action}:${ip}`;
  const now = Date.now();

  if (!rateLimitStore[key]) {
    rateLimitStore[key] = [];
  }

  // Filter requests outside window
  rateLimitStore[key] = rateLimitStore[key].filter((time) => now - time < windowMs);

  if (rateLimitStore[key].length >= limit) {
    return true; // Exceeded limit
  }

  rateLimitStore[key].push(now);
  return false;
}
