import { getRedisClient } from '../config/redis';

interface MatchmakingRequest {
  userId: string;
  trophies: number;
  betAmount: number;
  socketId: string;
  language: string;
}

const MATCHMAKING_QUEUE_KEY = 'matchmaking:queue';
const TROPHY_RANGE = 200;

export async function joinQueue(request: MatchmakingRequest): Promise<MatchmakingRequest | null> {
  const redis = getRedisClient();

  // Check if already in queue
  const queueData = await redis.lRange(MATCHMAKING_QUEUE_KEY, 0, -1);
  const inQueue = queueData.some((data) => {
    const req = JSON.parse(data);
    return req.userId === request.userId;
  });

  if (inQueue) {
    throw new Error('Already in matchmaking queue');
  }

  // Look for suitable opponent
  for (const data of queueData) {
    const opponent = JSON.parse(data) as MatchmakingRequest;

    // Check if trophies are within range
    const trophyDiff = Math.abs(opponent.trophies - request.trophies);
    // Check if bet amounts match
    const betMatch = opponent.betAmount === request.betAmount;
    // Check if languages match
    const languageMatch = opponent.language === request.language;
    // Check not same user
    const differentUser = opponent.userId !== request.userId;

    if (trophyDiff <= TROPHY_RANGE && betMatch && languageMatch && differentUser) {
      // Found a match! Remove opponent from queue
      await redis.lRem(MATCHMAKING_QUEUE_KEY, 1, data);
      return opponent;
    }
  }

  // No match found, add to queue
  await redis.rPush(MATCHMAKING_QUEUE_KEY, JSON.stringify(request));
  return null;
}

export async function leaveQueue(userId: string): Promise<void> {
  const redis = getRedisClient();
  const queueData = await redis.lRange(MATCHMAKING_QUEUE_KEY, 0, -1);

  for (const data of queueData) {
    const req = JSON.parse(data);
    if (req.userId === userId) {
      await redis.lRem(MATCHMAKING_QUEUE_KEY, 1, data);
      break;
    }
  }
}

export async function getQueuePosition(userId: string): Promise<number> {
  const redis = getRedisClient();
  const queueData = await redis.lRange(MATCHMAKING_QUEUE_KEY, 0, -1);

  for (let i = 0; i < queueData.length; i++) {
    const req = JSON.parse(queueData[i]);
    if (req.userId === userId) {
      return i + 1;
    }
  }

  return 0;
}