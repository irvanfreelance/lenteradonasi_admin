import { Redis } from '@upstash/redis';

// Determine if we should throw an error or handle silently if variables are missing
// For admin panel, maybe we just mock it if not present so it doesn't crash in local dev
// but since this is production critical, we should try to use the vars.
const url = process.env.UPSTASH_REDIS_REST_URL || '';
const token = process.env.UPSTASH_REDIS_REST_TOKEN || '';

export const redis = new Redis({
  url: url || 'http://localhost:8079', // Fallback
  token: token || 'default_token',
});
