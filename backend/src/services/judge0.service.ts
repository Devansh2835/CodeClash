import axios from 'axios';
import env from '../config/env';

// interface SubmissionRequest {
//   source_code: string;
//   language_id: number;
//   stdin?: string;
//   expected_output?: string;
// }

interface SubmissionResult {
  status: {
    id: number;
    description: string;
  };
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  time?: string;
  memory?: number;
}

const JUDGE0_HEADERS = env.JUDGE0_API_KEY
  ? {
      'X-RapidAPI-Key': env.JUDGE0_API_KEY,
      'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
    }
  : {};

export async function submitCode(
  code: string,
  languageId: number,
  stdin: string,
  expectedOutput: string
): Promise<SubmissionResult> {
  try {
    // Create submission
    const response = await axios.post(
      `${env.JUDGE0_API_URL}/submissions`,
      {
        source_code: code,
        language_id: languageId,
        stdin,
        expected_output: expectedOutput,
      },
      {
        headers: JUDGE0_HEADERS,
        params: {
          base64_encoded: false,
          wait: false,
        },
      }
    );

    const token = response.data.token;
    // Poll for result
    return await pollSubmission(token);
  } catch (error: any) {
    console.error('Judge0 submission error:', error);
    throw new Error('Failed to submit code for execution');
  }
}

async function pollSubmission(token: string, maxRetries = 30): Promise<SubmissionResult> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(
        `${env.JUDGE0_API_URL}/submissions/${token}`,
        {
          headers: JUDGE0_HEADERS,
          params: {
            base64_encoded: false,
          },
        }
      );

      const result = response.data;
      // Status IDs: 1-2 = In Queue/Processing, 3 = Accepted, 4+ = Error
      if (result.status.id > 2) {
        return result;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Judge0 polling error:', error);
    }
  }

  throw new Error('Submission timeout');
}

export async function executeTestCases(
  code: string,
  languageId: number,
  testCases: Array<{ input: string; expectedOutput: string }>
): Promise<
  Array<{
    testCase: number;
    passed: boolean;
    runtime?: number;
    memory?: number;
    output?: string;
    error?: string;
  }>
> {
  const results = [];

  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    try {
      const result = await submitCode(
        code,
        languageId,
        testCase.input,
        testCase.expectedOutput
      );

      const passed = result.status.id === 3; // 3 = Accepted
      results.push({
        testCase: i + 1,
        passed,
        runtime: result.time ? parseFloat(result.time) : undefined,
        memory: result.memory,
        output: result.stdout,
        error: result.stderr || result.compile_output,
      });
    } catch (error) {
      results.push({
        testCase: i + 1,
        passed: false,
        error: 'Execution error',
      });
    }
  }

  return results;
}

// Language IDs (common ones)
export const LANGUAGE_IDS = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  typescript: 74,
  go: 60,
};