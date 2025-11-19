'use client';
import { motion } from 'framer-motion';
import { Trophy, TrendingUp } from 'lucide-react';
import { getArenaName, getArenaColor } from '@/lib/utils';

interface ArenaCardProps {
  trophies: number;
  arena: number;
}

const ARENA_INFO = [
  { name: 'Bronze', range: '0-999', color: 'from-yellow-700 to-yellow-900', icon: '🥉' },
  { name: 'Silver', range: '1000-1999', color: 'from-gray-400 to-gray-600', icon: '🥈' },
  { name: 'Gold', range: '2000-2999', color: 'from-yellow-500 to-yellow-700', icon: '🥇' },
  { name: 'Platinum', range: '3000-3999', color: 'from-blue-400 to-blue-600', icon: '💎' },
  { name: 'Diamond', range: '4000-4999', color: 'from-cyan-400 to-cyan-600', icon: '💠' },
];

export default function ArenaCard({ trophies, arena }: ArenaCardProps) {
  const currentArena = ARENA_INFO[arena - 1];
  const nextArena = arena < 5 ? ARENA_INFO[arena] : null;
  
  const progress = ((trophies % 1000) / 1000) * 100;
  const trophiesNeeded = nextArena ? 1000 - (trophies % 1000) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Current Arena</h2>
        <Trophy className="w-6 h-6 text-yellow-400" />
      </div>

      {/* Current Arena */}
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-2">{currentArena.icon}</div>
          <h3 className="text-2xl font-bold text-white">{currentArena.name} Arena</h3>
          <p className="text-gray-400">{currentArena.range} trophies</p>
        </div>

        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-300">Your Progress</span>
          <span className="text-white font-semibold">{trophies} trophies</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="bg-gradient-to-r from-primary-500 to-success-500 h-full rounded-full"
          />
        </div>

        {nextArena && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Next: {nextArena.name}</span>
            <span className="text-primary-400">
              {trophiesNeeded} trophies to go
            </span>
          </div>
        )}
      </div>

      {/* All Arenas */}
      <div className="mt-8">
        <h4 className="flex items-center text-lg font-semibold text-white mb-4">
          <TrendingUp className="w-4 h-4 mr-2" />
          All Arenas
        </h4>
        <div className="space-y-3">
          {ARENA_INFO.map((arenaInfo, index) => {
            const arenaNum = index + 1;
            const isUnlocked = trophies >= index * 1000;
            const isCurrent = arenaNum === arena;

            return (
              <div
                key={arenaNum}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  isCurrent ? 'bg-primary-900/30 border-primary-500/50' : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{arenaInfo.icon}</span>
                  <div>
                    <div className="font-semibold text-white">{arenaInfo.name}</div>
                    <div className="text-sm text-gray-400">{arenaInfo.range}</div>
                  </div>
                </div>
                {isCurrent && (
                  <span className="px-2 py-1 bg-primary-500 text-white text-xs rounded-full">
                    Current
                  </span>
                )}
                {!isUnlocked && (
                  <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">🔒 Locked</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}