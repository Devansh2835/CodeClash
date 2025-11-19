 import mongoose from 'mongoose';
 import User from '../models/User.model';
 import Problem from '../models/Problem.model';
 import { hashPassword } from '../utils/bcrypt';
 import env from '../config/env';
 import { connectDatabase } from '../config/database';
 async function seed() {
 try {
 await connectDatabase();
 console.log(' Starting database seed...');
 // Clear existing data
 await User.deleteMany({});
 await Problem.deleteMany({});
 // Create sample users
 const hashedPassword = await hashPassword('password123');
 const users = await User.create([
 {
 username: 'alice',
 email: 'alice@example.com',
 password: hashedPassword,
 isVerified: true,
 trophies: 2500,
 totalGames: 50,
 wins: 35,
 losses: 15,
 badges: ['FIRST_BLOOD', 'WIN_STREAK', 'SPEEDSTER'],
 },
 {
 username: 'bob',
        email: 'bob@example.com',
        password: hashedPassword,
        isVerified: true,
        trophies: 1800,
        totalGames: 40,
        wins: 22,
        losses: 18,
        badges: ['FIRST_BLOOD', 'FLAWLESS'],
      },
      {
        username: 'charlie',
        email: 'charlie@example.com',
        password: hashedPassword,
        isVerified: true,
        trophies: 3200,
        totalGames: 75,
        wins: 50,
        losses: 25,
        badges: ['FIRST_BLOOD', 'WIN_STREAK', 'ARENA_CHAMPION'],
      },
      {
        username: 'demo',
        email: 'demo@example.com',
        password: hashedPassword,
        isVerified: true,
        trophies: 1000,
        totalGames: 10,
        wins: 5,
        losses: 5,
        badges: ['FIRST_BLOOD'],
      },
    ]);
    console.log('✅ Created sample users');
    // Create sample problems
    const problems = await Problem.create([
      {
        title: 'Two Sum',
        description: 'Find two numbers that add up to target',
        difficulty: 'EASY',
        trophyRange: { min: 0, max: 1000 },
        testCases: [
          { input: '2,7,11,15\n9', expectedOutput: '0,1', isHidden: false },
          { input: '3,2,4\n6', expectedOutput: '1,2', isHidden: false },
          { input: '3,3\n6', expectedOutput: '0,1', isHidden: true },
        ],
        hint: 'Use a hash map for O(n) solution',
        timeLimitSeconds: 30,
        tags: ['array', 'hash-table'],
        sampleInput: '2,7,11,15\n9',
        sampleOutput: '0,1',
        constraints: ['2 &lt;= nums.length &lt;= 10^4', '-10^9 &lt;= nums[i] &lt;= 10^9']
      },
      {
        title: 'Valid Parentheses',
        description: 'Check if string has valid bracket pairs',
        difficulty: 'EASY',
        trophyRange: { min: 0, max: 1000 },
        testCases: [
          { input: '()[]{}', expectedOutput: 'true', isHidden: false },
          { input: '([)]', expectedOutput: 'false', isHidden: false },
          { input: '{[]}', expectedOutput: 'true', isHidden: true },
        ],
        hint: 'Use a stack data structure',
        timeLimitSeconds: 30,
        tags: ['string', 'stack'],
        sampleInput: '()[]{}',
        sampleOutput: 'true',
        constraints: ['1 &lt;= s.length &lt;= 10^4'],
      },
      {
        title: 'Maximum Subarray',
        description: 'Find contiguous subarray with largest sum',
        difficulty: 'MEDIUM',
        trophyRange: { min: 1000, max: 3000 },
        testCases: [
          { input: '-2,1,-3,4,-1,2,1,-5,4', expectedOutput: '6', isHidden: false },
          { input: '1', expectedOutput: '1', isHidden: false },
          { input: '5,4,-1,7,8', expectedOutput: '23', isHidden: true },
        ],
        hint: "Use Kadane's algorithm",
        timeLimitSeconds: 45,
        tags: ['array', 'dynamic-programming'],
        sampleInput: '-2,1,-3,4,-1,2,1,-5,4',
        sampleOutput: '6',
        constraints: ['1 &lt;= nums.length &lt;= 10^5'],
      },
      {
        title: 'Merge K Sorted Lists',
        description: 'Merge k sorted linked lists',
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
        hint: 'Use a min-heap or priority queue',
        timeLimitSeconds: 60,
        tags: ['linked-list', 'heap'],
        sampleInput: '[[1,4,5],[1,3,4],[2,6]]',
        sampleOutput: '[1,1,2,3,4,4,5,6]',
        constraints: ['k == lists.length', '0 &lt;= k &lt;= 10^4'],
      },
    ]);
    console.log('✅ Created sample problems');
console.log('');
 console.log(' Database seeded successfully!');
 console.log('');
 console.log(' Test Credentials:');
 console.log('   Email: demo@example.com');
 console.log('   Password: password123');
 console.log('');
 process.exit(0);
 } catch (error) {
 console.error('❌ Seed error:', error);
 process.exit(1);
 }
 }
 seed();