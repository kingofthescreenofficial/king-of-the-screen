"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShieldAlert, CheckCircle2, Wallet, Zap, Bell, AlertTriangle, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [queue, setQueue] = useState<any[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [lastQueueLength, setLastQueueLength] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const HARDCODED_PASS = "KingPump2026!!!";

  const clearLogs = async () => {
    if (!confirm('Очистить все логи телеметрии?')) return;
    try {
      await fetch('/api/telemetry', { method: 'DELETE' });
      setTelemetry([]);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    // Create audio element for alarm
    audioRef.current = new Audio("https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=success-1-6297.mp3");
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchDashboard = async () => {
      try {
        const res = await fetch("/api/admin/dashboard");
        const data = await res.json();
        setQueue(data.queue || []);
        setTelemetry(data.telemetry || []);
        setActiveUsers(data.activeUsersCount || 0);
        
        if (data.queueLength > lastQueueLength && data.queueLength > 0) {
          // Play sound when new item arrives
          if (audioRef.current) {
             audioRef.current.play().catch(e => console.log("Audio play blocked by browser:", e));
          }
        }
        setLastQueueLength(data.queueLength);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, lastQueueLength]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="bg-[#111119] p-8 rounded-2xl border-2 border-red-500/50 max-w-sm w-full space-y-4">
          <h2 className="text-xl font-bold text-red-500 flex items-center gap-2">
            <ShieldAlert /> ADMIN LOGIN
          </h2>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter secure password"
            className="w-full bg-black border border-red-500/30 rounded-lg px-4 py-2 text-white"
            onKeyDown={(e) => {
               if (e.key === 'Enter' && password === HARDCODED_PASS) setIsAuthenticated(true);
            }}
          />
          <button 
            onClick={() => password === HARDCODED_PASS && setIsAuthenticated(true)}
            className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 rounded-lg"
          >
            ENTER COMMAND CENTER
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-gray-200 p-4 sm:p-8 font-sans selection:bg-yellow-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyber-border pb-4">
          <h1 className="text-2xl font-black text-yellow-400 flex items-center gap-2">
            <Zap className="text-yellow-400" />
            SENTINEL COMMAND CENTER
          </h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/40 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-xs font-bold text-emerald-400">ON SITE: {activeUsers}</span>
            </div>
            <div className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
              MONITORING
            </div>
          </div>
        </div>

        {/* Wallets Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111119] p-5 rounded-xl border border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
              <Wallet className="w-4 h-4" /> 1. ТРЕЖЕРИ (КАЗНА - ВАША ПРИБЫЛЬ 80%)
            </h3>
            <p className="font-mono text-xs text-emerald-400 break-all">EkgfzyrqfTZB8Er3XPSYn6nVmtTv4hvCo3F9Drkd62Aq</p>
            <p className="text-[11px] text-gray-500 mt-2">Сюда автоматически улетают 80% от всех оплат. Это ваша чистая прибыль. Ничего делать не нужно.</p>
          </div>
          <div className="bg-[#111119] p-5 rounded-xl border border-gray-800">
            <h3 className="text-sm font-bold text-gray-400 mb-2 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" /> 2. ГОРЯЧИЙ КОШЕЛЕК (ДЛЯ ПАМПА 20%)
            </h3>
            <p className="font-mono text-xs text-yellow-500 break-all">AahUkkoX21nkqkD3xnQUvsCcxQYbS9ajB2uurStj31xr</p>
            <p className="text-[11px] text-gray-500 mt-2">Сюда автоматически улетают 20% от оплат. С этих денег вы откупаете $KOTS на Pump.fun для передачи Королю.</p>
          </div>
        </div>

        {/* TERMINAL / TELEMETRY LOGS */}
        <div className="bg-[#0a0a0f] border-2 border-gray-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
            <h2 className="text-lg font-bold text-gray-300 flex items-center gap-2">
              <Zap className="text-blue-500 w-5 h-5" /> 
              TELEMETRY & SYSTEM LOGS (LIVE)
            </h2>
            <button onClick={clearLogs} className="flex items-center gap-1.5 text-xs bg-red-950/40 hover:bg-red-900/60 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/50 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Очистить
            </button>
          </div>
          
          <div className="bg-black border border-gray-800 rounded-xl h-96 overflow-y-auto p-4 font-mono text-[11px] sm:text-xs space-y-1.5 scrollbar-thin scrollbar-thumb-gray-800">
            {telemetry.length === 0 ? (
              <div className="text-gray-600 italic">No telemetry data yet...</div>
            ) : (
              telemetry.map((log, idx) => (
                <div key={idx} className="flex gap-3 hover:bg-gray-900/50 p-1 rounded transition-colors">
                  <span className="text-gray-600 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`shrink-0 font-bold ${log.type === 'USER' ? 'text-blue-400' : 'text-purple-400'}`}>[{log.type}]</span>
                  <span className={`shrink-0 ${log.type === 'USER' ? 'text-blue-200' : 'text-purple-200'}`}>{log.event}</span>
                  <span className="text-gray-400 truncate w-full">{JSON.stringify(log.details)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Action Queue */}
        <div className="bg-[#111119] border-2 border-red-500/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(220,38,38,0.1)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Bell className="text-red-500" /> 
              ОЖИДАЮТ ВАШЕГО ДЕЙСТВИЯ (ОЧЕРЕДЬ)
            </h2>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {queue.length} PENDING
            </span>
          </div>

          {queue.length === 0 ? (
            <div className="text-center py-10 text-gray-500 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 mb-3 text-gray-700" />
              <p>Очередь пуста. Вы можете отдыхать.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {queue.map((q, idx) => (
                <div key={idx} className="bg-red-950/30 border border-red-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                     <div>
                       <h4 className="text-red-400 font-bold text-sm flex items-center gap-2">
                         <AlertTriangle className="w-4 h-4" /> 
                         НОВЫЙ КОРОЛЬ: {q.nickname}
                       </h4>
                       <p className="text-xs text-gray-400 mt-1">Оплатил: <strong className="text-white">${q.paidUsd} USD</strong></p>
                     </div>
                     <span className="text-[10px] bg-red-900/50 text-red-300 px-2 py-1 rounded">ACTION REQUIRED</span>
                  </div>
                  
                  <div className="bg-black/50 p-3 rounded-lg border border-red-900/50">
                    <p className="text-xs text-gray-300 mb-2"><strong>Что вам нужно сделать ПРЯМО СЕЙЧАС:</strong></p>
                    <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                      <li>Возьмите 20% от этой суммы (<strong className="text-emerald-400">${q.paidUsd * 0.20} USD</strong>).</li>
                      <li>Зайдите на Pump.fun и купите монету <strong>KOTS</strong> на эту сумму.</li>
                      <li>Отправьте все купленные токены на кошелек этого Короля: <br/><strong className="text-yellow-400 font-mono break-all">{q.rewardWallet}</strong></li>
                    </ol>
                  </div>
                  
                  <button onClick={() => alert('Пока монета на Pump.fun, вы должны вручную удалить эту запись из /analytics/airdrop_queue.jsonl на сервере после отправки, либо просто игнорируйте эту панель после выполнения.')} className="w-full text-xs font-bold text-red-400 border border-red-500/30 hover:bg-red-500/10 py-2 rounded-lg transition-colors">
                    ПОМЕТИТЬ КАК ВЫПОЛНЕННОЕ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
