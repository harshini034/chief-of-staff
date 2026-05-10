'use client';

import { useState, useEffect } from 'react';

export default function StatsRow() {
  const [stats, setStats] = useState({
    handled: 47,
    saved: 2.3,
    match: 84
  });

  // Simulated live update for demo
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        handled: prev.handled + (Math.random() > 0.9 ? 1 : 0),
        saved: parseFloat((prev.saved + (Math.random() > 0.9 ? 0.1 : 0)).toFixed(1))
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
      {/* Handled Stat */}
      <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-8 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="text-6xl">✉️</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Autonomously Handled</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-white">{stats.handled}</span>
          <span className="text-gray-400 font-medium">Emails</span>
        </div>
        <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-emerald-500 w-[70%]" />
        </div>
      </div>

      {/* Saved Stat */}
      <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-8 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="text-6xl">⏳</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Human Time Saved</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-blue-400">~{stats.saved}</span>
          <span className="text-gray-400 font-medium">Hours</span>
        </div>
        <div className="mt-4 flex gap-1">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= 3 ? 'bg-blue-500' : 'bg-gray-800'}`} />
          ))}
        </div>
      </div>

      {/* Voice Match Stat */}
      <div className="rounded-3xl border border-gray-800 bg-gray-900/40 p-8 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <span className="text-6xl">🎙️</span>
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Voice Match Score</p>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-black text-emerald-400">{stats.match}%</span>
          <span className="text-gray-400 font-medium text-xs">Accuracy</span>
        </div>
        <p className="mt-4 text-[10px] text-gray-500 font-medium leading-tight uppercase tracking-tighter">
          Improving based on your last 12 edits
        </p>
      </div>
    </div>
  );
}
