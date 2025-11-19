'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Swords, Trophy, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

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
    <nav className="bg-gray-800/50 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 text-xl font-bold">
            <Swords className="w-6 h-6 text-primary-400" />
            <span>Code Battle</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center space-x-1 hover:text-primary-400 transition-colors ${
                    pathname === '/dashboard' ? 'text-primary-400' : ''
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  href="/game"
                  className={`flex items-center space-x-1 hover:text-primary-400 transition-colors ${
                    pathname === '/game' ? 'text-primary-400' : ''
                  }`}
                >
                  <Swords className="w-4 h-4" />
                  <span>Play</span>
                </Link>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="font-medium">{user.username}</div>
                    <div className="text-sm text-gray-400">{user.trophies} 🏆</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
                <Link
                  href="/login"
                  className="btn btn-secondary"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}