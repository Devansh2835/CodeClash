'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, Trophy, Zap, Shield, Sparkles, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleStartGaming = () => {
    if (user) {
      router.push('/game');
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full opacity-20"
            animate={{
              x: [0, 200, 0],
              y: [0, -200, 0],
              scale: [1, 2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
              Code Battle ⚔️
            </h1>
            <motion.div
              animate={{ 
                boxShadow: [
                  "0 0 20px rgba(6, 182, 212, 0.3)",
                  "0 0 60px rgba(168, 85, 247, 0.4)", 
                  "0 0 20px rgba(6, 182, 212, 0.3)"
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-block rounded-full p-1"
            >
              <div className="bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full p-4">
                <Swords className="w-16 h-16 text-white" />
              </div>
            </motion.div>
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4"
          >
            🚀 Test your coding skills in <span className="text-cyan-400 font-bold">intense real-time 1v1 battles</span>.
            <br />Climb the ranks, earn trophies, and become a <span className="text-purple-400 font-bold">coding legend</span>! 🏆
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 md:gap-6 justify-center items-center px-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleStartGaming}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 md:py-6 px-8 md:px-16 rounded-2xl text-lg md:text-2xl shadow-2xl transition-all duration-300 border-2 border-cyan-400/50 w-full sm:w-auto"
            >
              {user ? '🎮 Start Gaming' : '🚀 Login & Start'}
            </motion.button>
            
            {!user && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-gray-400 text-lg"
              >
                or{' '}
                <Link
                  href="/signup"
                  className="text-purple-400 hover:text-purple-300 font-bold transition-colors underline decoration-purple-400/50 hover:decoration-purple-300"
                >
                  Create Free Account
                </Link>
              </motion.div>
            )}
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mb-12 md:mb-20 px-4"
        >
        <FeatureCard
          icon={<Swords className="w-12 h-12 text-cyan-400" />}
          title="Real-Time 1v1"
          description="Compete against opponents in live coding battles with instant feedback"
          delay={0.1}
        />
        <FeatureCard
          icon={<Trophy className="w-12 h-12 text-yellow-400" />}
          title="Trophy System"
          description="Earn trophies and climb through 5 competitive arenas to prove your skills"
          delay={0.2}
        />
        <FeatureCard
          icon={<Zap className="w-12 h-12 text-purple-400" />}
          title="Instant Matching"
          description="Get matched with opponents of similar skill level in seconds"
          delay={0.3}
        />
        <FeatureCard
          icon={<Shield className="w-12 h-12 text-green-400" />}
          title="Fair Play"
          description="Advanced anti-cheat system with tab-switch detection"
          delay={0.4}
        />
        </motion.div>

        {/* Arena Showcase */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-20"
        >
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-2xl md:text-4xl lg:text-5xl font-bold text-center mb-8 md:mb-16 bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent px-4"
        >
          🏰 5 Arenas to Conquer 🏰
        </motion.h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 px-4">
          <ArenaCard name="Bronze" range="0-999" color="bg-yellow-700" />
          <ArenaCard name="Silver" range="1000-1999" color="bg-gray-400" />
          <ArenaCard name="Gold" range="2000-2999" color="bg-yellow-500" />
          <ArenaCard name="Platinum" range="3000-3999" color="bg-blue-400" />
          <ArenaCard name="Diamond" range="4000-4999" color="bg-cyan-400" />
        </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-center bg-gray-800 rounded-lg p-8 max-w-2xl mx-auto shadow-lg"
        >
        <h3 className="text-3xl font-bold mb-4">Ready to Battle?</h3>
        <p className="text-gray-300 mb-6">
          Join thousands of developers competing in the ultimate coding arena.
        </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + delay, duration: 0.6 }}
      whileHover={{ 
        y: -10, 
        scale: 1.05,
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}
      className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl p-8 text-center shadow-2xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
    >
      <motion.div 
        className="mb-6 flex justify-center"
        whileHover={{ rotate: 360, scale: 1.2 }}
        transition={{ duration: 0.6 }}
      >
        <div className="p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-full">
          {icon}
        </div>
      </motion.div>
      <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{title}</h3>
      <p className="text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function ArenaCard({
  name,
  range,
  color,
}: {
  name: string;
  range: string;
  color: string;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-gray-800 rounded-lg p-4 text-center shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className={`w-12 h-12 ${color} rounded-full mx-auto mb-3`}></div>
      <h4 className="font-bold mb-1">{name}</h4>
      <p className="text-sm text-gray-400">{range}</p>
    </motion.div>
  );
}