export interface LanguageDefinition {
  id: string;
  name: string;
  judgeId: number;
  extension: string;
  monacoId: string;
  template: string;
}

export const LANGUAGES: Record<string, LanguageDefinition> = {
  javascript: {
    id: 'javascript',
    name: 'JavaScript',
    judgeId: 63,
    extension: 'js',
    monacoId: 'javascript',
    template: `// Write your solution here
function solution(input) {
  // Your code here
  return result;
}

// Example usage
const input = ""; // Replace with actual input
console.log(solution(input));
`,
  },
  python: {
    id: 'python',
    name: 'Python',
    judgeId: 71,
    extension: 'py',
    monacoId: 'python',
    template: `# Write your solution here
def solution(input_data):
    # Your code here
    return result

# Example usage
if __name__ == "__main__":
    input_data = ""  # Replace with actual input
    print(solution(input_data))
`,
  },
  java: {
    id: 'java',
    name: 'Java',
    judgeId: 62,
    extension: 'java',
    monacoId: 'java',
    template: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
    
    public static String solution(String input) {
        // Your code here
        return result;
    }
}
`,
  },
  cpp: {
    id: 'cpp',
    name: 'C++',
    judgeId: 54,
    extension: 'cpp',
    monacoId: 'cpp',
    template: `#include <iostream>
#include <string>
using namespace std;

string solution(string input) {
    // Your code here
    return result;
}

int main() {
    string input = ""; // Replace with actual input
    cout << solution(input) << endl;
    return 0;
}
`,
  },
  c: {
    id: 'c',
    name: 'C',
    judgeId: 50,
    extension: 'c',
    monacoId: 'c',
    template: `#include <stdio.h>
#include <string.h>

void solution(char* input) {
    // Your code here
}

int main() {
    char input[1000] = ""; // Replace with actual input
    solution(input);
    return 0;
}
`,
  },
  typescript: {
    id: 'typescript',
    name: 'TypeScript',
    judgeId: 74,
    extension: 'ts',
    monacoId: 'typescript',
    template: `// Write your solution here
function solution(input: string): string {
  // Your code here
  return result;
}

// Example usage
const input: string = ""; // Replace with actual input
console.log(solution(input));
`,
  },
  go: {
    id: 'go',
    name: 'Go',
    judgeId: 60,
    extension: 'go',
    monacoId: 'go',
    template: `package main

import "fmt"

func solution(input string) string {
    // Your code here
    return result
}

func main() {
    input := "" // Replace with actual input
    fmt.Println(solution(input))
}
`,
  },
} as const;

export type LanguageId = keyof typeof LANGUAGES;

export function getLanguageById(id: string): LanguageDefinition | undefined {
  return LANGUAGES[id as LanguageId];
}

export function getAllLanguages(): LanguageDefinition[] {
  return Object.values(LANGUAGES);
}

export function getLanguageByJudgeId(judgeId: number): LanguageDefinition | undefined {
  return getAllLanguages().find((lang) => lang.judgeId === judgeId);
}