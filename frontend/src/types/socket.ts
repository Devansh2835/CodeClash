export interface MatchmakingData {
  betAmount: number;
}

export interface MatchFoundData {
  matchId: string;
  opponent: {
    username: string;
    trophies: number;
  };
  problem: any;
  betAmount: number;
}

export interface GameStartData {
  matchId: string;
  startTime: number;
}

export interface SubmissionData {
  matchId: string;
  code: string;
  language: string;
}

export interface SubmissionResultData {
  testResults: any[];
  allPassed: boolean;
  totalRuntime: number;
  submissionId: number;
}

export interface OpponentSubmittedData {
  allPassed: boolean;
  playerNumber: number;
}

export interface GameEndData {
  winner: string;
  reason?: string;
  player1Runtime?: number;
  player2Runtime?: number;
  disqualifiedPlayer?: string;
}

export interface TabSwitchWarningData {
  message: string;
  warningsLeft: number;
}

export interface HintData {
  hint: string;
}

export interface ErrorData {
  message: string;
}

// Server to Client Events
export interface ServerToClientEvents {
  matchmaking_status: (data: {
    status: string;
    message: string;
    position?: number;
  }) => void;
  match_found: (data: MatchFoundData) => void;
  game_start: (data: GameStartData) => void;
  submission_status: (data: { status: string; message: string }) => void;
  submission_result: (data: SubmissionResultData) => void;
  opponent_submitted: (data: OpponentSubmittedData) => void;
  game_end: (data: GameEndData) => void;
  tab_switch_warning: (data: TabSwitchWarningData) => void;
  disqualified: (data: { reason: string }) => void;
  hint: (data: HintData) => void;
  error: (data: ErrorData) => void;
}

// Client to Server Events
export interface ClientToServerEvents {
  join_matchmaking: (data: MatchmakingData) => void;
  leave_matchmaking: () => void;
  submit_code: (data: SubmissionData) => void;
  tab_switch: (data: { matchId: string }) => void;
  request_hint: (data: { matchId: string }) => void;
  player_ready: (data: { matchId: string }) => void;
}