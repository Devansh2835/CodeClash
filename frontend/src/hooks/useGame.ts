'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './useSocket';
import { GameState, Match, Problem, TestResult } from '@/types/game';
import toast from 'react-hot-toast';

export function useGame() {
  const { emit, on, off, connected } = useSocket();
  const [gameState, setGameState] = useState<GameState>('idle');
  const [match, setMatch] = useState<Match | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [opponent, setOpponent] = useState<any>(null);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submissionLoading, setSubmissionLoading] = useState(false);

  useEffect(() => {
    if (!connected) return;

    // Setup socket listeners
    on('matchmaking_status', handleMatchmakingStatus);
    on('match_found', handleMatchFound);
    on('game_start', handleGameStart);
    on('submission_result', handleSubmissionResult);
    on('opponent_submitted', handleOpponentSubmitted);
    on('game_end', handleGameEnd);
    on('tab_switch_warning', handleTabSwitchWarning);
    on('hint', handleHint);
    on('error', handleError);

    return () => {
      off('matchmaking_status');
      off('match_found');
      off('game_start');
      off('submission_result');
      off('opponent_submitted');
      off('game_end');
      off('tab_switch_warning');
      off('hint');
      off('error');
    };
  }, [connected]);

  // Handlers
  const handleMatchmakingStatus = useCallback((data: any) => {
    toast(data.message);
  }, []);

  const handleMatchFound = useCallback((data: any) => {
    setOpponent(data.opponent);
    setProblem(data.problem);
    setMatch({ id: data.matchId, ...data });
    setTimeLeft(data.problem.timeLimitSeconds);
    setGameState('in_game');
    toast.success('Match found! Get ready...');
  }, []);

  const handleGameStart = useCallback((data: any) => {
    toast.success('Battle started!');
  }, []);

  const handleSubmissionResult = useCallback((data: any) => {
    setTestResults(data.testResults);
    setSubmissionLoading(false);
    
    if (data.allPassed) {
      toast.success('All tests passed! 🎉');
    } else {
      const failedCount = data.testResults.filter((r: any) => !r.passed).length;
      toast.error(`${failedCount} test(s) failed`);
    }
  }, []);

  const handleOpponentSubmitted = useCallback((data: any) => {
    if (data.allPassed) {
      toast('⚠️ Opponent passed all tests!', { icon: '🏃' });
    }
  }, []);

  const handleGameEnd = useCallback((data: any) => {
    const won = data.winner === match?.player1Id;
    
    if (won) {
      toast.success('🏆 Victory! +100 trophies');
    } else {
      toast.error('💀 Defeat! -100 trophies');
    }

    setTimeout(() => {
      setGameState('idle');
      setMatch(null);
      setProblem(null);
      setOpponent(null);
      setTestResults([]);
    }, 3000);
  }, [match]);

  const handleTabSwitchWarning = useCallback((data: any) => {
    toast.error('⚠️ WARNING: ' + data.message, { duration: 5000 });
  }, []);

  const handleHint = useCallback((data: any) => {
    toast.success('Hint received!');
    // You can handle hint display here
  }, []);

  const handleError = useCallback((data: any) => {
    toast.error(data.message || 'An error occurred');
  }, []);

  // Actions
  const startMatchmaking = useCallback((betAmount: number = 0) => {
    if (!connected) {
      toast.error('Not connected to server');
      return;
    }

    setGameState('matchmaking');
    emit('join_matchmaking', { betAmount });
  }, [connected, emit]);

  const cancelMatchmaking = useCallback(() => {
    emit('leave_matchmaking');
    setGameState('idle');
    toast('Matchmaking cancelled');
  }, [emit]);

  const submitCode = useCallback((code: string, language: string) => {
    if (!match?.id) {
      toast.error('No active match');
      return;
    }

    if (!code.trim()) {
      toast.error('Please write some code first');
      return;
    }

    setSubmissionLoading(true);
    emit('submit_code', {
      matchId: match.id,
      code,
      language,
    });

    toast('Submitting code...');
  }, [match, emit]);

  const requestHint = useCallback(() => {
    if (!match?.id) {
      toast.error('No active match');
      return;
    }

    emit('request_hint', { matchId: match.id });
  }, [match, emit]);

  const reportTabSwitch = useCallback(() => {
    if (!match?.id) return;
    emit('tab_switch', { matchId: match.id });
  }, [match, emit]);

  return {
    gameState,
    match,
    problem,
    opponent,
    testResults,
    timeLeft,
    submissionLoading,
    connected,
    startMatchmaking,
    cancelMatchmaking,
    submitCode,
    requestHint,
    reportTabSwitch,
  };
}