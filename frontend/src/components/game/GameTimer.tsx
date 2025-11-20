'use client';

import { useState, useEffect, useRef } from 'react';

interface GameTimerProps {
  initialTime: number; // seconds
}

export default function GameTimer({ initialTime }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<number | null>(null);

  // update local state whenever initialTime prop changes
  useEffect(() => {
    setTimeLeft(initialTime);
  }, [initialTime]);

  // start/restart interval whenever initialTime changes
  useEffect(() => {
    // clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // don't start if time is already zero or negative
    if (initialTime <= 0) return;

    intervalRef.current = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // stop the interval when reaching zero
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [initialTime]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getTimerColor = () => {
    if (timeLeft <= 60) return 'text-red-400';
    if (timeLeft <= 300) return 'text-yellow-400';
    return 'text-primary-400';
  };

  return (
    <div className="text-center">
      <div className={`text-3xl font-bold ${getTimerColor()}`}>
        {minutes}:{seconds.toString().padStart(2, '0')}
      </div>
      <div className="text-sm text-gray-400">Time Left</div>
    </div>
  );
}