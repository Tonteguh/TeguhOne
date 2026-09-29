/**
 * Client-Side Rate Limiter & Abuse Guard
 * Prevents rapid spamming of actions (Posting Ads, Registration, AI Requests)
 */

interface RateLimitRecord {
  timestamps: number[];
}

class ClientRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();

  /**
   * Check if an action is allowed under the rate limit.
   * @param key Unique key for the action (e.g. 'post_ad_user123', 'ai_request')
   * @param maxAttempts Maximum attempts allowed within windowMs
   * @param windowMs Time window in milliseconds
   * @returns { allowed: boolean, retryAfterSeconds: number }
   */
  isAllowed(key: string, maxAttempts: number, windowMs: number): { allowed: boolean; retryAfterSeconds: number } {
    const now = Date.now();
    const record = this.records.get(key) || { timestamps: [] };

    // Filter out timestamps outside current sliding window
    const recent = record.timestamps.filter((ts) => now - ts < windowMs);

    if (recent.length >= maxAttempts) {
      const oldestInWindow = recent[0];
      const waitMs = windowMs - (now - oldestInWindow);
      const retryAfterSeconds = Math.max(1, Math.ceil(waitMs / 1000));
      return { allowed: false, retryAfterSeconds };
    }

    recent.push(now);
    this.records.set(key, { timestamps: recent });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  /**
   * Reset rate limit for a specific key
   */
  reset(key: string): void {
    this.records.delete(key);
  }
}

export const rateLimiter = new ClientRateLimiter();
