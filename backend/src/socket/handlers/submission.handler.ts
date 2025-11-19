import { Server, Socket } from 'socket.io';
import Match from '../../models/Match.model';
// import Problem from '../../models/Problem.model';
import { executeTestCases, LANGUAGE_IDS } from '../../services/judge0.service';

interface SubmissionData {
  matchId: string;
  code: string;
  language: string;
}

export function handleSubmission(_io: Server, socket: Socket, data: SubmissionData) {
  return async () => {
    try {
      const userId = socket.data.userId;
      const { matchId, code, language } = data;

      // Validate inputs
      if (!matchId || !code || !language) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Get match and problem
      const match = await Match.findById(matchId).populate('problem');
      if (!match) {
        socket.emit('error', { message: 'Match not found' });
        return;
      }

      if (match.status !== 'IN_PROGRESS') {
        socket.emit('error', { message: 'Match is not in progress' });
        return;
      }

      const problem = match.problem as any;
      const isPlayer1 = match.player1.toString() === userId;

      // Check if player is part of this match
      if (!isPlayer1 && match.player2.toString() !== userId) {
        socket.emit('error', { message: 'Unauthorized' });
        return;
      }

      // Check if player is disqualified
      if ((isPlayer1 && match.player1Disqualified) || (!isPlayer1 && match.player2Disqualified)) {
        socket.emit('error', { message: 'You have been disqualified' });
        return;
      }

      // Get language ID
      const languageId = LANGUAGE_IDS[language as keyof typeof LANGUAGE_IDS];
      if (!languageId) {
        socket.emit('error', { message: 'Unsupported language' });
        return;
      }

      // Notify submission started
      socket.emit('submission_status', {
        status: 'running',
        message: 'Executing test cases...',
      });

      // Execute test cases one by one
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

      // Create submission object
      const submission = {
        code,
        language,
        timestamp: new Date(),
        testResults,
        totalRuntime,
        allPassed,
      };

      // Update match with submission
      if (isPlayer1) {
        match.player1Submissions.push(submission);
        // Update best runtime if all passed and better than previous
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
        submissionId: submission.timestamp.getTime(),
      });

      // Notify opponent
      const roomId = `match:${matchId}`;
      socket.to(roomId).emit('opponent_submitted', {
        allPassed,
        playerNumber: isPlayer1 ? 1 : 2,
      });

      console.log(
        `✓ Submission processed for user ${userId} in match ${matchId}: ${
          allPassed ? 'All passed' : 'Some failed'
        }`
      );
    } catch (error: any) {
      console.error('Submission handler error:', error);
      socket.emit('error', { message: 'Submission failed: ' + error.message });
    }
  };
}