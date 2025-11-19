'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Target, Award, TrendingUp, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { users } from '@/lib/api';
import { getArenaName, getArenaColor } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [recentMatches, setRecentMatches] = useState([]);
  const [badges, setBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  async function fetchDashboardData() {
    try {
      const [profileRes, badgesRes] = await Promise.all([
        users.getProfile(),
        users.getBadges(),
      ]);
      setRecentMatches(profileRes.data.recentMatches || []);
      setBadges(badgesRes.data.badges || []);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    }
  }

  if (loading || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const arena = getArenaName(user.trophies);
  const arenaColor = getArenaColor(user.arena);
  const winrate = parseFloat(user.winrate);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2">Welcome back, {user.username}! 👋</h1>
        <p className="text-gray-400">Ready for your next battle?</p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
      >
        <StatCard
          icon={<Trophy className="w-8 h-8 text-yellow-400" />}
          label="Trophies"
          value={user.trophies.toString()}
          color="yellow"
        />
        <StatCard
          icon={<Target className="w-8 h-8 text-green-400" />}
          label="Win Rate"
          value={`${winrate.toFixed(1)}%`}
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-8 h-8 text-blue-400" />}
          label="Total Games"
          value={user.totalGames.toString()}
          color="blue"
        />
        <StatCard
          icon={<Award className="w-8 h-8 text-purple-400" />}
          label="Badges"
          value={badges.length.toString()}
          color="purple"
        />
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Arena Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Current Arena</h2>
            <div className={`text-3xl font-bold mb-4 ${arenaColor}`}>
              {arena} Arena
            </div>
            <div className="bg-gray-700 rounded-full h-4 mb-4">
              <div className="bg-primary-500 h-4 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <p className="text-gray-400 mb-6">
              {1000 - (user.trophies % 1000)} trophies to next arena
            </p>
            <button
              onClick={() => router.push('/game')}
              className="btn btn-primary w-full text-lg py-4"
            >
              <Zap className="w-5 h-5 inline mr-2" />
              Start Battle
            </button>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card">
            <h2 className="text-xl font-bold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Wins</span>
                <span className="font-bold text-green-400">{user.wins}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Losses</span>
                <span className="font-bold text-red-400">{user.losses}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Arena</span>
                <span className="font-bold">{user.arena}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Your Badges 🏆</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map((badge) => (
                <div key={badge} className="text-center p-4 bg-gray-700 rounded-lg">
                  <div className="text-3xl mb-2">
                    {getBadgeEmoji(badge)}
                  </div>
                  <div className="text-sm font-medium">{badge}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">Recent Matches</h2>
            <div className="space-y-3">
              {recentMatches.slice(0, 5).map((match: any) => (
                <div key={match.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {match.won ? '🏆' : '💀'}
                    </div>
                    <div>
                      <div className="font-medium">vs {match.opponent.username}</div>
                      <div className="text-sm text-gray-400">{match.problem.title}</div>
                    </div>
                  </div>
                  <div className={`font-bold ${match.won ? 'text-green-400' : 'text-red-400'}`}>
                    {match.won ? '+100' : '-100'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function StatCard({
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
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">{label}</div>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        {icon}
      </div>
    </div>
  );
}

function getBadgeEmoji(badge: string): string {
  const emojis: Record<string, string> = {
    FIRST_BLOOD: '🩸',
    SPEEDSTER: '⚡',
    FLAWLESS: '✨',
    WIN_STREAK: '🔥',
    ARENA_CHAMPION: '👑',
    BUG_HUNTER: '🐛',
    COMEBACK_KID: '🔄',
    BET_MASTER: '💰',
  };
  return emojis[badge] || '🏆';
}