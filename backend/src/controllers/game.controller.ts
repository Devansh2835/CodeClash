import { Request, Response } from 'express';
import User from '../models/User.model';
import Match from '../models/Match.model';

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;

    const users = await User.find({ isVerified: true })
      .sort({ trophies: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('username trophies totalGames wins losses arena badges');

    const leaderboard = users.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      username: user.username,
      trophies: user.trophies,
      totalGames: user.totalGames,
      wins: user.wins,
      winrate: user.winrate,
      arena: user.arena,
      badgeCount: user.badges.length,
    }));

    res.json({ leaderboard, page });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

export async function submitCode(_req: Request, res: Response): Promise<void> {
  try {
    // This is handled via Socket.io in production
    // This endpoint is for testing purposes only
    res.json({
      message: 'Please use Socket.io for code submission during matches',
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ error: 'Failed to submit code' });
  }
}

export async function getMatch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const match = await Match.findById(id)
      .populate('player1 player2', 'username trophies')
      .populate('problem', 'title description difficulty');

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    // Check if user is part of this match
    const isPlayer =
      match.player1._id.toString() === userId ||
      match.player2._id.toString() === userId;

    if (!isPlayer) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ match });
  } catch (error) {
    console.error('Get match error:', error);
    res.status(500).json({ error: 'Failed to fetch match' });
  }
}