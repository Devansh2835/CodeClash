import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function formatRuntime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getArenaName(trophies: number): string {
  if (trophies < 1000) return 'Bronze';
  if (trophies < 2000) return 'Silver';
  if (trophies < 3000) return 'Gold';
  if (trophies < 4000) return 'Platinum';
  return 'Diamond';
}

export function getArenaColor(arena: number): string {
  const colors = [
    'text-yellow-700',
    'text-gray-400',
    'text-yellow-500',
    'text-blue-400',
    'text-cyan-400',
  ];
  return colors[arena - 1] || colors[0];
}