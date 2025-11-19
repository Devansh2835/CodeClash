'use client';

import { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { game } from '@/lib/api';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  async function fetchLeaderboard() {
    try {
      const response = await game.getLeaderboard(1);
      setLeaderboard(response.data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold mb-4">🏆 Leaderboard</h2>
        <div className="text-center text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
        Leaderboard
      </h2>
      
      <div className="space-y-2">
        {leaderboard.slice(0, 10).map((player: any) => (
          <div key={player.rank} className="flex items-center justify-between p-2 bg-gray-700 rounded">
            <div className="flex items-center space-x-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                player.rank === 1 ? 'bg-yellow-500 text-black' :
                player.rank === 2 ? 'bg-gray-400 text-black' :
                player.rank === 3 ? 'bg-yellow-700 text-white' :
                'bg-gray-600 text-white'
              }`}>
                {player.rank}
              </div>
              <div>
                <div className="font-medium">{player.username}</div>
                <div className="text-xs text-gray-400">{player.totalGames} games</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-yellow-400">{player.trophies}</div>
              <div className="text-xs text-gray-400">{player.winrate}% WR</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}