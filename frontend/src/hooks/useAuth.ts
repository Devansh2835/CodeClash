'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/api';
import { initSocket, getSocket } from '@/lib/socket';

// Register socket listeners once per client session
let socketListenersRegistered = false;

export interface User {
  id: string;
  username: string;
  email: string;
  trophies: number;
  totalGames: number;
  wins: number;
  losses: number;
  winrate: string;
  arena: number;
  badges: string[];
  metamaskAddress?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  // Register socket listeners to keep `user` in sync across events
  useEffect(() => {
    if (!user) return;

    // Ensure socket is initialized
    try {
      initSocket();
      const socket = getSocket();

      if (!socketListenersRegistered) {
        socket.on('trophies:updated', (payload: any) => {
          setUser((prev) => {
            if (!prev) return prev;
            if (payload.userId !== prev.id) return prev;
            return { ...prev, trophies: payload.trophies };
          });
        });

        socket.on('badges:awarded', (payload: any) => {
          setUser((prev) => {
            if (!prev) return prev;
            if (payload.userId !== prev.id) return prev;
            const existing = prev.badges || [];
            const merged = Array.from(new Set([...existing, ...(payload.badges || [])]));
            return { ...prev, badges: merged };
          });
        });

        socket.on('user:updated', (payload: any) => {
          if (payload?.user && payload.user._id) {
            setUser((prev) => {
              if (!prev) return prev;
              if (payload.user._id.toString() !== prev.id && payload.user.id !== prev.id) return prev;
              // Normalize id property if needed
              const normalized = { ...payload.user, id: payload.user._id ?? payload.user.id };
              return normalized as User;
            });
          }
        });

        // As a fallback, refresh profile on game end
        socket.on('game_end', () => {
          checkAuth();
        });

        socketListenersRegistered = true;
      }
    } catch (err) {
      // Socket not initialized yet or running on server — ignore
      // console.warn('Socket init/listen failed in useAuth', err);
    }
  }, [user]);

  async function checkAuth() {
    try {
      const response = await auth.getMe();
      setUser(response.data.user);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const response = await auth.login({ email, password });
    setUser(response.data.user);
    return response.data;
  }

  async function signup(username: string, email: string, password: string) {
    const response = await auth.signup({ username, email, password });
    return response.data;
  }

  async function logout() {
    await auth.logout();
    setUser(null);
  }

  return {
    user,
    loading,
    login,
    signup,
    logout,
    refetch: checkAuth,
  };
}