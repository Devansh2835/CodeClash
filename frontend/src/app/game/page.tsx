'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trophy, Swords, Crown, Zap, Users, Target } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import { game } from '@/lib/api';
import { ARENAS, getArenaByTrophies } from '@/constants/arenas';
import Leaderboard from '@/components/game/Leaderboard';
import toast from 'react-hot-toast';
import GameTimer from '@/components/game/GameTimer';

type GameState = 'lobby' | 'matchmaking' | 'in_game';

export default function GamePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { emit, on, off, connected } = useSocket();
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [betAmount, setBetAmount] = useState(0);
  const [problem, setProblem] = useState<any>(null);
  const [matchId, setMatchId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Socket event listeners
    on('match_found', handleMatchFound);
    on('game_start', handleGameStart);
    on('submission_result', handleSubmissionResult);
    on('opponent_submitted', handleOpponentSubmitted);
    on('game_end', handleGameEnd);
    on('tab_switch_warning', handleTabSwitchWarning);
    on('disqualified', handleDisqualified);
    on('error', handleError);

    return () => {
      off('match_found');
      off('game_start');
      off('submission_result');
      off('opponent_submitted');
      off('game_end');
      off('tab_switch_warning');
      off('disqualified');
      off('error');
    };
  }, [user, loading]);

  // Timer is handled by the GameTimer component via the `initialTime` prop.

  // Tab switch detection
  useEffect(() => {
    if (gameState === 'in_game' && matchId) {
      const handleVisibilityChange = () => {
        if (document.hidden) {
          emit('tab_switch', { matchId });
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [gameState, matchId]);

  function handleMatchFound(data: any) {
    setOpponent(data.opponent);
    setProblem(data.problem);
    setMatchId(data.matchId);
    setTimeLeft(data.problem.timeLimitSeconds);
    setGameState('in_game');
    toast.success('Opponent found! Get ready...');
  }

  function handleGameStart(data: any) {
    toast.success('Battle started! Code fast!');
  }

  function handleSubmissionResult(data: any) {
    setTestResults(data.testResults);
    if (data.allPassed) {
      toast.success('All tests passed! 🎉');
    } else {
      const failedCount = data.testResults.filter((r: any) => !r.passed).length;
      toast.error(`${failedCount} test(s) failed`);
    }
  }

  function handleOpponentSubmitted(data: any) {
    if (data.allPassed) {
      toast('⚠️ Opponent passed all tests!', { icon: '🏃' });
    }
  }

  function handleGameEnd(data: any) {
    const won = data.winner === user?.id;
    // stop countdown immediately when game ends
    setTimeLeft(0);
    if (won) {
      toast.success('🏆 Victory! +100 trophies');
    } else {
      toast.error('💀 Defeat! -100 trophies');
    }

    setTimeout(() => {
      setGameState('lobby');
      setMatchId(null);
      setProblem(null);
      setOpponent(null);
      setCode('');
      setTestResults([]);
    }, 3000);
  }

  function handleTabSwitchWarning(data: any) {
    toast.error('⚠️ WARNING: Switching tabs again will disqualify you!', {
      duration: 5000,
    });
  }

  function handleDisqualified(data: any) {
    toast.error('❌ You have been disqualified for tab switching!');
    // stop the timer and return to lobby
    setTimeLeft(0);
    setGameState('lobby');
  }

  function handleError(data: any) {
    toast.error(data.message || 'An error occurred');
  }

  function startMatchmaking() {
    if (!connected) {
      toast.error('Not connected to server');
      return;
    }

    setGameState('matchmaking');
    emit('join_matchmaking', { betAmount });
  }

  function cancelMatchmaking() {
    emit('leave_matchmaking');
    setGameState('lobby');
    toast('Matchmaking cancelled');
  }

  function submitCode() {
    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    emit('submit_code', {
      matchId,
      code,
      language,
    });
    toast('Submitting code...');
  }

  function requestHint() {
    emit('request_hint', { matchId });
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentArena = getArenaByTrophies(user.trophies);

  // Game Lobby - Main game page
  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Animated Background Elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-primary-400 rounded-full opacity-20"
                animate={{
                  x: [0, 100, 0],
                  y: [0, -100, 0],
                  scale: [1, 1.5, 1],
                }}
                transition={{
                  duration: 3 + i * 0.2,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 relative z-10"
          >
            <motion.h1 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="text-7xl font-bold mb-6 bg-gradient-to-r from-red-400 via-yellow-400 to-purple-400 bg-clip-text text-transparent drop-shadow-2xl"
            >
              ⚔️ BATTLE ARENA ⚔️
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold"
            >
              🔥 Prove your coding skills in epic 1v1 battles 🔥
            </motion.p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {/* Main Battle Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Current Arena */}
              <motion.div 
                whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)" }}
                className="card bg-gradient-to-br from-gray-800 via-gray-900 to-black border-2 shadow-2xl" 
                style={{ borderColor: currentArena.color, boxShadow: `0 0 30px ${currentArena.color}40` }}
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-6">
                    <motion.div 
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-8xl"
                    >
                      {currentArena.icon}
                    </motion.div>
                    <div>
                      <h2 className="text-4xl font-bold mb-2" style={{ color: currentArena.color }}>
                        {currentArena.name} Arena
                      </h2>
                      <p className="text-gray-400 text-lg">{currentArena.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-4xl font-bold text-yellow-400 mb-2"
                    >
                      {user.trophies} 🏆
                    </motion.div>
                    <div className="text-sm text-gray-400">
                      {currentArena.maxTrophies - user.trophies} to next arena
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                  <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ 
                        width: `${((user.trophies - currentArena.minTrophies) / (currentArena.maxTrophies - currentArena.minTrophies)) * 100}%` 
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-4 rounded-full bg-gradient-to-r from-primary-500 via-yellow-500 to-purple-500"
                    />
                  </div>
                </div>

                {/* Betting Options */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-6 flex items-center">
                    <Target className="w-6 h-6 mr-3" />
                    Optional Betting 💰
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {[0, 1, 5, 10, 20].map((amount) => (
                      <motion.button
                        key={amount}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setBetAmount(amount)}
                        className={`p-4 rounded-xl font-bold text-lg transition-all ${
                          betAmount === amount
                            ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white shadow-lg'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                      >
                        {amount === 0 ? 'Free' : `$${amount}`}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Start Battle Button */}
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(239, 68, 68, 0.4)" }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: ["0 0 20px rgba(239, 68, 68, 0.3)", "0 0 40px rgba(239, 68, 68, 0.6)", "0 0 20px rgba(239, 68, 68, 0.3)"],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  onClick={startMatchmaking}
                  disabled={!connected}
                  className="w-full bg-gradient-to-r from-red-500 via-orange-500 to-red-600 hover:from-red-600 hover:to-orange-600 text-white font-bold py-8 px-8 rounded-2xl text-3xl flex items-center justify-center space-x-4 transition-all duration-300 shadow-2xl border-2 border-red-400"
                >
                  <Swords className="w-10 h-10" />
                  <span>{connected ? 'START BATTLE' : 'CONNECTING...'}</span>
                  <Swords className="w-10 h-10" />
                </motion.button>
              </motion.div>

              {/* Arena Progression */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="card bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30"
              >
                <h3 className="text-3xl font-bold mb-8 flex items-center">
                  <Crown className="w-8 h-8 mr-3 text-yellow-400" />
                  Arena Progression
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                  {ARENAS.map((arena, index) => {
                    const isUnlocked = user.trophies >= arena.minTrophies;
                    const isCurrent = currentArena.id === arena.id;
                    
                    return (
                      <motion.div
                        key={arena.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.1, y: -10 }}
                        className={`p-6 rounded-xl text-center transition-all ${
                          isCurrent
                            ? 'bg-gradient-to-b from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400 shadow-lg'
                            : isUnlocked
                            ? 'bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600'
                            : 'bg-gray-800/30 opacity-50 border border-gray-700'
                        }`}
                      >
                        <motion.div 
                          animate={isCurrent ? { rotate: [0, 10, -10, 0] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-5xl mb-3"
                        >
                          {arena.icon}
                        </motion.div>
                        <div className="font-bold text-lg mb-1" style={{ color: isUnlocked ? arena.color : '#666' }}>
                          {arena.name}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          {arena.minTrophies}+ 🏆
                        </div>
                        {isCurrent && (
                          <motion.div 
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-xs text-yellow-400 font-bold bg-yellow-400/20 px-2 py-1 rounded-full"
                          >
                            CURRENT
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Leaderboard />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // Matchmaking State
  if (gameState === 'matchmaking') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-lg bg-gradient-to-br from-gray-800 to-gray-900 border border-primary-500/50 shadow-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-24 h-24 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-8"
          />
          <h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
            Finding Opponent...
          </h2>
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Users className="w-6 h-6 text-gray-400" />
            <span className="text-xl text-gray-300">
              {betAmount > 0
                ? `$${betAmount} Betting Match`
                : `${currentArena.name} Arena`}
            </span>
          </div>
          <p className="text-gray-400 mb-8 text-lg">
            Matching with players around {user.trophies} trophies
          </p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cancelMatchmaking} 
            className="btn btn-secondary w-full text-lg py-3"
          >
            Cancel Matchmaking
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // In Game State
  if (gameState === 'in_game' && problem) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900/20 via-gray-900 to-orange-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Game Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
              <div className="card bg-gradient-to-r from-red-900/50 to-orange-900/50 border border-red-500/50">
              <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-center md:space-x-12 space-y-4 md:space-y-0 w-full">
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="text-center p-4 bg-blue-500/20 rounded-xl border border-blue-400"
                  >
                    <span className="text-sm text-gray-400 block mb-1">You</span>
                    <div className="font-bold text-blue-400 text-lg md:text-xl">{user.username}</div>
                    <div className="text-sm text-gray-400">{user.trophies} 🏆</div>
                  </motion.div>
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-6xl"
                  >
                    ⚔️
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="text-center p-4 bg-red-500/20 rounded-xl border border-red-400"
                  >
                    <span className="text-sm text-gray-400 block mb-1">Opponent</span>
                    <div className="font-bold text-red-400 text-lg md:text-xl">{opponent?.username}</div>
                    <div className="text-sm text-gray-400">{opponent?.trophies} 🏆</div>
                  </motion.div>
                </div>
                <motion.div 
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="text-center w-full md:w-auto"
                >
<<<<<<< HEAD
                  <div className="text-3xl md:text-5xl font-bold text-yellow-400 mb-2">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-400">Time Left</div>
=======
                  <GameTimer initialTime={timeLeft} />
>>>>>>> f943010 (Fix: real-time trophies, badges and match timer; add socket listeners)
                </motion.div>
                <div className="flex flex-col md:flex-row md:space-x-3 w-full md:w-auto">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={requestHint} 
                    className="btn btn-secondary btn-sm text-lg px-6 py-3 mb-2 md:mb-0"
                  >
                    💡 Hint
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={submitCode} 
                    className="btn btn-success btn-sm text-lg px-6 py-3"
                  >
                    🚀 Submit
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Game Area */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Problem Panel */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30"
            >
              <h2 className="text-3xl font-bold mb-6 text-primary-400">{problem.title}</h2>
              <div className="prose prose-invert max-w-none mb-8">
                <p className="text-gray-300 text-lg leading-relaxed">{problem.description}</p>
              </div>
              
              {testResults.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8"
                >
                  <h3 className="font-bold mb-4 text-xl">Test Results:</h3>
                  <div className="space-y-3">
                    {testResults.map((result: any, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border-l-4 ${
                          result.passed 
                            ? 'bg-green-900/30 border-green-500 border border-green-500/50' 
                            : 'bg-red-900/30 border-red-500 border border-red-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-lg">Test Case {index + 1}</span>
                          <span className={`font-bold text-xl ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                            {result.passed ? '✅ PASSED' : '❌ FAILED'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Code Editor */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-600"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-2xl">Code Editor</h3>
                <select
                  id="language-select"
                  aria-label="Select programming language"
                  title="Select programming language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-lg"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full h-96 bg-gray-900 border border-gray-600 rounded-lg p-6 font-mono text-lg resize-none focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                placeholder="// Write your solution here..."
              />
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}