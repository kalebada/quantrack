/**
 * Client-side rate limiting utility
 * Tracks attempts in localStorage with timestamp-based cleanup
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  storageKey: string;
}

interface AttemptRecord {
  timestamp: number;
  count: number;
}

/**
 * Check if an action is rate limited
 * @param config Rate limit configuration
 * @returns true if rate limited, false if allowed
 */
export function isRateLimited(config: RateLimitConfig): boolean {
  const now = Date.now();
  const { maxAttempts, windowMs, storageKey } = config;

  try {
    const stored = localStorage.getItem(storageKey);
    const record: AttemptRecord = stored
      ? JSON.parse(stored)
      : { timestamp: now, count: 0 };

    // Check if the window has expired
    if (now - record.timestamp > windowMs) {
      // Reset the window
      record.timestamp = now;
      record.count = 0;
    }

    // Check if rate limit exceeded
    if (record.count >= maxAttempts) {
      return true;
    }

    return false;
  } catch (error) {
    // If localStorage fails, allow the request
    if (import.meta.env.DEV) {
      console.warn("Rate limit check failed:", error);
    }
    return false;
  }
}

/**
 * Record an attempt for rate limiting
 * @param config Rate limit configuration
 */
export function recordAttempt(config: RateLimitConfig): void {
  const now = Date.now();
  const { windowMs, storageKey } = config;

  try {
    const stored = localStorage.getItem(storageKey);
    const record: AttemptRecord = stored
      ? JSON.parse(stored)
      : { timestamp: now, count: 0 };

    // Check if the window has expired
    if (now - record.timestamp > windowMs) {
      // Reset the window
      record.timestamp = now;
      record.count = 1;
    } else {
      // Increment count within the current window
      record.count += 1;
    }

    localStorage.setItem(storageKey, JSON.stringify(record));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Failed to record attempt:", error);
    }
  }
}

/**
 * Get remaining time until rate limit resets (in milliseconds)
 * @param config Rate limit configuration
 * @returns milliseconds until reset, or 0 if not rate limited
 */
export function getTimeUntilReset(config: RateLimitConfig): number {
  const { windowMs, storageKey } = config;

  try {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return 0;

    const record: AttemptRecord = JSON.parse(stored);
    const now = Date.now();
    const timeElapsed = now - record.timestamp;

    if (timeElapsed >= windowMs) {
      return 0;
    }

    return windowMs - timeElapsed;
  } catch (error) {
    return 0;
  }
}

/**
 * Format milliseconds to human-readable time
 * @param ms Milliseconds
 * @returns Formatted time string
 */
export function formatTimeRemaining(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);

  if (minutes > 0) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  return `${seconds} second${seconds !== 1 ? 's' : ''}`;
}
