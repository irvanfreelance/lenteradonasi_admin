import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// Only initialize if we have the credentials
export const redis = (url && token) 
  ? new Redis({ url, token })
  : null;

/**
 * Safely invalidate cache keys.
 * Handles cases where Redis is not configured or fails.
 */
export async function invalidateCache(keys: string | string[]) {
  if (!redis) return;
  
  try {
    const keysArray = Array.isArray(keys) ? keys : [keys];
    if (keysArray.length === 0) return;
    
    await redis.del(...keysArray);
  } catch (error) {
    // Log warning but don't crash the request
    console.warn('Redis Invalidation Error:', error);
  }
}
