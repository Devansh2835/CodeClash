import User from '../models/User.model';
import env from '../config/env';

export async function awardTrophy(userId: string, amount: number): Promise<number> {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  const newTrophies = Math.max(0, user.trophies + amount);
  user.trophies = newTrophies;
  await user.save();

  return newTrophies;
}

export async function updateMatchStats(
  winnerId: string,
  loserId: string
): Promise<void> {
  // Update winner
  await User.findByIdAndUpdate(winnerId, {
    $inc: {
      totalGames: 1,
      wins: 1,
      trophies: env.TROPHY_WIN_AMOUNT,
    },
  });

  // Update loser
  await User.findByIdAndUpdate(loserId, {
    $inc: {
      totalGames: 1,
      losses: 1,
      trophies: -env.TROPHY_LOSS_AMOUNT,
    },
  });

  // Prevent negative trophies
  const loser = await User.findById(loserId);
  if (loser && loser.trophies < 0) {
    loser.trophies = 0;
    await loser.save();
  }
}