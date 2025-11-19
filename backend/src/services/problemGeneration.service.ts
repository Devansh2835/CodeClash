import { generateProblem } from './aiAgent.service';
import Problem from '../models/Problem.model';

function getTrophyRangeForDifficulty(difficulty: string): { min: number; max: number } {
  switch (difficulty) {
    case 'Easy':
      return { min: 0, max: 999 };
    case 'Medium':
      return { min: 1000, max: 1999 };
    case 'Hard':
      return { min: 2000, max: 2999 };
    case 'Very Hard':
      return { min: 3000, max: 3999 };
    case 'Expert':
      return { min: 4000, max: 9999 };
    default:
      return { min: 0, max: 999 };
  }
}

export async function generateAndSaveProblem(trophies: number) {
  try {
    // Generate problem using AI agent
    const aiProblem = await generateProblem(trophies);
    
    // Convert AI response to Problem model format
    const problemData = {
      title: aiProblem.title,
      description: aiProblem.description,
      difficulty: aiProblem.difficulty as any,
      difficultyScore: aiProblem.difficulty_score,
      estimatedTimeSeconds: aiProblem.estimated_time_seconds,
      trophyRange: getTrophyRangeForDifficulty(aiProblem.difficulty),
      testCases: aiProblem.testcases.map(tc => ({
        input: tc.stdin,
        expectedOutput: tc.expected_stdout,
        isHidden: false,
        explanation: tc.explanation
      })),
      hint: aiProblem.hint,
      timeLimitSeconds: Math.min(aiProblem.estimated_time_seconds, 300), // Cap at 5 minutes
      memoryLimitMB: 256,
      tags: aiProblem.tags,
      constraints: aiProblem.constraints,
      generationNotes: aiProblem.generation_notes,
      aiGeneratedId: aiProblem.id
    };

    // Save to database
    const problem = await Problem.create(problemData);
    return problem;
  } catch (error: any) {
    console.error('Problem generation error:', error.message);
    
    // Fallback: try to find an existing problem for this trophy range
    const fallbackProblem = await Problem.findOne({
      'trophyRange.min': { $lte: trophies },
      'trophyRange.max': { $gte: trophies },
    });
    
    if (fallbackProblem) {
      console.log('Using fallback problem:', fallbackProblem.title);
      return fallbackProblem;
    }
    
    throw new Error('Failed to generate or find suitable problem');
  }
}