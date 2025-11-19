export type Language = 'javascript' | 'python' | 'java' | 'cpp' | 'c' | 'typescript' | 'go';

export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard' | 'Expert';

export type MatchStatus = 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type GameState = 'idle' | 'matchmaking' | 'in_game' | 'finished';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalCount: number;
}

export interface ErrorResponse {
  error: string;
  details?: any;
  code?: string;
}