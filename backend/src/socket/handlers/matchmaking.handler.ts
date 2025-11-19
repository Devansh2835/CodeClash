import { Server, Socket } from 'socket.io';
import { joinQueue, leaveQueue } from '../../services/matchmaking.service';
import User from '../../models/User.model';
import Problem from '../../models/Problem.model';
import Match from '../../models/Match.model';
import { generateAndSaveProblem } from '../../services/problemGeneration.service';
import env from '../../config/env';

export function registerMatchmakingHandlers(io: Server, socket: Socket): void {
  socket.on('join_matchmaking', async (data: { betAmount: number }) => {
    try {
      const userId = socket.data.userId;
      const { betAmount } = data;

      // Get user data
      const user = await User.findById(userId);
      if (!user) {
        socket.emit('error', { message: 'User not found' });
        return;
      }

      // Check bet limit if betting
      if (betAmount > 0) {
        const today = new Date().toDateString();
        const lastBetDate = user.lastBetDate?.toDateString();
        if (lastBetDate !== today) {
          user.betsToday = 0;
          user.lastBetDate = new Date();
        }

        if (user.betsToday >= env.MAX_BETS_PER_DAY) {
          socket.emit('error', {
            message: 'Daily bet limit reached',
          });
          return;
        }
      }

      // Join queue
      const opponent = await joinQueue({
        userId: userId,
        trophies: user.trophies,
        betAmount: betAmount,
        socketId: socket.id,
      });

      if (opponent) {
        // Match found!
        await createMatch(io, user, opponent, betAmount);
      } else {
        // In queue, waiting
        socket.emit('matchmaking_status', {
          status: 'waiting',
          message: 'Looking for opponent...',
        });
      }
    } catch (error: any) {
      console.error('Matchmaking error:', error);
      socket.emit('error', { message: error.message });
    }
  });

  socket.on('leave_matchmaking', async () => {
    try {
      const userId = socket.data.userId;
      await leaveQueue(userId);
      socket.emit('matchmaking_status', {
        status: 'left',
        message: 'Left matchmaking queue',
      });
    } catch (error: any) {
      console.error('Leave queue error:', error);
      socket.emit('error', { message: error.message });
    }
  });
}

async function createMatch(
  io: Server,
  player1Data: any,
  player2Request: any,
  betAmount: number
): Promise<void> {
  try {
    // Get player2 data
    const player2 = await User.findById(player2Request.userId);
    if (!player2) {
      return;
    }

    // Generate problem based on average trophy count
    const avgTrophies = Math.round((player1Data.trophies + player2.trophies) / 2);
    const problem = await generateAndSaveProblem(avgTrophies);

    // Create match
    const match = await Match.create({
      player1: player1Data._id,
      player2: player2._id,
      problem: problem._id,
      status: 'IN_PROGRESS',
      betAmount: betAmount > 0 ? betAmount : undefined,
      startedAt: new Date(),
    });

    // Update bet counts if betting
    if (betAmount > 0) {
      await User.findByIdAndUpdate(player1Data._id, {
        $inc: { betsToday: 1 },
        lastBetDate: new Date(),
      });
      await User.findByIdAndUpdate(player2._id, {
        $inc: { betsToday: 1 },
        lastBetDate: new Date(),
      });
    }

    // Notify both players
    const gameData = {
      matchId: match._id,
      opponent: {
        username: player2.username,
        trophies: player2.trophies,
      },
      problem: {
        title: problem.title,
        description: problem.description,
        timeLimitSeconds: problem.timeLimitSeconds,
        constraints: problem.constraints,
        hint: problem.hint,
        difficulty: problem.difficulty,
        estimatedTimeSeconds: problem.estimatedTimeSeconds,
      },
      betAmount,
    };

    io.to(`user:${player1Data._id}`).emit('match_found', gameData);
    io.to(`user:${player2._id}`).emit('match_found', {
      ...gameData,
      opponent: {
        username: player1Data.username,
        trophies: player1Data.trophies,
      },
    });

    // Create game room
    const roomId = `match:${match._id}`;
    io.in(`user:${player1Data._id}`).socketsJoin(roomId);
    io.in(`user:${player2._id}`).socketsJoin(roomId);

    // Start game countdown
    setTimeout(() => {
      io.to(roomId).emit('game_start', {
        matchId: match._id,
        startTime: Date.now(),
      });
    }, 3000);
  } catch (error) {
    console.error('Create match error:', error);
  }
}

