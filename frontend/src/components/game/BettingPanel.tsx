'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useMetaMask } from '@/hooks/useMetaMask';
import { contractService } from '@/lib/contract';
import toast from 'react-hot-toast';

interface BettingPanelProps {
  matchId: string;
  onBetPlaced: (amount: string, txHash: string) => void;
  disabled?: boolean;
}

export default function BettingPanel({ matchId, onBetPlaced, disabled = false }: BettingPanelProps) {
  const { address, connected, connect, loading: metaMaskLoading } = useMetaMask();
  const [betAmount, setBetAmount] = useState('0.01');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string>('0');
  const [contractMatch, setContractMatch] = useState<any>(null);

  useEffect(() => {
    if (connected && address) {
      loadBalance();
      loadContractMatch();
    }
  }, [connected, address, matchId]);

  async function loadBalance() {
    if (!address) return;
    
    try {
      const bal = await contractService.getBalance(address);
      setBalance(bal);
    } catch (error) {
      console.error('Failed to load balance:', error);
    }
  }

  async function loadContractMatch() {
    try {
      const match = await contractService.getMatch(matchId);
      setContractMatch(match);
    } catch (error) {
      console.error('Failed to load contract match:', error);
    }
  }

  async function handlePlaceBet() {
    if (!connected) {
      await connect();
      return;
    }

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    const amount = parseFloat(betAmount);
    if (amount <= 0) {
      toast.error('Bet amount must be greater than 0');
      return;
    }

    if (parseFloat(balance) < amount) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);

    try {
      const txHash = await contractService.placeBet(matchId, betAmount);
      toast.success('Bet placed successfully! Waiting for confirmation...');
      
      onBetPlaced(betAmount, txHash);
      
      // Reload contract match and balance
      await loadContractMatch();
      await loadBalance();
      
    } catch (error: any) {
      console.error('Betting error:', error);
      
      if (error.code === 4001) {
        toast.error('Transaction cancelled by user');
      } else if (error.message?.includes('Cannot bet against yourself')) {
        toast.error('Cannot bet against yourself');
      } else if (error.message?.includes('Both players already joined')) {
        toast.error('Match is already full');
      } else if (error.message?.includes('Bet amount must match')) {
        toast.error('Bet amount must match the first player');
      } else {
        toast.error(error.message || 'Failed to place bet');
      }
    } finally {
      setLoading(false);
    }
  }

  const isFirstPlayer = contractMatch && contractMatch.player1 === '0x0000000000000000000000000000000000000000';
  const isSecondPlayer = contractMatch && contractMatch.player1 !== '0x0000000000000000000000000000000000000000' && contractMatch.player2 === '0x0000000000000000000000000000000000000000';
  const bothPlayersJoined = contractMatch && contractMatch.player1 !== '0x0000000000000000000000000000000000000000' && contractMatch.player2 !== '0x0000000000000000000000000000000000000000';
  const requiredAmount = contractMatch && contractMatch.amount1 > 0 ? parseFloat(contractMatch.amount1.toString()) / 1e18 : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/50"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold flex items-center">
          <Wallet className="w-6 h-6 mr-3 text-purple-400" />
          Crypto Betting
        </h3>
        {connected && (
          <div className="text-right">
            <div className="text-sm text-gray-400">Balance</div>
            <div className="font-bold text-green-400">{parseFloat(balance).toFixed(4)} ETH</div>
          </div>
        )}
      </div>

      {!connected ? (
        <div className="text-center py-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-6xl mb-4"
          >
            🦊
          </motion.div>
          <p className="text-gray-400 mb-6">Connect your MetaMask wallet to place crypto bets</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={connect}
            disabled={metaMaskLoading}
            className="btn btn-primary w-full text-lg py-3"
          >
            {metaMaskLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5 mr-2" />
                Connect MetaMask
              </>
            )}
          </motion.button>
        </div>
      ) : bothPlayersJoined ? (
        <div className="text-center py-8">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h4 className="text-xl font-bold text-green-400 mb-2">Bets Placed!</h4>
          <p className="text-gray-400">Both players have placed their bets</p>
          <div className="mt-4 p-4 bg-green-900/20 rounded-lg border border-green-500/30">
            <div className="text-2xl font-bold text-green-400">
              {(parseFloat(contractMatch.amount1.toString()) + parseFloat(contractMatch.amount2.toString())) / 1e18} ETH
            </div>
            <div className="text-sm text-gray-400">Total Prize Pool</div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {isSecondPlayer && requiredAmount && (
            <div className="p-4 bg-yellow-900/20 rounded-lg border border-yellow-500/30">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2" />
                <span className="text-yellow-400 font-medium">
                  Match the first player's bet: {requiredAmount} ETH
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bet Amount (ETH)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={isSecondPlayer && requiredAmount ? requiredAmount.toString() : betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                disabled={disabled || loading || (isSecondPlayer && requiredAmount)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-lg focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
                placeholder="0.01"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">
                ETH
              </div>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-2">
              <span>Min: 0.001 ETH</span>
              <span>Available: {parseFloat(balance).toFixed(4)} ETH</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {['0.01', '0.05', '0.1', '0.2'].map((amount) => (
              <motion.button
                key={amount}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBetAmount(amount)}
                disabled={disabled || loading || (isSecondPlayer && requiredAmount)}
                className={`p-2 rounded-lg font-medium transition-all ${
                  betAmount === amount
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                } disabled:opacity-50`}
              >
                {amount}
              </motion.button>
            ))}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlaceBet}
            disabled={disabled || loading || parseFloat(betAmount) <= 0 || parseFloat(balance) < parseFloat(betAmount)}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-bold py-4 px-6 rounded-xl text-lg flex items-center justify-center space-x-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Placing Bet...</span>
              </>
            ) : (
              <>
                <Wallet className="w-5 h-5" />
                <span>Place Bet</span>
              </>
            )}
          </motion.button>

          <div className="text-xs text-gray-500 text-center">
            <p>• Winner gets 98% of the total pot</p>
            <p>• 2% commission goes to platform</p>
            <p>• Powered by Ethereum smart contracts</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}