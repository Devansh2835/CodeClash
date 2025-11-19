export interface BadgeDefinition {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export const BADGES: Record<string, BadgeDefinition> = {
  FIRST_BLOOD: {
    id: 'FIRST_BLOOD',
    name: 'First Blood',
    emoji: '🩸',
    description: 'Win your first match',
    condition: 'Win 1 match',
    rarity: 'common',
  },
  SPEEDSTER: {
    id: 'SPEEDSTER',
    name: 'Speedster',
    emoji: '⚡',
    description: 'Solve a problem in under 1 second',
    condition: 'Complete 3 matches with runtime < 1s',
    rarity: 'rare',
  },
  FLAWLESS: {
    id: 'FLAWLESS',
    name: 'Flawless',
    emoji: '✨',
    description: 'Pass all test cases on first submission',
    condition: 'Pass all tests first try (5 times)',
    rarity: 'rare',
  },
  WIN_STREAK: {
    id: 'WIN_STREAK',
    name: 'Win Streak',
    emoji: '🔥',
    description: 'Win multiple matches in a row',
    condition: 'Win 5 consecutive matches',
    rarity: 'epic',
  },
  ARENA_CHAMPION: {
    id: 'ARENA_CHAMPION',
    name: 'Arena Champion',
    emoji: '👑',
    description: 'Reach the Diamond arena',
    condition: 'Reach 4000+ trophies',
    rarity: 'legendary',
  },
  BUG_HUNTER: {
    id: 'BUG_HUNTER',
    name: 'Bug Hunter',
    emoji: '🐛',
    description: 'Fix failing tests and achieve victory',
    condition: 'Submit correct after failing tests',
    rarity: 'common',
  },
  COMEBACK_KID: {
    id: 'COMEBACK_KID',
    name: 'Comeback Kid',
    emoji: '🔄',
    description: 'Win after opponent submits first',
    condition: 'Win after opponent passed tests',
    rarity: 'rare',
  },
  BET_MASTER: {
    id: 'BET_MASTER',
    name: 'Bet Master',
    emoji: '💰',
    description: 'Master of wagering',
    condition: 'Win 10 betting matches',
    rarity: 'epic',
  },
  PERFECT_SCORE: {
    id: 'PERFECT_SCORE',
    name: 'Perfect Score',
    emoji: '💯',
    description: 'Win with flawless execution',
    condition: 'Win with 0ms runtime difference',
    rarity: 'legendary',
  },
  NIGHT_OWL: {
    id: 'NIGHT_OWL',
    name: 'Night Owl',
    emoji: '🦉',
    description: 'Play late at night',
    condition: 'Win 10 matches between 12 AM - 6 AM',
    rarity: 'rare',
  },
} as const;

export type BadgeId = keyof typeof BADGES;

export function getBadgeById(id: string): BadgeDefinition | undefined {
  return BADGES[id as BadgeId];
}

export function getAllBadges(): BadgeDefinition[] {
  return Object.values(BADGES);
}

export function getBadgesByRarity(
  rarity: BadgeDefinition['rarity']
): BadgeDefinition[] {
  return getAllBadges().filter((badge) => badge.rarity === rarity);
}