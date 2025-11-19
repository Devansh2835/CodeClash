'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Swords, Trophy, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const handleStartGaming = () => {
    if (user) {
      router.push('/game');
    } else {
      router.push('/signup');
    }
  };

  return (
    <div className="container mx-auto px-4 py-20">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-success-400 bg-clip-text text-transparent">
          Code Battle ⚔️
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Test your coding skills in intense real-time 1v1 battles.
          Climb the ranks, earn trophies, and become a legend.
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleStartGaming}
          className="bg-primary-500 hover:bg-primary-600 text-white font-bold py-4 px-12 rounded-lg text-xl shadow-lg hover:shadow-primary-500/25 transition-all duration-300"
        >
          Start Gaming
        </motion.button>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
      >
        <FeatureCard
          icon={<Swords className="w-12 h-12 text-primary-400" />}
          title="Real-Time 1v1"
          description="Compete against opponents in live coding battles"
        />
        <FeatureCard
          icon={<Trophy className="w-12 h-12 text-success-400" />}
          title="Trophy System"
          description="Earn trophies and climb through 5 competitive arenas"
        />
        <FeatureCard
          icon={<Zap className="w-12 h-12 text-yellow-400" />}
          title="Instant Matching"
          description="Get matched with opponents of similar skill level"
        />
        <FeatureCard
          icon={<Shield className="w-12 h-12 text-purple-400" />}
          title="Fair Play"
          description="Anti-cheat system with tab-switch detection"
        />
      </motion.div>

      {/* Arena Showcase */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="mb-20"
      >
        <h2 className="text-4xl font-bold text-center mb-12">5 Arenas to Conquer</h2>
        <div className="grid md:grid-cols-5 gap-4">
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
        <button 
          onClick={handleStartGaming} 
          className="bg-success-500 hover:bg-success-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-success-500/25 transition-all duration-300"
        >
          Create Account & Start
        </button>
      </motion.div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-gray-800 rounded-lg p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-300">{description}</p>
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