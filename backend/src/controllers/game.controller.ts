import { Request, Response } from "express";
import User from "../models/User.model";
import Match from "../models/Match.model";
import { clampPageLimit } from "../middleware/throttle.middleware";

// AuthRequest adds a minimal typed user object expected from auth middleware
type AuthRequest = Request & { user?: { userId?: string } };

// Helper to safely extract string id from populated doc, ObjectId, or string
function extractId(val: any): string | null {
  // null/undefined
  if (!val) return null;
  // already a string
  if (typeof val === "string") return val;
  // mongoose populated doc with _id
  if (val._id) return String(val._id);
  // fallback to toString if available
  if (typeof val.toString === "function") return val.toString();
  return null;
}

export async function getLeaderboard(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Validate and clamp page/limit
    const { page, limit } = clampPageLimit(req);

    const users = await User.find({ isVerified: true })
      // only select fields we need to build the leaderboard
      .select("username trophies totalGames wins losses arena badges")
      .sort({ trophies: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec();

    const leaderboard = users.map((user: any, index: number) => {
      const totalGames = Number(user.totalGames) || 0;
      const wins = Number(user.wins) || 0;
      const winrate =
        totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

      return {
        rank: (page - 1) * limit + index + 1,
        username: user.username,
        // ensure trophies are numeric
        trophies: Number(user.trophies) || 0,
        totalGames,
        wins,
        losses: Number(user.losses) || 0,
        winrate,
        arena: user.arena || null,
        badgeCount: Array.isArray(user.badges) ? user.badges.length : 0,
      };
    });

    // Prevent client/CDN caching so league views always receive fresh trophy values
    res.set("Cache-Control", "no-store");
    res.set("Last-Modified", new Date().toUTCString());

    res.json({ leaderboard, page });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}

export async function submitCode(
  _req: AuthRequest,
  res: Response
): Promise<void> {
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

export async function getMatch(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const userId = req.user?.userId ?? null;

    // Select only minimal fields to avoid leaking data
    const match = await Match.findById(id)
      .select(
        "player1 player2 problem status createdAt startAt startsAt startTime"
      ) // include common start fields
      .populate("player1", "username trophies")
      .populate("player2", "username trophies")
      .populate("problem", "title difficulty")
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

// New endpoint: called by frontend when user clicks "Battle" on the home page.
// If user is logged in -> respond with eligible:true so frontend proceeds.
// If not logged in -> respond 401 with a login redirect URL containing returnTo.
export async function startBattle(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    // Frontend may pass the desired return path (e.g. "/battle") as `next` query param.
    const desiredReturn = String(req.query.next || "/battle");

    // If user is logged in, allow direct battle flow
    if (req.user && req.user.userId) {
      res.json({
        eligible: true,
        message: "User authenticated. Proceed to battle.",
      });
      return;
    }

    // Not logged in: return 200 with redirect info so frontend controls when to redirect.
    // This prevents automatic redirects on initial page load while still providing the login URL.
    const loginUrl = `/login?returnTo=${encodeURIComponent(desiredReturn)}`;
    res.json({
      eligible: false,
      redirect: loginUrl,
      message:
        "Authentication required. Client may redirect to login when user initiates battle.",
    });
  } catch (error) {
    console.error("Start battle error:", error);
    res.status(500).json({ error: "Failed to start battle" });
  }
}
