"use client";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ReignTimerProps {
  crownedAt: number;
}

export const ReignTimer: React.FC<ReignTimerProps> = React.memo(({ crownedAt }) => {
  const [timeStr, setTimeStr] = useState("00:00:00");

  useEffect(() => {
    const update = () => {
      const diffMs = Math.max(0, Date.now() - crownedAt);
      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor(totalSec / 3600);
      const mins = Math.floor((totalSec % 3600) / 60);
      const secs = totalSec % 60;
      setTimeStr(
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      );
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [crownedAt]);

  return (
    <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2.5 py-1 rounded-full text-yellow-300">
      <Clock className="w-3.5 h-3.5 text-yellow-400" />
      <span>REIGN: <strong className="text-white font-mono">{timeStr}</strong></span>
    </div>
  );
});

ReignTimer.displayName = "ReignTimer";
