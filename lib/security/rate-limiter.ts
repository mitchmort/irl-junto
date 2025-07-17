/**
 * Rate Limiter for Webhook Endpoints
 * Prevents abuse of Twilio webhooks and other sensitive endpoints
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request should be rate limited
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @returns true if request should be allowed, false if rate limited
   */
  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.requests.get(identifier);

    // Clean up expired entries
    this.cleanup(now);

    if (!entry || now >= entry.resetTime) {
      // First request or window expired
      const resetTime = now + this.config.windowMs;
      this.requests.set(identifier, { count: 1, resetTime });
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime
      };
    }

    if (entry.count >= this.config.maxRequests) {
      // Rate limit exceeded
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Increment count
    entry.count += 1;
    this.requests.set(identifier, entry);

    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private cleanup(now: number) {
    for (const [key, entry] of this.requests.entries()) {
      if (now >= entry.resetTime) {
        this.requests.delete(key);
      }
    }
  }

  /**
   * Reset rate limit for a specific identifier
   */
  reset(identifier: string) {
    this.requests.delete(identifier);
  }

  /**
   * Get current status for identifier
   */
  getStatus(identifier: string): { count: number; remaining: number; resetTime: number } | null {
    const entry = this.requests.get(identifier);
    if (!entry || Date.now() >= entry.resetTime) {
      return null;
    }

    return {
      count: entry.count,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }
}

// Pre-configured rate limiters for different endpoints
export const webhookRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute per IP
});

export const smsWebhookRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute  
  maxRequests: 10, // 10 SMS webhooks per minute per phone number
});

export const statusWebhookRateLimiter = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 50, // 50 status updates per minute per account
});

/**
 * Utility function to get client IP from Next.js request
 */
export function getClientIP(request: Request): string {
  // Check various headers for the real IP
  const headers = new Headers(request.headers);
  
  return (
    headers.get('x-forwarded-for')?.split(',')[0] ||
    headers.get('x-real-ip') ||
    headers.get('cf-connecting-ip') || // Cloudflare
    headers.get('x-client-ip') ||
    'unknown'
  );
}

/**
 * Create rate limit response headers
 */
export function createRateLimitHeaders(result: { remaining: number; resetTime: number }) {
  const resetTimeSeconds = Math.ceil((result.resetTime - Date.now()) / 1000);
  
  return {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': resetTimeSeconds.toString(),
    'Retry-After': resetTimeSeconds.toString(),
  };
}

export { RateLimiter, type RateLimitConfig }; 