'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Target, Award, TrendingUp, Zap, Calendar, Clock, Flame, Crown, Star, Sword, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { users } from '@/lib/api';
import { ARENAS, getArenaByTrophies } from '@/constants/arenas';
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-20 h-20 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentArena = getArenaByTrophies(user.trophies);
  const winrate = parseFloat(user.winrate);
  const nextArena = ARENAS.find(arena => arena.minTrophies > user.trophies);
  const trophiesNeeded = nextArena ? nextArena.minTrophies - user.trophies : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30"
            animate={{
              x: [0, 200, 0],
              y: [0, -200, 0],
              scale: [1, 2, 1],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 4 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.1,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.h1 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl"
          >
            Welcome back, {user.username}! 👑
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
          >
            🚀 Your coding empire awaits your command 🚀
          </motion.p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
        >
          <StatCard
            icon={<Trophy className="w-12 h-12" />}
            label="Trophies"
            value={user.trophies.toString()}
            subtitle={`${currentArena.name} Arena`}
            gradient="from-yellow-400 via-orange-500 to-red-500"
            glowColor="yellow"
          />
          <StatCard
            icon={<Target className="w-12 h-12" />}
            label="Win Rate"
            value={`${winrate.toFixed(1)}%`}
            subtitle={`${user.wins}W / ${user.losses}L`}
            gradient="from-green-400 via-emerald-500 to-teal-500"
            glowColor="green"
          />
          <StatCard
            icon={<Sword className="w-12 h-12" />}
            label="Total Battles"
            value={user.totalGames.toString()}
            subtitle="Fought with honor"
            gradient="from-blue-400 via-cyan-500 to-purple-500"
            glowColor="blue"
          />
          <StatCard
            icon={<Star className="w-12 h-12" />}
            label="Achievements"
            value={badges.length.toString()}
            subtitle="Badges earned"
            gradient="from-purple-400 via-pink-500 to-rose-500"
            glowColor="purple"
          />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Arena Progress */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2"
          >
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="bg-gradient-to-br from-gray-800/80 via-gray-900/80 to-black/80 backdrop-blur-xl border-2 rounded-3xl p-10 shadow-2xl" 
              style={{ 
                borderColor: currentArena.color, 
                boxShadow: `0 0 50px ${currentArena.color}30, inset 0 0 50px ${currentArena.color}10` 
              }}
            >
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center space-x-8">
                  <motion.div 
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-9xl filter drop-shadow-2xl"
                  >
                    {currentArena.icon}
                  </motion.div>
                  <div>
                    <h2 className="text-5xl font-black mb-3" style={{ color: currentArena.color }}>
                      {currentArena.name} Arena
                    </h2>
                    <p className="text-gray-300 text-xl font-medium">{currentArena.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-6xl font-black text-yellow-400 mb-3 filter drop-shadow-lg"
                  >
                    {user.trophies}
                  </motion.div>
                  <div className="text-lg text-gray-400 font-medium">Trophies</div>
                </div>
              </div>

              {/* Progress to next arena */}
              {nextArena && (
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg text-gray-300 font-medium">Progress to {nextArena.name}</span>
                    <span className="text-lg font-bold text-cyan-400">{trophiesNeeded} more needed</span>
                  </div>
                  <div className="bg-gray-700/50 rounded-full h-6 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${Math.max(5, ((user.trophies - currentArena.minTrophies) / (currentArena.maxTrophies - currentArena.minTrophies)) * 100)}%` 
                      }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="h-6 rounded-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-lg"
                      style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)' }}
                    />
                  </div>
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{ 
                  boxShadow: [
                    "0 0 30px rgba(239, 68, 68, 0.4)", 
                    "0 0 60px rgba(239, 68, 68, 0.8)", 
                    "0 0 30px rgba(239, 68, 68, 0.4)"
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                onClick={() => router.push('/game')}
                className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 hover:from-red-600 hover:to-orange-600 text-white font-black py-8 px-12 rounded-2xl text-4xl flex items-center justify-center space-x-6 transition-all duration-300 shadow-2xl border-2 border-red-400"
              >
                <Flame className="w-12 h-12" />
                <span>ENTER BATTLE</span>
                <Zap className="w-12 h-12" />
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Performance Stats */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-blue-900/40 to-purple-900/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold mb-8 flex items-center text-cyan-400">
                <Crown className="w-8 h-8 mr-3" />
                Battle Stats
              </h3>
              <div className="space-y-6">
                <StatRow label="Victories" value={user.wins} color="text-green-400" />
                <StatRow label="Defeats" value={user.losses} color="text-red-400" />
                <StatRow label="Win Streak" value="0" color="text-orange-400" />
                <StatRow label="Best Rank" value={`#${Math.max(1, 100 - Math.floor(user.trophies / 50))}`} color="text-purple-400" />
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-8 shadow-2xl"
            >
              <h3 className="text-3xl font-bold mb-8 flex items-center text-purple-400">
                <Clock className="w-8 h-8 mr-3" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <ActivityItem icon={<Calendar />} text="Last battle: Today" />
                <ActivityItem icon={<Trophy />} text="Trophies gained today: +0" />
                <ActivityItem icon={<Target />} text={`Problems solved: ${user.wins}`} />
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Achievements */}
        {badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-16"
          >
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-yellow-500/30 rounded-3xl p-10 shadow-2xl">
              <h2 className="text-4xl font-bold mb-10 flex items-center text-yellow-400">
                <Award className="w-10 h-10 mr-4" />
                Achievement Gallery 🏆
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {badges.map((badge, index) => (
                  <motion.div 
                    key={badge}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -10 }}
                    className="text-center p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl border border-yellow-400/30 hover:border-yellow-400 transition-all shadow-lg hover:shadow-yellow-400/25"
                  >
                    <div className="text-5xl mb-3">
                      {getBadgeEmoji(badge)}
                    </div>
                    <div className="text-sm font-bold text-yellow-300">{formatBadgeName(badge)}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtitle,
  gradient,
  glowColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle: string;
  gradient: string;
  glowColor: string;
}) {
  return (
    <motion.div 
      whileHover={{ scale: 1.05, y: -10 }}
      className={`bg-gradient-to-br ${gradient} p-8 rounded-3xl shadow-2xl border border-white/20 backdrop-blur-sm relative overflow-hidden`}
      style={{ 
        boxShadow: `0 0 40px rgba(${
          glowColor === 'yellow' ? '251, 191, 36' :
          glowColor === 'green' ? '34, 197, 94' :
          glowColor === 'blue' ? '59, 130, 246' :
          '168, 85, 247'
        }, 0.3)` 
      }}
    >
      <div className="flex items-center justify-between relative z-10">
        <div>
          <div className="text-lg text-white/80 mb-2 font-medium">{label}</div>
          <div className="text-5xl font-black text-white mb-2">{value}</div>
          <div className="text-sm text-white/70 font-medium">{subtitle}</div>
        </div>
        <div className="text-white/90">{icon}</div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
    </motion.div>
  );
}

function StatRow({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-300 text-lg font-medium">{label}</span>
      <span className={`font-bold text-2xl ${color}`}>{value}</span>
    </div>
  );
}

function ActivityItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center text-gray-300 text-lg">
      <div className="w-6 h-6 mr-3 text-purple-400">{icon}</div>
      <span>{text}</span>
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

function formatBadgeName(badge: string): string {
  return badge.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
}