// Security utilities for input sanitization and rate limiting

// Rate limit configuration
export const RATE_LIMITS = {
  checkIn: { max: 10, windowMs: 60000 }, // 10 check-ins per minute
  rating: { max: 20, windowMs: 60000 }, // 20 ratings per minute
  profile: { max: 5, windowMs: 60000 }, // 5 profile updates per minute
}

// In-memory rate limit store (resets on page refresh - suitable for client-side)
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map()

/**
 * Check if an action is rate limited
 * @returns Object with allowed status and waitTime if rate limited
 */
export function checkRateLimit(
  action: keyof typeof RATE_LIMITS,
  userId: string,
): { allowed: boolean; waitTime?: number } {
  const config = RATE_LIMITS[action]
  const key = `${action}:${userId}`
  const now = Date.now()

  const existing = rateLimitStore.get(key)

  if (!existing || now > existing.resetTime) {
    // Reset or create new entry
    rateLimitStore.set(key, { count: 1, resetTime: now + config.windowMs })
    return { allowed: true }
  }

  if (existing.count >= config.max) {
    const waitTime = Math.ceil((existing.resetTime - now) / 1000)
    return { allowed: false, waitTime }
  }

  // Increment count
  existing.count++
  return { allowed: true }
}

/**
 * Sanitize user input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return ""

  return input
    .replace(/[<>]/g, "") // Remove < and > to prevent HTML injection
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+=/gi, "") // Remove event handlers like onclick=
    .replace(/data:/gi, "") // Remove data: protocol
    .trim()
    .slice(0, 1000) // Limit length
}

/**
 * Sanitize username - only allow alphanumeric, underscore, and hyphen
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== "string") return ""

  return username
    .replace(/[^a-zA-Z0-9_-]/g, "") // Only allow safe characters
    .slice(0, 30) // Limit length
}

/**
 * Sanitize and validate avatar URL
 * Only allows HTTPS URLs from trusted domains
 */
export function sanitizeAvatarUrl(url: string): string {
  if (!url || typeof url !== "string") return ""

  const trimmed = url.trim()

  // Allow empty string
  if (!trimmed) return ""

  // Must be HTTPS
  if (!trimmed.startsWith("https://")) {
    return ""
  }

  // Basic URL validation
  try {
    const parsed = new URL(trimmed)

    // Only allow HTTPS protocol
    if (parsed.protocol !== "https:") {
      return ""
    }

    // Block javascript and data URLs
    if (parsed.href.toLowerCase().includes("javascript:") || parsed.href.toLowerCase().includes("data:")) {
      return ""
    }

    return parsed.href.slice(0, 500) // Limit length
  } catch {
    return ""
  }
}

/**
 * Sanitize review text
 */
export function sanitizeReview(review: string): string {
  if (!review || typeof review !== "string") return ""

  return sanitizeInput(review).slice(0, 500) // Reviews limited to 500 chars
}
