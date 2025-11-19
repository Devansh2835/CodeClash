import { Request, Response } from 'express';
import Problem from '../models/Problem.model';

/**
 * AI Problem Generation Controller
 * 
 * This is a placeholder implementation that returns deterministic problems.
 * 
 * TODO: Integrate with OpenAI/Claude API for dynamic problem generation
 * Integration steps:
 * 1. Add OpenAI API key to environment
 * 2. Install openai package
 * 3. Replace placeholder with actual AI generation
 */

const SAMPLE_PROBLEMS = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].`,
    hint: 'Use a hash map to store numbers you have seen along with their indices.',
    difficulty: 'EASY',
    trophyRange: { min: 0, max: 1000 },
    testCases: [
      {
        input: '2,7,11,15\n9',
        expectedOutput: '0,1',
        isHidden: false,
      },
      {
        input: '3,2,4\n6',
        expectedOutput: '1,2',
        isHidden: false,
      },
      {
        input: '3,3\n6',
        expectedOutput: '0,1',
        isHidden: true,
      },
    ],
    timeLimitSeconds: 30,
    tags: ['array', 'hash-table'],
  },
  {
    title: 'Valid Parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

Example:
Input: s = "()[]{}"
Output: true

Input: s = "([)]"
Output: false`,
    hint: 'Use a stack to keep track of opening brackets.',
    difficulty: 'EASY',
    trophyRange: { min: 0, max: 1000 },
    testCases: [
      { input: '()[]{}', expectedOutput: 'true', isHidden: false },
      { input: '([)]', expectedOutput: 'false', isHidden: false },
      { input: '{[]}', expectedOutput: 'true', isHidden: true },
    ],
    timeLimitSeconds: 30,
    tags: ['string', 'stack'],
  },
  {
    title: 'Maximum Subarray',
    description: `Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

Example:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.`,
    hint: "Kadane's algorithm: keep track of current max and global max.",
    difficulty: 'MEDIUM',
    trophyRange: { min: 1000, max: 3000 },
    testCases: [
      { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6', isHidden: false },
      { input: '1', expectedOutput: '1', isHidden: false },
      { input: '5,4,-1,7,8', expectedOutput: '23', isHidden: true },
    ],
    timeLimitSeconds: 45,
    tags: ['array', 'dynamic-programming'],
  },
  {
    title: 'Longest Palindromic Substring',
    description: `Given a string s, return the longest palindromic substring in s.

Example:
Input: s = "babad"
Output: "bab" or "aba"

Input: s = "cbbd"
Output: "bb"`,
    hint: 'Expand around center for each possible center point.',
    difficulty: 'MEDIUM',
    trophyRange: { min: 1000, max: 3000 },
    testCases: [
      { input: 'babad', expectedOutput: 'bab', isHidden: false },
      { input: 'cbbd', expectedOutput: 'bb', isHidden: false },
      { input: 'a', expectedOutput: 'a', isHidden: true },
    ],
    timeLimitSeconds: 45,
    tags: ['string', 'dynamic-programming'],
  },
  {
    title: 'Merge K Sorted Lists',
    description: `You are given an array of k linked-lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

Example:
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]`,
    hint: 'Use a min-heap to efficiently find the next smallest element.',
    difficulty: 'HARD',
    trophyRange: { min: 3000, max: 5000 },
    testCases: [
      {
        input: '[[1,4,5],[1,3,4],[2,6]]',
        expectedOutput: '[1,1,2,3,4,4,5,6]',
        isHidden: false,
      },
      { input: '[]', expectedOutput: '[]', isHidden: false },
      { input: '[[]]', expectedOutput: '[]', isHidden: true },
    ],
    timeLimitSeconds: 60,
    tags: ['linked-list', 'heap', 'divide-and-conquer'],
  },
];

export async function generateProblem(req: Request, res: Response): Promise<void> {
  try {
    const { trophies } = req.body;

    // TODO: Replace with actual AI generation
    /*
    const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a competitive programming problem generator."
        },
        {
          role: "user",
          content: `Generate a coding problem suitable for someone with ${trophies} trophies.
          Include: title, description, test cases, hint, difficulty, time limit.`
        }
      ]
    });
    
    const problem = parseAIResponse(response);
    */

    // Placeholder: Select problem based on trophies
    let problem;
    if (trophies < 1000) {
      problem = SAMPLE_PROBLEMS[Math.floor(Math.random() * 2)]; // Easy
    } else if (trophies < 3000) {
      problem = SAMPLE_PROBLEMS[2 + Math.floor(Math.random() * 2)]; // Medium
    } else {
      problem = SAMPLE_PROBLEMS[4]; // Hard
    }

    res.json({
      problem: {
        ...problem,
        // Hide the solution hints initially
        hint: undefined,
      },
    });
  } catch (error) {
    console.error('Generate problem error:', error);
    res.status(500).json({ error: 'Failed to generate problem' });
  }
}

export async function getHint(req: Request, res: Response): Promise<void> {
  try {
    const { problemId } = req.body;

    const problem = await Problem.findById(problemId);
    if (!problem) {
      res.status(404).json({ error: 'Problem not found' });
      return;
    }

    res.json({ hint: problem.hint });
  } catch (error) {
    console.error('Get hint error:', error);
    res.status(500).json({ error: 'Failed to fetch hint' });
  }
}