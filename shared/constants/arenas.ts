export const ARENAS = [
  {
    id: 1,
    name: 'Bronze',
    minTrophies: 0,
    maxTrophies: 999,
    color: '#CD7F32',
    icon: '🥉',
    description: 'Starting arena for new players',
  },
  {
    id: 2,
    name: 'Silver',
    minTrophies: 1000,
    maxTrophies: 1999,
    color: '#C0C0C0',
    icon: '🥈',
    description: 'Intermediate skill level',
  },
  {
    id: 3,
    name: 'Gold',
    minTrophies: 2000,
    maxTrophies: 2999,
    color: '#FFD700',
    icon: '🥇',
    description: 'Advanced players compete here',
  },
  {
    id: 4,
    name: 'Platinum',
    minTrophies: 3000,
    maxTrophies: 3999,
    color: '#E5E4E2',
    icon: '💎',
    description: 'Elite skill level',
  },
  {
    id: 5,
    name: 'Diamond',
    minTrophies: 4000,
    maxTrophies: 4999,
    color: '#B9F2FF',
    icon: '💠',
    description: 'Top-tier players only',
  },
] as const;

export type Arena = typeof ARENAS[number];

export function getArenaByTrophies(trophies: number): Arena {
  return (
    ARENAS.find(
      (arena) => trophies >= arena.minTrophies && trophies <= arena.maxTrophies
    ) || ARENAS[0]
  );
}

export function getArenaById(id: number): Arena | undefined {
  return ARENAS.find((arena) => arena.id === id);
}

export function getNextArena(currentArenaId: number): Arena | null {
  const currentIndex = ARENAS.findIndex((arena) => arena.id === currentArenaId);
  if (currentIndex === -1 || currentIndex === ARENAS.length - 1) {
    return null;
  }
  return ARENAS[currentIndex + 1];
}

export function getTrophiesNeededForNextArena(
  currentTrophies: number
): number | null {
  const currentArena = getArenaByTrophies(currentTrophies);
  const nextArena = getNextArena(currentArena.id);
  if (!nextArena) {
    return null; // Already at max arena
  }
  return nextArena.minTrophies - currentTrophies;
}