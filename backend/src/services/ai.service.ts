import axios from 'axios';

interface TestCase {
  stdin: string;
  expected_stdout: string;
  explanation: string;
}

interface ProblemData {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  difficulty_score: number;
  estimated_time_seconds: number;
  hint: string;
  constraints: string;
  language: string;
  testcases: TestCase[];
  tags: string[];
  generation_notes: string;
}

class AIService {
  private apiKey = 'sk-default-EiUxVZWVhWT0SRuI7bHOK4oKm7oUoNzD';
  private agentId = '691ce37f499310d238fb1c96';
  private baseUrl = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';

  async generateProblem(trophies: number, language: string): Promise<ProblemData> {
    try {
      const sessionId = `${this.agentId}-${Date.now()}`;
      const message = `Generate a programming problem for trophies: ${trophies} and language: ${language}`;
      
      const response = await axios.post(this.baseUrl, {
        user_id: 'devanshparti@gmail.com',
        agent_id: this.agentId,
        session_id: sessionId,
        message: message
      }, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        }
      });

      const aiResponse = response.data.response;
      
      // Parse JSON response from AI
      let problemData: ProblemData;
      try {
        problemData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error('Failed to parse AI response:', aiResponse);
        // Fallback to mock problem
        return this.generateMockProblem(trophies, language);
      }

      // Validate required fields
      if (!problemData.id || !problemData.title || !problemData.testcases || problemData.testcases.length !== 4) {
        console.error('Invalid AI response structure:', problemData);
        return this.generateMockProblem(trophies, language);
      }

