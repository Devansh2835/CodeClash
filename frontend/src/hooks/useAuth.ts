'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/api';

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