'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

type GameState = 'idle' | 'matchmaking' | 'betting' | 'in_game';

export default function GamePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { emit, on, off, connected } = useSocket();
  const [gameState, setGameState] = useState<GameState>('idle');
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
    on('matchmaking_status', handleMatchmakingStatus);
    on('match_found', handleMatchFound);
    on('game_start', handleGameStart);
    on('submission_result', handleSubmissionResult);
    on('opponent_submitted', handleOpponentSubmitted);
    on('game_end', handleGameEnd);
    on('tab_switch_warning', handleTabSwitchWarning);
    on('disqualified', handleDisqualified);
    on('error', handleError);

    return () => {
      off('matchmaking_status');
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

  function handleMatchmakingStatus(data: any) {
    toast.success(data.message);
  }

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
    if (won) {
      toast.success('🏆 Victory! +100 trophies');
    } else {
      toast.error('💀 Defeat! -100 trophies');
    }

    setTimeout(() => {
      setGameState('idle');
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
    setGameState('idle');
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
    setGameState('idle');
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
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Idle State - Choose bet and start
  if (gameState === 'idle') {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card text-center"
          >
            <h1 className="text-4xl font-bold mb-4">Ready to Battle?</h1>
            <p className="text-gray-400 mb-8">
              You'll be matched with an opponent of similar skill level
            </p>

            <div className="mb-8">
              <h3 className="text-xl font-bold mb-4">Optional: Place a Bet 💰</h3>
              <div className="flex justify-center space-x-4">
                {[0, 1, 5, 10, 20].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setBetAmount(amount)}
                    className={`px-6 py-3 rounded-lg font-bold transition ${
                      betAmount === amount
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {amount === 0 ? 'No Bet' : `$${amount}`}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startMatchmaking}
              disabled={!connected}
              className="btn btn-primary text-xl px-12 py-4"
            >
              {connected ? 'Find Match' : 'Connecting...'}
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Matchmaking State
  if (gameState === 'matchmaking') {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card text-center max-w-md"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full mx-auto mb-6"
          />
          <h2 className="text-2xl font-bold mb-4">Finding Opponent...</h2>
          <p className="text-gray-400 mb-6">
            {betAmount > 0
              ? `Looking for opponents with $${betAmount} bet`
              : 'Matching based on your trophies'}
          </p>
          <button onClick={cancelMatchmaking} className="btn btn-secondary">
            Cancel
          </button>
        </motion.div>
      </div>
    );
  }

  // In Game State
  if (gameState === 'in_game' && problem) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Game Header */}
        <div className="mb-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <span className="text-sm text-gray-400">You</span>
                  <div className="font-bold">{user.username}</div>
                </div>
                <div className="text-2xl">⚔️</div>
                <div className="text-center">
                  <span className="text-sm text-gray-400">Opponent</span>
                  <div className="font-bold">{opponent?.username}</div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-400">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</div>
                <div className="text-sm text-gray-400">Time Left</div>
              </div>
              <div className="flex space-x-2">
                <button onClick={requestHint} className="btn btn-secondary btn-sm">
                  Hint
                </button>
                <button onClick={submitCode} className="btn btn-success btn-sm">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Game Area */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Problem Panel */}
          <div className="card">
            <h2 className="text-xl font-bold mb-4">{problem.title}</h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-gray-300">{problem.description}</p>
            </div>
            
            {testResults.length > 0 && (
              <div className="mt-6">
                <h3 className="font-bold mb-2">Test Results:</h3>
                <div className="space-y-2">
                  {testResults.map((result: any, index: number) => (
                    <div key={index} className={`p-2 rounded ${result.passed ? 'bg-green-900' : 'bg-red-900'}`}>
                      Test {result.testCase}: {result.passed ? '✅ Passed' : '❌ Failed'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Code Editor */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">Code Editor</h3>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-gray-700 border border-gray-600 rounded px-3 py-1"
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
              className="w-full h-96 bg-gray-900 border border-gray-600 rounded p-4 font-mono text-sm"
              placeholder="Write your solution here..."
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
}