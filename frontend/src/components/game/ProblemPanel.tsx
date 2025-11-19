'use client';

interface ProblemPanelProps {
  problem: any;
  testResults: any[];
}

export default function ProblemPanel({ problem, testResults }: ProblemPanelProps) {
  if (!problem) {
    return (
      <div className="card">
        <div className="text-center text-gray-400">No problem loaded</div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">{problem.title}</h2>
      
      <div className="prose prose-invert max-w-none mb-6">
        <p className="text-gray-300 whitespace-pre-wrap">{problem.description}</p>
      </div>

      {problem.sampleInput && problem.sampleOutput && (
        <div className="mb-6">
          <h3 className="font-bold mb-2">Example:</h3>
          <div className="bg-gray-900 rounded p-3 mb-2">
            <div className="text-sm text-gray-400 mb-1">Input:</div>
            <code className="text-green-400">{problem.sampleInput}</code>
          </div>
          <div className="bg-gray-900 rounded p-3">
            <div className="text-sm text-gray-400 mb-1">Output:</div>
            <code className="text-blue-400">{problem.sampleOutput}</code>
          </div>
        </div>
      )}

      {testResults.length > 0 && (
        <div>
          <h3 className="font-bold mb-2">Test Results:</h3>
          <div className="space-y-2">
            {testResults.map((result: any, index: number) => (
              <div 
                key={index} 
                className={`p-3 rounded ${result.passed ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}
              >
                <div className="flex items-center justify-between">
                  <span>Test {result.testCase}</span>
                  <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                    {result.passed ? '✅ Passed' : '❌ Failed'}
                  </span>
                </div>
                {result.runtime && (
                  <div className="text-sm text-gray-400 mt-1">
                    Runtime: {result.runtime}ms
                  </div>
                )}
                {result.error && (
                  <div className="text-sm text-red-400 mt-1">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}