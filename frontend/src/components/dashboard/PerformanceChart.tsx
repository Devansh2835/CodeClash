'use client';
import { motion } from 'framer-motion';
import { BarChart3, Target, Zap, TrendingUp } from 'lucide-react';

interface PerformanceStatsProps {
  wins: number;
  losses: number;
  totalGames: number;
  winrate: string;
  bestRuntime?: number;
}

export default function PerformanceStats({
  wins,
  losses,
  totalGames,
  winrate,
  bestRuntime,
}: PerformanceStatsProps) {
  const winrateNum = parseFloat(winrate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="flex items-center text-xl font-semibold text-white mb-6">
        <BarChart3 className="w-6 h-6 mr-2 text-blue-400" />
        Performance Stats
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Win Rate Circle */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-700"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${
                  2 * Math.PI * 56 * (1 - winrateNum / 100)
                }`}
                className={`${
                  winrateNum >= 70
                    ? 'text-success-500'
                    : winrateNum >= 50
                    ? 'text-primary-500'
                    : 'text-danger-500'
                } transition-all duration-1000`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-white">{winrateNum.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Win Rate</div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-4">
          <StatItem
            icon={<TrendingUp className="w-5 h-5 text-green-400" />}
            label="Wins"
            value={wins.toString()}
            color="green"
          />
          <StatItem
            icon={<Target className="w-5 h-5 text-red-400" />}
            label="Losses"
            value={losses.toString()}
            color="red"
          />
        </div>
      </div>

      {/* Total Games */}
      <div className="text-center p-4 bg-gray-800/50 rounded-lg mt-6">
        <div className="text-sm text-gray-400">Total Games</div>
        <div className="text-2xl font-bold text-white">{totalGames}</div>
      </div>

      {/* Best Runtime */}
      {bestRuntime !== undefined && (
        <div className="p-4 bg-gray-800/50 rounded-lg mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-sm text-gray-400">Best Runtime</span>
            </div>
            <div className="font-semibold text-white">
              {formatRuntime(bestRuntime)}
            </div>
          </div>
        </div>
      )}

      {/* Performance Rating */}
      <div className="text-center p-4 bg-gray-800/50 rounded-lg mt-4">
        <div className="text-sm text-gray-400 mb-2">Performance Rating</div>
        <div className="flex items-center justify-center space-x-2">
          <div className="font-semibold text-white">
            {getPerformanceRating(winrateNum)}
          </div>
          <div className="text-xl">{getPerformanceEmoji(winrateNum)}</div>
        </div>
      </div>
    </motion.div>
  );
}

function StatItem({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
      <div>{icon}</div>
      <div className="flex-1">
        <div className="text-sm text-gray-400">{label}</div>
        <div className="text-xl font-bold text-white">{value}</div>
      </div>
    </div>
  );
}

function formatRuntime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function getPerformanceRating(winrate: number): string {
  if (winrate >= 80) return 'Exceptional';
  if (winrate >= 70) return 'Excellent';
  if (winrate >= 60) return 'Great';
  if (winrate >= 50) return 'Good';
  if (winrate >= 40) return 'Average';
  return 'Needs Improvement';
}

function getPerformanceEmoji(winrate: number): string {
  if (winrate >= 80) return '🏆';
  if (winrate >= 70) return '⭐';
  if (winrate >= 60) return '👍';
  if (winrate >= 50) return '😊';
  if (winrate >= 40) return '😐';
  return '😞';
}