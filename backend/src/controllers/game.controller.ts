import { Request, Response } from 'express';
import User from '../models/User.model';
import Match from '../models/Match.model';
import Bet from '../models/Bet.model';
import { blockchainService } from '../services/blockchain.service';
import { clampPageLimit } from '../middleware/throttle.middleware';

type AuthRequest = Request & { user?: { userId?: string } };

function extractId(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (val._id) return String(val._id);
  if (typeof val.toString === "function") return val.toString();
  return null;
}

export async function getLeaderboard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { page, limit } = clampPageLimit(req);

    const users = await User.find({ isVerified: true })
      .select('username trophies totalGames wins losses arena badges walletAddress')
      .sort({ trophies: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    const leaderboard = users.map((user: any, index: number) => {
      const totalGames = Number(user.totalGames) || 0;
      const wins = Number(user.wins) || 0;
      const winrate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

      return {
        rank: (page - 1) * limit + index + 1,
        username: user.username,
        trophies: Number(user.trophies) || 0,
        totalGames,
        wins,
        losses: Number(user.losses) || 0,
        winrate,
        arena: user.arena || null,
        badgeCount: Array.isArray(user.badges) ? user.badges.length : 0,
        hasWallet: !!user.walletAddress,
      };
    });

    res.set("Cache-Control", "no-store");
    res.set("Last-Modified", new Date().toUTCString());

    res.json({ leaderboard, page });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}

export async function getCommissionWallet(_req: Request, res: Response): Promise<void> {
  try {
    const walletAddress = blockchainService.getCommissionWallet();
    res.json({ commissionWallet: walletAddress });
  } catch (error) {
    console.error('Get commission wallet error:', error);
    res.status(500).json({ error: 'Failed to get commission wallet' });
  }
}

export async function submitCode(_req: AuthRequest, res: Response): Promise<void> {
  try {
    // This is handled via Socket.io in production
    // This endpoint is for testing purposes only
    res.json({
      message: "Please use Socket.io for code submission during matches",
    });
  } catch (error) {
    console.error("Submit code error:", error);
    res.status(500).json({ error: "Failed to submit code" });
  }
}

export async function createCryptoBet(req: Request, res: Response): Promise<void> {
  try {
    const { matchId, player1Id, player2Id, amount, txHash } = req.body;
    const userId = req.user?.userId;

    if (userId !== player1Id && userId !== player2Id) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const bet = new Bet({
      match: matchId,
      player1: player1Id,
      player2: player2Id,
      amount: parseFloat(amount),
      txHash,
      status: 'PENDING'
    });

    await bet.save();

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

export async function getMatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? null;

    const match = await Match.findById(id)
      .select("player1 player2 problem status createdAt startAt startsAt startTime")
      .populate("player1", "username trophies walletAddress")
      .populate("player2", "username trophies walletAddress")
      .populate("problem", "title description difficulty")
      .lean()
      .exec();

    if (!match) {
      res.status(404).json({ error: "Match not found" });
      return;
    }

    // Extract ids safely (handles populated docs or raw ObjectIds/strings)
    const p1Id = extractId(match.player1);
    const p2Id = extractId(match.player2);

    // If no authenticated user or user not part of match -> deny
    if (!userId || (userId !== p1Id && userId !== p2Id)) {
      res.status(403).json({ error: "Access denied" });
      return;
    }

    // Determine startAt (server-provided). Accept several possible fields and compute a fallback.
    const rawStart =
      (match as any).startAt ??
      (match as any).startsAt ??
      (match as any).startTime ??
      null;

    let startAtIso: string | null = null;
    if (rawStart) {
      const parsed = new Date(rawStart);
      if (!isNaN(parsed.getTime())) startAtIso = parsed.toISOString();
    }

    // If no explicit start time and match is pending/matched, provide a short fallback countdown
    if (
      !startAtIso &&
      ((match as any).status === "pending" ||
        (match as any).status === "matched")
    ) {
      const created = new Date((match as any).createdAt);
      const fallbackDelayMs = 5000; // 5s default countdown after matchmaking
      if (!isNaN(created.getTime())) {
        startAtIso = new Date(
          created.getTime() + fallbackDelayMs
        ).toISOString();
      }
    }

    // Server time and remaining ms relative to server to avoid client/server skew problems
    const serverTime = new Date();
    const serverTimeIso = serverTime.toISOString();
    const remainingMs = startAtIso
      ? Math.max(new Date(startAtIso).getTime() - serverTime.getTime(), 0)
      : null;

    // Build a short hint message and optional expiry for frontend display
    let hint: string | null = null;
    let hintExpiresAt: string | null = null;
    const status = (match as any).status ?? null;

    if (status === "searching" || status === "waiting") {
      hint = "Searching for opponent...";
      // no expiry; will update as match state changes
    } else if (status === "pending" || status === "matched") {
      if (remainingMs === null) {
        hint = "Preparing match...";
      } else if (remainingMs > 0) {
        const secs = Math.ceil(remainingMs / 1000);
        hint = `Match starts in ${secs}s`;
        // hint expires when the countdown reaches zero
        hintExpiresAt = new Date(
          serverTime.getTime() + remainingMs
        ).toISOString();
      } else {
        hint = "Match starting now";
      }
    } else if (status === "active" || status === "in_progress") {
      hint = "Match in progress";
    } else if (status === "completed" || status === "finished") {
      hint = "Match completed";
    } else {
      hint = null;
    }

    // Return only the safe subset of the match object plus timing and hint info
    const safeMatch = {
      _id: match._id,
      player1: match.player1
        ? {
            username: (match.player1 as any).username,
            trophies: Number((match.player1 as any).trophies) || 0,
          }
        : null,
      player2: match.player2
        ? {
            username: (match.player2 as any).username,
            trophies: Number((match.player2 as any).trophies) || 0,
          }
        : null,
      problem: match.problem
        ? {
            title: (match.problem as any).title,
            difficulty: (match.problem as any).difficulty,
          }
        : null,
      status,
      createdAt: (match as any).createdAt ?? null,
      // timing fields for frontend timer sync
      startAt: startAtIso, // ISO string or null
      serverTime: serverTimeIso, // ISO string of server now
      remainingMs, // milliseconds until start (0 if already started), or null
      // matchmaking hint fields
      hint, // short string for client to display
      hintExpiresAt, // ISO when hint should no longer be shown (if applicable)
    };

    // Prevent client/CDN caching so league/arena views see updated trophies immediately
    res.set("Cache-Control", "no-store");
    res.set("Last-Modified", new Date().toUTCString());

    res.json({ match: safeMatch });
  } catch (error) {
    console.error("Get match error:", error);
    res.status(500).json({ error: "Failed to fetch match" });
  }
}

export async function settleCryptoBet(req: Request, res: Response): Promise<void> {
  try {
    const { matchId, winnerId, loserId } = req.body;
    
    const match = await Match.findById(matchId)
      .populate('player1 player2', 'walletAddress');

    if (!match) {
      res.status(404).json({ error: 'Match not found' });
      return;
    }

    const winner = match.player1._id.toString() === winnerId ? match.player1 : match.player2;
    const loser = match.player1._id.toString() === loserId ? match.player1 : match.player2;

    if (!(winner as any).walletAddress || !(loser as any).walletAddress) {
      res.status(400).json({ error: 'Both players must have connected wallets' });
      return;
    }

    const hasBets = await blockchainService.hasCryptoBets(matchId);
    if (!hasBets) {
      res.status(400).json({ error: 'No crypto bets found for this match' });
      return;
    }

    const txHash = await blockchainService.settleBet(
      matchId,
      (winner as any).walletAddress,
      (loser as any).walletAddress
    );

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
    
    const matchData = await blockchainService.getMatchData(matchId);
    
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

export async function startBattle(req: AuthRequest, res: Response): Promise<void> {
  try {
    const desiredReturn = String(req.query.next || "/battle");

    if (req.user && req.user.userId) {
      res.json({
        eligible: true,
        message: "User authenticated. Proceed to battle.",
      });
      return;
    }

    const loginUrl = `/login?returnTo=${encodeURIComponent(desiredReturn)}`;
    res.json({
      eligible: false,
      redirect: loginUrl,
      message: "Authentication required. Client may redirect to login when user initiates battle.",
    });
  } catch (error) {
    console.error("Start battle error:", error);
    res.status(500).json({ error: "Failed to start battle" });
  }
}