      return problemData;
    } catch (error) {
      console.error('AI service error:', error);
      // Fallback to mock problem
      return this.generateMockProblem(trophies, language);
    }
  }

  private generateMockProblem(trophies: number, language: string): ProblemData {
    const difficulty = this.getDifficultyByTrophies(trophies);
    const timeLimit = this.getTimeLimitByDifficulty(difficulty);
    
    return {
      id: `prob_${Date.now()}`,
      title: this.generateTitle(language, difficulty),
      description: this.generateDescription(language, difficulty),
      difficulty,
      difficulty_score: this.getDifficultyScore(trophies),
      estimated_time_seconds: timeLimit,
      hint: this.generateHint(language, difficulty),
      constraints: this.generateConstraints(difficulty),
      language,
      testcases: this.generateTestCases(language, difficulty),
      tags: this.generateTags(language, difficulty),
      generation_notes: `${timeLimit}s estimated for ${difficulty} ${language} problem.`
    };
  }

  private getDifficultyByTrophies(trophies: number): string {
    if (trophies < 1000) return 'Easy';
    if (trophies < 2000) return 'Medium';
    if (trophies < 3000) return 'Hard';
    if (trophies < 4000) return 'Very Hard';
    return 'Expert';
  }

  private getDifficultyScore(trophies: number): number {
    if (trophies < 1000) return 2 + Math.floor(Math.random() * 2);
    if (trophies < 2000) return 4 + Math.floor(Math.random() * 2);
    if (trophies < 3000) return 6 + Math.floor(Math.random() * 2);
    if (trophies < 4000) return 8;
    return 9 + Math.floor(Math.random() * 2);
  }

  private getTimeLimitByDifficulty(difficulty: string): number {
    const limits = {
      'Easy': 600,
      'Medium': 1200,
      'Hard': 1800,
      'Very Hard': 2400,
      'Expert': 3000
    };
    return limits[difficulty as keyof typeof limits] || 1200;
  }

  private generateTitle(language: string, difficulty: string): string {
    const titles = {
      javascript: {
        Easy: ['Array Sum', 'String Reverse', 'Find Maximum'],
        Medium: ['Two Sum', 'Valid Parentheses', 'Merge Arrays'],
        Hard: ['Longest Substring', 'Binary Tree Path', 'Dynamic Array'],
        'Very Hard': ['Graph Traversal', 'Complex DP', 'Advanced Trees'],
        Expert: ['Optimal Pathfinding', 'Advanced Algorithms', 'Complex Optimization']
      },
      python: {
        Easy: ['List Operations', 'String Manipulation', 'Basic Math'],
        Medium: ['Dictionary Usage', 'List Comprehension', 'Set Operations'],
        Hard: ['Advanced Recursion', 'Complex Data Structures', 'Algorithm Design'],
        'Very Hard': ['Optimization Problems', 'Advanced Algorithms', 'Complex Logic'],
        Expert: ['Competitive Programming', 'Advanced Optimization', 'Complex Systems']
      },
      java: {
        Easy: ['Array Processing', 'String Methods', 'Basic Collections'],
        Medium: ['HashMap Usage', 'ArrayList Operations', 'Object Design'],
        Hard: ['Advanced Collections', 'Complex Algorithms', 'Design Patterns'],
        'Very Hard': ['Performance Optimization', 'Advanced Data Structures', 'Complex Systems'],
        Expert: ['Enterprise Algorithms', 'Advanced Optimization', 'System Design']
      },
      cpp: {
        Easy: ['Vector Operations', 'String Processing', 'Basic STL'],
        Medium: ['Map Usage', 'Algorithm Library', 'Pointer Operations'],
        Hard: ['Advanced STL', 'Memory Management', 'Performance Algorithms'],
        'Very Hard': ['Competitive Programming', 'Advanced Algorithms', 'Optimization'],
        Expert: ['High Performance', 'Advanced Optimization', 'Complex Algorithms']
      }
    };

    const langTitles = titles[language as keyof typeof titles] || titles.javascript;
    const diffTitles = langTitles[difficulty as keyof typeof langTitles] || langTitles.Easy;
    return diffTitles[Math.floor(Math.random() * diffTitles.length)];
  }

  private generateDescription(_language: string, _difficulty: string): string {
    return `Given an array of integers, solve the problem efficiently.\n\nInput Format:\nFirst line contains integer n (array size)\nSecond line contains n space-separated integers\n\nOutput Format:\nSingle integer result\n\nExample:\nInput:\n3\n1 2 3\nOutput:\n6`;
  }

  private generateHint(_language: string, difficulty: string): string {
    const hints = {
      Easy: 'Use a simple loop to iterate through the array',
      Medium: 'Consider using a hash map for O(1) lookups',
      Hard: 'Think about dynamic programming or divide and conquer',
      'Very Hard': 'Advanced algorithm with optimal time complexity needed',
      Expert: 'Complex optimization with multiple constraints'
    };
    return hints[difficulty as keyof typeof hints] || hints.Easy;
  }

  private generateConstraints(difficulty: string): string {
    const constraints = {
      Easy: '1 ≤ n ≤ 100, -100 ≤ arr[i] ≤ 100',
      Medium: '1 ≤ n ≤ 1000, -1000 ≤ arr[i] ≤ 1000',
      Hard: '1 ≤ n ≤ 10000, -10000 ≤ arr[i] ≤ 10000',
      'Very Hard': '1 ≤ n ≤ 100000, -100000 ≤ arr[i] ≤ 100000',
      Expert: '1 ≤ n ≤ 1000000, -1000000 ≤ arr[i] ≤ 1000000'
    };
    return constraints[difficulty as keyof typeof constraints] || constraints.Easy;
  }

  private generateTestCases(_language: string, _difficulty: string): TestCase[] {
    return [
      {
        stdin: '3\n1 2 3',
        expected_stdout: '6',
        explanation: 'Basic test case with small input'
      },
      {
        stdin: '5\n-1 0 1 2 3',
        expected_stdout: '5',
        explanation: 'Test with negative numbers and zero'
      },
      {
        stdin: '1\n42',
        expected_stdout: '42',
        explanation: 'Edge case with single element'
      },
      {
        stdin: '4\n10 20 30 40',
        expected_stdout: '100',
        explanation: 'Larger numbers test case'
      }
    ];
  }

  private generateTags(_language: string, difficulty: string): string[] {
    const baseTags = ['arrays', 'math'];
    
    if (difficulty === 'Medium' || difficulty === 'Hard') {
      baseTags.push('hash-map');
    }
    
    if (difficulty === 'Hard' || difficulty === 'Very Hard' || difficulty === 'Expert') {
      baseTags.push('dynamic-programming');
    }

    return baseTags;
  }
}

export const aiService = new AIService();