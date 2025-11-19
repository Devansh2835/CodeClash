 export interface User {
 id: string;
 username: string;
 email: string;
 trophies: number;
 totalGames: number;
 wins: number;
 losses: number;
 winrate: string;
 arena: number;
 badges: string[];
 metamaskAddress?: string;
 bestRuntime?: number;
 betsToday?: number;
 createdAt: Date;
 updatedAt: Date;
 }
 export interface UserProfile extends User {
 recentMatches: RecentMatch[];
 }
 export interface RecentMatch {
 id: string;
 opponent: {
 username: string;
 trophies: number;
 };
 problem: {
 title: string;
 difficulty: string;
 };
 won: boolean;
 endedAt: Date;
 }
 export interface Badge {
 id: string;
 name: string;
 description: string;
 emoji: string;
 earned: boolean;
 earnedAt?: Date;
 }
export interface BetInfo {
 betsToday: number;
 remaining: number;
 maxPerDay: number;
 }