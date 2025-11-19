'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

interface TestCase {
  testCase: number;
  passed: boolean;
  runtime?: number;
  memory?: number;
  output?: string;
  error?: string;
}

interface TestCaseResultsProps {
  results: TestCase[];
  loading?: boolean;
}

export default function TestCaseResults({ results, loading }: TestCaseResultsProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 space-x-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
        <span className="text-gray-300">Running test cases...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 mb-2">No test results yet</p>
        <p className="text-gray-500 text-sm">Submit your code to see results</p>
      </div>
    );
  }

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {allPassed ? (
              <CheckCircle className="w-5 h-5 text-success-400" />
            ) : (
              <XCircle className="w-5 h-5 text-danger-400" />
            )}
            <span className="font-semibold text-white">
              {passedCount} / {totalCount} Test Cases Passed
            </span>
          </div>
          {allPassed && <span className="text-2xl">🎉</span>}
        </div>
      </div>

      {/* Individual Test Cases */}
      <AnimatePresence>
        {results.map((result, index) => (
          <motion.div
            key={result.testCase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-lg border p-4 ${
              result.passed
                ? 'bg-success-900/10 border-success-500/30'
                : 'bg-danger-900/10 border-danger-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                {result.passed ? (
                  <CheckCircle className="w-5 h-5 text-success-400" />
                ) : (
                  <XCircle className="w-5 h-5 text-danger-400" />
                )}
                <span className="font-medium text-white">Test Case {result.testCase}</span>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                result.passed ? 'bg-success-900/30 text-success-400' : 'bg-danger-900/30 text-danger-400'
              }`}>
                {result.passed ? 'Passed' : 'Failed'}
              </span>
            </div>

            {/* Runtime and Memory */}
            {(result.runtime !== undefined || result.memory !== undefined) && (
              <div className="flex items-center space-x-4 text-sm text-gray-400 mb-3">
                {result.runtime !== undefined && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatRuntime(result.runtime)}</span>
                  </div>
                )}
                {result.memory !== undefined && (
                  <div>Memory: {(result.memory / 1024).toFixed(2)} MB</div>
                )}
              </div>
            )}

            {/* Output */}
            {result.output && (
              <div className="mb-3">
                <div className="text-sm font-medium text-gray-300 mb-1">Output:</div>
                <pre className="bg-gray-900 p-2 rounded text-sm text-gray-300 overflow-x-auto">
                  {result.output}
                </pre>
              </div>
            )}

            {/* Error */}
            {result.error && (
              <div>
                <div className="text-sm font-medium text-danger-400 mb-1">Error:</div>
                <pre className="bg-danger-900/20 border border-danger-500/30 p-2 rounded text-sm text-danger-300 overflow-x-auto">
                  {result.error}
                </pre>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function formatRuntime(ms: number): string {
  if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
  if (ms < 1000) return `${ms.toFixed(2)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}