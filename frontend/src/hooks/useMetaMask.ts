'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { users } from '@/lib/api';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export function useMetaMask() {
  const [address, setAddress] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  async function checkConnection() {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });

        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setConnected(true);
        }
      } catch (error) {
        console.error('Failed to check MetaMask connection:', error);
      }
    }
  }

  async function connect() {
    if (typeof window.ethereum === 'undefined') {
      toast.error('MetaMask is not installed. Please install it to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setLoading(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      const account = accounts[0];
      setAddress(account);
      setConnected(true);

      // Save to backend
      await users.connectMetaMask(account);
      toast.success('MetaMask connected successfully!');
    } catch (error: any) {
      console.error('MetaMask connection error:', error);
      toast.error(error.message || 'Failed to connect MetaMask');
    } finally {
      setLoading(false);
    }
  }

  async function disconnect() {
    setAddress(null);
    setConnected(false);
  }

  return {
    address,
    connected,
    loading,
    connect,
    disconnect,
  };
}