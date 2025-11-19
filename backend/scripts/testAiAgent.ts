import dotenv from 'dotenv';
import { generateProblem } from '../src/services/aiAgent.service';
import { generateAndSaveProblem } from '../src/services/problemGeneration.service';
import mongoose from 'mongoose';
import env from '../src/config/env';

dotenv.config();

async function testAiAgent() {
  try {
    console.log('Testing AI Agent integration...');
    
    // Test different trophy levels
    const trophyLevels = [500, 1500, 2500, 3500, 4500];
    
    for (const trophies of trophyLevels) {
      console.log(`\n--- Testing with ${trophies} trophies ---`);
      
      try {
        const aiResponse = await generateProblem(trophies);
        console.log('✅ AI Agent Response:');
        console.log(`Title: ${aiResponse.title}`);
        console.log(`Difficulty: ${aiResponse.difficulty} (Score: ${aiResponse.difficulty_score})`);
        console.log(`Estimated Time: ${aiResponse.estimated_time_seconds}s`);
        console.log(`Test Cases: ${aiResponse.testcases.length}`);
        console.log(`Tags: ${aiResponse.tags.join(', ')}`);
        console.log(`Hint: ${aiResponse.hint}`);
      } catch (error: any) {
        console.error('❌ AI Agent Error:', error.message);
      }
    }
    
    console.log('\n--- Testing Database Integration ---');
    
    // Connect to MongoDB
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Test saving a problem
    try {
      const problem = await generateAndSaveProblem(1500);
      console.log('✅ Problem saved to database:');
      console.log(`ID: ${problem._id}`);
      console.log(`Title: ${problem.title}`);
      console.log(`Difficulty: ${problem.difficulty}`);
    } catch (error: any) {
      console.error('❌ Database save error:', error.message);
    }
    
    await mongoose.disconnect();
    console.log('\nTest completed!');
    
  } catch (error: any) {
    console.error('Test failed:', error.message);
  }
}

testAiAgent();