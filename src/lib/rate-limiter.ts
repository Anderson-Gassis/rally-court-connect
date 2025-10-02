// Simple in-memory rate limiter for edge functions
// For production, consider using Redis or a distributed cache

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
}

const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 10 }
): { allowed: boolean; remaining: number; resetTime: number } => {
  const now = Date.now();
  const record = requestCounts.get(identifier);

  // Clean up old entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetTime < now) {
        requestCounts.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    // New window
    const resetTime = now + config.windowMs;
    requestCounts.set(identifier, { count: 1, resetTime });
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  // Increment count
  record.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
};
