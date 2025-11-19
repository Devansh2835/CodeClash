import axios from 'axios';
import env from '../config/env';

interface AIAgentResponse {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  difficulty_score: number;
  estimated_time_seconds: number;
  hint: string;
  constraints: string;
  testcases: Array<{
    stdin: string;
    expected_stdout: string;
    explanation: string;
  }>;
  tags: string[];
  generation_notes: string;
}

export async function generateProblem(trophies: number): Promise<AIAgentResponse> {
  try {
    const response = await axios.post(
      env.AI_AGENT_API_URL,
      {
        user_id: 'system',
        agent_id: env.AI_AGENT_ID,
        session_id: `${env.AI_AGENT_ID}-${Date.now()}`,
        message: `${trophies}`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.AI_AGENT_API_KEY
        },
        timeout: 30000
      }
    );

    let aiResponse = response.data?.response;
    if (!aiResponse) {
      throw new Error('Invalid AI agent response');
    }

    // Clean the response string - remove control characters and fix common issues
    aiResponse = aiResponse
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .replace(/\\n/g, '\n') // Fix escaped newlines
      .replace(/\\t/g, '\t') // Fix escaped tabs
      .replace(/\\"/g, '"') // Fix escaped quotes
      .replace(/,\s*}/g, '}') // Fix trailing commas
      .replace(/,\s*]/g, ']') // Fix trailing commas in arrays
      .trim();

    // Try to extract JSON if it's wrapped in markdown or other text
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      aiResponse = jsonMatch[0];
    }

    console.log('Cleaned AI Response:', aiResponse.substring(0, 200) + '...');

    // Parse JSON response from AI agent with error handling
    let problemData;
    try {
      problemData = JSON.parse(aiResponse);
    } catch (parseError: any) {
      // Try to fix common JSON issues and parse again
      const fixedResponse = aiResponse
        .replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":') // Add quotes to unquoted keys
        .replace(/:\s*([^"\[\{][^,}\]]*[^,}\]\s])([,}\]])/g, ': "$1"$2') // Quote unquoted string values
        .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
      
      try {
        problemData = JSON.parse(fixedResponse);
      } catch (secondError: any) {
        console.error('JSON parsing failed twice:', parseError.message, secondError.message);
        throw parseError;
      }
    }
    
    if (problemData.error) {
      throw new Error(problemData.message || 'AI agent returned error');
    }

    return problemData;
  } catch (error: any) {
    console.error('AI Agent error:', error.message);
    throw new Error('Failed to generate problem from AI agent');
  }
}