"use client";

import React, { useEffect, useState } from "react";

export const LiveViewerBadge: React.FC = React.memo(() => {
  const [viewers, setViewers] = useState(142);

  useEffect(() => {
    const interval = setInterval(() => {
      setViewers((prev) => Math.max(80, prev + Math.floor(Math.random() * 5) - 2));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 bg-red-950/40 border border-red-800/50 px-3 py-1.5 rounded-full text-red-400">
      <span className="w-2 h-2 rounded-full bg-red-500" />
      <span className="font-bold">{viewers} WATCHING</span>
    </div>
  );
});

LiveViewerBadge.displayName = "LiveViewerBadge";
