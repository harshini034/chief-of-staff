'use client';

import { useEffect, useState } from 'react';

interface InboxZeroBarProps {
  handled: number;
  total: number;
}

export default function InboxZeroBar({ handled, total }: InboxZeroBarProps) {
  const [fillWidth, setFillWidth] = useState(0);

  useEffect(() => {
    // Calculate percentage, maxing out at 100%
    const percentage = total === 0 ? 100 : Math.min(100, Math.max(0, (handled / total) * 100));
    // Small delay to allow the animation to trigger after mount
    const timeout = setTimeout(() => setFillWidth(percentage), 100);
    return () => clearTimeout(timeout);
  }, [handled, total]);

  const isInboxZero = handled >= total && total > 0;

  return (
    <div className="mb-12 w-full">
      <div className="flex justify-between items-end mb-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-[0.15em] text-gray-400">
            Inbox Zero Progress
          </h2>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {handled} / {total} emails triaged or handled
          </p>
        </div>
        {isInboxZero && (
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 animate-pulse">
            Goal Reached ✨
          </span>
        )}
      </div>

      <div className="relative h-4 w-full bg-gray-900/50 rounded-full overflow-hidden border border-gray-800 backdrop-blur-md">
        <div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-1000 ease-out"
          style={{ width: `${fillWidth}%` }}
        >
          {/* Animated shine effect */}
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
        </div>
      </div>
    </div>
  );
}
