'use client';

import { useState, useEffect } from 'react';

interface GameTimerProps {
  initialTime: number;
}

export default function GameTimer({ initialTime }: GameTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

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