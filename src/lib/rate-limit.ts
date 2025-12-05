/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or Upstash
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a given identifier
 * @param identifier - Unique identifier (IP, user ID, email, etc.)
 * @param config - Rate limit configuration
 * @returns Rate limit result with success status and metadata
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const key = identifier;
  
  const entry = rateLimitStore.get(key);
  
  if (!entry || now > entry.resetTime) {
    // First request or window expired - create new entry
    const resetTime = now + config.windowMs;
    rateLimitStore.set(key, { count: 1, resetTime });
    
    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: resetTime,
    };
  }
  
  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: entry.resetTime,
    };
  }
  
  // Increment counter
  entry.count++;
  
  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - entry.count,
    reset: entry.resetTime,
  };
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Rate limit configurations for different endpoints
 */
export const RATE_LIMITS = {
  // Booking endpoints - prevent spam bookings
  BOOKING_CREATE: {
    maxRequests: 10, // 10 bookings
    windowMs: 60 * 60 * 1000, // per hour
  },
  BOOKING_CANCEL: {
    maxRequests: 5, // 5 cancellations
    windowMs: 60 * 60 * 1000, // per hour
  },
  
  // Payment endpoints - protect payment processing
  PAYMENT_CREATE: {
    maxRequests: 3, // 3 payment attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },
  
  // Auth endpoints - prevent brute force
  LOGIN: {
    maxRequests: 5, // 5 login attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },
  REGISTER: {
    maxRequests: 3, // 3 registration attempts
    windowMs: 60 * 60 * 1000, // per hour
  },
  
  // General API endpoints
  API_GENERAL: {
    maxRequests: 100, // 100 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
  },
} as const;
