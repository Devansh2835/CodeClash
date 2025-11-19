'use client';
import { motion } from 'framer-motion';
import { Award } from 'lucide-react';

interface BadgeDisplayProps {
  badges: string[];
}

const BADGE_INFO: Record<string, { name: string; emoji: string; description: string }> = {
  FIRST_BLOOD: {
    name: 'First Blood',
    emoji: '🩸',
    description: 'Win your first match',
  },
  SPEEDSTER: {
    name: 'Speedster',
    emoji: '⚡',
    description: 'Solve 3 matches under time limit',
  },
  FLAWLESS: {
    name: 'Flawless',
    emoji: '✨',
    description: 'Pass all tests on first attempt 5 times',
  },
  WIN_STREAK: {
    name: 'Win Streak',
    emoji: '🔥',
    description: 'Win 5 consecutive matches',
  },
  ARENA_CHAMPION: {
    name: 'Arena Champion',
    emoji: '👑',
    description: 'Reach Diamond arena (4000+ trophies)',
  },
  BUG_HUNTER: {
    name: 'Bug Hunter',
    emoji: '🐛',
    description: 'First correct after failing tests',
  },
  COMEBACK_KID: {
    name: 'Comeback Kid',
    emoji: '💪',
    description: 'Win after trailing on tests',
  },
  BET_MASTER: {
    name: 'Bet Master',
    emoji: '💰',
    description: 'Win 10 betting matches',
  },
};

export default function BadgeDisplay({ badges }: BadgeDisplayProps) {
  if (badges.length === 0) {
    return (
      <div className="card">
        <h2 className="flex items-center text-xl font-semibold text-white mb-6">
          <Award className="w-6 h-6 mr-2 text-purple-400" />
          Badges
        </h2>
        <div className="text-center py-12">
          <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p className="text-gray-400 mb-2">No badges earned yet</p>
          <p className="text-gray-500 text-sm">Keep playing to earn achievements!</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="flex items-center text-xl font-semibold text-white mb-6">
        <Award className="w-6 h-6 mr-2 text-purple-400" />
        Your Badges ({badges.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((badgeId, index) => {
          const badge = BADGE_INFO[badgeId] || {
            name: badgeId,
            emoji: '🏆',
            description: 'Achievement unlocked',
          };

          return (
            <motion.div
              key={badgeId}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg p-4 text-center hover:scale-105 transition-transform"
              title={badge.description}
            >
              <div className="text-3xl mb-2">
                {badge.emoji}
              </div>
              <div className="font-semibold text-white mb-1">{badge.name}</div>
              <div className="text-sm text-gray-400">
                {badge.description}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}