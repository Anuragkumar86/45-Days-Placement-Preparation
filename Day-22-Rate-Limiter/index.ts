// ==========================================
// 1. Interfaces & Configurations
// ==========================================

interface TokenBucketConfig {
  capacity: number;         // Max tokens allowed
  refillRatePerSec: number; // Tokens added per second
}

interface BucketData {
  tokens: number;
  lastRefillTimestamp: number; // In milliseconds
}

// ==========================================
// 2. Rate Limiter Class
// ==========================================

class TokenBucketRateLimiter {
  private capacity: number;
  private refillRatePerSec: number;
  private buckets: Map<string, BucketData> = new Map();

  constructor(config: TokenBucketConfig) {
    this.capacity = config.capacity;
    this.refillRatePerSec = config.refillRatePerSec;
  }

  // Core function to check if a user can make a request
  public isAllowed(userId: string, now: number = Date.now()): boolean {
    let bucket = this.buckets.get(userId);

    // If it's a new user, create their bucket and allow the request
    if (!bucket) {
      bucket = {
        tokens: this.capacity - 1, // Use 1 token for this current request
        lastRefillTimestamp: now,
      };
      this.buckets.set(userId, bucket);
      return true;
    }

    // Step 1: Calculate how much time passed since last check
    const elapsedSeconds = (now - bucket.lastRefillTimestamp) / 1000;

    // Step 2: Add new tokens based on time passed
    const tokensToAdd = elapsedSeconds * this.refillRatePerSec;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefillTimestamp = now;

    // Step 3: Check if we have at least 1 token to consume
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1; // Consume 1 token
      return true;        // Request ALLOWED
    }

    return false; // Request BLOCKED
  }

  // Deletes users who haven't made requests in a long time to save memory
  public cleanupStaleBuckets(maxIdleTimeMs: number, now: number = Date.now()): void {
    for (const [userId, bucket] of this.buckets.entries()) {
      if (now - bucket.lastRefillTimestamp > maxIdleTimeMs) {
        this.buckets.delete(userId);
      }
    }
  }

  // Helper method to check how many users are stored
  public getTrackedUsersCount(): number {
    return this.buckets.size;
  }
}

// ==========================================
// 3. Simple Testing Helper (No Libraries)
// ==========================================

function assert(condition: boolean, testName: string): void {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
  }
}

// ==========================================
// 4. Test Suite Execution
// ==========================================

function runTests() {
  console.log('--- RUNNING RATE LIMITER TESTS ---\n');

  // Test 1: Capacity Limiting
  const limiter1 = new TokenBucketRateLimiter({ capacity: 2, refillRatePerSec: 1 });
  const time1 = 100000;

  assert(limiter1.isAllowed('user1', time1) === true, '1st request allowed');
  assert(limiter1.isAllowed('user1', time1) === true, '2nd request allowed');
  assert(limiter1.isAllowed('user1', time1) === false, '3rd request blocked (capacity reached)');

  // Test 2: Token Refill over time
  const limiter2 = new TokenBucketRateLimiter({ capacity: 2, refillRatePerSec: 1 }); // 1 token per sec
  let time2 = 100000;

  limiter2.isAllowed('user1', time2); // Uses 1 token
  limiter2.isAllowed('user1', time2); // Uses 1 token
  assert(limiter2.isAllowed('user1', time2) === false, 'Blocked when out of tokens');

  time2 += 1000; // Fast-forward time by 1 second (1000 ms)
  assert(limiter2.isAllowed('user1', time2) === true, 'Allowed again after 1 second refill');

  // Test 3: User Isolation
  const limiter3 = new TokenBucketRateLimiter({ capacity: 1, refillRatePerSec: 0.1 });
  const time3 = 100000;

  limiter3.isAllowed('userA', time3);
  assert(limiter3.isAllowed('userA', time3) === false, 'User A blocked');
  assert(limiter3.isAllowed('userB', time3) === true, 'User B still allowed (different bucket)');

  // Test 4: Memory Cleanup
  const limiter4 = new TokenBucketRateLimiter({ capacity: 5, refillRatePerSec: 1 });
  const startTime = 100000;

  limiter4.isAllowed('oldUser', startTime);
  assert(limiter4.getTrackedUsersCount() === 1, '1 user tracked in memory');

  const twoHoursLater = startTime + 7200000;
  limiter4.cleanupStaleBuckets(3600000, twoHoursLater); // Delete entries older than 1 hour

  assert(limiter4.getTrackedUsersCount() === 0, 'Stale user removed from memory');

  console.log('\n--- ALL TESTS COMPLETED ---');
}

// Run the tests
runTests();