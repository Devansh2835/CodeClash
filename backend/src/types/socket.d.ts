import { Socket as BaseSocket } from 'socket.io';

export interface SocketData {
  userId: string;
  email: string;
}

export interface Socket extends BaseSocket {
  data: SocketData;
}

export interface MatchmakingData {
  betAmount: number;
}

export interface SubmissionData {
  matchId: string;
  code: string;
  language: string;
}

export interface TabSwitchData {
  matchId: string;
}

export interface HintRequestData {
  matchId: string;
}

// Server to Client events
export interface ServerToClientEvents {
  matchmaking_status: (data: {
    status: string;
    message: string;
    position?: number;
  }) => void;
  match_found: (data: {
    matchId: string;
    opponent: {
      username: string;
      trophies: number;
    };
    problem: any;
    betAmount: number;
  }) => void;
  game_start: (data: { matchId: string; startTime: number }) => void;
  submission_status: (data: { status: string; message: string }) => void;
  submission_result: (data: {
    testResults: any[];
    allPassed: boolean;
    totalRuntime: number;
    submissionId: number;
  }) => void;
  opponent_submitted: (data: {
    allPassed: boolean;
    playerNumber: number;
  }) => void;
  game_end: (data: {
    winner: string;
    reason?: string;
    player1Runtime?: number;
    player2Runtime?: number;
    disqualifiedPlayer?: string;
  }) => void;
  tab_switch_warning: (data: {
    message: string;
    warningsLeft: number;
  }) => void;
  disqualified: (data: { reason: string }) => void;
  hint: (data: { hint: string }) => void;
  error: (data: { message: string }) => void;
}

// Client to Server events
export interface ClientToServerEvents {
  join_matchmaking: (data: MatchmakingData) => void;
  leave_matchmaking: () => void;
  submit_code: (data: SubmissionData) => void;
  tab_switch: (data: TabSwitchData) => void;
  request_hint: (data: HintRequestData) => void;
  player_ready: (data: { matchId: string }) => void;
}