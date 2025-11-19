import User from '../models/User.model';
import Match from '../models/Match.model';

export const BADGE_RULES = {
  FIRST_BLOOD: {
    name: 'First Blood',
    description: 'Win your first match',
    check: async (userId: string) => {
      const user = await User.findById(userId);
      return user?.wins === 1;
    },
  },
  SPEEDSTER: {
    name: 'Speedster',
    description: 'Solve 3 matches under time limit',
    check: async (userId: string) => {
      const matches = await Match.find({
        $or: [{ player1: userId }, { player2: userId }],
        status: 'COMPLETED',
      }).limit(100);

      let fastWins = 0;
      for (const match of matches) {
        const isPlayer1 = match.player1.toString() === userId;
        const bestRuntime = isPlayer1 ? match.player1BestRuntime : match.player2BestRuntime;
        if (bestRuntime && bestRuntime < 1000) {
          // Under 1 second
          fastWins++;
        }
      }
      return fastWins >= 3;
    },
  },
  FLAWLESS: {
    name: 'Flawless',
    description: 'Pass all tests on first attempt 5 times',
    check: async (userId: string) => {
      const matches = await Match.find({
        $or: [{ player1: userId }, { player2: userId }],
        status: 'COMPLETED',
      }).limit(100);

      let flawlessCount = 0;
      for (const match of matches) {
        const isPlayer1 = match.player1.toString() === userId;
        const submissions = isPlayer1 ? match.player1Submissions : match.player2Submissions;
        if (submissions.length > 0 && submissions[0].allPassed) {
          flawlessCount++;
        }
      }
      return flawlessCount >= 5;
    },
  },
  WIN_STREAK: {
    name: 'Win Streak',
    description: 'Win 5 consecutive matches',
    check: async (userId: string) => {
      const matches = await Match.find({
        $or: [{ player1: userId }, { player2: userId }],
        status: 'COMPLETED',
      })
        .sort({ endedAt: -1 })
        .limit(10);

      let streak = 0;
      for (const match of matches) {
        if (match.winner?.toString() === userId) {
          streak++;
          if (streak >= 5) return true;
        } else {
          break;
        }
      }
      return false;
    },
  },
  ARENA_CHAMPION: {
    name: 'Arena Champion',
    description: 'Reach Diamond arena (4000+ trophies)',
    check: async (userId: string) => {
      const user = await User.findById(userId);
      return user ? user.trophies >= 4000 : false;
    },
  },
};

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const user = await User.findById(userId);
  if (!user) {
    return [];
  }

  const newBadges: string[] = [];

  for (const [badgeId, rule] of Object.entries(BADGE_RULES)) {
    // Skip if already has badge
    if (user.badges.includes(badgeId)) {
      continue;
    }

    // Check if earned
    const earned = await rule.check(userId);
    if (earned) {
      user.badges.push(badgeId);
      newBadges.push(badgeId);
    }
  }

  if (newBadges.length > 0) {
    await user.save();
    console.log(`✅ User ${userId} earned badges:`, newBadges);
  }

  return newBadges;
}