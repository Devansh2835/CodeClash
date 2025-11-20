import { Server, Socket } from 'socket.io';
import Match from '../../models/Match.model';
import User from '../../models/User.model';
import { executeTestCases, LANGUAGE_IDS } from '../../services/judge0.service';
import { updateMatchStats } from '../../services/trophy.service';
import { checkAndAwardBadges } from '../../services/badge.service';

const tabSwitchWarnings = new Map<string, number>();

export function registerGameHandlers(io: Server, socket: Socket): void {
  socket.on('submit_code', async (data: {
    matchId: string;
    code: string;
    language: string;
  }) => {
    try {
      const userId = socket.data.userId;
      const { matchId, code, language } = data;

      // Get match and problem
      const match = await Match.findById(matchId).populate('problem');
      if (!match) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }

      const problem = match.problem as any;
      const isPlayer1 = match.player1.toString() === userId;

      // Get language ID
      const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];
      if (!languageId) {
        socket.emit('error', { message: 'Unsupported language' });
        return;
      }

      // Execute test cases
      socket.emit('submission_status', {
        status: 'running',
        message: 'Executing test cases...',
      });

      const testResults = await executeTestCases(
        code,
        languageId,
        problem.testCases.map((tc: any) => ({
          input: tc.input,
          expectedOutput: tc.expectedOutput,
        }))
      );

      // Calculate total runtime
      const totalRuntime = testResults.reduce(
        (sum, result) => sum + (result.runtime || 0),
        0
      );

      const allPassed = testResults.every((r) => r.passed);

      // Create submission
      const submission = {
        code,
        language,
        timestamp: new Date(),
        testResults,
        totalRuntime,
        allPassed,
      };

      // Update match
      if (isPlayer1) {
        match.player1Submissions.push(submission);
        if (
          allPassed &&
          (!match.player1BestRuntime || totalRuntime < match.player1BestRuntime)
        ) {
          match.player1BestRuntime = totalRuntime;
        }
      } else {
        match.player2Submissions.push(submission);
        if (
          allPassed &&
          (!match.player2BestRuntime || totalRuntime < match.player2BestRuntime)
        ) {
          match.player2BestRuntime = totalRuntime;
        }
      }

      await match.save();

      // Send results to player
      socket.emit('submission_result', {
        testResults,
        allPassed,
        totalRuntime,
      });

      // Notify opponent
      const roomId = `match:${matchId}`;
      socket.to(roomId).emit('opponent_submitted', {
        allPassed,
      });

      // Check for winner
      if (allPassed) {
        await checkForWinner(io, match);
      }
    } catch (error: any) {
      console.error('Submit code error:', error);
      socket.emit('error', { message: 'Submission failed' });
    }
  });

  socket.on('tab_switch', async (data: { matchId: string }) => {
    try {
      const userId = socket.data.userId;
      const { matchId } = data;

      const warnings = tabSwitchWarnings.get(userId) || 0;

      if (warnings === 0) {
        // First warning
        tabSwitchWarnings.set(userId, 1);
        socket.emit('tab_switch_warning', {
          message: 'Switching tabs will disqualify you!',
          warningsLeft: 1,
        });
      } else {
        // Disqualify
        const match = await Match.findById(matchId);
        if (!match) return;

        const isPlayer1 = match.player1.toString() === userId;
        if (isPlayer1) {
          match.player1Disqualified = true;
        } else {
          match.player2Disqualified = true;
        }

        match.status = 'COMPLETED';
        match.winner = isPlayer1 ? match.player2 : match.player1;
        match.endedAt = new Date();
        await match.save();

        // Update stats
        const winnerId = match.winner.toString();
        await updateMatchStats(winnerId, userId);

        // Award badges if any and emit user-level updates
        const newBadges = await checkAndAwardBadges(winnerId);

        // Fetch updated user docs to emit accurate payloads
        const winnerUser = await User.findById(winnerId).select('trophies badges username _id');
        const loserUser = await User.findById(userId).select('trophies badges username _id');

        // Notify both players in the match room
        const roomId = `match:${matchId}`;
        io.to(roomId).emit('game_end', {
          reason: 'disqualification',
          winner: winnerId,
          disqualifiedPlayer: userId,
        });

        // Emit per-user updates
        if (winnerUser) {
          io.to(`user:${winnerId}`).emit('trophies:updated', { userId: winnerId, trophies: winnerUser.trophies });
          if (newBadges && newBadges.length > 0) {
            io.to(`user:${winnerId}`).emit('badges:awarded', { userId: winnerId, badges: newBadges, badgesFull: winnerUser.badges });
            io.to(`user:${winnerId}`).emit('user:updated', { user: winnerUser });
          }
        }

        if (loserUser) {
          io.to(`user:${userId}`).emit('trophies:updated', { userId: userId, trophies: loserUser.trophies });
          io.to(`user:${userId}`).emit('user:updated', { user: loserUser });
        }

        tabSwitchWarnings.delete(userId);
      }
    } catch (error) {
      console.error('Tab switch error:', error);
    }
  });

  socket.on('request_hint', async (data: { matchId: string }) => {
    try {
      const match = await Match.findById(data.matchId).populate('problem');
      if (!match) return;

      const problem = match.problem as any;
      socket.emit('hint', {
        hint: problem.hint,
      });
    } catch (error) {
      console.error('Request hint error:', error);
    }
  });
}

