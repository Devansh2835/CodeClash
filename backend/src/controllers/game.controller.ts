import { Request, Response } from 'express';
import User from '../models/User.model';
import Match from '../models/Match.model';
import Bet from '../models/Bet.model';
import { blockchainService } from '../services/blockchain.service';

export async function getLeaderboard(req: Request, res: Response): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;

    const users = await User.find({ isVerified: true })
      .sort({ trophies: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('username trophies totalGames wins losses arena badges walletAddress');

    const leaderboard = users.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      username: user.username,
      trophies: user.trophies,
      totalGames: user.totalGames,
      wins: user.wins,
      winrate: user.winrate,
      arena: user.arena,
      badgeCount: user.badges.length,
      hasWallet: !!user.walletAddress,
    }));

    res.json({ leaderboard, page });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
}

export async function getCommissionWallet(req: Request, res: Response): Promise<void> {
  try {
    const walletAddress = blockchainService.getCommissionWallet();
    res.json({ commissionWallet: walletAddress });
  } catch (error) {
    console.error('Get commission wallet error:', error);
    res.status(500).json({ error: 'Failed to get commission wallet' });
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

export async function createCryptoBet(req: Request, res: Response): Promise<void> {
  try {
    const { matchId, player1Id, player2Id, amount, txHash } = req.body;
    const userId = req.user?.userId;

    // Verify user is one of the players
    if (userId !== player1Id && userId !== player2Id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    // Create bet record
    const bet = new Bet({
      match: matchId,
      player1: player1Id,
      player2: player2Id,
      amount: parseFloat(amount),
      txHash,
      status: 'PENDING'
    });

    await bet.save();

    // Update match with bet info
    await Match.findByIdAndUpdate(matchId, {
      betId: bet._id,
      betAmount: parseFloat(amount)
    });

    res.json({
      success: true,
      betId: bet._id,
      message: 'Crypto bet created successfully'
    });
  } catch (error: any) {
    console.error('Create crypto bet error:', error);
    res.status(500).json({ error: error.message || 'Failed to create crypto bet' });
  }
}

export async function getMatch(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const match = await Match.findById(id)
      .populate('player1 player2', 'username trophies walletAddress')
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

export async function settleCryptoBet(req: Request, res: Response): Promise<void> {
  try {
    const { matchId, winnerId, loserId } = req.body;
    const userId = req.user?.userId;

    // Verify the user is authorized (you might want to restrict this to admin/system)
    // For now, allowing any authenticated user
    
    const match = await Match.findById(matchId)
      .populate('player1 player2', 'walletAddress');

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    // Get wallet addresses
    const winner = match.player1._id.toString() === winnerId ? match.player1 : match.player2;
    const loser = match.player1._id.toString() === loserId ? match.player1 : match.player2;

    if (!winner.walletAddress || !loser.walletAddress) {
      res.status(400).json({ error: 'Both players must have connected wallets' });
      return;
    }

    // Check if there are crypto bets for this match
    const hasBets = await blockchainService.hasCryptoBets(matchId);
    if (!hasBets) {
      res.status(400).json({ error: 'No crypto bets found for this match' });
      return;
    }

    // Settle the bet on blockchain
    const txHash = await blockchainService.settleBet(
      matchId,
      winner.walletAddress,
      loser.walletAddress
    );

    // Update bet record in database
    await Bet.findOneAndUpdate(
      { match: matchId },
      {
        status: 'SETTLED',
        winner: winnerId,
        settleTxHash: txHash
      }
    );

    res.json({
      success: true,
      txHash,
      message: 'Crypto bet settled successfully'
    });
  } catch (error: any) {
    console.error('Settle crypto bet error:', error);
    res.status(500).json({ error: error.message || 'Failed to settle crypto bet' });
  }
}

export async function getCryptoBetStatus(req: Request, res: Response): Promise<void> {
  try {
    const { matchId } = req.params;
    
    // Get match data from blockchain
    const matchData = await blockchainService.getMatchData(matchId);
    
    // Get bet record from database
    const bet = await Bet.findOne({ match: matchId })
      .populate('player1 player2 winner', 'username walletAddress');

    res.json({
      blockchain: matchData,
      database: bet
    });
  } catch (error: any) {
    console.error('Get crypto bet status error:', error);
    res.status(500).json({ error: error.message || 'Failed to get crypto bet status' });
  }
}