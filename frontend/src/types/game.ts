export type GameState = 'idle' | 'matchmaking' | 'in_game' | 'finished';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Expert';

export interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  difficultyScore?: number;
  estimatedTimeSeconds?: number;
  timeLimitSeconds: number;
  memoryLimitMB: number;
  hint: string;
  tags: string[];
  constraints: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface TestResult {
  testCase: number;
  passed: boolean;
  runtime?: number;
  memory?: number;
  output?: string;
  error?: string;
}

export interface Submission {
  code: string;
  language: string;
  timestamp: Date;
  testResults: TestResult[];
  totalRuntime: number;
  allPassed: boolean;
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  problemId: string;
  winner?: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  player1Submissions: Submission[];
  player2Submissions: Submission[];
  player1BestRuntime?: number;
  player2BestRuntime?: number;
  betAmount?: number;
  startedAt?: Date;
  endedAt?: Date;
}

export interface Opponent {
  username: string;
  trophies: number;
  arena: number;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  trophies: number;
  totalGames: number;
  wins: number;
  winrate: string;
  arena: number;
  badgeCount: number;
}