async function checkForWinner(io: Server, match: any): Promise<void> {
  // Check if both players have submitted passing solutions
  const p1Passed = match.player1Submissions.some((s: any) => s.allPassed);
  const p2Passed = match.player2Submissions.some((s: any) => s.allPassed);

  if (p1Passed && p2Passed) {
    // Both passed - compare runtimes
    const p1Runtime = match.player1BestRuntime || Infinity;
    const p2Runtime = match.player2BestRuntime || Infinity;

    let winnerId;
    if (p1Runtime < p2Runtime) {
      winnerId = match.player1;
    } else if (p2Runtime < p1Runtime) {
      winnerId = match.player2;
    } else {
      // Tie - first to submit wins
      const p1FirstPass = match.player1Submissions.find((s: any) => s.allPassed);
      const p2FirstPass = match.player2Submissions.find((s: any) => s.allPassed);
      winnerId =
        p1FirstPass.timestamp < p2FirstPass.timestamp
          ? match.player1
          : match.player2;
    }

    match.winner = winnerId;
    match.status = 'COMPLETED';
    match.endedAt = new Date();
    await match.save();

    // Update stats
    const loserId = winnerId.toString() === match.player1.toString()
      ? match.player2.toString()
      : match.player1.toString();

    await updateMatchStats(winnerId.toString(), loserId);

    // Check badges and capture newly awarded badges
    const newBadges = await checkAndAwardBadges(winnerId.toString());

    // Fetch updated users and emit user-level events so clients can update in real-time
    const winnerUser = await User.findById(winnerId).select('trophies badges username _id');
    const loserUser = await User.findById(loserId).select('trophies badges username _id');

    // Notify players in match room
    const roomId = `match:${match._id}`;
    io.to(roomId).emit('game_end', {
      winner: winnerId,
      player1Runtime: p1Runtime,
      player2Runtime: p2Runtime,
    });

    // Emit per-user updates
    if (winnerUser) {
      io.to(`user:${winnerId}`).emit('trophies:updated', { userId: winnerId, trophies: winnerUser.trophies });
      if (newBadges && newBadges.length > 0) {
        io.to(`user:${winnerId}`).emit('badges:awarded', { userId: winnerId, badges: newBadges, badgesFull: winnerUser.badges });
        io.to(`user:${winnerId}`).emit('user:updated', { user: winnerUser });
      }
    }

    if (loserUser) {
      io.to(`user:${loserId}`).emit('trophies:updated', { userId: loserId, trophies: loserUser.trophies });
      io.to(`user:${loserId}`).emit('user:updated', { user: loserUser });
    }
  }
}