"use client";

import { useState, useEffect } from "react";
import { getTimeRemaining } from "@/lib/pricing";

interface CountdownTimerProps {
  deadline: string;
  compact?: boolean;
}

export function CountdownTimer({ deadline, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining(deadline));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(deadline));
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  if (timeLeft.isExpired) {
    return (
      <span className="text-red-400 font-semibold text-sm">Expired</span>
    );
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <span className={`font-mono font-semibold text-sm ${timeLeft.isUrgent ? "text-red-400 animate-pulse" : "text-slate-300"}`}>
        {timeLeft.hours > 0 ? `${timeLeft.hours}h ${pad(timeLeft.minutes)}m` : `${pad(timeLeft.minutes)}:${pad(timeLeft.seconds)}`}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {timeLeft.hours > 0 && (
        <>
          <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${timeLeft.isUrgent ? "bg-red-500/20" : "bg-white/10"}`}>
            <span className={`text-lg font-bold font-mono tabular-nums ${timeLeft.isUrgent ? "text-red-400" : "text-white"}`}>
              {pad(timeLeft.hours)}
            </span>
            <span className="text-xs text-slate-600">hrs</span>
          </div>
          <span className={`text-lg font-bold ${timeLeft.isUrgent ? "text-red-400" : "text-slate-600"}`}>:</span>
        </>
      )}
      <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${timeLeft.isUrgent ? "bg-red-500/20" : "bg-white/10"}`}>
        <span className={`text-lg font-bold font-mono tabular-nums ${timeLeft.isUrgent ? "text-red-400" : "text-white"}`}>
          {pad(timeLeft.minutes)}
        </span>
        <span className="text-xs text-slate-600">min</span>
      </div>
      <span className={`text-lg font-bold ${timeLeft.isUrgent ? "text-red-400" : "text-slate-600"}`}>:</span>
      <div className={`flex flex-col items-center px-2 py-1 rounded-lg ${timeLeft.isUrgent ? "bg-red-500/20" : "bg-white/10"}`}>
        <span className={`text-lg font-bold font-mono tabular-nums ${timeLeft.isUrgent ? "text-red-400" : "text-white"}`}>
          {pad(timeLeft.seconds)}
        </span>
        <span className="text-xs text-slate-600">sec</span>
      </div>
    </div>
  );
}
