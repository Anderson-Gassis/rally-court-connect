import { describe, it, expect, beforeEach, vi } from 'vitest';
import { rateLimit } from '../rate-limiter';

describe('RateLimit Function', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('should allow requests within the limit', () => {
    const key = 'test-user-1';
    const config = { windowMs: 1000, maxRequests: 3 };

    const result1 = rateLimit(key, config);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = rateLimit(key, config);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = rateLimit(key, config);
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests exceeding the limit', () => {
    const key = 'test-user-2';
    const config = { windowMs: 1000, maxRequests: 2 };

    rateLimit(key, config);
    rateLimit(key, config);
    
    const blocked = rateLimit(key, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('should use default config when not provided', () => {
    const key = 'test-user-3';
    
    const result = rateLimit(key);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(9); // Default is 10 requests
  });

  it('should reset after time window expires', async () => {
    const key = 'test-user-4';
    const config = { windowMs: 100, maxRequests: 2 };

    rateLimit(key, config);
    rateLimit(key, config);
    
    const blocked = rateLimit(key, config);
    expect(blocked.allowed).toBe(false);

    // Wait for window to expire
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const afterReset = rateLimit(key, config);
    expect(afterReset.allowed).toBe(true);
    expect(afterReset.remaining).toBe(1);
  });

  it('should track different keys independently', () => {
    const config = { windowMs: 1000, maxRequests: 2 };
    
    rateLimit('user-1', config);
    rateLimit('user-1', config);
    const user1Blocked = rateLimit('user-1', config);
    expect(user1Blocked.allowed).toBe(false);
    
    const user2Allowed = rateLimit('user-2', config);
    expect(user2Allowed.allowed).toBe(true);
    expect(user2Allowed.remaining).toBe(1);
  });

  it('should return reset time', () => {
    const key = 'test-user-5';
    const config = { windowMs: 1000, maxRequests: 5 };
    
    const result = rateLimit(key, config);
    expect(result.resetTime).toBeGreaterThan(Date.now());
    expect(result.resetTime).toBeLessThanOrEqual(Date.now() + config.windowMs + 10);
  });
});
