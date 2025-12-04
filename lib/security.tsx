// Security utilities for input sanitization and rate limiting

/**
 * Sanitize user input to prevent XSS attacks
 * Removes/escapes potentially dangerous HTML characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return ""

  return (
    input
      .trim()
      // Remove script tags and their content
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      // Remove event handlers
      .replace(/on\w+="[^"]*"/gi, "")
      .replace(/on\w+='[^']*'/gi, "")
      // Escape HTML entities
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      // Limit length to prevent abuse
      .slice(0, 1000)
  )
}

/**
 * Sanitize username - only allow safe characters
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== "string") return ""

  return (
    username
      .trim()
      // Only allow letters, numbers, underscores, and hyphens
      .replace(/[^a-zA-Z0-9_-]/g, "")
      // Limit length
      .slice(0, 30)
  )
}

/**
 * Validate URL for avatar - only allow https URLs
 */
export function sanitizeAvatarUrl(url: string): string {
  if (!url || typeof url !== "string") return ""

  const trimmed = url.trim()

  // Only allow https URLs
  if (!trimmed.startsWith("https://")) {
    return ""
  }

  // Basic URL validation
  try {
    const parsed = new URL(trimmed)
    // Only allow http(s) protocols
    if (!["https:", "http:"].includes(parsed.protocol)) {
      return ""
    }
    return trimmed.slice(0, 500)
  } catch {
    return ""
  }
}

/**
 * Rate limiter using localStorage (client-side)
 * Returns true if action is allowed, false if rate limited
 */
interface RateLimitConfig {
  key: string
  maxAttempts: number
  windowMs: number // Time window in milliseconds
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

export function checkRateLimit(config: RateLimitConfig): {
  allowed: boolean
  remainingAttempts: number
  resetIn: number
} {
  const { key, maxAttempts, windowMs } = config
  const storageKey = `rate_limit_${key}`

  // Skip rate limiting on server
  if (typeof window === "undefined") {
    return { allowed: true, remainingAttempts: maxAttempts, resetIn: 0 }
  }

  const now = Date.now()
  let entry: RateLimitEntry

  try {
    const stored = localStorage.getItem(storageKey)
    entry = stored ? JSON.parse(stored) : { count: 0, resetAt: now + windowMs }
  } catch {
    entry = { count: 0, resetAt: now + windowMs }
  }

  // Reset if window has passed
  if (now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs }
  }

  const remainingAttempts = Math.max(0, maxAttempts - entry.count)
  const resetIn = Math.max(0, entry.resetAt - now)

  if (entry.count >= maxAttempts) {
    return { allowed: false, remainingAttempts: 0, resetIn }
  }

  // Increment count
  entry.count++

  try {
    localStorage.setItem(storageKey, JSON.stringify(entry))
  } catch {
    // Storage full or unavailable, allow the action
  }

  return { allowed: true, remainingAttempts: remainingAttempts - 1, resetIn }
}

/**
 * Rate limit configurations for different actions
 */
export const RATE_LIMITS = {
  checkIn: {
    key: "checkin",
    maxAttempts: 10, // 10 check-ins
    windowMs: 60 * 1000, // per minute
  },
  rating: {
    key: "rating",
    maxAttempts: 20, // 20 ratings
    windowMs: 60 * 1000, // per minute
  },
  profileUpdate: {
    key: "profile_update",
    maxAttempts: 5, // 5 updates
    windowMs: 60 * 1000, // per minute
  },
} as const
