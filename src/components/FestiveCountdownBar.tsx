'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Clock, Sparkles } from 'lucide-react';

export default function FestiveCountdownBar() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    // Target Diwali celebration date (November 2026 or appropriate festive countdown)
    const targetDate = new Date('2026-11-08T00:00:00');

    const updateCountdown = () => {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 12, hours: 8, minutes: 45, seconds: 20 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-orange-950 to-slate-900 text-white py-2.5 px-4 border-b border-orange-500/30">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-xs">
        <div className="flex items-center gap-2 font-medium">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping flex-shrink-0" />
          <span className="text-amber-200 font-extrabold uppercase tracking-wide">
            🪔 Diwali 2026 Countdown:
          </span>
          <span className="text-slate-300 hidden md:inline">
            Fresh Sivakasi batches shipping daily across Gujarat & India!
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-heading font-black text-[11px] tracking-wider">
          <div className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-yellow-300">
            <span>{timeLeft.days}</span>
            <span className="text-[9px] font-normal text-slate-300 ml-0.5">d</span>
          </div>
          <span>:</span>
          <div className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-yellow-300">
            <span>{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="text-[9px] font-normal text-slate-300 ml-0.5">h</span>
          </div>
          <span>:</span>
          <div className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-yellow-300">
            <span>{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="text-[9px] font-normal text-slate-300 ml-0.5">m</span>
          </div>
          <span>:</span>
          <div className="px-2 py-0.5 rounded-md bg-white/10 backdrop-blur-md border border-white/10 text-yellow-300">
            <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="text-[9px] font-normal text-slate-300 ml-0.5">s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
