import { createClient } from 'redis';
import env from './env';
let redisClient: ReturnType<typeof createClient>;
export async function connectRedis() {
try {
	// Some env values (from examples or copy-paste) may include a wrapper like
	// `redis-cli -u redis://...`. Extract the actual URL if present.
	const raw = String(env.REDIS_URL || '').trim();
	const urlMatch = raw.match(/(redis:\/\/.*)/);
	const redisUrl = urlMatch ? urlMatch[1] : raw;

	redisClient = createClient({
		url: redisUrl,
	});
redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('✅ Redis connected'));
await redisClient.connect();
} catch (error) {
console.error('❌ Redis connection error:', error);
throw error;
}
}
export function getRedisClient() {
if (!redisClient) {
throw new Error('Redis client not initialized');
}
return redisClient;
}
