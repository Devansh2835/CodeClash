import { createClient } from 'redis';
import env from './env';
let redisClient: ReturnType<typeof createClient>;
export async function connectRedis() {
try {
redisClient = createClient({
url: env.REDIS_URL,
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
