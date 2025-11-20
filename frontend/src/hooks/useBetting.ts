'use client';

import { useState, useEffect, useCallback } from 'react';
import { contractService } from '@/lib/contract';
import { useMetaMask } from './useMetaMask';
import toast from 'react-hot-toast';

interface BettingState {
  matchId: string | null;
  betAmount: string | null;
  txHash: string | null;
  settled: boolean;
  loading: boolean;
  error: string | null;
}

export function useBetting() {
  const { address, connected } = useMetaMask();
  const [bettingState, setBettingState] = useState<BettingState>({
    matchId: null,
    betAmount: null,
    txHash: null,
    settled: false,
    loading: false,
    error: null
  });

  const placeBet = useCallback(async (matchId: string, amount: string) => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    setBettingState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const txHash = await contractService.placeBet(matchId, amount);
      
      setBettingState(prev => ({
        ...prev,
        matchId,
        betAmount: amount,
        txHash,
        loading: false
      }));

      return txHash;
    } catch (error: any) {
      setBettingState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  }, [connected, address]);

  const settleBet = useCallback(async (matchId: string, winner: string, loser: string) => {
    if (!connected || !address) {
      throw new Error('Wallet not connected');
    }

    setBettingState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const txHash = await contractService.settleBet(matchId, winner, loser);
      
      setBettingState(prev => ({
        ...prev,
        settled: true,
        loading: false
      }));

      return txHash;
    } catch (error: any) {
      setBettingState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      throw error;
    }
  }, [connected, address]);

  const getMatchDetails = useCallback(async (matchId: string) => {
    try {
      return await contractService.getMatch(matchId);
    } catch (error: any) {
      console.error('Failed to get match details:', error);
      return null;
    }
  }, []);

  const resetBetting = useCallback(() => {
    setBettingState({
      matchId: null,
      betAmount: null,
      txHash: null,
      settled: false,
      loading: false,
      error: null
    });
  }, []);

  // Listen for contract events
  useEffect(() => {
    if (!connected) return;

    const handleBetPlaced = (matchId: string, player: string, amount: string) => {
      if (player.toLowerCase() === address?.toLowerCase()) {
        toast.success(`Bet placed: ${amount} ETH`);
      }
    };

    const handleBetSettled = (matchId: string, winner: string, loser: string, pot: string, winnerPayout: string, commission: string) => {
      if (winner.toLowerCase() === address?.toLowerCase()) {
        toast.success(`🎉 You won ${winnerPayout} ETH!`);
      } else if (loser.toLowerCase() === address?.toLowerCase()) {
        toast.error(`💀 You lost the bet`);
      }
    };

    contractService.onBetPlaced(handleBetPlaced);
    contractService.onBetSettled(handleBetSettled);

    return () => {
      contractService.removeAllListeners();
    };
  }, [connected, address]);

  return {
    bettingState,
    placeBet,
    settleBet,
    getMatchDetails,
    resetBetting
  };
}