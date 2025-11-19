'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Swords, Trophy, LogOut, LayoutDashboard, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900/95 via-purple-900/95 to-gray-900/95 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-2xl">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <Swords className="w-8 h-8 text-cyan-400 group-hover:text-cyan-300" />
              <div className="absolute inset-0 w-8 h-8 bg-cyan-400/20 rounded-full blur-lg group-hover:bg-cyan-300/30 transition-all" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Code Battle
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    pathname === '/dashboard' 
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 border border-blue-500/30' 
                      : 'text-gray-300 hover:text-blue-400 hover:bg-blue-500/10'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/game"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                    pathname === '/game' 
                      ? 'bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-400 border border-red-500/30' 
                      : 'text-gray-300 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Zap className="w-5 h-5" />
                  <span>Battle</span>
                </Link>
                
                {/* User Profile */}
                <div className="flex items-center space-x-4 bg-gradient-to-r from-gray-800/50 to-gray-700/50 px-6 py-3 rounded-2xl border border-gray-600/50">
                  <div className="text-right">
                    <div className="font-bold text-white text-lg">{user.username}</div>
                    <div className="flex items-center text-yellow-400 font-medium">
                      <Trophy className="w-4 h-4 mr-1" />
                      {user.trophies}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition-colors p-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/30"
                    title="Logout"
                  >
                    <LogOut className="w-6 h-6" />
                  </motion.button>
                </div>
              </>
            ) : !loading ? (
              <>
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-cyan-400 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-cyan-500/10"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white px-6 py-3 rounded-xl transition-all duration-300 font-bold shadow-lg hover:shadow-cyan-500/25"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="text-gray-400">Loading...</div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}